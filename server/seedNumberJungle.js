/**
 * One-time seed script for Number Jungle questions.
 *
 * Usage:
 *   node server/seedNumberJungle.js
 *
 * It connects to the same MongoDB Atlas database your app already uses,
 * adds a few practice questions, then disconnects.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Question = require('./models/Question');

// Adjust this if your .env variable is named differently
// (check .env for something like MONGODB_URI= or DATABASE_URL=)
const MONGO_URI =
  process.env.MONGODB_URI ||
  process.env.MONGO_URI ||
  process.env.DATABASE_URL;

if (!MONGO_URI) {
  console.error(
    '❌ No MongoDB connection string found. Check your .env file for the variable name and update MONGO_URI in this script to match.'
  );
  process.exit(1);
}

// A minimal Quest ObjectId placeholder — swap this for your real
// Number Jungle Quest document's _id once you have one saved.
const PLACEHOLDER_QUEST_ID = new mongoose.Types.ObjectId();

const sampleQuestions = [
  {
    quest: PLACEHOLDER_QUEST_ID,
    gradeBand: 'prek-k',
    difficulty: 1,
    type: 'tap-select',
    prompt: 'How many monkeys do you see?',
    choices: [
      { label: '2', isCorrect: false },
      { label: '3', isCorrect: true },
      { label: '4', isCorrect: false },
    ],
  },
  {
    quest: PLACEHOLDER_QUEST_ID,
    gradeBand: '1-2',
    difficulty: 1,
    type: 'tap-select',
    prompt: 'What is 4 + 3?',
    choices: [
      { label: '6', isCorrect: false },
      { label: '7', isCorrect: true },
      { label: '8', isCorrect: false },
    ],
  },
  {
    quest: PLACEHOLDER_QUEST_ID,
    gradeBand: '3-5',
    difficulty: 1,
    type: 'tap-select',
    prompt: 'What is 12 × 3?',
    choices: [
      { label: '24', isCorrect: false },
      { label: '36', isCorrect: true },
      { label: '32', isCorrect: false },
    ],
  },
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    await Question.insertMany(sampleQuestions);
    console.log(`✅ Inserted ${sampleQuestions.length} practice questions`);
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected. Done.');
  }
}

seed();