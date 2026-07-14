const https = require('https');

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function checkDeployment() {
  try {
    const html = await get('https://glanzgroom.de/book');
    const chunkRegex = /\/_next\/static\/chunks\/pages\/book-[a-zA-Z0-9]+\.js/g;
    const match = html.match(chunkRegex);
    
    if (!match) return false;
    
    const chunkUrl = 'https://glanzgroom.de' + match[0];
    const chunkData = await get(chunkUrl);
    
    const breedsToCheck = ['Mops', 'Dalmatiner', 'Dobermann', 'Westie', 'Foxterrier', 'Riesenschnauzer', 'Malteser', 'Yorkie', 'Pudel'];
    let allFound = true;
    for (const breed of breedsToCheck) {
      if (!chunkData.includes(breed)) {
        allFound = false;
        break;
      }
    }
    return allFound;
  } catch (e) {
    return false;
  }
}

(async () => {
  console.log('Started monitoring deployment...');
  let attempts = 0;
  while (attempts < 60) { // 60 attempts * 10 seconds = 10 minutes
    const isDeployed = await checkDeployment();
    if (isDeployed) {
      console.log('SUCCESS: All new breeds are correctly deployed to the site!');
      process.exit(0);
    }
    console.log(`Attempt ${attempts + 1}/60: Not yet deployed. Waiting 10s...`);
    await new Promise(r => setTimeout(r, 10000));
    attempts++;
  }
  console.log('FAILURE: Timeout waiting for deployment.');
  process.exit(1);
})();
