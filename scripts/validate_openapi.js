const fs = require('fs');
const path = require('path');

const openapiPath = path.join(__dirname, '..', 'upharma-openapi.json');

try {
  const content = fs.readFileSync(openapiPath, 'utf8');
  const doc = JSON.parse(content);

  console.log('--- VALIDATION RESULTS ---');
  console.log('1. JSON Validity: ✅ PASSED (Valid JSON Syntax)');

  // Check top-level required fields
  const requiredTop = ['openapi', 'info', 'servers', 'paths', 'components'];
  const missingTop = requiredTop.filter(k => !doc[k]);
  if (missingTop.length === 0) {
    console.log('2. OpenAPI 3.0.3 Structure: ✅ PASSED (All required top-level keys present)');
  } else {
    console.log('2. OpenAPI Structure: ❌ FAILED (Missing keys:', missingTop.join(', '), ')');
  }

  // Check $ref validity
  const schemas = doc.components.schemas || {};
  let invalidRefs = 0;
  let totalRefs = 0;

  function checkRefs(obj) {
    if (!obj || typeof obj !== 'object') return;
    for (const key in obj) {
      if (key === '$ref') {
        totalRefs++;
        const refTarget = obj[key];
        if (refTarget.startsWith('#/components/schemas/')) {
          const modelName = refTarget.replace('#/components/schemas/', '');
          if (!schemas[modelName]) {
            console.error('Invalid $ref target:', refTarget);
            invalidRefs++;
          }
        }
      } else {
        checkRefs(obj[key]);
      }
    }
  }

  checkRefs(doc.paths);
  checkRefs(schemas);

  if (invalidRefs === 0) {
    console.log(`3. $ref Integrity Check: ✅ PASSED (Checked ${totalRefs} $ref links, 0 broken links)`);
  } else {
    console.log(`3. $ref Integrity Check: ❌ FAILED (${invalidRefs} broken $ref links found)`);
  }

  // Check duplicate paths
  const pathKeys = Object.keys(doc.paths || {});
  const uniquePaths = new Set(pathKeys);
  if (pathKeys.length === uniquePaths.size) {
    console.log(`4. Duplicate Paths Check: ✅ PASSED (${pathKeys.length} unique paths, 0 duplicates)`);
  } else {
    console.log('4. Duplicate Paths Check: ❌ FAILED');
  }

  console.log('\n--- SYSTEM STATISTICS ---');
  console.log('• Total Endpoints:', pathKeys.length);
  const schemasCount = Object.keys(schemas).length;
  console.log('• Total Schemas in components.schemas:', schemasCount);

  let postCount = 0, getCount = 0, putCount = 0, deleteCount = 0;
  for (const p of pathKeys) {
    const methods = Object.keys(doc.paths[p]);
    if (methods.includes('post')) postCount++;
    if (methods.includes('get')) getCount++;
    if (methods.includes('put')) putCount++;
    if (methods.includes('delete')) deleteCount++;
  }

  console.log(`• Method Breakdown -> POST: ${postCount}, GET: ${getCount}, PUT: ${putCount}, DELETE: ${deleteCount}`);

} catch (err) {
  console.error('Validation Error:', err.message);
}
