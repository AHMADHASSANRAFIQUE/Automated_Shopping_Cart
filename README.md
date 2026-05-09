# 🛒 Florland AI Grocery Assistant

**Florland** is a premium, AI-driven grocery shopping platform that transforms your voice and text lists into automated cart actions on major vendor sites like Instacart and Walmart.

![Project Status](https://img.shields.io/badge/Status-Phase%204%20Complete-green)
![Tech Stack](https://img.shields.io/badge/Stack-React%20%7C%20Node%20%7C%20FastAPI%20%7C%20AI-blue)

---

## 🚀 The Vision
Florland simplifies the digital grocery experience using a 4-step professional workflow:
1.  **Entry**: User visits the Florland web portal.
2.  **Selection**: User picks their preferred store (Instacart/Walmart).
3.  **Intelligence**: AI Agent parses the grocery list and optimizes search queries.
4.  **Automation**: Playwright-powered agents autonomously fill the cart on the vendor's site.

---

## ✨ Key Features

### 🧠 Pillar 1: Intelligence Engine
- **Voice Recognition**: Natural language processing to capture grocery lists via speech.
- **AI Parsing**: Powered by **Gemini 3 Flash**, converting raw text into structured JSON (Category, Quantity, Brand Preference).

### 🤖 Pillar 2: Autonomous Shopping
- **Playwright Automation**: Real-time browser interaction to search and add items to carts on Instacart & Walmart.
- **Stealth Browsing**: Human-like interaction patterns to ensure reliability.

### 📊 Pillar 3: Professional UX
- **Store Selection Modal**: Multi-stage selection featuring sub-stores like **Publix, Aldi, Sam's Club, and Costco**.
- **Real-time Status Widget**: Floating UI that shows the AI's progress as it shops.
- **Guided Handover**: A professional transition dialog that manages the handoff between Florland and the vendor site.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React (Vite), Material UI (MUI), Framer Motion |
| **Voice Backend** | Node.js, Express, MongoDB Atlas |
| **AI Backend** | Python, FastAPI, CrewAI, LiteLLM |
| **Automation** | Playwright (Python) |
| **LLM** | Google Gemini 3 Flash Preview |

---

## 📦 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/AHMADHASSANRAFIQUE/Automated_Shopping_Cart.git
cd Automated_Shopping_Cart
```

### 2. Configure Environment Variables
Copy the `.env.example` files in both `backend/voice_service` and `backend/ai_service` to `.env` and fill in your keys:
- `MONGODB_URI`
- `JWT_SECRET`
- `GEMINI_API_KEY`

### 3. Start the Services
**Voice Backend:**
```bash
cd backend/voice_service
npm install
node server.js
```

**AI Backend:**
```bash
cd backend/ai_service
pip install -r requirements.txt
python main.py
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

---

## 📈 Roadmap
- [x] Phase 1: Core Foundation & Landing Template
- [x] Phase 2: Affiliate Routing Engine
- [x] Phase 3: AI Intelligence & Automation
- [x] Phase 4: Diagram Alignment & Persistence
- [x] Phase 5: Analytics Dashboard & Reliability
- [ ] Phase 6: Production Deployment (Docker)

---

## 🤝 Contributing
Built with ❤️ by **Florland Development Team**.
For inquiries, contact [Ahmad Hassan](https://github.com/AHMADHASSANRAFIQUE).
