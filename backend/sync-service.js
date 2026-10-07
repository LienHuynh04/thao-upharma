const cron = require('node-cron');
const db = require('./firebase-config');
const axios = require('axios');
require('dotenv').config();

// Hàm thực hiện kéo dữ liệu từ API gốc & đẩy lên Firebase Cache
async function syncDataFromCoreSystem() {
  console.log(`[${new Date().toISOString()}] 🔄 Đang bắt đầu đồng bộ dữ liệu...`);
  try {
    let inventoryData;
    const coreApiUrl = process.env.CORE_API_URL;
    const coreApiToken = process.env.CORE_API_TOKEN;

    if (coreApiUrl && !coreApiUrl.includes('api-he-thong-goc.com')) {
      // Gọi API hệ thống gốc
      const response = await axios.get(`${coreApiUrl}/inventory`, {
        headers: { Authorization: `Bearer ${coreApiToken}` }
      });
      inventoryData = response.data;
    } else {
      // Dữ liệu mẫu demo nếu chưa cấu hình URL hệ thống gốc
      inventoryData = [
        { id: '1', code: 'MED-001', name: 'Paracetamol 500mg', quantity: 150, unit: 'hộp' },
        { id: '2', code: 'MED-002', name: 'Amoxicillin 250mg', quantity: 20, unit: 'hộp' }
      ];
    }

    // Đẩy dữ liệu lên Firebase Realtime DB (nếu đã kết nối)
    if (db) {
      const ref = db.ref('upharma_data/inventory');
      await ref.set({
        updatedAt: new Date().toISOString(),
        items: inventoryData
      });
      console.log(`[${new Date().toISOString()}] ✅ Đồng bộ dữ liệu lên Firebase thành công!`);
    } else {
      console.log(`[${new Date().toISOString()}] ℹ️ Giả lập đồng bộ thành công (Cần cấu hình serviceAccountKey.json để ghi lên Firebase thực tế).`);
    }
  } catch (error) {
    console.error('❌ Lỗi khi đồng bộ dữ liệu:', error.message);
  }
}

// Lập lịch Cronjob: Chạy tự động mỗi 15 phút
// Cấu trúc Cron: (Phút Giờ Ngày Tháng Thứ) -> "*/15 * * * *"
cron.schedule('*/15 * * * *', () => {
  syncDataFromCoreSystem();
});

console.log('🚀 Cronjob Sync Service đã khởi chạy! (Lịch chạy: Mỗi 15 phút)');
// Chạy thử ngay lần đầu khi khởi động
syncDataFromCoreSystem();
