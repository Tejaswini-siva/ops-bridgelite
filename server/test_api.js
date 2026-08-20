const http = require('http');

function makeRequest(options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', (e) => reject(e));

    if (postData) {
      req.write(JSON.stringify(postData));
    }
    req.end();
  });
}

async function runTests() {
  console.log('--- RUNNING BACKEND API TESTS ---');

  // 1. Health check
  const health = await makeRequest({ host: 'localhost', port: 5000, path: '/api/health', method: 'GET' });
  console.log('Health Check:', health.status, health.body.status);

  // 2. Dashboard stats
  const stats = await makeRequest({ host: 'localhost', port: 5000, path: '/api/dashboard/stats', method: 'GET' });
  console.log('Dashboard Stats:', stats.status, stats.body.data);

  // 3. Products list
  const products = await makeRequest({ host: 'localhost', port: 5000, path: '/api/products', method: 'GET' });
  console.log('Products Count:', products.body.data.length);

  // 4. Create product
  const newProd = await makeRequest(
    { host: 'localhost', port: 5000, path: '/api/products', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { name: 'Wireless Bluetooth Earbuds', category: 'Electronics', price: 59.99, quantity: 12, minimum_stock: 4 }
  );
  console.log('Create Product Response:', JSON.stringify(newProd.body, null, 2));

  if (newProd.body.success) {
    const createdId = newProd.body.data.id;

    // 5. Stock In
    const stockIn = await makeRequest(
      { host: 'localhost', port: 5000, path: '/api/stock/in', method: 'POST', headers: { 'Content-Type': 'application/json' } },
      { product_id: createdId, quantity: 5, reason: 'Supplier Delivery' }
    );
    console.log('Stock In Result:', stockIn.status, stockIn.body.message);

    // 6. Stock Out
    const stockOut = await makeRequest(
      { host: 'localhost', port: 5000, path: '/api/stock/out', method: 'POST', headers: { 'Content-Type': 'application/json' } },
      { product_id: createdId, quantity: 3, reason: 'Customer Order #1001' }
    );
    console.log('Stock Out Result:', stockOut.status, stockOut.body.message);

    // 7. Invalid Stock Out (Excess Quantity)
    const invalidStockOut = await makeRequest(
      { host: 'localhost', port: 5000, path: '/api/stock/out', method: 'POST', headers: { 'Content-Type': 'application/json' } },
      { product_id: createdId, quantity: 999, reason: 'Testing Invalid Quantity' }
    );
    console.log('Invalid Stock Out (Should fail with 400):', invalidStockOut.status, invalidStockOut.body.message);
  }

  // 8. Stock History
  const history = await makeRequest({ host: 'localhost', port: 5000, path: '/api/stock/history', method: 'GET' });
  console.log('Stock History Count:', history.body.data.length);

  console.log('--- ALL API TESTS COMPLETED ---');
}

runTests().catch(err => console.error('API Test Error:', err));
