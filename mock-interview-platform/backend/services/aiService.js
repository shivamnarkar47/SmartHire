const https = require('https');
const http = require('http');
require('dotenv').config();

class AIService {
  constructor() {
    this.geminiApiKey = process.env.GEMINI_API_KEY || "AIzaSyAxaWuMFpVNHchxjz48cxI_i8-nR7Lv6n8";
    this.geminiModel = process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite';
    this.opencodeEndpoint = process.env.OPENCODE_ENDPOINT || 'http://localhost:4096';
    this.opencodeSessionId = process.env.OPENCODE_SESSION_ID || 'ses_3ce183adfffeT9GY9TKf3vhKMH';
    this.useOpencodePrimary = process.env.USE_OPENCODE_PRIMARY === 'true';
  }

  async makeGeminiRequest(prompt, maxTokens = 300) {
    return new Promise((resolve) => {
      const postData = JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: maxTokens,
          responseMimeType: 'application/json'
        }
      });

      const options = {
        hostname: 'generativelanguage.googleapis.com',
        path: `/v1beta/models/${this.geminiModel}:generateContent?key=${this.geminiApiKey}`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      console.log('AI Service: Making request to Gemini...');
      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          if (res.statusCode !== 200) {
            console.log('AI Service: Gemini error:', res.statusCode);
            resolve({ error: `Gemini API returned status ${res.statusCode}`, provider: 'gemini' });
            return;
          }
          try {
            const result = JSON.parse(data);
            if (result.error) {
              console.log('AI Service: Gemini API error:', result.error);
              resolve({ error: result.error.message || result.error, provider: 'gemini' });
            } else {
              const text = result.candidates?.[0]?.content?.parts?.[0]?.text || '';
              resolve({ text, provider: 'gemini' });
            }
          } catch (e) {
            resolve({ error: e.message, provider: 'gemini' });
          }
        });
      });

      req.on('error', (e) => {
        console.log('AI Service: Gemini request error:', e.message);
        resolve({ error: e.message, provider: 'gemini' });
      });
      req.write(postData);
      req.end();
    });
  }

  async makeOpencodeRequest(prompt, maxTokens = 300) {
    return new Promise((resolve) => {
      const postData = JSON.stringify({
        parts: [{ type: "text", text: prompt }]
      });

      const url = new URL(`${this.opencodeEndpoint}/session/${this.opencodeSessionId}/message`);
      const options = {
        hostname: url.hostname,
        port: url.port || 80,
        path: url.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      console.log('AI Service: Making request to Opencode...');
      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          if (res.statusCode !== 200) {
            console.log('AI Service: Opencode error:', res.statusCode);
            resolve({ error: `Opencode API returned status ${res.statusCode}`, provider: 'opencode' });
            return;
          }
          try {
            const result = JSON.parse(data);
            if (result.error) {
              console.log('AI Service: Opencode API error:', result.error);
              resolve({ error: result.error.message || result.error, provider: 'opencode' });
            } else {
              const text = result.parts?.[0]?.text || '';
              resolve({ text, provider: 'opencode' });
            }
          } catch (e) {
            resolve({ error: e.message, provider: 'opencode' });
          }
        });
      });

      req.on('error', (e) => {
        console.log('AI Service: Opencode request error:', e.message);
        resolve({ error: e.message, provider: 'opencode' });
      });
      req.write(postData);
      req.end();
    });
  }

  async makeRequest(prompt, maxTokens = 300) {
    if (this.useOpencodePrimary) {
      const opencodeResult = await this.makeOpencodeRequest(prompt, maxTokens);
      if (!opencodeResult.error) {
        console.log('AI Service: Opencode succeeded');
        return opencodeResult;
      }
      console.log('AI Service: Opencode failed, trying Gemini...');
      return await this.makeGeminiRequest(prompt, maxTokens);
    } else {
      const geminiResult = await this.makeGeminiRequest(prompt, maxTokens);
      if (!geminiResult.error) {
        console.log('AI Service: Gemini succeeded');
        return geminiResult;
      }
      console.log('AI Service: Gemini failed, trying Opencode...');
      return await this.makeOpencodeRequest(prompt, maxTokens);
    }
  }

  async generateInterviewQuestion(type, domain, difficulty, previousQuestions = []) {
    const prompt = `Generate exactly ONE ${difficulty} level ${type} interview question for ${domain}.
    ${previousQuestions.length > 0 ? `Avoid these topics: ${previousQuestions.join(', ')}` : ''}

    JSON format only:
    {"question": "your question", "category": "category name", "expectedPoints": ["point 1", "point 2"], "timeLimit": 300}`;

    const result = await this.makeRequest(prompt, 200);

    if (result.error) {
      console.error('AI Error:', result.error, 'Provider:', result.provider);
      return this.getFallbackQuestion(domain);
    }

    const parsed = this.parseJSON(result.text);
    if (!parsed || !parsed.question) {
      console.error('AI returned invalid data:', result.text);
      return this.getFallbackQuestion(domain);
    }

    return parsed;
  }

  async evaluateAnswer(question, answer, type, domain) {
    const prompt = `Evaluate this ${type} interview answer for ${domain}.
    
Question: ${question}
Answer: ${answer}

JSON format only:
{"score": 75, "strengths": ["strength 1"], "improvements": ["improvement 1"], "analysis": "brief analysis", "communication": {"clarity": 75, "structure": 75, "confidence": 75}}`;

    const result = await this.makeRequest(prompt, 300);
    
    if (result.error) {
      return this.getFallbackFeedback();
    }

    const parsed = this.parseJSON(result.text);
    return parsed || this.getFallbackFeedback();
  }

  async generateOverallFeedback(interviewData) {
    const prompt = `Generate interview feedback summary.
    
Type: ${interviewData.type}, Domain: ${interviewData.domain}
Questions: ${interviewData.questions.length}

JSON format:
{"overallScore": 75, "summary": "brief summary", "strengths": ["strength 1"], "areasForImprovement": ["area 1"], "keyTakeaways": "advice", "nextSteps": ["step 1"]}`;

    const result = await this.makeRequest(prompt, 250);
    
    if (result.error) {
      return this.getFallbackOverallFeedback();
    }

    const parsed = this.parseJSON(result.text);
    return parsed || this.getFallbackOverallFeedback();
  }

  parseJSON(text) {
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) return JSON.parse(jsonMatch[0]);
      return JSON.parse(text);
    } catch (e) {
      try {
        const clean = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(clean);
      } catch (e2) {
        return null;
      }
    }
  }

  getFallbackQuestion(domain) {
    const fallbackQuestions = [
      {
        question: `Describe a challenging project you worked on in ${domain} and how you overcame obstacles.`,
        category: 'Projects',
        expectedPoints: ['Project context', 'Challenges faced', 'Solution approach', 'Outcome'],
        aiPrompt: `Fallback question for ${domain}: Describe a challenging project.`,
        timeLimit: 300
      },
      {
        question: `Tell me about a time you had to learn a new technology or skill quickly for ${domain}.`,
        category: 'Learning',
        expectedPoints: ['Situation', 'Learning approach', 'Application', 'Result'],
        aiPrompt: `Fallback question for ${domain}: Learning new skills.`,
        timeLimit: 300
      },
      {
        question: `How do you prioritize tasks when working on multiple ${domain} projects simultaneously?`,
        category: 'Time Management',
        expectedPoints: ['Prioritization strategy', 'Examples', 'Results'],
        aiPrompt: `Fallback question for ${domain}: Task prioritization.`,
        timeLimit: 300
      },
      {
        question: `Describe a situation where you had a disagreement with a colleague regarding ${domain} and how you resolved it.`,
        category: 'Collaboration',
        expectedPoints: ['Context', 'Disagreement', 'Resolution', 'Outcome'],
        aiPrompt: `Fallback question for ${domain}: Conflict resolution.`,
        timeLimit: 300
      },
      {
        question: `What are the most important skills for success in ${domain} and why?`,
        category: 'Skills',
        expectedPoints: ['Key skills', 'Why important', 'Examples'],
        aiPrompt: `Fallback question for ${domain}: Important skills.`,
        timeLimit: 300
      }
    ];
    return fallbackQuestions[Math.floor(Math.random() * fallbackQuestions.length)];
  }

  getFallbackFeedback() {
    return {
      score: 70,
      strengths: ['Good response'],
      improvements: ['Add more details'],
      analysis: 'Consider providing concrete examples.',
      communication: { clarity: 70, structure: 70, confidence: 70 }
    };
  }

  getFallbackOverallFeedback() {
    return {
      overallScore: 75,
      summary: 'Good performance overall.',
      strengths: ['Consistent effort'],
      areasForImprovement: ['More examples'],
      keyTakeaways: 'Continue practicing.',
      nextSteps: ['Review feedback', 'Practice more']
    };
  }
}

module.exports = new AIService();
