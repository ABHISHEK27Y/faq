const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy_key');
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

const generateChatResponse = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Sanitize message to prevent prompt injection
    const sanitizedMessage = message.replace(/["]/g, '\\"').replace(/[{}]/g, '');

    const prompt = `
      You are Yaksha, an AI assistant for our FAQ platform.
      Analyze the user's language and tone. If the user communicates using Gen-Z slang or Hinglish, respond back in a matching chill, relatable Gen-Z/Hinglish tone.
      Otherwise, if the user communicates in standard or formal language, respond strictly in a professional, clear, and helpful tone.
      User message: "${sanitizedMessage}"
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    res.json({ reply: responseText });
  } catch (error) {
    console.error('Gemini API Error:', error);
    // Fallback response if API fails or key is invalid
    res.json({ reply: "I'm currently experiencing some server issues. Please try again in a little bit! 😅" });
  }
};

module.exports = { generateChatResponse };
