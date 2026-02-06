require('dotenv').config();
const aiService = require('./services/aiService');

async function testAI() {
  console.log('Testing AI Question Generation...\n');
  
  console.log('1. Generating question...');
  const qStart = Date.now();
  const question = await aiService.generateInterviewQuestion('behavioral', 'software-engineering', 'medium', []);
  console.log(`   Time: ${(Date.now() - qStart) / 1000}s`);
  console.log(`   Question: ${question.question}`);
  console.log(`   Category: ${question.category}\n`);

  console.log('2. Evaluating answer...');
  const aStart = Date.now();
  const feedback = await aiService.evaluateAnswer(
    question.question,
    'I solved a complex bug by carefully analyzing the logs and implementing a fix.',
    'behavioral',
    'software-engineering'
  );
  console.log(`   Time: ${(Date.now() - aStart) / 1000}s`);
  console.log(`   Score: ${feedback.score}`);
  console.log(`   Strengths: ${feedback.strengths.join(', ')}\n`);

  console.log('✅ AI Service is working correctly!');
}

testAI().catch(console.error);
