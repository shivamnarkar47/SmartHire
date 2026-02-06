const https = require('https');

const apiKey = process.env.GEMINI_API_KEY;

const options = {
  hostname: 'generativelanguage.googleapis.com',
  path: '/v1beta/models?key=' + apiKey,
  method: 'GET'
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    try {
      const models = JSON.parse(data);
      console.log('Available models:');
      models.models?.forEach(m => console.log(`- ${m.name} (${m.supportedMethods?.join(', ')})`));
    } catch (e) {
      console.error('Error:', data);
    }
  });
});

req.on('error', (e) => console.error('Error:', e.message));
req.end();
