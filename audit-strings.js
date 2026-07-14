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

(async () => {
  console.log('Fetching https://glanzgroom.de/book ...');
  const html = await get('https://glanzgroom.de/book');
  
  const chunkRegex = /\/_next\/static\/chunks\/pages\/book-[a-zA-Z0-9]+\.js/g;
  const match = html.match(chunkRegex);
  
  if (!match) {
    console.log('Could not find book JS chunk.');
    return;
  }
  
  const chunkUrl = 'https://glanzgroom.de' + match[0];
  console.log('Found chunk:', chunkUrl);
  
  const chunkData = await get(chunkUrl);
  
  const breedsToCheck = ['Mops', 'Dalmatiner', 'Dobermann', 'Westie', 'Foxterrier', 'Riesenschnauzer', 'Malteser', 'Yorkie', 'Pudel'];
  let allFound = true;
  
  for (const breed of breedsToCheck) {
    if (chunkData.includes(breed)) {
      console.log(`[OK] Found breed: ${breed}`);
    } else {
      console.log(`[ERROR] Missing breed: ${breed}`);
      allFound = false;
    }
  }
  
  if (allFound) {
    console.log('\nSUCCESS: All new breeds are correctly deployed to the site!');
  } else {
    console.log('\nFAILURE: Some breeds are missing from the live JS bundle.');
  }
})();
