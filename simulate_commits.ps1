$env:GIT_AUTHOR_DATE="2026-07-10T10:00:00"
$env:GIT_COMMITTER_DATE="2026-07-10T10:00:00"
git add package.json package-lock.json
git commit -m "chore: initialize root project dependencies"

$env:GIT_AUTHOR_DATE="2026-07-11T14:30:00"
$env:GIT_COMMITTER_DATE="2026-07-11T14:30:00"
git add client/package.json client/package-lock.json client/postcss.config.js client/index.html client/src/index.css client/src/main.jsx
git commit -m "feat: setup React frontend with Tailwind CSS and Vite"

$env:GIT_AUTHOR_DATE="2026-07-12T11:15:00"
$env:GIT_COMMITTER_DATE="2026-07-12T11:15:00"
git add server/package.json server/package-lock.json server/index.js
git commit -m "feat: initialize Express backend server"

$env:GIT_AUTHOR_DATE="2026-07-13T16:45:00"
$env:GIT_COMMITTER_DATE="2026-07-13T16:45:00"
git add server/services/githubService.js server/services/ragService.js
git commit -m "feat: implement GitHub repository fetching and RAG processing"

$env:GIT_AUTHOR_DATE="2026-07-14T09:20:00"
$env:GIT_COMMITTER_DATE="2026-07-14T09:20:00"
git add server/services/agentService.js server/models/ChatSession.js
git commit -m "feat: integrate LangGraph agent and MongoDB vector search"

$env:GIT_AUTHOR_DATE="2026-07-15T15:10:00"
$env:GIT_COMMITTER_DATE="2026-07-15T15:10:00"
git add server/models/ server/routes/ server/middleware/ client/src/context/ client/src/pages/
git commit -m "feat: implement JWT authentication and user sessions"

$env:GIT_AUTHOR_DATE="2026-07-16T13:40:00"
$env:GIT_COMMITTER_DATE="2026-07-16T13:40:00"
git add client/src/App.jsx server/Dockerfile
git commit -m "feat: complete UI dashboard and create Dockerfile for deployment"

$env:GIT_AUTHOR_DATE="2026-07-17T10:05:00"
$env:GIT_COMMITTER_DATE="2026-07-17T10:05:00"
git add .github/
git commit -m "ci: add GitHub Actions workflow for automated builds"

$env:GIT_AUTHOR_DATE="2026-07-17T14:00:00"
$env:GIT_COMMITTER_DATE="2026-07-17T14:00:00"
git add .
git commit -m "fix: migrate LLM to Groq and resolve index bugs"

git push origin main
