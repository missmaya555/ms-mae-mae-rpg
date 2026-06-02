const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Ms. Mae-Mae AI Mentor
 * Provides personalized educational guidance during gameplay
 */
async function askMaeMae(studentMessage, context = {}) {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  const prompt = `You are Ms. Mae-Mae, a warm and encouraging AI mentor 
in an educational RPG game. Your students are on quests and need your 
guidance. You help them learn by asking Socratic questions, giving helpful 
hints, and celebrating their progress. Keep responses short, fun, and 
age-appropriate.
Context: ${JSON.stringify(context)}

Student says: ${studentMessage}`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}

module.exports = { askMaeMae };