const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy_key');
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

const { generateEmbedding, cosineSimilarity } = require('../utils/embeddings');
const { FAQ } = require('../models/FAQ');

const generateChatResponse = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Sanitize message to prevent prompt injection
    const sanitizedMessage = message.replace(/["]/g, '\\"').replace(/[{}]/g, '');

    // Search FAQ database for context
    let context = "";
    try {
      const queryEmbedding = await generateEmbedding(sanitizedMessage);
      if (queryEmbedding && queryEmbedding.length > 0) {
        const faqs = await FAQ.find({ status: 'published' }).select('title answer embedding').lean();
        const scoredFaqs = faqs.map(faq => {
          let score = 0;
          if (faq.embedding && faq.embedding.length > 0) {
            score = cosineSimilarity(queryEmbedding, faq.embedding);
          }
          return { faq, score };
        }).filter(item => item.score > 0.60).sort((a, b) => b.score - a.score).slice(0, 3);
        
        if (scoredFaqs.length > 0) {
          context = scoredFaqs.map(item => `Q: ${item.faq.title}\nA: ${item.faq.answer}`).join("\n\n");
        }
      }
    } catch (err) {
      console.error("Chatbot Embedding Search Error:", err.message);
    }

    const baseContext = `
      Base Platform Context (ALWAYS TRUE):
      - Internship Name: Vicharanashala Internship (VINS)
      - Organization: Lab of Prof. Sudarshan Iyengar at IIT Ropar.
      - Duration: Two-month duration with a one-month grace period. Start anytime in 2026. Finish by 31 Dec 2026.
      - Format: Entirely online. Open-source software engineering for India-centric problems (Annam.AI, ViBe).
      - Stipend: No stipend. It is an unpaid internship, but the programme is completely free.
      - Badges: Bronze (Training), Silver (OS Project), Gold (Significant feature), Platinum (Visit lab with stipend).
      - Workload: 6 to 10 hours of focused work a day.
      - NOC (No Objection Certificate) from college is mandatory to start.
    `;

    const prompt = `
      You are Yaksha, an AI assistant for the Vicharanashala Internship (samagama.in).
      Analyze the user's language and tone. If the user communicates using Gen-Z slang or Hinglish, respond back in a matching chill, relatable Gen-Z/Hinglish tone.
      Otherwise, if the user communicates in standard or formal language, respond strictly in a professional, clear, and helpful tone.
      
      You MUST base your answer strictly on the following context. If the context doesn't fully answer the question, say so politely but try to be as helpful as possible using the Base Platform Context.
      
      ${baseContext}
      
      FAQ DATABASE CONTEXT:
      ${context || "No specific FAQ found, rely on Base Platform Context."}

      User message: "${sanitizedMessage}"
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    res.json({ reply: responseText });
  } catch (error) {
    console.error('Gemini API Error:', error);
    // Fallback response if API fails or key is invalid
    res.status(500).json({ reply: "I'm currently experiencing some server issues. Please try again in a little bit! 😅" });
  }
};

module.exports = { generateChatResponse };
