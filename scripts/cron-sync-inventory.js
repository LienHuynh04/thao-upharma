#!/usr/bin/env node

/**
 * ==============================================================================
 * UPHARMA CRONJOB - TỰ ĐỘNG ĐỒNG BỘ TỒN KHO & HỆ SỐ DOANH SỐ (HHS) LÊN FIREBASE
 * ==============================================================================
 * 
 * Cách dùng:
 * 1. Chạy 1 lần (cho crontab hệ thống):
 *    node scripts/cron-sync-inventory.js
 * 
 * 2. Chạy dạng daemon định kỳ (mỗi 30 phút mặc định):
 *    node scripts/cron-sync-inventory.js --daemon
 *    (Có thể đổi thời gian: CRON_INTERVAL_MINUTES=15 node scripts/cron-sync-inventory.js --daemon)
 * 
 * 3. Thêm vào Crontab hệ thống (crontab -e):
 *    *\/30 * * * * /usr/bin/node /path/to/thao-upharma/scripts/cron-sync-inventory.js >> /var/log/upharma-cron.log 2>&1
 * ==============================================================================
 */

const fs = require('fs');
const path = require('path');

// ── 1. Cấu hình & Biến môi trường ───────────────────────────────────────────
const UPHARMA_API_BASE_URL = process.env.UPHARMA_API_BASE_URL || "https://icpc1hn.work/NHATHUOC";
const UPHARMA_USERNAME = process.env.UPHARMA_USERNAME || "";
const UPHARMA_PASSWORD = process.env.UPHARMA_PASSWORD || "";
const FIREBASE_DATABASE_URL = (
  process.env.FIREBASE_DATABASE_URL || 
  "https://thao-uph-default-rtdb.asia-southeast1.firebasedatabase.app"
).replace(/\/$/, "");

const EXCLUDED_SHOP_CODES = new Set([]);
const INTERVAL_MINUTES = Math.max(1, Number(process.env.CRON_INTERVAL_MINUTES || 30));
const IS_DAEMON = process.argv.includes('--daemon');

// ── 2. Firebase Admin SDK hoặc Fallback REST API ────────────────────────────
let adminDb = null;

function initFirebaseAdmin() {
  try {
    const { initializeApp, cert, getApps } = require('firebase-admin/app');
    const { getDatabase } = require('firebase-admin/database');

    if (getApps().length > 0) {
      adminDb = getDatabase();
      return;
    }

    let serviceAccount = null;
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    } else {
      const candidates = [
        path.join(__dirname, '..', 'backend', 'serviceAccountKey.json'),
        path.join(__dirname, '..', 'backend', 'thao-uph-firebase-adminsdk-fbsvc-ee2f42c516.json'),
      ];
      for (const p of candidates) {
        if (fs.existsSync(p)) {
          serviceAccount = require(p);
          break;
        }
      }
    }

    if (serviceAccount) {
      const app = initializeApp({
        credential: cert(serviceAccount),
        databaseURL: FIREBASE_DATABASE_URL,
      });
      adminDb = getDatabase(app);
      console.log(`[Firebase] Khởi tạo Firebase Admin SDK thành công (${FIREBASE_DATABASE_URL})`);
    } else {
      console.log(`[Firebase] Không có Service Account, sử dụng REST API PUT trực tiếp.`);
    }
  } catch (err) {
    console.warn(`[Firebase] Bỏ qua Admin SDK, dùng REST API fallback:`, err.message);
  }
}

async function writeToFirebase(rtdbPath, data) {
  const cleanPath = rtdbPath.replace(/^\//, '').replace(/\.json$/, '');
  
  if (adminDb) {
    await adminDb.ref(cleanPath).set(data);
    return;
  }

  // Fallback REST API
  const url = `${FIREBASE_DATABASE_URL}/${cleanPath}.json`;
  const res = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error(`Firebase REST API status ${res.status}`);
  }
}

