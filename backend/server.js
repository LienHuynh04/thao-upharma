const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const swaggerUi = require('swagger-ui-express');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// Load OpenAPI Swagger Spec
const swaggerPath = path.join(__dirname, 'openapi_swagger.json');
let swaggerDocument = {};

if (fs.existsSync(swaggerPath)) {
  swaggerDocument = JSON.parse(fs.readFileSync(swaggerPath, 'utf8'));
} else {
  const rootSwaggerPath = path.join(__dirname, '..', 'openapi_swagger.json');
  if (fs.existsSync(rootSwaggerPath)) {
    swaggerDocument = JSON.parse(fs.readFileSync(rootSwaggerPath, 'utf8'));
  }
}

// Serve Swagger JSON raw endpoint
app.get('/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerDocument);
});

app.get('/openapi.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerDocument);
});

// Serve Interactive Swagger UI
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Route demo API Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Backend Proxy & Swagger Server is running',
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
  console.log(`📑 Interactive Swagger UI: http://localhost:${PORT}/swagger`);
  console.log(`📄 Swagger JSON spec:     http://localhost:${PORT}/swagger.json`);
});
