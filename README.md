# SupportAI: AI-Powered Customer Support Chatbot System

A production-ready, high-fidelity customer support chatbot system built using **React.js (Vite)**, **Node.js (Express)**, **Python (Flask)**, and **MongoDB**. 

The system leverages natural language processing (NLP) to detect user intents, answers frequently asked questions dynamically, supports simulation order-tracking (via order codes), and includes a fully-featured **Admin Dashboard** to audit conversations, edit system FAQs, and view classification statistics.

---

## 🚀 Key Features

*   **ChatGPT-like User Interface**: Ultra-modern glassmorphic design featuring smooth spring physics animations (Framer Motion), retracting sidebar, recent conversation history search, and dark/blue theme switching.
*   **Dual NLP Intent Classifier**: A Python AI microservice using **spaCy** (lemmatization) and **NLTK** (stopwords/tokenization) to classify user messages.
*   **Intelligent Overrides**: Administrative FAQs configured in MongoDB dynamically override Flask responses on the fly.
*   **Live Order Tracking**: Dynamic regex tracking that extracts 5-digit Order IDs (e.g. `ORD12345`) from message streams and pulls status from MongoDB.
*   **Robust Fallback System**: A redundant Javascript classifier in the Node service processes chats if the Python service is offline.
*   **Admin Dashboard**: Real-time stats panels showing:
    *   Metrics counters (Conversations, Messages, FAQs).
    *   Dynamic bar chart representing intent distribution hits.
    *   Dynamic CRUD FAQ Editor to modify chatbot answers.
    *   Conversations Audit Log with full message history transcript views.
*   **LLM Extensibility**: Easily switch the NLP rules classifier with Gemini or OpenAI models simply by setting API keys in the `.env` variables.

---

## 🛠️ Architecture & Data Flow

```
   ┌─────────────────────────────────────────────────────────────┐
   │                       React Client                          │
   └──────────────────────────┬──────▲───────────────────────────┘
                              │      │
                      (JSON)  │      │  (JSON Response)
                              ▼      │
   ┌─────────────────────────────────┴───────────────────────────┐
   │                     Node/Express Server                     │
   └─────────────┬─────────────▲─────────────┬─────────────▲─────┘
                 │             │             │             │
      (Lookup)   ▼             │ (Save/Seed) (Classify)    ▼     │ (JSON response)
   ┌───────────────────────────┴─────┐     ┌───────────────┴─────┴─────┐
   │            MongoDB              │     │    Python Flask NLP API   │
   │  (Chats, FAQs, Orders, Users)   │     │  (spaCy, NLTK, or LLMs)   │
   └─────────────────────────────────┘     └───────────────────────────┘
```

---

## 📂 Project Structure

```
customer-support-chatbot/
├── frontend/                 # Vite React Client SPA
│   ├── src/
│   │   ├── components/       # Header, Sidebar, ChatWindow, Message, Input, Avatars
│   │   ├── hooks/            # useChat.js (State management & syncing)
│   │   ├── pages/            # Home.jsx (Chat UI & Admin Dashboard view controller)
│   │   ├── services/         # api.js (Axios connection handlers)
│   │   └── styles/           # theme.css (CSS design tokens & theme sheets)
│   └── .env                  # Frontend configuration
├── backend/                  # Express.js REST API
│   ├── controllers/          # chatController.js (Logic router)
│   ├── models/               # Mongoose schemas (Chat, FAQ, Order)
│   ├── routes/               # API Router mountpoints (chat, history, faq, admin)
│   ├── services/             # pythonService.js (Flask bridge & JS Classifier fallback)
│   ├── server.js             # Express entry point & database seeder
│   └── .env                  # Backend configuration
├── python-ai/                # Flask NLP Classification service
│   ├── app.py                # Server runner and classify endpoint
│   ├── chatbot.py            # Preprocessors, Jaccard token matching, and LLM hooks
│   ├── intents.py            # Static intents list and default answers
│   └── requirements.txt      # Python dependencies
└── README.md                 # Main Documentation
```

---

## ⚙️ Installation & Setup

### Prerequisites
*   Node.js (v18 or higher)
*   Python (3.9 or higher)
*   MongoDB (running locally on `mongodb://localhost:27017` or Atlas connection string)

---

### Step 1: Python NLP Microservice Setup
Navigate to the `python-ai/` directory, install packages, and boot:
```bash
cd python-ai
pip install -r requirements.txt
python app.py
```
*(On its first run, the app will automatically download the spaCy `en_core_web_sm` model and NLTK stopwords/corpora datasets).*

### Step 2: Node.js Backend Setup
Navigate to the `backend/` directory, install packages, and boot:
```bash
cd backend
npm install
node server.js
```
*(On boot, the server will automatically seed MongoDB with sample FAQs and simulated Orders for tracking).*

### Step 3: Frontend React Setup
Navigate to the `frontend/` directory, install packages, and run the development hot-reloader:
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔌 API Documentation

### Backend Server (`http://localhost:5000`)

#### 1. Chat Message Handler
*   **POST** `/api/chat`
*   **Body**: `{ "message": "string", "chatId": "string (optional)" }`
*   **Response**: Returns the processed message, classification intent details, and updated chat history array.

#### 2. Chat History Manager
*   **GET** `/api/history` - List all chat sessions.
*   **GET** `/api/history/:id` - Fetch transcripts for a specific chat.
*   **DELETE** `/api/history/:id` - Remove a chat session.

#### 3. FAQ Configurations
*   **GET** `/api/faq` - Get all FAQ records.
*   **POST** `/api/faq` - Insert or update custom FAQ answers.
*   **DELETE** `/api/faq/:id` - Remove an FAQ item.

#### 4. Admin Analytics
*   **GET** `/api/admin/stats` - Fetch total exchanges counts and intent hits distributions.

---

## 💡 Extensible LLM Integration (Bonus)

If you wish to switch the rule-based NLP classification to a live LLM (Google Gemini or OpenAI), populate the respective variables in `python-ai/.env`:

```env
# Using Gemini 1.5 Flash
GEMINI_API_KEY=AIzaSy...

# OR

# Using OpenAI GPT-4o-Mini
OPENAI_API_KEY=sk-...
```

Upon restart, `chatbot.py` automatically detects these keys and routes incoming messages to the LLM. It generates customized replies while formatting output JSON objects to match the Express API contract, keeping the React frontend fully decoupled.