// ── 3. Helper logic chuẩn hóa dữ liệu tồn kho ──────────────────────────────
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

function parseDate(value) {
  if (!value) return null;
  if (value instanceof Date) return value;
  const text = String(value).trim();
  const aspNet = text.match(/\/Date\((\d+)\)\//);
  if (aspNet) return new Date(Number(aspNet[1]));
  const ddmmyyyy = text.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
  if (ddmmyyyy) return new Date(Number(ddmmyyyy[3]), Number(ddmmyyyy[2]) - 1, Number(ddmmyyyy[1]));
  const d = new Date(text.replace(" ", "T"));
  return Number.isNaN(d.getTime()) ? null : d;
}

function classifyExpiry(value) {
  const date = parseDate(value);
  if (!date) return { status: "normal", days: null };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(date);
  expiry.setHours(0, 0, 0, 0);

  const diffDays = Math.floor((expiry.getTime() - today.getTime()) / 86400000);
  if (diffDays < 0) return { status: "expired", days: diffDays };
  if (diffDays <= 90) return { status: "danger", days: diffDays };
  if (diffDays <= 180) return { status: "warning", days: diffDays };
  if (diffDays <= 360) return { status: "safe", days: diffDays };
  return { status: "normal", days: diffDays };
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

// ── 4. Request Upharma API ──────────────────────────────────────────────────
async function requestUpharma(pathname, payload) {
  const url = `${UPHARMA_API_BASE_URL}${pathname}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Origin: "https://upharma.com.vn",
      Referer: "https://upharma.com.vn/",
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status} khi gọi ${pathname}`);
  }
  return res.json();
}

function extractArray(response) {
  if (Array.isArray(response)) return response;
  const keys = ["InventoryLst", "ShopPlanLst", "data", "Data", "items", "Items", "result", "Result"];
  for (const k of keys) {
    if (Array.isArray(response?.[k])) return response[k];
  }
  return [];
}

