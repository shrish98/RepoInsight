# RepoInsight

Ask questions about a GitHub repository and get answers grounded in its code.

**Live:** [http://13.201.51.249:5000](http://13.201.51.249:5000) (HTTPS setup below)

## How it works

**Indexing a repository.** RepoInsight reads the default branch through the GitHub API, skips dependencies, build output and binary files, and splits the rest into 1,000-character chunks with 200 characters of overlap. Each chunk is embedded with Google's `gemini-embedding-001` and stored in a MongoDB Atlas vector index. The language model then reads the file tree and `package.json` to write an overview, the stack, entry points, suggested questions and a Mermaid architecture diagram.

**Answering a question.** A LangGraph agent retrieves the most relevant chunks (vector search, with a keyword fallback), and `openai/gpt-oss-120b` on Groq writes an answer from them. It can also search the repository's GitHub issues. A second pass checks whether the answer actually addresses the question; if not, the agent searches again with new keywords, once.

## Tech stack

- **Frontend:** React 19, Vite, Tailwind CSS 4, React Router, Mermaid
- **Backend:** Node.js, Express 5, MongoDB Atlas with Mongoose, LangChain and LangGraph
- **Auth:** Sign in with GitHub (OAuth) or email and password, with JWT sessions
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
JWT_SECRET=a_long_random_string
GEMINI_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key
GITHUB_TOKEN=your_github_token

# Sign in with GitHub (see below)
GITHUB_CLIENT_ID=your_oauth_app_client_id
GITHUB_CLIENT_SECRET=your_oauth_app_client_secret
# Only needed when the app is reached through a proxy, e.g. local development:
# GITHUB_CALLBACK_URL=http://localhost:5173/api/auth/github/callback

# Optional. Defaults to openai/gpt-oss-120b. Change it when Groq retires a model.
# GROQ_MODEL=openai/gpt-oss-120b
```

The server won't start without `JWT_SECRET`, and warns if it's shorter than 32 characters. Generate one with:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Then start the client and server together:

```bash
npm run dev
```

The client runs on `http://localhost:5173` and proxies `/api` to the server on `http://localhost:5000`.

### Sign in with GitHub

Create an OAuth app under GitHub → Settings → Developer settings → OAuth Apps, and set its **Authorization callback URL** to the server's `/api/auth/github/callback`:

- Production: `http://13.201.51.249:5000/api/auth/github/callback`
- Local development: `http://localhost:5173/api/auth/github/callback`, plus `GITHUB_CALLBACK_URL` set to the same value

An OAuth app only accepts one callback URL, so use a separate app for local development. RepoInsight asks for `read:user` and `user:email` only. It never stores the GitHub access token, and links a GitHub sign-in to an existing email account only when GitHub reports that email as verified. If the client ID or secret is missing, the sign-in page says so and email sign-in keeps working.

## Deploying

The Docker image serves the pre-built frontend from `public/`, so rebuild it after changing anything in `client/`:

```bash
npm run build                  # builds client/ into public/
docker compose up -d --build   # reads server/.env
```

On the EC2 host, deploying a new version is `git pull` followed by the `docker compose` command above.

### HTTPS without buying a domain

`docker-compose.https.yml` puts [Caddy](https://caddyserver.com) in front of the app. Caddy gets a free Let's Encrypt certificate and renews it on its own. All it needs is a hostname that points at the server, and a free [DuckDNS](https://www.duckdns.org) subdomain works.

1. Sign in to DuckDNS, create a subdomain (e.g. `repoinsight-yourname`), and set its IP to the EC2 instance's public IP.
2. In the EC2 security group, allow inbound TCP 80 and 443. Once HTTPS works, remove the rule for 5000.
3. Point the GitHub OAuth app's callback URL at `https://repoinsight-yourname.duckdns.org/api/auth/github/callback`.
4. On the server:

   ```bash
   docker compose down                                        # stop the plain-HTTP setup
   echo "SITE_ADDRESS=repoinsight-yourname.duckdns.org" > .env
   docker compose -f docker-compose.https.yml up -d --build
   ```

The first request can take a few seconds while the certificate is issued. If the instance's public IP changes (for example after a stop and start), update it on DuckDNS, or attach an Elastic IP so it doesn't change.

## License

ISC
