# 🚀 RepoInsight

RepoInsight is an intelligent, full-stack application that allows you to chat directly with GitHub repositories. By leveraging a powerful RAG (Retrieval-Augmented Generation) pipeline and LangChain, RepoInsight fetches, analyzes, and understands codebases, allowing you to ask complex questions about any repository's architecture, logic, and implementation.

## ✨ Features

- **🧠 AI-Powered Code Analysis:** Input any public GitHub repository URL, and the internal RAG pipeline will fetch, chunk, and embed the codebase into a vector database.
- **💬 Chat with your Code:** Ask questions about the analyzed repository in natural language. The AI agent acts as a knowledgeable pair programmer.
- **🔐 User Authentication:** Secure user accounts and authentication flow.
- **📜 Chat History:** Saves your chat sessions so you can pick up right where you left off.
- **⚡ Modern Tech Stack:** Built with a blazing-fast Vite + React frontend and a robust Node.js + Express backend.

## 🛠️ Tech Stack

**Frontend:**
- React 19
- Vite
- TailwindCSS (v4)
- React Router
- Framer Motion

**Backend:**
- Node.js & Express
- MongoDB Atlas (Mongoose)
- LangChain & LangGraph
- JWT Authentication

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- A MongoDB Atlas connection string
- Relevant API Keys (e.g., Google Gemini / Groq) for the LangChain agent

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/shrish98/RepoInsight.git
   cd RepoInsight
   ```

2. **Install all dependencies**
   Install the root, client, and server dependencies:
   ```bash
   npm install
   cd client && npm install
   cd ../server && npm install
   cd ..
   ```

3. **Environment Setup**
   Navigate to the `server/` directory and create a `.env` file with your variables:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   # Add your AI provider API keys here...
   ```

### Running the App Locally

Start both the frontend and backend development servers concurrently from the root directory:

```bash
npm run dev
```

- The Frontend will be available at `http://localhost:5173`
- The Backend API will be available at `http://localhost:5000`

## 📦 Building for Production

To build the application for production, run:
```bash
npm run build
```
This command compiles the React frontend and moves it into the `server/public` folder. You can then start the server, and it will automatically serve both the API and the static React interface from a single port!

## 📜 License
ISC License
