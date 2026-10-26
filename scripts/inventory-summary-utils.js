"use strict";

/**
 * Shared inventory summary logic for the Node sync scripts
 * (fetch-upharma-data.js and cron-sync-inventory.js).
 *
 * Single source of truth for how a shop's stock value and expiry buckets are
 * calculated, so the CI sync and the manual cron can never drift apart again.
 *
 * Semantics MUST match the uPharma desktop app
 * ("6. Tồn kho các Shop" → "Cảnh báo"), verified against SHOP0010 on
 * 2026-10-26 (desktop total 619,986,100 VND / 1,912 product codes):
 *   - Expired:         expiryDays < 0                    (its own bucket)
 *   - Under 3 months:  0 <= expiryDays <= 90             (band, excludes expired)
 *   - Under 6 months:  90 < expiryDays <= 180            (band, not cumulative)
 *   - Under 12 months: expiryDays <= 360                 (cumulative, as desktop shows)
 *   - Over 12 months:  expiryDays > 360
 * Items without a parseable expiry date count toward the total only.
 *
 * Field mapping MUST match what /LocalStore/GetInventoryShop actually
 * returns: Quantity, UnitPrice, ExpirationDate, ProductID.
 * Stock value = Quantity * UnitPrice.
 */

function parseInventoryDate(value) {
  if (!value) return null;
  if (value instanceof Date) return value;
  const text = String(value).trim();
  const aspNet = text.match(/\/Date\((\d+)\)\//);
  if (aspNet) return new Date(Number(aspNet[1]));
  const ddmmyyyy = text.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
  if (ddmmyyyy) return new Date(Number(ddmmyyyy[3]), Number(ddmmyyyy[2]) - 1, Number(ddmmyyyy[1]));
  const parsed = new Date(text.replace(" ", "T"));
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function getExpiryDaysRemaining(value, now = new Date()) {
  const date = parseInventoryDate(value);
  if (!date) return null;
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(date);
  expiry.setHours(0, 0, 0, 0);
  return Math.floor((expiry.getTime() - today.getTime()) / 86400000);
}

function isWarehouseStore(item) {
  if (!item) return false;
  const code = String(item.StoreCode || item.ShopCode || item.BranchCode || "").toUpperCase().trim();
  const name = String(item.StoreName || item.ShopName || item.BranchName || item.__shopName || "").toLowerCase().trim();
  const type = String(item.StoreType || "").toLowerCase().trim();

  if (type.includes("kho")) return true;
  if (code === "DN" || code.startsWith("KHO_") || code.startsWith("KHO") || code.startsWith("K_")) return true;
  if (
    name.startsWith("kho ") ||
    name.startsWith("kho.") ||
    name.startsWith("kho-") ||
    name.includes("kho tổng") ||
    name.includes("kho chi nhánh") ||
    name.includes("kho tong") ||
    name.includes("kho chi nhanh")
  ) {
    return true;
  }
  return false;
}

function isVoucherProduct(item) {
  const pCode = String(item.ProductCode || item.ProductID || item.MaSP || "").toUpperCase().trim();
  const pName = String(item.ProductName || item.Product_Name || item.TenSP || "").toUpperCase().trim();
  return pCode.includes("VOUCHER") || pName.includes("VOUCHER") || pCode.startsWith("VC");
}

function extractProvince(shopName) {
  const s = String(shopName || "").toLowerCase();
  if (s.includes("khánh hòa") || s.includes("khanh hoa") || s.includes("nha trang") || s.includes("cam ranh")) return "Khánh Hòa";
  if (s.includes("gia lai") || s.includes("pleiku")) return "Gia Lai";
  if (s.includes("đắk lắk") || s.includes("dak lak") || s.includes("buôn ma thuột") || s.includes("bmt")) return "Đắk Lắk";
  if (s.includes("đà nẵng") || s.includes("da nang") || s.includes("liên chiểu") || s.includes("hải châu") || s.includes("ngũ hành sơn") || s.includes("thanh khê") || s.includes("sơn trà")) return "Đà Nẵng";
  if (s.includes("quảng nam") || s.includes("hội an") || s.includes("tam kỳ")) return "Quảng Nam";
  if (s.includes("huế") || s.includes("thừa thiên")) return "Thừa Thiên Huế";
  if (s.includes("hà nội") || s.includes("ha noi")) return "Hà Nội";
  if (s.includes("hồ chí minh") || s.includes("hcm") || s.includes("sài gòn")) return "Hồ Chí Minh";
  const parts = String(shopName || "").split("-");
  if (parts.length > 1) {
    const last = parts[parts.length - 1].trim();
    if (last.length > 2) return last;
  }
  return "Miền Trung";
}

/**
 * Compute one shop's inventory summary from raw GetInventoryShop rows.
 * rows: raw API rows for this shop (filtering is applied here, idempotently).
 * shop: { ShopCode, ShopName }
 */
function computeShopInventorySummary(rows, shop, now = new Date()) {
  const list = Array.isArray(rows) ? rows : [];

  let totalStockVal = 0;
  let expiredValue = 0;
  let under3MValue = 0; // band: 0..90 days remaining
  let under6MValue = 0; // band: 91..180 days remaining
  let under12MValue = 0; // cumulative: <= 360 days remaining (desktop semantics)
  let over12MValue = 0;
  let recordCount = 0;
  const productCodes = new Set();

  for (const item of list) {
    if (!item) continue;
    if (isWarehouseStore(item)) continue;
    if (isVoucherProduct(item)) continue;

    const qty = Number(item.Quantity || item.Qty || item.TonKho || item.SL) || 0;
    const price = Number(item.UnitPrice || item.Price || item.GiaBan || item.RetailPrice || item.BasePrice) || 0;
    const stockValue = price * qty;

    totalStockVal += stockValue;
    recordCount += 1;
    const code = String(item.ProductCode || item.ProductID || item.MaSP || "").trim();
    if (code) productCodes.add(code);

    const expRaw = item.ExpirationDate || item.ExpDate || item.ExpireDate || item.HanDung || item.HSD || "";
    const days = getExpiryDaysRemaining(expRaw, now);
    if (days === null) continue;

    if (days < 0) expiredValue += stockValue;
    else if (days <= 90) under3MValue += stockValue;
    else if (days <= 180) under6MValue += stockValue;

    if (days <= 360) under12MValue += stockValue;
    else over12MValue += stockValue;
  }

  const rate = (value) => (totalStockVal > 0 ? Number(((value / totalStockVal) * 100).toFixed(2)) : 0);
  const province = extractProvince(shop.ShopName);
  const fetchedAt = new Date(now).toISOString();

  return {
    // Legacy field names consumed by the current frontend
    Date_3th: under3MValue,
    Date_6th: under6MValue,
    Date_12th: under12MValue,
    Total: totalStockVal,
    Date_3th_Rate: rate(under3MValue),
    Date_6th_Rate: rate(under6MValue),
    Date_12th_Rate: rate(under12MValue),
    ShopCode: shop.ShopCode,
    ShopName: shop.ShopName,
    Province: province,
    // CamelCase aliases
    shopCode: shop.ShopCode,
    shopName: shop.ShopName,
    province: province,
    totalStockValue: totalStockVal,
    dateUnder3MValue: under3MValue,
    dateUnder3MRate: rate(under3MValue),
    dateUnder6MValue: under6MValue,
    dateUnder6MRate: rate(under6MValue),
    dateUnder12MValue: under12MValue,
    dateUnder12MRate: rate(under12MValue),
    // Extra buckets the desktop shows but the web did not track before
    expiredValue,
    expiredRate: rate(expiredValue),
    over12MValue,
    over12MRate: rate(over12MValue),
    productCount: productCodes.size,
    recordCount,
    fetchedAt,
    updatedAt: new Date(now).getTime(),
  };
}

module.exports = {
  parseInventoryDate,
  getExpiryDaysRemaining,
  isWarehouseStore,
  isVoucherProduct,
  extractProvince,
  computeShopInventorySummary,
};
