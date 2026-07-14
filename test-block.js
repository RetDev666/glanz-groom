const http = require('http');

const payload = JSON.stringify({
  isBlock: true,
  date: new Date(Date.now() + 86400000).toISOString(), // tomorrow
  duration: 60,
  groomerId: 1,
  notes: 'TEST BLOCK'
});

const req = http.request({
  hostname: 'localhost',
  port: 3001, // backend is usually on 3001 or 5000? Let's check backend/src/index.ts
  path: '/api/appointments/admin-create',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': payload.length
  }
}, res => {
  let data = '';
  res.on('data', d => data += d);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Body:', data);
  });
});

req.on('error', console.error);
req.write(payload);
req.end();
