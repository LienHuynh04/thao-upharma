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
const { computeShopInventorySummary } = require('./inventory-summary-utils');

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

// ── 3. Logic tính summary tồn kho nằm ở scripts/inventory-summary-utils.js ──
// (dùng chung với fetch-upharma-data.js để hai pipeline không lệch nhau nữa)

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
      let shopInventorySummary = null;

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

        // Lọc & tính summary bằng logic dùng chung (inventory-summary-utils):
        // semantics khớp phần mềm uPharma desktop — hết hạn tách riêng,
        // dưới 3 tháng = còn hạn 0–90 ngày, dưới 6 tháng = 91–180 ngày,
        // dưới 12 tháng = cộng dồn ≤360 ngày.
        shopInventorySummary = computeShopInventorySummary(rawList, shop);

        console.log(`[CRON] ✓ Lọc được ${shopInventorySummary.recordCount} sản phẩm tồn kho (gốc: ${rawList.length}).`);
        totalInventoryRecords += shopInventorySummary.recordCount;
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

      // ── BƯỚC 4: GHI DÒNG TỔNG QUAN TỒN KHO CHO SHOP ───
      // Summary đã tính ở Bước 2 bằng logic dùng chung. Nếu tải tồn kho lỗi
      // thì bỏ qua shop này (giữ số cũ trên Firebase), không ghi đè bằng 0.
      if (shopInventorySummary) {
        inventoryByShop[shop.ShopCode] = shopInventorySummary;
        overviewItems.push(shopInventorySummary);

        // Ghi vào node summary RIÊNG. Không ghi vào
        // shops/{code}/upharma_data/inventory — node đó thuộc về dữ liệu thô
        // do fetch-upharma-data.js quản lý, ghi đè vào sẽ phá các trang chi tiết.
        await writeToFirebase(`shops/${shop.ShopCode}/upharma_data/inventory_summary`, shopInventorySummary);
      } else {
        console.warn(`[CRON] ⚠ Bỏ qua summary tồn kho shop ${shop.ShopCode} do lỗi tải dữ liệu.`);
      }

      totalSyncedShops++;
    }

    // ── GHI TOÀN BỘ INVENTORY VÀ TỔNG QUAN LÊN FIREBASE RTDB ─────────────────────
    // 1. Ghi inventory.json dạng { [ShopCode]: { Date_3th, Date_6th, ... } }
    // KHÔNG ghi vào upharma_data/inventory — node đó là dữ liệu thô gộp
    // do fetch-upharma-data.js quản lý.
    await writeToFirebase("inventory", inventoryByShop);
    console.log(`[CRON] ✓ Đã lưu ${Object.keys(inventoryByShop).length} nhà thuốc vào inventory trên Firebase!`);

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
