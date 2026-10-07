const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// Route demo API Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Backend Proxy is running',
    timestamp: new Date().toISOString()
  });
});

// Route proxy demo lấy danh sách kho
app.get('/api/inventory', (req, res) => {
  res.json({
    status: 'success',
    data: [
      { id: '1', code: 'MED-001', name: 'Paracetamol 500mg', quantity: 150, unit: 'hộp' },
      { id: '2', code: 'MED-002', name: 'Amoxicillin 250mg', quantity: 20, unit: 'hộp' }
    ]
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
});
