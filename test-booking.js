const https = require('https');

function post(url, data) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(data);
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    };
    
    const req = https.request(url, options, (res) => {
      let responseBody = '';
      res.on('data', chunk => responseBody += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: responseBody }));
    });
    
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

(async () => {
  try {
    const url = 'https://glanz-groom.netlify.app/api/appointments';
    console.log(`Sending POST to ${url}`);
    const res = await post(url, {
      clientFirstName: 'Test',
      clientLastName: 'User',
      clientEmail: 'test@example.com',
      clientPhone: '+49123456789',
      petName: 'Rex',
      petBreed: 'Mops',
      petSize: 's',
      petPhotoUrl: null,
      notes: 'Test booking from bot',
      groomerId: 1,
      date: new Date().toISOString(),
      serviceIds: [1], // assuming 1 is a valid service ID
      duration: 60,
      totalPrice: 50
    });
    
    console.log(`Status: ${res.status}`);
    console.log(`Body: ${res.body}`);
  } catch (e) {
    console.error(e);
  }
})();
