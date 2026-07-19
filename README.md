# 🚀 RepoInsight

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Active-brightgreen?style=for-the-badge&logo=amazonaws)](http://13.201.51.249:5000)
[![Tech Stack](https://img.shields.io/badge/Stack-MERN%20%2B%20LangGraph-blue?style=for-the-badge)](http://13.201.51.249:5000)

RepoInsight is an intelligent, full-stack application that allows you to chat directly with GitHub repositories. By leveraging a powerful RAG (Retrieval-Augmented Generation) pipeline and LangChain/LangGraph, RepoInsight fetches, analyzes, and indexes codebases, allowing you to ask complex questions about any repository's architecture, logic, and implementation.

🔗 **Deployed Live on AWS EC2:** [http://13.201.51.249:5000](http://13.201.51.249:5000)

---

## ✨ Features

- **🧠 AI-Powered Code Analysis:** Input any public GitHub repository URL, and the internal RAG pipeline will clone, chunk, and embed the codebase into a vector database automatically.
- **💬 Chat with your Code:** Ask questions about the analyzed repository in natural language. The AI agent acts as a knowledgeable pair programmer with complete context.
- **🔐 User Authentication:** Secure user accounts and authentication flow built with JWT.
- **📜 Chat History:** Saves your chat sessions so you can easily pick up right where you left off.
- **🐳 Docker Production Ready:** Built with a multi-stage Docker build packaging the Vite frontend and Node/Express backend into a single deployment container.

---

## 🛠️ Tech Stack

* **Frontend:** React 19, Vite, TailwindCSS (v4), React Router, Framer Motion, Lucide Icons
* **Backend:** Node.js & Express, MongoDB Atlas & Mongoose, LangChain & LangGraph (AI Orchestration), JWT Authentication

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- A MongoDB Atlas connection string
- Relevant API Keys (Google Gemini / Groq) for the LangGraph agent

### Local Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/shrish98/RepoInsight.git
   cd RepoInsight
   ```

2. **Install all dependencies**
   ```bash
   npm install
   cd client && npm install
   cd ../server && npm install
   cd ..
   ```

3. **Environment Setup**
   Create a `.env` file in the `server/` directory:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   GEMINI_API_KEY=your_gemini_api_key
   GITHUB_TOKEN=your_github_token
   GROQ_API_KEY=your_groq_api_key
   ```

4. **Running the App Locally**
   Start both development servers concurrently from the root:
   ```bash
   npm run dev
   ```
   - Frontend: `http://localhost:5173`
   - Backend: `http://localhost:5000`

---

## 📦 Containerized Production Deployment

To run and deploy the application in production using Docker:

### 1. Build the Docker Image
From the root directory, run the multi-stage build:
```bash
docker build -t repoinsight .
```

### 2. Run the Container
Run the container, exposing port `5000` and supplying your environment variables:
```bash
docker run -d \
  -p 5000:5000 \
  -e PORT=5000 \
  -e MONGODB_URI="your_mongodb_uri" \
  -e JWT_SECRET="your_jwt_secret" \
  -e GEMINI_API_KEY="your_gemini_api_key" \
  -e GITHUB_TOKEN="your_github_token" \
  -e GROQ_API_KEY="your_groq_api_key" \
  --name repoinsight_app \
  repoinsight
```

---

## 📜 License
ISC License
