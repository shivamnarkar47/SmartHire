require('dotenv').config();

const https = require('https');

const apiKey = process.env.GEMINI_API_KEY;
const prompt = JSON.stringify({
  contents: [{ parts: [{ text: 'Generate a behavioral interview question. Respond with JSON: {"question": "your question", "category": "category"}' }] }]
});

const models = ['gemini-2.0-flash', 'gemini-pro-latest', 'gemini-flash-latest'];

async function testModel(modelName) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'generativelanguage.googleapis.com',
      path: `/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': prompt.length }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        const result = JSON.parse(data);
        if (result.error) {
          resolve({ model: modelName, success: false, error: result.error.message });
        } else {
          resolve({ model: modelName, success: true, response: data.substring(0, 500) });
        }
      });
    });

    req.on('error', (e) => resolve({ model: modelName, success: false, error: e.message }));
    req.write(prompt);
    req.end();
  });
}

async function runTests() {
  console.log('Testing Gemini models...\n');
  
  for (const model of models) {
    const result = await testModel(model);
    console.log(`${result.success ? '✅' : '❌'} ${model}: ${result.success ? 'WORKS' : result.error}`);
    if (result.success) console.log(`   Response: ${result.response}`);
  }
}

runTests();
