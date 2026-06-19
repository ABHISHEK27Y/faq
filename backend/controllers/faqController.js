const { FAQ, Category } = require('../models/FAQ');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const getPendingFAQs = async (req, res) => {
  try {
    const pending = await FAQ.find({ status: 'pending' }).populate('author', 'username');
    res.json(pending);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const getCategories = async (req, res) => {
  try {
    const categories = await Category.aggregate([
      {
        $lookup: {
          from: 'faqs',
          localField: '_id',
          foreignField: 'category',
          as: 'faqs'
        }
      },
      {
        $project: {
          name: 1,
          slug: 1,
          description: 1,
          icon: 1,
          questionCount: { $size: '$faqs' }
        }
      }
    ]);
    res.json(categories);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const getFAQs = async (req, res) => {
  try {
    const pageSize = Number(req.query.limit) || 10;
    const page = Number(req.query.page) || 1;

    let queryCondition = {};
    if (req.query.keyword) {
      let searchTerms = req.query.keyword;
      try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy_key');
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const prompt = `Extract the 3 most critical formal intent keywords from this student search query: "${req.query.keyword}". Return ONLY the keywords separated by spaces. Do not include any other text.`;
        const result = await model.generateContent(prompt);
        const intent = result.response.text().trim();
        if (intent && !intent.toLowerCase().includes('error')) {
          // Create an OR regex pattern combining original query and AI extracted keywords
          searchTerms = `${req.query.keyword} ${intent}`.split(/\s+/).join('|');
        }
      } catch(err) {
        console.error("Gemini RAG Error:", err.message);
      }
      queryCondition = { title: { $regex: searchTerms, $options: 'i' } };
    }
    
    let categoryFilter = {};
    if (req.query.categorySlug) {
      const category = await Category.findOne({ slug: req.query.categorySlug });
      if (category) {
        categoryFilter = { category: category._id };
      } else {
        return res.json({ faqs: [], page: 1, pages: 1 }); // return empty if category not found
      }
    }

    const count = await FAQ.countDocuments({ ...queryCondition, ...categoryFilter, status: 'published' });
    const faqs = await FAQ.find({ ...queryCondition, ...categoryFilter, status: 'published' })
      .populate('category', 'name slug')
      .populate('author', 'username')
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .sort('-createdAt'); // Ensure consistent ordering

    res.json({ faqs, page, pages: Math.ceil(count / pageSize) });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const getMyFAQs = async (req, res) => {
  try {
    const faqs = await FAQ.find({ author: req.user._id })
      .populate('category', 'name')
      .sort('-createdAt');
    res.json(faqs);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const getFAQBySlug = async (req, res) => {
  try {
    const faq = await FAQ.findOne({ slug: req.params.slug })
      .populate('category')
      .populate('author', 'username role');
    if (faq) { res.json(faq); } else { res.status(404).json({ message: 'FAQ not found' }); }
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const createFAQ = async (req, res) => {
  try {
    const { title, slug, question, answer, category } = req.body;

    // AI-Powered Automated Content Moderation
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy_key');
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const prompt = `Analyze the following FAQ submission for abusive, toxic, or sexual language. Answer with exactly "SAFE" or "TOXIC".\nTitle: ${title}\nQuestion: ${question}\nAnswer: ${answer}`;
      const result = await model.generateContent(prompt);
      const moderationResult = result.response.text().trim();
      
      if (moderationResult.toUpperCase().includes('TOXIC')) {
        return res.status(400).json({ message: 'Content rejected by automated moderation: Toxic language detected.' });
      }
    } catch (err) {
      console.error("Gemini Moderation Error:", err.message);
    }

    const faq = new FAQ({ title, slug, question, answer, category, author: req.user._id });
    const createdFAQ = await faq.save();
    res.status(201).json(createdFAQ);
  } catch (error) { res.status(400).json({ message: error.message }); }
};

const updateFAQStatus = async (req, res) => {
  try {
    const faq = await FAQ.findById(req.params.id);
    if (!faq) return res.status(404).json({ message: 'FAQ not found' });
    faq.status = req.body.status; // 'published' or 'rejected'
    await faq.save();
    res.json(faq);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const voteFAQ = async (req, res) => {
  try {
    const { voteType } = req.body;
    const faq = await FAQ.findById(req.params.id);
    if (!faq) return res.status(404).json({ message: 'FAQ not found' });
    
    if (voteType === 1) faq.upvoteCount += 1;
    else if (voteType === -1) faq.downvoteCount += 1;
    
    await faq.save();
    res.json(faq);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const FAQEditSuggestion = require('../models/FAQEditSuggestion');

const suggestEdit = async (req, res) => {
  try {
    const { proposedTitle, proposedAnswer } = req.body;
    const faqId = req.params.id;

    if (!proposedTitle || !proposedAnswer) {
      return res.status(400).json({ message: 'Proposed title and answer are required.' });
    }

    const suggestion = new FAQEditSuggestion({
      faq: faqId,
      suggestedBy: req.user._id,
      proposedTitle,
      proposedAnswer
    });
    
    await suggestion.save();
    res.status(201).json(suggestion);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const getPendingSuggestions = async (req, res) => {
  try {
    const suggestions = await FAQEditSuggestion.find({ status: 'pending' })
      .populate('faq', 'title answer slug')
      .populate('suggestedBy', 'username email')
      .sort({ createdAt: -1 });
    res.json(suggestions);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const reviewSuggestion = async (req, res) => {
  try {
    const { status, adminFeedback } = req.body; // 'approved' or 'rejected'
    const suggestion = await FAQEditSuggestion.findById(req.params.suggestionId).populate('faq');
    if (!suggestion) return res.status(404).json({ message: 'Suggestion not found' });

    suggestion.status = status;
    if (adminFeedback) suggestion.adminFeedback = adminFeedback;
    await suggestion.save();

    if (status === 'approved') {
      const faq = suggestion.faq;
      faq.title = suggestion.proposedTitle;
      faq.answer = suggestion.proposedAnswer;
      faq.status = 'published'; // ensure it stays published
      await faq.save();
      
      const { createNotification } = require('./notificationController');
      await createNotification(
        suggestion.suggestedBy,
        'accepted',
        `Your suggested edit for "${faq.title}" was approved!`,
        `/faqs/${faq.slug}`
      );
      if (req.io) req.io.to(`user_${suggestion.suggestedBy}`).emit('new_notification');
    }

    res.json(suggestion);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

module.exports = { 
  getCategories, 
  getFAQs, 
  getMyFAQs,
  getPendingFAQs, 
  getFAQBySlug, 
  createFAQ, 
  updateFAQStatus,
  voteFAQ,
  suggestEdit,
  getPendingSuggestions,
  reviewSuggestion
};
