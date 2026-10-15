import { Link } from 'react-router-dom';
import { Bug, FileText, Highlighter, History, MessageCircleQuestion, Workflow } from 'lucide-react';
import Wordmark from '../components/Wordmark';
import GithubMark from '../components/GithubMark';

const SOURCE_URL = 'https://github.com/shrish98/RepoInsight';
const AUTHOR_URL = 'https://my-portfolio-beta-steel-ih418ur0sz.vercel.app';

// Each step is tinted by the layer doing the work, matching the diagram colours.
const indexing = [
  { name: 'Fetch', layer: 'services', detail: 'Reads the default branch through the GitHub API.' },
  { name: 'Filter', layer: 'api', detail: 'Skips node_modules, build output and binary files.' },
  { name: 'Split', layer: 'api', detail: '1,000-character chunks with 200 characters of overlap.' },
  { name: 'Embed', layer: 'services', detail: 'gemini-embedding-001, 3,072 dimensions per chunk.' },
  { name: 'Store', layer: 'data', detail: 'Written to a MongoDB Atlas vector index.' },
];

const answering = [
  { name: 'Retrieve', layer: 'data', detail: 'Vector search over this repository’s chunks, with a keyword fallback.' },
  { name: 'Answer', layer: 'services', detail: 'gpt-oss-120b on Groq writes from those files, and can search the repo’s issues.' },
  { name: 'Check', layer: 'services', detail: 'A second pass asks whether the answer actually answers the question.' },
  { name: 'Retry', layer: 'pen', detail: 'If it doesn’t, search again with better keywords. Once.' },
];

const features = [
  { icon: FileText, layer: 'frontend', term: 'Overview', detail: 'A few sentences on what the project does, its stack, and where to start reading.' },
  { icon: Workflow, layer: 'api', term: 'Architecture diagram', detail: 'A flowchart of the main pieces, coloured by layer, expandable to full screen.' },
  { icon: Highlighter, layer: 'jobs', term: 'Answers from the code', detail: 'Written from the retrieved files, with the paths marked so you can check them.' },
  { icon: MessageCircleQuestion, layer: 'services', term: 'Suggested questions', detail: 'Four starting points written for that specific repository.' },
  { icon: Bug, layer: 'data', term: 'Issue search', detail: 'Questions about bugs or pull requests search the repo’s GitHub issues.' },
  { icon: History, layer: 'none', term: 'History', detail: 'Every repository you’ve asked about stays in the sidebar.' },
];

