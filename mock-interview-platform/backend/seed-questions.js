const mongoose = require('mongoose');
const Question = require('../models/Question');
const aiService = require('../services/aiService');

const domains = [
  'general',
  'software-engineering',
  'product-management',
  'data-science',
  'design',
  'marketing'
];

const types = ['behavioral', 'technical', 'domain-specific'];

const QUESTIONS_PER_COMBO = 10;

async function seedQuestions() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mock-interview');
    console.log('Connected to MongoDB');

    // Clear existing questions
    await Question.deleteMany({});
    console.log('Cleared existing questions');

    let totalCreated = 0;

    for (const domain of domains) {
      for (const type of types) {
        console.log(`Generating ${QUESTIONS_PER_COMBO} questions for ${type}/${domain}...`);
        
        const questions = [];
        const askedCategories = [];

        // Generate all questions for this combination in parallel
        const promises = [];
        for (let i = 0; i < QUESTIONS_PER_COMBO; i++) {
          promises.push(
            aiService.generateInterviewQuestion(type, domain, 'medium', askedCategories)
          );
        }

        const results = await Promise.all(promises);

        for (const result of results) {
          if (result && result.question) {
            const questionDoc = new Question({
              type,
              domain,
              difficulty: 'medium',
              question: result.question,
              category: result.category,
              expectedAnswerPoints: result.expectedPoints || [],
              aiPrompt: '',
              timeLimit: result.timeLimit || 300,
              isActive: true,
              tags: [type, domain, result.category]
            });
            
            await questionDoc.save();
            questions.push(questionDoc);
            askedCategories.push(result.category);
            totalCreated++;
          }
        }

        console.log(`✓ Created ${questions.length} questions for ${type}/${domain}`);
      }
    }

    console.log(`\n✅ Seeding complete! Total questions created: ${totalCreated}`);
    
    // Index for faster queries
    await Question.createIndexes({ type: 1, domain: 1, category: 1, isActive: 1 });
    console.log('Indexes created');

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seedQuestions();
