const https = require('https');

const apiKey = process.env.GEMINI_API_KEY;
const prompt = 'Generate a simple behavioral interview question. Respond with JSON: {"question": "your question"}';

const postData = JSON.stringify({
  contents: [{ parts: [{ text: prompt }] }],
  generationConfig: {
    temperature: 0.7,
    maxOutputTokens: 100
  }
});

const options = {
  hostname: 'generativelanguage.googleapis.com',
  path: '/v1beta/models/gemini-1.5-pro:generateContent?key=' + apiKey,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': postData.length
  }
};

console.log('Testing Gemini API...');
const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    try {
      const result = JSON.parse(data);
      if (result.error) {
        console.error('API Error:', result.error.message);
      } else {
        console.log('Success! Response:');
        console.log(data);
      }
    } catch (e) {
      console.error('Parse Error:', e.message);
      console.log('Raw data:', data);
    }
  });
});

req.on('error', (e) => console.error('Request Error:', e.message));
req.write(postData);
req.end();
