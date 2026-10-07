const fs = require('fs');
const path = require('path');
const https = require('https');

const inputFilePath = path.join(__dirname, '..', 'api_help_documentation.json');
const outputOpenApiFilePath = path.join(__dirname, '..', 'openapi_swagger.json');
const outputEnrichedDocPath = path.join(__dirname, '..', 'api_help_documentation.json');
const backendSwaggerPath = path.join(__dirname, '..', 'backend', 'openapi_swagger.json');

const inputData = JSON.parse(fs.readFileSync(inputFilePath, 'utf8'));

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { rejectUnauthorized: false }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', (err) => resolve(''));
  });
}

function decodeHtmlEntities(str) {
  if (!str) return '';
  return str
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&#39;/g, "'");
}

function parseHelpPage(html) {
  if (!html) return { requestSample: null, responseSample: null, requestModel: null, responseModel: null };

  const cleanHtml = decodeHtmlEntities(html);

  // Extract Sample JSON Request
  let requestSample = null;
  const reqMatch = html.match(/<h2>Request Information<\/h2>[\s\S]*?<h4 class="sample-header">application\/json[\s\S]*?<pre class="wrapped">([\s\S]*?)<\/pre>/i);
  if (reqMatch) {
    const rawSample = decodeHtmlEntities(reqMatch[1].trim());
    try {
      requestSample = JSON.parse(rawSample);
    } catch (e) {
      requestSample = rawSample;
    }
  }

  // Extract Sample JSON Response
  let responseSample = null;
  const resMatch = html.match(/<h2>Response Information<\/h2>[\s\S]*?<h4 class="sample-header">application\/json[\s\S]*?<pre class="wrapped">([\s\S]*?)<\/pre>/i);
  if (resMatch) {
    const rawSample = decodeHtmlEntities(resMatch[1].trim());
    try {
      responseSample = JSON.parse(rawSample);
    } catch (e) {
      responseSample = rawSample;
    }
  }

  return { requestSample, responseSample };
}

async function scrapeAllEndpoints() {
  console.log('🚀 Bắt đầu cào thông tin chi tiết (Request Payload & Response Sample) cho 657 APIs...');

  let totalEndpoints = 0;
  inputData.modules.forEach(m => totalEndpoints += (m.endpoints || []).length);
  let processed = 0;

  const BATCH_SIZE = 15;

  for (const mod of inputData.modules) {
    if (!mod.endpoints) continue;

    for (let i = 0; i < mod.endpoints.length; i += BATCH_SIZE) {
      const chunk = mod.endpoints.slice(i, i + BATCH_SIZE);
      await Promise.all(chunk.map(async (ep) => {
        if (ep.detail_url) {
          try {
            const html = await fetchUrl(ep.detail_url);
            const parsed = parseHelpPage(html);
            ep.requestSample = parsed.requestSample;
            ep.responseSample = parsed.responseSample;
          } catch (err) {
            console.error('Lỗi fetch:', ep.detail_url, err.message);
          }
        }
        processed++;
      }));
      process.stdout.write(`Đã cào: ${processed}/${totalEndpoints} APIs...\r`);
    }
  }

  console.log(`\n✅ Đã hoàn tất cào dữ liệu cho ${processed} APIs! Updating files...`);

  // Save enriched documentation JSON
  fs.writeFileSync(outputEnrichedDocPath, JSON.stringify(inputData, null, 2), 'utf8');

  // Build OpenAPI 3.0 specification
  const openapi = {
    openapi: '3.0.0',
    info: {
      title: inputData.title || 'ICPC1HN NHATHUOC API Documentation',
      version: '1.0.0',
      description: 'Tài liệu OpenAPI 3.0 tiêu chuẩn của Hệ thống ICPC1HN / NHATHUOC UPHARMA chứa đầy đủ Request Payload Schema, Sample Request & Sample Response.',
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

        const opObject = {
          tags: [tagName],
          summary: ep.description || ep.name,
          description: `Name: ${ep.name}\nDetail URL: ${ep.detail_url || ''}`,
          operationId: `${method}_${sanitizedOpId}`,
          responses: {}
        };

        // Add Request Payload if present
        if (ep.requestSample) {
          opObject.requestBody = {
            required: true,
            description: 'Dữ liệu Yêu cầu (Request Payload)',
            content: {
              'application/json': {
                schema: {
                  type: typeof ep.requestSample === 'object' ? 'object' : 'string',
                  example: ep.requestSample
                }
              }
            }
          };
        }

        // Add Response Sample if present
        if (ep.responseSample) {
          opObject.responses['200'] = {
            description: 'Phản hồi thành công (Successful operation)',
            content: {
              'application/json': {
                schema: {
                  type: typeof ep.responseSample === 'object' ? 'object' : 'string',
                  example: ep.responseSample
                }
              }
            }
          };
        } else {
          opObject.responses['200'] = {
            description: 'Phản hồi thành công',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    RespCode: { type: 'integer', example: 0 },
                    RespText: { type: 'string', example: 'Thành công' }
                  }
                }
              }
            }
          };
        }

        openapi.paths[routePath][method] = opObject;
      });
    }
  });

  fs.writeFileSync(outputOpenApiFilePath, JSON.stringify(openapi, null, 2), 'utf8');
  fs.writeFileSync(backendSwaggerPath, JSON.stringify(openapi, null, 2), 'utf8');

  console.log('🎉 Đã cập nhật xong openapi_swagger.json & backend/openapi_swagger.json với Request Payload & Response Sample!');
}

scrapeAllEndpoints();
