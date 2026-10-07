const fs = require('fs');
const path = require('path');

const inputFilePath = path.join(__dirname, '..', 'api_help_documentation.json');
const outputFilePath = path.join(__dirname, '..', 'openapi_swagger.json');

const inputData = JSON.parse(fs.readFileSync(inputFilePath, 'utf8'));

const openapi = {
  openapi: '3.0.0',
  info: {
    title: inputData.title || 'ICPC1HN NHATHUOC API Documentation',
    version: '1.0.0',
    description: 'Tài liệu OpenAPI 3.0 tiêu chuẩn của Hệ thống ICPC1HN / NHATHUOC UPHARMA, tương thích hoàn toàn với Swagger Editor, Postman và Swagger UI.',
    contact: {
      name: 'ICPC1HN NHATHUOC Support',
      url: inputData.helpUrl || 'https://icpc1hn.work/NHATHUOC/Help'
    }
  },
  servers: [
    {
      url: inputData.baseUrl || 'https://icpc1hn.work/NHATHUOC',
      description: 'Production Server'
    }
  ],
  tags: [],
  paths: {}
};

inputData.modules.forEach(mod => {
  const tagName = mod.id || mod.title;
  openapi.tags.push({
    name: tagName,
    description: mod.description || tagName
  });

  if (Array.isArray(mod.endpoints)) {
    mod.endpoints.forEach(ep => {
      let routePath = ep.endpoint;
      if (!routePath.startsWith('/')) {
        routePath = '/' + routePath;
      }

      const method = (ep.method || 'POST').toLowerCase();

      if (!openapi.paths[routePath]) {
        openapi.paths[routePath] = {};
      }

      const sanitizedOpId = (ep.endpoint || '').replace(/[^a-zA-Z0-9_]/g, '_');

      openapi.paths[routePath][method] = {
        tags: [tagName],
        summary: ep.description || ep.name,
        description: `Name: ${ep.name}\nDetail URL: ${ep.detail_url || ''}`,
        operationId: `${method}_${sanitizedOpId}`,
        responses: {
          '200': {
            description: 'Phản hồi thành công (Successful operation)',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    Code: { type: 'integer', example: 200 },
                    Message: { type: 'string', example: 'Thành công' },
                    Data: { type: 'object' }
                  }
                }
              }
            }
          }
        }
      };
    });
  }
});

fs.writeFileSync(outputFilePath, JSON.stringify(openapi, null, 2), 'utf8');
console.log('Successfully generated openapi_swagger.json!');
console.log('Total paths:', Object.keys(openapi.paths).length);
console.log('Total tags:', openapi.tags.length);
