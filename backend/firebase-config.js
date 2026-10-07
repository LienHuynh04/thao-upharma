const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');

let db = null;

if (fs.existsSync(serviceAccountPath)) {
  try {
    const serviceAccount = require(serviceAccountPath);
    if (admin.apps.length === 0) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: process.env.FIREBASE_DATABASE_URL
      });
    }
    db = admin.database();
    console.log('✅ Firebase Admin SDK đã khởi tạo thành công với Database URL:', process.env.FIREBASE_DATABASE_URL);
  } catch (err) {
    console.warn('⚠️ File serviceAccountKey.json chưa đúng cấu hình Firebase Admin Key thực tế:', err.message);
  }
} else {
  console.warn('⚠️ Chưa tìm thấy file backend/serviceAccountKey.json. Vui lòng tải private key từ Firebase Console và lưu vào thư mục backend/.');
}

module.exports = db;
