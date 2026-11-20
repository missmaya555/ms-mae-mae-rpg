/**
 * One-time seed script for Number Jungle questions (grades 6–12).
 *
 * Usage:
 *   node server/seedNumberJungle.js
 *
 * Loads every question from server/data/numberJungleQuestions.js into the
 * same MongoDB Atlas database your app uses, then disconnects.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Question = require('./models/Question');
const { QUESTION_BANK } = require('./data/numberJungleQuestions');

const MONGO_URI =
  process.env.MONGODB_URI ||
  process.env.MONGO_URI ||
  process.env.DATABASE_URL;

if (!MONGO_URI) {
  console.error(
    '❌ No MongoDB connection string found. Check your .env file for MONGODB_URI (or MONGO_URI / DATABASE_URL).'
  );
  process.exit(1);
}

// Swap this for your real Number Jungle Quest document's _id once you have one saved.
const PLACEHOLDER_QUEST_ID = new mongoose.Types.ObjectId();

function buildQuestions() {
  const docs = [];
  for (const [gradeBand, levels] of Object.entries(QUESTION_BANK)) {
    for (const [difficulty, questions] of Object.entries(levels)) {
      for (const q of questions) {
        docs.push({
          quest: PLACEHOLDER_QUEST_ID,
          gradeBand,
          difficulty: Number(difficulty),
          type: 'tap-select',
          topic: q.topic,
          prompt: q.prompt,
          choices: q.choices,
          steps: q.steps,
          creature: q.creature,
          meta: { bankId: q.id },
        });
      }
    }
  }
  return docs;
}

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const docs = buildQuestions();
    await Question.insertMany(docs);
    console.log(`✅ Inserted ${docs.length} Number Jungle questions (grades 6–12)`);
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected. Done.');
  }
}

seed();
