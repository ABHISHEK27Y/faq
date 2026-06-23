const mongoose = require('mongoose');
const User = require('./models/User');
const { Question, Answer } = require('./models/QA');
const { FAQ } = require('./models/FAQ');
const importSqliteData = require('./importSqlite');

const seedDatabase = async () => {
  try {
    const count = await User.countDocuments();
    if (count === 0) {
      await importSqliteData();
      
      // Fallback: If importSqliteData failed or found no data
      const newCount = await User.countDocuments();
      const faqCount = await FAQ.countDocuments();
      
      if (newCount === 0 || faqCount === 0) {
        console.log('⚠️ SQLite import yielded incomplete or no data. Seeding fallback dummy data...');
        if (process.env.NODE_ENV !== 'production') {
          const Category = require('./models/FAQ').Category;
          const bcrypt = require('bcryptjs');
          const crypto = require('crypto');
          
          const salt = await bcrypt.genSalt(10);
          const fallbackPassword = crypto.randomBytes(8).toString('hex');
          const hash = await bcrypt.hash(fallbackPassword, salt);

          const admin = await User.create({ username: 'admin', email: 'admin@example.com', password: hash, role: 'admin' });
          const user1 = await User.create({ username: 'johndoe', email: 'john@example.com', password: hash });
          
          console.log(`🔐 Generated fallback credentials - Email: admin@example.com | Password: ${fallbackPassword}`);

          const cat = await Category.create({ name: 'General', slug: 'general' });

          await FAQ.create({ title: 'What is Samagama?', question: 'Can you explain what Samagama is?', answer: 'Samagama is an interactive FAQ and Q&A platform.', category: cat._id, status: 'published' });
          await FAQ.create({ title: 'How to login?', question: 'Where is the login page?', answer: 'Click the login button in the top right corner.', category: cat._id, status: 'published' });

          const q1 = await Question.create({ title: 'How do I submit an FAQ?', body: 'I would like to suggest a new FAQ. How do I do that?', author: user1._id, category: cat._id });
          await Answer.create({ question: q1._id, author: admin._id, body: 'You can suggest an FAQ from the Moderation page or the submit form!', isAccepted: true });

          console.log('🌱 Fallback dummy data seeded successfully!');
        } else {
          console.log('⚠️ Skipping fallback dummy data in production environment.');
        }
      } else {
        console.log('🌱 Database seeded with real SQLite data!');
      }
    }

    // Force migration of any old embeddings (e.g. 3072 dims) to the strict 768 dim schema
    const faqsToReEmbed = await FAQ.find({ 
      status: 'published', 
      $or: [
        { embedding: { $exists: false } },
        { embedding: { $size: 0 } },
        { embedding: { $not: { $size: 768 } } }
      ]
    });
    
    if (faqsToReEmbed.length > 0) {
      console.log(`🔄 Found ${faqsToReEmbed.length} FAQs needing embedding dimension updates (768-dim required). Migrating in background...`);
      const { generateEmbedding } = require('./utils/embeddings');
      setTimeout(async () => {
        for (const faq of faqsToReEmbed) {
          try {
            const text = `${faq.title}\n${faq.question}\n${faq.answer}`;
            faq.embedding = await generateEmbedding(text);
            await faq.save();
            console.log(`✅ Automatically corrected embedding for FAQ: ${faq.title}`);
            await new Promise(r => setTimeout(r, 2000));
          } catch (e) {
            console.error("Migration error:", e.message);
          }
        }
        console.log("🎉 Embedding dimension migration complete.");
      }, 0);
    }

  } catch (error) {
    console.error('Error seeding DB:', error);
  }
};

module.exports = seedDatabase;
