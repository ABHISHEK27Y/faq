const mongoose = require('mongoose');
const User = require('./models/User');
const { Question, Answer } = require('./models/QA');
const { FAQ } = require('./models/FAQ');
const importSqliteData = require('./importSqlite');

const seedDatabase = async () => {
  try {
    const count = await User.countDocuments();
    if (count > 0) return; // Already seeded

    await importSqliteData();
    console.log('🌱 Database seeded with real SQLite data!');
  } catch (error) {
    console.error('Error seeding DB:', error);
  }
};

module.exports = seedDatabase;
