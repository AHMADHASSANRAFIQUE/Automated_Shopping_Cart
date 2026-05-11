# 🚀 Florland AI: Ultimate Client Setup Guide

This comprehensive guide will walk you through setting up the **Florland AI Grocery Assistant** on your local machine. Follow every step carefully to ensure all AI and automation features work perfectly.

---

## 📋 1. Prerequisites (Tools Needed)
Before starting, download and install these tools. They are the "engines" that run the project.

1.  **Node.js (v18+)**: [Download here](https://nodejs.org/). This runs the User & Voice backend.
2.  **Python (v3.10+)**: [Download here](https://www.python.org/). 
    *   *Important*: During installation, check the box **"Add Python to PATH"**.
3.  **Git**: [Download here](https://git-scm.com/).
4.  **Visual Studio Code (Optional)**: [Download here](https://code.visualstudio.com/). It makes editing files much easier.

---

## 📂 2. Downloading the Project
1.  Open your terminal (Command Prompt or PowerShell).
2.  Type the following commands:
    ```bash
    git clone https://github.com/AHMADHASSANRAFIQUE/Automated_Shopping_Cart.git
    cd Automated_Shopping_Cart
    ```

---

## 🔑 3. Configuration (The "Brain" Setup)
You need to create "Secret" files called `.env` in two different folders. 

### **Step A: Getting your Keys**
*   **Gemini API Key**: Go to [Google AI Studio](https://aistudio.google.com/app/apikey) and create a free API Key.
*   **MongoDB URI**: Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas), create a free cluster, and get your connection string (looks like `mongodb+srv://...`).

### **Step B: Setting up the Voice Backend**
1.  Go to the folder: `backend/voice_service`
2.  Create a new file named `.env` (make sure it's not `.env.txt`).
3.  Paste this inside:
    ```env
    PORT=3001
    MONGODB_URI=your_mongodb_connection_string_here
    JWT_SECRET=florland_secure_session_key_123
    INSTACART_AFFILIATE_URL=https://www.instacart.com/?affiliate=florland
    WALMART_AFFILIATE_URL=https://www.walmart.com/?affiliate=florland
    ```

### **Step C: Setting up the AI Automation Agent**
1.  Go to the folder: `backend/ai_service`
2.  Create a new file named `.env`.
3.  Paste this inside:
    ```env
    GEMINI_API_KEY=your_google_gemini_key_here
    MODEL=gemini-3-flash-preview
    PORT=8000
    ```

---

## 🛠️ 4. Running the Project (3-Terminal Setup)

You must run these 3 windows at the same time:

### **Window 1: The User Portal Backend**
1.  Open a terminal in `backend/voice_service`.
2.  Run: `npm install`
3.  Run: `node server.js`
4.  **Verification**: Open `http://localhost:3001/api/health` in your browser. You should see `{"status": "ok"}`.

### **Window 2: The AI Automation Agent**
1.  Open a terminal in `backend/ai_service`.
2.  Run: `pip install -r requirements.txt`
3.  Run: `playwright install chromium`
4.  Run: `python main.py`
5.  **Verification**: Open `http://localhost:8000/docs`. You should see a professional API documentation page.

### **Window 3: The Florland Web Interface**
1.  Open a terminal in the `frontend` folder.
2.  Run: `npm install`
3.  Run: `npm run dev`
4.  **Success!**: Click the link provided (usually `http://localhost:5173`) to launch the Florland portal.

---

## 🧪 5. Testing the Full Flow
1.  **Register**: Create an account on the landing page.
2.  **Voice Input**: Click the microphone and say: *"I need 2 apples and a gallon of milk."*
3.  **Confirm List**: Ensure the items appear in your list.
4.  **Automate**: Click "Checkout with AI".
5.  **Select Store**: Choose Instacart -> Publix.
6.  **Redirection**: A new tab will open Instacart, and a **Status Widget** on Florland will show the AI working in the background.

---

## 🚩 Common Issues & Fixes
*   **"Command not found"**: Ensure Node and Python were added to your System PATH during installation.
*   **MongoDB Connection Error**: Go to MongoDB Atlas -> Network Access -> and add "0.0.0.0/0" (Allow access from anywhere).
*   **Browser not opening**: Ensure you ran `playwright install chromium` in Step 4.

---
Built with Excellence for **Florland AI** | [Ahmad Hassan](https://github.com/AHMADHASSANRAFIQUE)
