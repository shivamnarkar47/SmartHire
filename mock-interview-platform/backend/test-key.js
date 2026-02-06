const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function testKey() {
  try {
    console.log('Testing API key...');
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const result = await model.generateContent("Hello, are you working?");
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ SUCCESS! API key is working.');
    console.log('Response:', text);
    process.exit(0);
  } catch (error) {
    console.error('❌ FAILED:', error.message);
    if (error.message.includes('API key not valid')) {
      console.log('\nYour API key is invalid. Please:');
      console.log('1. Go to https://aistudio.google.com/app/apikey');
      console.log('2. Create a NEW API key (delete old ones first)');
      console.log('3. Make sure to enable the "Generative Language API"');
    }
    process.exit(1);
  }
}

testKey();
