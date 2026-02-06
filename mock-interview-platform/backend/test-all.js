require('dotenv').config();

const https = require('https');

const apiKey = process.env.GEMINI_API_KEY;

console.log('API Key present:', !!apiKey);
console.log('API Key (first 10 chars):', apiKey ? apiKey.substring(0, 10) + '...' : 'MISSING');

if (!apiKey) {
  console.log('\n⚠️ API key not found! Check your .env file.');
  process.exit(1);
}

const endpoints = [
  '/v1/models/gemini-1.5-flash:generateContent',
  '/v1/models/gemini-1.5-pro:generateContent', 
  '/v1/models/gemini-pro:generateContent',
  '/v1beta/models/gemini-1.5-flash:generateContent'
];

const prompt = JSON.stringify({
  contents: [{ parts: [{ text: 'Hello' }] }]
});

function testEndpoint(path) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'generativelanguage.googleapis.com',
      path: path + '?key=' + apiKey,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': prompt.length }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        resolve({ path, status: res.statusCode, data: data.substring(0, 300) });
      });
    });

    req.on('error', (e) => resolve({ path, error: e.message }));
    req.write(prompt);
    req.end();
  });
}

async function testAll() {
  console.log('\nTesting Gemini API endpoints...\n');
  
  for (const endpoint of endpoints) {
    const result = await testEndpoint(endpoint);
    console.log(`${result.path}`);
    console.log(`  Status: ${result.status || result.error}`);
    if (result.data) console.log(`  Response: ${result.data}`);
    console.log('');
  }
}

testAll();