// ── 5. Main Sync Task ───────────────────────────────────────────────────────
async function runSyncTask() {
  const now = new Date();
  console.log(`\n======================================================`);
  console.log(`[CRON] Bắt đầu đồng bộ Tồn kho & HHS lúc: ${now.toLocaleString('vi-VN')}`);
  console.log(`======================================================`);

  if (!UPHARMA_USERNAME || !UPHARMA_PASSWORD) {
    console.error(`[CRON] Lỗi: Chưa cung cấp UPHARMA_USERNAME hoặc UPHARMA_PASSWORD.`);
    console.error(`Vui lòng thiết lập biến môi trường trước khi chạy.`);
    return;
  }

  try {
    // BƯỚC 1: XÁC THỰC (AUTHENTICATION)
    console.log(`[CRON] Đăng nhập tài khoản ${UPHARMA_USERNAME}...`);
    const loginData = await requestUpharma("/User/UserLogin", {
      UserName: UPHARMA_USERNAME,
      Password: UPHARMA_PASSWORD,
    });

    if (loginData.RespCode !== 0 || !loginData.Token) {
      throw new Error(`Đăng nhập thất bại: ${loginData.RespText || 'Không có Token'}`);
    }

    const { Token, UserInfo } = loginData;
    const uPharmaID = String(UserInfo.uPharmaID);
    const allShops = UserInfo.ShopLst || [];
    const shops = allShops.filter((s) => !EXCLUDED_SHOP_CODES.has(s.ShopCode));

    console.log(`[CRON] Đăng nhập thành công! Tìm thấy ${shops.length} nhà thuốc hợp lệ.`);

    // Thời gian tính toán HHS
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const monthStr = String(month).padStart(2, '0');
    const targetMonthStr = `${year}-${monthStr}`;
    const totalDaysInMonth = new Date(year, month, 0).getDate();
    const daysElapsed = now.getDate();

    let totalSyncedShops = 0;
    let totalInventoryRecords = 0;
    const overviewItems = [];
    const inventoryByShop = {};

    // Lặp qua từng nhà thuốc
    for (const shop of shops) {
      console.log(`\n[CRON] ── Đang xử lý: ${shop.ShopCode} (${shop.ShopName}) ──`);
      let filteredList = [];

      // ── BƯỚC 2: LẤY VÀ LỌC TỒN KHO (INVENTORY) ──────────────────────────
      try {
        console.log(`[CRON] Gọi /LocalStore/GetInventoryShop cho ${shop.ShopCode}...`);
        const invRes = await requestUpharma("/LocalStore/GetInventoryShop", {
          uPharmaID: uPharmaID,
          Token: Token,
          ShopCode: shop.ShopCode,
          BranchLst: "",
          ProductID: "",
          LotCode: "",
          PackageID: null,
          StoreType: "",
        });

        const rawList = extractArray(invRes);

        // Quy tắc lọc & chuẩn hóa
        filteredList = rawList
          .filter((item) => {
            if (isWarehouseStore(item)) return false;
            const pCode = String(item.ProductCode || item.ProductID || item.MaSP || "").toUpperCase().trim();
            const pName = String(item.ProductName || item.Product_Name || item.TenSP || "").toUpperCase().trim();
            if (pCode.includes("VOUCHER") || pName.includes("VOUCHER") || pCode.startsWith("VC")) {
              return false;
            }
            return true;
          })
          .map((item) => {
            const expRaw = item.ExpirationDate || item.ExpDate || item.ExpireDate || item.HanDung || item.HSD || "";
            const { status, days } = classifyExpiry(expRaw);
            const qty = Number(item.Quantity || item.Qty || item.TonKho || item.SL) || 0;
            const price = Number(item.UnitPrice || item.Price || item.GiaBan || item.RetailPrice || item.BasePrice) || 0;

            return {
              ...item,
              __shopCode: shop.ShopCode,
              __shopName: shop.ShopName,
              ShopCode: shop.ShopCode,
              ShopName: shop.ShopName,
              Quantity: qty,
              Price: price,
              stockValue: price * qty,
              expiryStatus: status,
              expiryDaysRemaining: days,
            };
          });

        console.log(`[CRON] ✓ Lọc được ${filteredList.length} sản phẩm tồn kho (gốc: ${rawList.length}).`);
        totalInventoryRecords += filteredList.length;
      } catch (invErr) {
        console.error(`[CRON] ✗ Lỗi tải tồn kho shop ${shop.ShopCode}:`, invErr.message);
      }

      // ── BƯỚC 3: LẤY VÀ TÍNH HỆ SỐ DOANH SỐ % (HHS %) ────────────────────
      let amountActual = 0;
      try {
        console.log(`[CRON] Gọi /ShopPlan/GetShopPlanByTime cho ${shop.ShopCode}...`);
        const planRes = await requestUpharma("/ShopPlan/GetShopPlanByTime", {
          TimeStart: `${year}-01-01 00:00:00`,
          TimeEnd: `${year}-12-31 23:59:59`,
          ShopCode: shop.ShopCode,
          Token: Token,
          uPharmaID: uPharmaID,
        });

        const rawPlans = extractArray(planRes);
        const currentMonthPlans = rawPlans.filter((p) => {
          const m = String(p.Month || p.TimeMonth || "");
          return m.includes("-") ? m === targetMonthStr : Number(m) === month;
        });

        const amountTarget = currentMonthPlans.reduce((s, p) => s + (Number(p.Amount) || 0), 0);
        amountActual = currentMonthPlans.reduce((s, p) => s + (Number(p.AmountR) || 0), 0);
        const hhsTarget = currentMonthPlans.reduce((s, p) => s + (Number(p.PointSales01) || 0), 0);
        const hhsActual = currentMonthPlans.reduce((s, p) => s + (Number(p.PointSales01R) || 0), 0);

        // Fallback EmployeePlan nếu trống
        if (amountActual === 0 && amountTarget === 0) {
          try {
            const empRes = await requestUpharma("/EmployeePlan/GetEmployeePlanLst", {
              Month: month,
              Year: year,
              ShopCode: shop.ShopCode,
              Token: Token,
              uPharmaID: uPharmaID,
            });
            const empList = extractArray(empRes);
            if (empList.length > 0) {
              amountActual = empList.reduce((s, p) => s + (Number(p.AmountR) || 0), 0);
            }
          } catch {}
        }

        // Công thức nghiệp vụ:
        const hhsRatio = amountActual > 0 ? ((hhsActual * 1000) / amountActual) * 100 : 0;
        const salesPercent = amountTarget > 0 ? (amountActual / amountTarget) * 100 : 0;
        const hhsPercent = hhsTarget > 0 ? (hhsActual / hhsTarget) * 100 : 0;
        const projectedAmount = daysElapsed > 0 ? (amountActual / daysElapsed) * totalDaysInMonth : 0;

        const hhsSummary = {
          shopCode: shop.ShopCode,
          shopName: shop.ShopName,
          month: targetMonthStr,
          amountTarget,
          amountActual,
          hhsTarget,
          hhsActual,
          hhsRatio: Number(hhsRatio.toFixed(2)),
          salesPercent: Number(salesPercent.toFixed(2)),
          hhsPercent: Number(hhsPercent.toFixed(2)),
          projectedAmount: Math.round(projectedAmount),
          fetchedAt: new Date().toISOString(),
          updatedAt: Date.now(),
        };

        await writeToFirebase(`shops/${shop.ShopCode}/upharma_data/hhs_summary`, hhsSummary);
        console.log(`[CRON] ✓ Cập nhật HHS: Đạt DS ${hhsSummary.salesPercent}%, Tỉ trọng HHS ${hhsSummary.hhsRatio}%`);

      } catch (planErr) {
        console.error(`[CRON] ✗ Lỗi tính HHS shop ${shop.ShopCode}:`, planErr.message);
      }

      // ── BƯỚC 4: TÍNH TOÁN DÒNG TỔNG QUAN TỒN KHO CHO SHOP ───
      const totalStockVal = filteredList.reduce((s, i) => s + (Number(i.stockValue) || 0), 0);
      const itemsUnder3M = filteredList.filter((i) => i.expiryDaysRemaining !== null && i.expiryDaysRemaining <= 90);
      const dateUnder3MValue = itemsUnder3M.reduce((s, i) => s + (Number(i.stockValue) || 0), 0);
      const dateUnder3MRate = totalStockVal > 0 ? (dateUnder3MValue / totalStockVal) * 100 : 0;

      const itemsUnder6M = filteredList.filter((i) => i.expiryDaysRemaining !== null && i.expiryDaysRemaining <= 180);
      const dateUnder6MValue = itemsUnder6M.reduce((s, i) => s + (Number(i.stockValue) || 0), 0);
      const dateUnder6MRate = totalStockVal > 0 ? (dateUnder6MValue / totalStockVal) * 100 : 0;

      const itemsUnder12M = filteredList.filter((i) => i.expiryDaysRemaining !== null && i.expiryDaysRemaining <= 360);
      const dateUnder12MValue = itemsUnder12M.reduce((s, i) => s + (Number(i.stockValue) || 0), 0);
      const dateUnder12MRate = totalStockVal > 0 ? (dateUnder12MValue / totalStockVal) * 100 : 0;

      const province = extractProvince(shop.ShopName);
      const r3 = totalStockVal > 0 ? Number(((dateUnder3MValue / totalStockVal) * 100).toFixed(2)) : 0;
      const r6 = totalStockVal > 0 ? Number(((dateUnder6MValue / totalStockVal) * 100).toFixed(2)) : 0;
      const r12 = totalStockVal > 0 ? Number(((dateUnder12MValue / totalStockVal) * 100).toFixed(2)) : 0;

      const shopSummaryItem = {
        Date_3th: dateUnder3MValue,
        Date_6th: dateUnder6MValue,
        Date_12th: dateUnder12MValue,
        Total: totalStockVal,
        Date_3th_Rate: r3,
        Date_6th_Rate: r6,
        Date_12th_Rate: r12,
        ShopCode: shop.ShopCode,
        ShopName: shop.ShopName,
        Province: province,
        // CamelCase aliases để tương thích toàn bộ hệ thống
        shopCode: shop.ShopCode,
        shopName: shop.ShopName,
        province: province,
        totalStockValue: totalStockVal,
        dateUnder3MValue,
        dateUnder3MRate: r3,
        dateUnder6MValue,
        dateUnder6MRate: r6,
        dateUnder12MValue,
        dateUnder12MRate: r12,
      };

      inventoryByShop[shop.ShopCode] = shopSummaryItem;
      overviewItems.push(shopSummaryItem);

      // Đẩy tồn kho rút gọn của shop lên Firebase (không chứa mảng chi tiết sản phẩm)
      await writeToFirebase(`shops/${shop.ShopCode}/upharma_data/inventory`, shopSummaryItem);

      totalSyncedShops++;
    }

    // ── GHI TOÀN BỘ INVENTORY VÀ TỔNG QUAN LÊN FIREBASE RTDB ─────────────────────
    // 1. Ghi inventory.json dạng { [ShopCode]: { Date_3th, Date_6th, ... } }
    await writeToFirebase("inventory", inventoryByShop);
    await writeToFirebase("upharma_data/inventory", inventoryByShop);
    console.log(`[CRON] ✓ Đã lưu ${Object.keys(inventoryByShop).length} nhà thuốc vào inventory và upharma_data/inventory trên Firebase!`);

    // 2. Ghi shops_inventory_overview dạng bảng tổng hợp
    const overviewPayload = {
      updatedAt: Date.now(),
      fetchedAt: new Date().toISOString(),
      month: targetMonthStr,
      totalShops: overviewItems.length,
      items: overviewItems,
      byShop: inventoryByShop,
    };
    await writeToFirebase("shops_inventory_overview", overviewPayload);
    await writeToFirebase("upharma_data/shops_inventory_overview", overviewPayload);
    console.log(`[CRON] ✓ Đã lưu ${overviewItems.length} nhà thuốc vào shops_inventory_overview trên Firebase!`);

    // 3. Cập nhật file cục bộ src/assets/data/inventory.json dạng rút gọn
    const localDataDir = path.join(__dirname, "..", "src", "assets", "data");
    if (fs.existsSync(localDataDir)) {
      fs.writeFileSync(path.join(localDataDir, "inventory.json"), JSON.stringify(inventoryByShop, null, 2));
      console.log(`[CRON] ✓ Đã ghi cấu trúc rút gọn vào src/assets/data/inventory.json!`);
    }

    console.log(`\n======================================================`);
    console.log(`[CRON] ✅ HOÀN THÀNH ĐỒNG BỘ: ${totalSyncedShops} nhà thuốc, ${totalInventoryRecords} bản ghi tồn kho.`);
    console.log(`======================================================`);

  } catch (err) {
    console.error(`[CRON] ❌ Lỗi nghiêm trọng trong quá trình đồng bộ:`, err.message);
  }
}

// ── 6. Khởi động Cronjob ────────────────────────────────────────────────────
initFirebaseAdmin();

if (IS_DAEMON) {
  console.log(`[CRON] 🚀 Khởi chạy ở chế độ DAEMON (Lập lịch chạy mỗi ${INTERVAL_MINUTES} phút).`);
  runSyncTask();
  setInterval(runSyncTask, INTERVAL_MINUTES * 60 * 1000);
} else {
  // Chạy 1 lần rồi thoát (phù hợp crontab hệ thống)
  runSyncTask().then(() => {
    process.exit(0);
  });
}
