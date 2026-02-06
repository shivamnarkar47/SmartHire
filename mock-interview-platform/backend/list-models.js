require('dotenv').config();

const https = require('https');

const apiKey = process.env.GEMINI_API_KEY;

const options = {
  hostname: 'generativelanguage.googleapis.com',
  path: '/v1beta/models?key=' + apiKey,
  method: 'GET'
};

console.log('Fetching available models...\n');

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    try {
      const result = JSON.parse(data);
      if (result.models) {
        console.log('Available Models:\n');
        result.models.forEach(m => {
          console.log(`Name: ${m.name}`);
          console.log(`  Display: ${m.displayName}`);
          console.log(`  Methods: ${m.supportedMethods?.join(', ')}`);
          console.log(`  Input: ${m.inputTokenLimit} tokens max`);
          console.log(`  Output: ${m.outputTokenLimit} tokens max`);
          console.log('');
        });
      } else if (result.error) {
        console.log('Error:', result.error.message);
      } else {
        console.log('Response:', data);
      }
    } catch (e) {
      console.error('Parse error:', e.message);
      console.log('Raw:', data);
    }
  });
});

req.on('error', (e) => console.error('Error:', e.message));
req.end();
