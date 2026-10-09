const fs = require('fs');
const path = require('path');
const { initializeApp, cert } = require('firebase-admin/app');
const { getDatabase } = require('firebase-admin/database');

const keyPath = path.join(__dirname, '..', 'backend', 'thao-uph-firebase-adminsdk-fbsvc-ee2f42c516.json');
if (!fs.existsSync(keyPath)) {
  console.error("Không tìm thấy service account key:", keyPath);
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
const app = initializeApp({
  credential: cert(serviceAccount),
  databaseURL: "https://thao-uph-default-rtdb.asia-southeast1.firebasedatabase.app"
});

const db = getDatabase(app);

async function aggregateData() {
  console.log("Đang đọc toàn bộ shops từ Firebase RTDB...");
  const snapshot = await db.ref('shops').once('value');
  const shopsData = snapshot.val();
  if (!shopsData) {
    console.error("Không có dữ liệu trong node shops");
    process.exit(1);
  }

  const shopCodes = Object.keys(shopsData);
  console.log(`Tìm thấy ${shopCodes.length} shops:`, shopCodes.join(', '));

  const resources = ['employees_detail', 'shop_plan', 'sales_report'];

  for (const resourceName of resources) {
    let count = 0;
    console.log(`Đang xử lý ${resourceName}...`);
    for (const shopCode of shopCodes) {
      const resNode = shopsData[shopCode]?.upharma_data?.[resourceName];
      if (resNode && resNode.data) {
        try {
          await db.ref(`upharma_data/${resourceName}/data/${shopCode}`).set(resNode.data);
          count++;
        } catch (err) {
          console.warn(`  Lỗi shop ${shopCode} trong ${resourceName}:`, err.message);
        }
      }
    }

    if (count > 0) {
      await db.ref(`upharma_data/${resourceName}/success`).set(true);
      await db.ref(`upharma_data/${resourceName}/resource`).set(resourceName);
      await db.ref(`upharma_data/${resourceName}/fetchedAt`).set(new Date().toISOString());
      console.log(`✅ Hoàn thành gộp upharma_data/${resourceName} (${count} shops)`);
    } else {
      console.warn(`⚠️ Không tìm thấy data nào cho ${resourceName}`);
    }
  }

  console.log("Tất cả đã hoàn thành!");
  process.exit(0);
}

aggregateData().catch(err => {
  console.error("Lỗi:", err);
  process.exit(1);
});
