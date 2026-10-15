# RepoInsight

Ask questions about a GitHub repository and get answers grounded in its code.

**Live:** [http://13.201.51.249:5000](http://13.201.51.249:5000)

## How it works

**Indexing a repository.** RepoInsight reads the default branch through the GitHub API, skips dependencies, build output and binary files, and splits the rest into 1,000-character chunks with 200 characters of overlap. Each chunk is embedded with Google's `gemini-embedding-001` and stored in a MongoDB Atlas vector index. The language model then reads the file tree and `package.json` to write an overview, the stack, entry points, suggested questions and a Mermaid architecture diagram.

**Answering a question.** A LangGraph agent retrieves the most relevant chunks (vector search, with a keyword fallback), and `openai/gpt-oss-120b` on Groq writes an answer from them. It can also search the repository's GitHub issues. A second pass checks whether the answer actually addresses the question; if not, the agent searches again with new keywords, once.

## Tech stack

- **Frontend:** React 19, Vite, Tailwind CSS 4, React Router, Mermaid
- **Backend:** Node.js, Express 5, MongoDB Atlas with Mongoose, LangChain and LangGraph, JWT auth
- **Models:** `openai/gpt-oss-120b` via Groq, `gemini-embedding-001` via Google AI Studio

## Running locally

You'll need Node.js 20+, a MongoDB Atlas cluster, a Groq API key, a Google AI Studio API key and a GitHub token.

In Atlas, create a vector search index named `vector_index` on the `repoinsight.code_chunks` collection, over the `embedding` field (3,072 dimensions).

```bash
git clone https://github.com/shrish98/RepoInsight.git
cd RepoInsight
npm install
cd client && npm install && cd ..
cd server && npm install --legacy-peer-deps && cd ..
```

Create `server/.env`:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key
GITHUB_TOKEN=your_github_token
# Optional. Defaults to openai/gpt-oss-120b. Change it when Groq retires a model.
# GROQ_MODEL=openai/gpt-oss-120b
```

Then start the client and server together:

```bash
npm run dev
```

The client runs on `http://localhost:5173` and proxies `/api` to the server on `http://localhost:5000`.

## Deploying

The Docker image serves the pre-built frontend from `public/`, so rebuild it after changing anything in `client/`:

```bash
npm run build                  # builds client/ into public/
docker compose up -d --build   # reads server/.env
```

On the EC2 host, deploying a new version is `git pull` followed by the `docker compose` command above.

## License

ISC