const stack = [
  ['Frontend', 'React 19, Vite, Tailwind CSS', 'frontend'],
  ['API', 'Node.js, Express 5', 'api'],
  ['Agent', 'LangGraph', 'services'],
  ['Language model', 'openai/gpt-oss-120b on Groq', 'services'],
  ['Embeddings', 'Google gemini-embedding-001', 'services'],
  ['Vector store', 'MongoDB Atlas Vector Search', 'data'],
  ['Auth', 'GitHub OAuth, JWT, bcrypt', 'api'],
  ['Hosting', 'Docker on AWS EC2', 'none'],
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-page">
      <header className="sticky top-0 z-20 border-b border-line bg-page/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <Wordmark />
          <nav className="flex items-center gap-1 text-[15px]" aria-label="Main">
            <a href="#how" className="hidden px-3 py-2 font-medium text-ink-2 hover:text-ink sm:inline">
              How it works
            </a>
            <a href={SOURCE_URL} target="_blank" rel="noopener noreferrer" className="hidden px-3 py-2 font-medium text-ink-2 hover:text-ink sm:inline">
              Source
            </a>
            <Link to="/login" className="px-3 py-2 font-medium text-ink-2 hover:text-ink">
              Sign in
            </Link>
            <Link to="/register" className="btn-primary ml-1">
              Create account
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-20 pt-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.12fr)] lg:gap-14 lg:pb-24 lg:pt-20">
          <div className="max-w-xl">
            <p className="flex items-center gap-2.5 font-mono text-[13px] text-ink-3">
              <span aria-hidden className="h-0.5 w-6 bg-pen" />
              For reading unfamiliar code
            </p>
            <h1 className="mt-4 font-display text-[2.9rem] font-bold leading-[0.98] tracking-[-0.015em] sm:text-[3.9rem]">
              Ask a repository <span className="marker">how it works.</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-ink-2">
              Paste a GitHub link. RepoInsight indexes the code, draws the architecture, and answers your questions from the
              files it found, so you can check its work.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {/* A plain link: the server starts the OAuth redirect. */}
              <a href="/api/auth/github" className="btn-dark px-5 py-2.5">
                <GithubMark className="h-[18px] w-[18px]" /> Continue with GitHub
              </a>
              <Link to="/register" className="btn-secondary px-5 py-2.5">
                Use email instead
              </Link>
            </div>
            <p className="mt-4 text-sm text-ink-3">Works with public GitHub repositories.</p>
          </div>

          <HeroDrawing />
        </section>

        <section id="how" className="border-t border-line bg-surface">
          <div className="mx-auto max-w-6xl px-5 py-20">
            <div className="max-w-2xl">
              <p className="eyebrow">How it works</p>
              <h2 className="mt-2 font-display text-[2.1rem] font-bold leading-tight">Two pipelines</h2>
              <p className="mt-3 leading-7 text-ink-2">
                The first runs once, when you add a repository. The second runs for every question you ask.
              </p>
            </div>

            <Pipeline title="When you add a repository" note="runs once" steps={indexing} />
            <p className="mt-4 max-w-3xl text-sm leading-6 text-ink-2">
              Then the model reads the file tree and <code className="font-mono text-[13px]">package.json</code> to write
              the overview, stack, entry points, suggested questions and architecture diagram.
            </p>

            <Pipeline title="When you ask a question" note="runs every time" steps={answering} loop />
          </div>
        </section>

        <section className="border-t border-line">
          <div className="mx-auto grid max-w-6xl gap-14 px-5 py-20 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
            <div>
              <p className="eyebrow">What you get</p>
              <h2 className="mt-2 font-display text-[2.1rem] font-bold leading-tight">A report, then a conversation</h2>
              <ul className="mt-8 grid gap-x-8 gap-y-7 sm:grid-cols-2">
                {features.map(({ icon: Icon, layer, term, detail }) => (
                  <li key={term} className="flex gap-3.5">
                    <span
                      className={`tint-${layer} grid h-9 w-9 shrink-0 place-items-center rounded-lg border-[1.5px]`}
                      style={{ background: 'var(--tint-fill)', borderColor: 'var(--tint-edge)', color: 'var(--tint-line)' }}
                    >
                      <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
                    </span>
                    <span>
                      <span className="block font-semibold">{term}</span>
                      <span className="mt-0.5 block text-[15px] leading-6 text-ink-2">{detail}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="self-start overflow-hidden rounded-xl border-[1.5px] border-accent bg-surface">
              <div className="flex items-center justify-between border-b-[1.5px] border-accent px-4 py-2.5">
                <p className="font-display text-lg font-bold">Under the hood</p>
                <span className="font-mono text-xs text-ink-3">parts list</span>
              </div>
              <table className="w-full text-left text-[15px]">
                <tbody className="divide-y divide-line">
                  {stack.map(([part, tech, layer]) => (
                    <tr key={part}>
                      <th scope="row" className="w-40 py-2.5 pl-4 pr-3 align-top font-normal text-ink-3">
                        <span className="flex items-center gap-2">
                          <span aria-hidden className={`tint-${layer} h-2 w-2 shrink-0 rounded-sm`} style={{ background: 'var(--tint-line)' }} />
                          {part}
                        </span>
                      </th>
                      <td className="py-2.5 pr-4 font-mono text-[13.5px]">{tech}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="border-t-[1.5px] border-accent px-4 py-2 font-mono text-xs text-ink-3">shrish98/RepoInsight · main</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-8 text-sm text-ink-2 sm:flex-row sm:items-center sm:justify-between">
          <p>
            Built by{' '}
            <a href={AUTHOR_URL} target="_blank" rel="noopener noreferrer" className="text-ink underline decoration-line-strong underline-offset-4 hover:decoration-ink">
              Shrishti Tomar
            </a>
            .
          </p>
          <div className="flex gap-5">
            <a href={SOURCE_URL} target="_blank" rel="noopener noreferrer" className="hover:text-ink">
              Source on GitHub
            </a>
            <a href="mailto:shrishtitomar300@gmail.com" className="hover:text-ink">
              Email
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Pipeline({ title, note, steps, loop = false }) {
  return (
    <div className="mt-12">
      <h3 className="flex items-baseline gap-2 font-semibold">
        {title}
        <span className="font-mono text-xs font-normal text-ink-3">· {note}</span>
      </h3>
      <ol
        className={`mt-4 grid overflow-hidden rounded-xl border-[1.5px] border-accent bg-surface sm:grid-cols-2 ${
          steps.length === 5 ? 'lg:grid-cols-5' : 'lg:grid-cols-4'
        }`}
      >
        {steps.map((step, i) => (
          <li
            key={step.name}
            className="relative border-line p-5 [&:not(:last-child)]:border-b-[1.5px] lg:[&:not(:last-child)]:border-b-0 lg:[&:not(:last-child)]:border-r-[1.5px]"
          >
            <p className="flex items-center gap-2 font-mono text-xs text-ink-3">
              {step.layer === 'pen' ? (
                <span className="pen-num h-[22px] w-[22px] text-xs">{i + 1}</span>
              ) : (
                <span
                  className={`tint-${step.layer} grid h-[22px] min-w-[22px] place-items-center rounded-md border-[1.5px] px-1 font-semibold`}
                  style={{ background: 'var(--tint-fill)', borderColor: 'var(--tint-edge)', color: 'var(--tint-ink)' }}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
              )}
              {i < steps.length - 1 && <span aria-hidden>→</span>}
            </p>
            <p className="mt-3 font-display text-lg font-bold">{step.name}</p>
            <p className="mt-1 text-[14.5px] leading-6 text-ink-2">{step.detail}</p>
          </li>
        ))}
      </ol>
      {loop && (
        <p className="mt-3 font-mono text-xs text-pen">↺ Retry goes back to 01 with new keywords. A weak answer gets at most one more attempt.</p>
      )}
    </div>
  );
}

// RepoInsight's own architecture, drawn in on first load: the lines first, then the boxes over them.
const heroNodes = [
  { x: 30, y: 40, title: 'React client', sub: 'Vite · Tailwind', layer: 'frontend', d: 0.55 },
  { x: 230, y: 40, title: 'Express API', sub: 'JWT · OAuth', layer: 'api', d: 0.65 },
  { x: 430, y: 40, title: 'LangGraph agent', sub: 'retrieve · check', layer: 'services', d: 0.75 },
  { x: 430, y: 150, title: 'Groq', sub: 'gpt-oss-120b', layer: 'services', d: 0.85 },
  { x: 30, y: 150, title: 'GitHub API', sub: 'external', layer: 'none', d: 0.95, dashed: true },
];

const heroEdges = [
  { path: 'M182 64 H224', head: [226, 64, 0], label: [188, 52, '/chat'], d: 0 },
  { path: 'M382 64 H424', head: [426, 64, 0], label: [388, 52, 'ask'], d: 0.1 },
  { path: 'M505 88 V144', head: [505, 146, 90], label: [512, 118, 'prompt'], d: 0.2 },
  { path: 'M450 88 C420 120 362 128 346 144', head: [344, 146, 135], label: [376, 108, 'search'], d: 0.3 },
  { path: 'M270 88 C240 120 172 130 142 145', head: [140, 146, 152], label: [168, 106, 'fetch tree'], d: 0.4 },
  { path: 'M105 198 C105 236 170 242 226 238', head: [228, 238, -5], label: [150, 256, 'chunks'], d: 0.5, dashed: true },
];

function HeroDrawing() {
  return (
    <figure className="relative min-w-0">
      <div className="overflow-hidden rounded-xl border-[1.5px] border-accent bg-surface shadow-[0_18px_40px_-24px_rgb(31_39_82/0.45)]">
        <div className="flex items-center gap-2 border-b-[1.5px] border-accent px-4 py-2.5 font-mono text-[13px]">
          <span>shrish98/RepoInsight</span>
          <span className="hidden text-ink-3 sm:inline">· architecture</span>
          <span className="ml-auto rounded border-[1.5px] border-accent px-1.5 text-[11px] font-semibold tracking-[0.08em] text-accent">EXAMPLE</span>
        </div>
        <div className="gridpaper">
          <svg viewBox="0 0 600 290" className="block w-full" role="img" aria-label="RepoInsight's architecture: React client, Express API, LangGraph agent, Groq, MongoDB Atlas and the GitHub API">
            {heroEdges.map((e) => (
              <g key={e.path}>
                {e.dashed ? (
                  <path d={e.path} fill="none" stroke="#3b4fa0" strokeWidth="1.6" strokeDasharray="5 4" className="draw-in" style={{ '--d': `${e.d}s` }} />
                ) : (
                  <path d={e.path} pathLength="1" fill="none" stroke="#3b4fa0" strokeWidth="1.6" className="draw-line" style={{ '--d': `${e.d}s` }} />
                )}
                <g className="draw-in" style={{ '--d': `${e.d + 0.45}s` }}>
                  <path d="M0 0 L-9 -4.5 L-9 4.5 Z" fill="#3b4fa0" transform={`translate(${e.head[0]} ${e.head[1]}) rotate(${e.head[2]})`} />
                  <text x={e.label[0]} y={e.label[1]} fontFamily="Overpass Mono" fontSize="10.5" fill="#666c93" dominantBaseline="middle">
                    {e.label[2]}
                  </text>
                </g>
              </g>
            ))}

            {heroNodes.map((n) => (
              <g key={n.title} className={`tint-${n.layer} draw-in`} style={{ '--d': `${n.d}s` }}>
                <rect
                  x={n.x}
                  y={n.y}
                  width="150"
                  height="48"
                  rx="8"
                  strokeWidth="1.6"
                  strokeDasharray={n.dashed ? '5 4' : undefined}
                  style={{ fill: 'var(--tint-fill)', stroke: 'var(--tint-line)' }}
                />
                <text x={n.x + 75} y={n.y + 18} textAnchor="middle" dominantBaseline="middle" fontFamily="Barlow" fontSize="14" fontWeight="600" style={{ fill: 'var(--tint-ink)' }}>
                  {n.title}
                </text>
                <text x={n.x + 75} y={n.y + 35} textAnchor="middle" dominantBaseline="middle" fontFamily="Overpass Mono" fontSize="11" style={{ fill: 'var(--tint-line)' }}>
                  {n.sub}
                </text>
              </g>
            ))}

            <g className="tint-data draw-in" style={{ '--d': '0.9s' }}>
              <path d="M232 160 h146 v58 a73 11 0 0 1 -146 0 z" strokeWidth="1.6" style={{ fill: 'var(--tint-fill)', stroke: 'var(--tint-line)' }} />
              <ellipse cx="305" cy="160" rx="73" ry="11" strokeWidth="1.6" style={{ fill: 'var(--tint-fill)', stroke: 'var(--tint-line)' }} />
              <text x="305" y="190" textAnchor="middle" dominantBaseline="middle" fontFamily="Barlow" fontSize="14" fontWeight="600" style={{ fill: 'var(--tint-ink)' }}>
                MongoDB Atlas
              </text>
              <text x="305" y="207" textAnchor="middle" dominantBaseline="middle" fontFamily="Overpass Mono" fontSize="11" style={{ fill: 'var(--tint-line)' }}>
                vector index
              </text>
            </g>
            <text x="30" y="276" fontFamily="Overpass Mono" fontSize="10" fill="#666c93" dominantBaseline="middle">
              Drawn from the file tree and package.json
            </text>
          </svg>
        </div>
      </div>

      <div className="relative mt-4 rounded-xl border-[1.5px] border-line-strong bg-surface p-4 text-[14.5px] leading-6 shadow-[0_20px_40px_-18px_rgb(31_39_82/0.45)] sm:-mt-10 sm:ml-[-28px] sm:mr-16 lg:max-w-[400px]">
        <p className="flex gap-2 font-semibold">
          <span className="mt-0.5 h-fit rounded bg-accent px-1.5 font-mono text-[11px] font-semibold leading-5 text-white">Q1</span>
          Where does authentication happen?
        </p>
        <ol className="mt-3 space-y-2">
          <li className="flex gap-2.5">
            <span className="pen-num">1</span>
            <span>
              <FileRef>authController.js</FileRef> checks the password with bcrypt and signs a 7-day JWT.
            </span>
          </li>
          <li className="flex gap-2.5">
            <span className="pen-num">2</span>
            <span>
              <FileRef>githubAuthController.js</FileRef> handles GitHub sign-in.
            </span>
          </li>
          <li className="flex gap-2.5">
            <span className="pen-num">3</span>
            <span>
              <FileRef>middleware/auth.js</FileRef> verifies the token on every request.
            </span>
          </li>
        </ol>
      </div>
      <figcaption className="mt-3 text-sm text-ink-3 sm:ml-[-28px]">RepoInsight answering a question about its own source.</figcaption>
    </figure>
  );
}

function FileRef({ children }) {
  return (
    <code className="rounded-sm bg-[linear-gradient(transparent_10%,rgb(247_221_74/0.6)_10%_90%,transparent_90%)] px-1 font-mono text-[12.5px]">
      {children}
    </code>
  );
}
