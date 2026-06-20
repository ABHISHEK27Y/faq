# 🚀 Samagama FAQ & Crowdsourcing Platform

A next-generation, AI-powered knowledge base and community Q&A platform built on the modern MERN stack. Designed to facilitate community knowledge sharing with advanced real-time features, AI moderation, and gamification.

## ✨ Core Features & Unique Contributions

### 🤖 AI-Powered Ecosystem (Google Gemini Integration)
- **Yaksha Chatbot**: A custom-built, Gen-Z/Hinglish AI assistant integrated directly into the application. Yaksha helps users find answers instantly with a relatable, conversational tone. Protected against prompt injection via aggressive input sanitization.
- **Automated Content Moderation**: An invisible AI layer that intercepts newly created questions and answers. It scans the content for abusive, highly toxic, or inappropriate material in real-time, instantly rejecting bad actors before their content hits the database.

### 🎮 Gamification & Reputation Engine
- **Reputation Points (REP)**: Users earn reputation points by contributing to the platform. Upvotes on answers and questions grant points, while downvotes remove them.
- **Accepted Answers**: Question authors can mark an answer as "Accepted", permanently locking it in as the definitive solution and rewarding the answer author with a massive +20 REP boost. Protected by idempotency guards to prevent "REP farming".
- **Dynamic Leaderboard**: A beautifully animated, real-time leaderboard featuring 3D-styled podiums for the top 3 contributors and progress bars indicating relative reputation gaps between users.

### 🛡️ Advanced Admin & Moderation Tools
- **Review Queue**: A secure admin dashboard where moderators can view user-submitted FAQs and pending edits.
- **Expandable Inline Review**: Instead of navigating to different pages, admins can click any pending FAQ to dynamically expand the table row, read the full question and proposed answer, and seamlessly click "Approve" or "Reject".
- **Floating Toast Notifications**: Highly polished, animated UI notifications that slide in to confirm admin actions instead of jarring browser alert boxes.

### ⚡ Real-Time Interactions (Socket.io)
- **Live Typing Indicators**: When a user begins typing an answer to a question, other users currently viewing that question see a real-time "User is typing..." indicator.
- **Instant Notifications**: Users receive instant, live UI updates when someone comments on their answer, answers their question, or accepts their solution—no page refresh required.

### 🔐 Security & Authentication
- **Dual-Strategy Auth**: Supports both traditional Email/Password login (secured via `bcryptjs` and JWTs) as well as **Google OAuth 2.0**.
- **Secure Fallbacks**: Strict environment variable enforcement ensures no hardcoded fallback secrets are used for token signing. Dummy passwords generated for OAuth users are aggressively hashed.
- **Route Protection**: Robust role-based access control (RBAC) middleware separating standard users from `admin` and `moderator` roles.

### 🎨 Modern UI/UX Architecture
- **Next.js & Tailwind CSS v4**: Fully responsive, mobile-first design utilizing the newest Tailwind compiler and syntaxes.
- **Dynamic Theming**: Native Dark Mode / Light Mode support managed globally via `next-themes` and a centralized `<ThemeProvider>`.
- **Glassmorphism**: Heavy use of modern UI trends including blurred backdrops, subtle gradients, and soft shadows.

---

## 🛠️ Technology Stack

- **Frontend**: Next.js 14+ (App Router), React, Tailwind CSS v4, Axios
- **Backend**: Node.js, Express.js, Socket.io
- **Database**: MongoDB (via `mongodb-memory-server` for local persistent dev, easily swappable to Atlas), Mongoose
- **Authentication**: Passport.js (Google OAuth), JSON Web Tokens (JWT), bcryptjs
- **AI Engine**: `@google/generative-ai` (Gemini 2.5 Flash)

---

## 🚀 Getting Started (Local Development)

### Prerequisites
- Node.js (v18 or higher)
- A Google Gemini API Key
- A Google OAuth Client ID & Secret

### 1. Clone the repository
```bash
git clone https://github.com/ABHISHEK27Y/faq.git
cd faq
```

### 2. Setup the Backend
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` directory:
```env
PORT=5000
JWT_SECRET=your_super_secure_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_secret
```
Start the backend server:
```bash
npm run dev
```

### 3. Setup the Frontend
Open a new terminal window:
```bash
cd frontend
npm install
```
Create a `.env.local` file in the `frontend` directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```
Start the Next.js development server:
```bash
npm run dev
```

### 4. Access the Application
Open your browser and navigate to `http://localhost:3000`.

---
*Built with ❤️ for the Samagama Community.*
