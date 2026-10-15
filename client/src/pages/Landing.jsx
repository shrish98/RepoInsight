import { Link } from 'react-router-dom';
import Wordmark from '../components/Wordmark';
import GithubMark from '../components/GithubMark';
import { useReveal } from '../hooks/useReveal';
import { languageShares } from '../utils/languages';
import LanguageBar from '../components/LanguageBar';

const SOURCE_URL = 'https://github.com/shrish98/RepoInsight';
const AUTHOR_URL = 'https://my-portfolio-beta-steel-ih418ur0sz.vercel.app';
const fileOnGithub = (path, lines = '') => `${SOURCE_URL}/blob/HEAD/${path}${lines}`;

// Everything shown on this page is RepoInsight describing its own repository.
const OWN_LANGUAGES = languageShares({ JavaScript: 130147, CSS: 7740, HTML: 2113, Dockerfile: 332 });

const specs = [
  ['1,000', 'characters per chunk, with 200 of overlap'],
  ['3,072', 'dimensions per embedding'],
  ['120B', 'parameter model on Groq'],
  ['1', 'automatic retry when an answer misses'],
];

const stack = [
  ['Frontend', 'React 19 · Vite · Tailwind'],
  ['API', 'Node.js · Express 5'],
  ['Agent', 'LangGraph'],
  ['Language model', 'gpt-oss-120b · Groq'],
  ['Embeddings', 'gemini-embedding-001'],
  ['Vector store', 'MongoDB Atlas'],
  ['Auth', 'GitHub OAuth · JWT'],
  ['Hosting', 'Docker · AWS EC2'],
];

export default function Landing() {
  useReveal();

  return (
    <div className="min-h-screen bg-page">
      <Hero />
      <HowItWorks />
      <Grounded />
      <ReportSection />
      <UnderTheHood />

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-8 text-sm text-ink-2 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p>
            Built by{' '}
            <a href={AUTHOR_URL} target="_blank" rel="noopener noreferrer" className="font-semibold text-ink hover:text-accent">
              Shrishti Tomar
            </a>
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

/* ---------------------------------------------------------------- Hero */

function Hero() {
  return (
    <section className="relative overflow-hidden bg-night text-white">
      <div
        aria-hidden
        className="gradient-band absolute inset-0 hidden opacity-95 lg:block"
        style={{ clipPath: 'polygon(64% 0, 100% 0, 100% 100%, 44% 100%)' }}
      />
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(1100px_480px_at_12%_8%,rgb(91_76_245/0.28),transparent_60%)]" />

      <header className="relative z-10 mx-auto flex h-[68px] max-w-7xl items-center gap-1 px-5 sm:px-8">
        <Wordmark light />
        <span className="flex-1" />
        <a href="#how" className="hidden px-3 py-2 font-medium text-white/80 hover:text-white sm:inline">
          How it works
        </a>
        <a href={SOURCE_URL} target="_blank" rel="noopener noreferrer" className="hidden px-3 py-2 font-medium text-white/80 hover:text-white sm:inline">
          Source
        </a>
        <Link to="/login" className="px-3 py-2 font-medium text-white/80 hover:text-white">
          Sign in
        </Link>
        <Link to="/register" className="btn-light ml-1 hidden h-9 px-3.5 text-sm sm:inline-flex">
          Create account
        </Link>
      </header>

      <div className="relative z-10 mx-auto grid max-w-7xl gap-14 px-5 pb-20 pt-10 sm:px-8 lg:grid-cols-[0.86fr_1.14fr] lg:gap-8 lg:pb-28 lg:pt-14">
        <div className="min-w-0 max-w-xl">
          <p className="rise inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 py-1 pl-1.5 pr-3 text-[13px] font-semibold text-[#c9d3e6]">
            <span className="rounded-full bg-accent px-2 py-px text-[11.5px] text-white">New</span>
            Sign in with GitHub
          </p>
          <h1
            className="rise mt-6 text-[2.75rem] font-[780] leading-[1.0] tracking-[-0.035em] sm:text-[3.7rem]"
            style={{ '--d': '0.08s', fontStretch: '112%' }}
          >
            Ask a repository{' '}
            <span className="bg-gradient-to-r from-[#a5b4ff] to-[#7fe3f5] bg-clip-text text-transparent">how it works.</span>
          </h1>
          <p className="rise mt-5 max-w-[30rem] text-lg leading-8 text-[#aebbd2]" style={{ '--d': '0.16s' }}>
            Paste a GitHub link. RepoInsight indexes the code, maps the architecture, and answers your questions with the exact
            files and lines it used.
          </p>
          <div className="rise mt-8 flex flex-wrap gap-3" style={{ '--d': '0.24s' }}>
            {/* A plain link: the server starts the OAuth redirect. */}
            <a href="/api/auth/github" className="btn-light h-12 px-5 text-base">
              <GithubMark className="h-[18px] w-[18px]" /> Continue with GitHub
            </a>
            <Link to="/register" className="btn-ghost-dark h-12 px-5 text-base">
              Use email
            </Link>
          </div>
          <p className="rise mt-7 flex flex-wrap gap-x-5 gap-y-1 font-mono text-[12.5px] text-[#8796b0]" style={{ '--d': '0.32s' }}>
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#3fb950]" />
              Public repos
            </span>
            <span>gpt-oss-120b on Groq</span>
            <span>Atlas vector search</span>
          </p>
        </div>

        <ProductShot />
      </div>
    </section>
  );
}

function FileIcon({ className = 'h-3 w-3' }) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className={className} aria-hidden="true">
      <path d="M2 1.75C2 .78 2.78 0 3.75 0h6.59c.46 0 .9.18 1.23.51l2.92 2.92c.33.33.51.77.51 1.23v9.59A1.75 1.75 0 0 1 13.25 16h-9.5A1.75 1.75 0 0 1 2 14.25Zm1.75-.25a.25.25 0 0 0-.25.25v12.5c0 .14.11.25.25.25h9.5a.25.25 0 0 0 .25-.25V6h-2.75A1.75 1.75 0 0 1 9 4.25V1.5Z" />
    </svg>
  );
}

function RepoIcon({ className = 'h-4 w-4' }) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className={className} aria-hidden="true">
      <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.71 1.71.75.75 0 0 1-1.06 1.06A2.49 2.49 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.71A2.49 2.49 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.09a.25.25 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z" />
    </svg>
  );
}

function Pill({ children, href }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="file-pill">
      <FileIcon />
      {children}
    </a>
  );
}

// Syntax colours from GitHub's light theme.
const K = ({ children }) => <span className="text-[#cf222e]">{children}</span>;
const F = ({ children }) => <span className="text-[#8250df]">{children}</span>;
const S = ({ children }) => <span className="text-[#0a3069]">{children}</span>;
const N = ({ children }) => <span className="text-[#0550ae]">{children}</span>;
const C = ({ children }) => <span className="italic text-[#6e7781]">{children}</span>;

function CodeView({ path, note, href, lines, className = '' }) {
  return (
    <div className={`overflow-hidden rounded-xl border border-line bg-white text-ink ${className}`}>
      <div className="flex items-center gap-2 border-b border-line bg-subtle px-3.5 py-2 text-xs text-ink-2">
        <FileIcon className="h-3.5 w-3.5" />
        <span className="font-mono font-semibold text-ink">{path}</span>
        {note && <span className="hidden text-ink-3 sm:inline">· {note}</span>}
        <a href={href} target="_blank" rel="noopener noreferrer" className="ml-auto font-semibold text-link hover:underline">
          View on GitHub ↗
        </a>
      </div>
      <div className="overflow-x-auto py-2 font-mono text-[12.5px] leading-[1.75]">
        {lines.map(([n, code, highlighted]) => (
          <div key={n} className={`flex ${highlighted ? 'bg-[#fff8c5] shadow-[inset_3px_0_0_#d4a72c]' : ''}`}>
            <span className="w-11 shrink-0 select-none pr-3.5 text-right text-[#8c959f]">{n}</span>
            <span className="whitespace-pre pr-4">{code}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const AUTH_LINES = [
  [1, <><K>import</K> {'{ verifyToken }'} <K>from</K> <S>'../config/auth.js'</S>;</>],
  [2, ''],
  [3, <><K>export const</K> <F>authMiddleware</F> = (req, res, next) =&gt; {'{'}</>],
  [4, <>  <K>const</K> authHeader = req.headers.authorization;</>],
  [5, ''],
  [6, <>  <K>if</K> (!authHeader || !authHeader.<F>startsWith</F>(<S>'Bearer '</S>)) {'{'}</>],
  [7, <>    <K>return</K> res.<F>status</F>(<N>401</N>).<F>json</F>({'{'} error: <S>'No token provided.'</S> {'}'});</>],
  [8, '  }'],
  [9, ''],
  [10, <>  <K>try</K> {'{'}</>, true],
  [11, <>    req.user = <F>verifyToken</F>(authHeader.<F>slice</F>(<S>'Bearer '</S>.length)); <C>{'// { userId }'}</C></>, true],
  [12, <>    <F>next</F>();</>, true],
  [13, <>  {'}'} <K>catch</K> {'{'}</>, true],
  [14, <>    res.<F>status</F>(<N>401</N>).<F>json</F>({'{'} error: <S>'Invalid or expired token.'</S> {'}'});</>, true],
  [15, <>  {'}'}</>, true],
  [16, '};'],
];

function ProductShot() {
  return (
    <div className="relative min-w-0 lg:h-[520px]">
      <div
        className="rise relative overflow-hidden rounded-xl bg-white text-ink shadow-[0_40px_80px_-30px_rgb(3_10_30/0.7),0_0_0_1px_rgb(255_255_255/0.08)] lg:absolute lg:left-5 lg:top-0 lg:w-[600px]"
        style={{ '--d': '0.3s' }}
      >
        <div className="flex items-center gap-2.5 border-b border-line px-3.5 py-2.5 text-[13px]">
          <RepoIcon className="h-4 w-4 text-ink-2" />
          <span className="font-semibold">
            <span className="font-medium text-ink-2">shrish98 / </span>RepoInsight
          </span>
          <span className="rounded-full border border-line bg-subtle px-2 font-mono text-[11.5px] text-ink-2">main</span>
        </div>
        <div className="px-4 pb-4 pt-4 sm:px-5">
          <p className="flex items-center gap-2.5 text-[15px] font-semibold">
            <span aria-hidden className="h-6 w-6 shrink-0 rounded-full bg-[conic-gradient(#5b4cf5_0_30%,#22c7e8_0_60%,#ff6a55_0)]" />
            Where does authentication happen?
          </p>
          <div className="ml-0 mt-3 text-sm leading-relaxed text-[#2f363d] sm:ml-[34px]">
            <p className="text-xs font-semibold text-ink-3">
              <span className="text-accent">RepoInsight</span> · read 3 files
            </p>
            <ol className="mt-2 space-y-1.5">
              {[
                ['server/controllers/authController.js', 'hashes passwords with bcrypt and signs the JWT.', ''],
                ['server/controllers/githubAuthController.js', 'handles Sign in with GitHub.', ''],
                ['server/middleware/auth.js', 'checks the token on every API request.', '#L10-L15'],
              ].map(([path, text, lines], i) => (
                <li key={path} className="rise flex gap-2" style={{ '--d': `${0.55 + i * 0.12}s` }}>
                  <span className="mt-0.5 grid h-[19px] w-[19px] shrink-0 place-items-center rounded-md bg-accent-soft text-[11px] font-bold text-accent-strong">
                    {i + 1}
                  </span>
                  <span>
                    <Pill href={fileOnGithub(path, lines)}>{path.replace('server/', '')}</Pill> {text}
                  </span>
                </li>
              ))}
            </ol>
            <CodeView
              className="rise mt-3"
              path="server/middleware/auth.js"
              href={fileOnGithub('server/middleware/auth.js', '#L10-L15')}
              lines={AUTH_LINES.slice(9, 15)}
            />
          </div>
        </div>
      </div>

      <div
        className="pop absolute -top-5 right-2 hidden items-center gap-2.5 rounded-xl bg-white px-3.5 py-2.5 text-[13px] text-ink shadow-[0_20px_40px_-18px_rgb(3_10_30/0.6),0_0_0_1px_rgb(0_0_0/0.04)] sm:flex lg:-right-2"
        style={{ '--d': '1s' }}
      >
        <span className="grid h-6 w-6 place-items-center rounded-full bg-ok-soft text-ok">
          <svg viewBox="0 0 16 16" className="h-3 w-3" fill="currentColor" aria-hidden="true">
            <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z" />
          </svg>
        </span>
        <span>
          <b className="block">RepoInsight indexed</b>
          <span className="font-mono text-[11.5px] text-ink-3">ready for questions</span>
        </span>
      </div>

      <div
        className="pop mt-4 w-full rounded-xl bg-white p-3 pb-2 text-ink shadow-[0_30px_60px_-24px_rgb(3_10_30/0.65),0_0_0_1px_rgb(0_0_0/0.04)] lg:absolute lg:-right-2 lg:bottom-0 lg:mt-0 lg:w-[310px]"
        style={{ '--d': '1.25s' }}
      >
        <p className="mb-1.5 flex justify-between text-[12.5px] font-semibold text-ink-2">
          Architecture <span className="font-medium text-ink-3">generated</span>
        </p>
        <MiniDiagram />
      </div>
    </div>
  );
}

function Box({ x, y, w = 120, label, layer }) {
  return (
    <g className={`tint-${layer}`}>
      <rect x={x} y={y} width={w} height="32" rx="7" strokeWidth="1.2" style={{ fill: 'var(--tint-fill)', stroke: 'var(--tint-line)' }} />
      <text x={x + w / 2} y={y + 16.5} textAnchor="middle" dominantBaseline="middle" fontSize="11.5" fontWeight="650" style={{ fill: 'var(--tint-ink)' }}>
        {label}
      </text>
    </g>
  );
}

function MiniDiagram() {
  return (
    <svg viewBox="0 0 286 142" className="block w-full font-sans" role="img" aria-label="Diagram: React client to Express API to LangGraph agent, which uses Groq and MongoDB Atlas">
      <defs>
        <marker id="mini-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M0 0L10 5L0 10z" fill="#818b98" />
        </marker>
      </defs>
      <g fill="none" stroke="#818b98" strokeWidth="1.2" markerEnd="url(#mini-arrow)">
        <path d="M106 22 H146" />
        <path d="M208 38 V64" />
        <path d="M168 82 H128" />
        <path d="M208 98 V116" />
      </g>
      <Box x={6} y={6} w={100} label="React client" layer="frontend" />
      <Box x={148} y={6} w={120} label="Express API" layer="api" />
      <Box x={148} y={66} w={120} label="LangGraph agent" layer="services" />
      <Box x={6} y={66} w={120} label="MongoDB Atlas" layer="data" />
      <text x="208" y="131" textAnchor="middle" fontSize="10.5" fontFamily="JetBrains Mono" fill="#818b98" dominantBaseline="middle">
        Groq · gpt-oss-120b
      </text>
    </svg>
  );
}

/* ---------------------------------------------------------------- Sections */

function SectionHead({ kicker, title, children }) {
  return (
    <div className="reveal max-w-2xl">
      <p className="text-sm font-semibold text-accent">{kicker}</p>
      <h2 className="mt-2.5 text-[2.1rem] font-[760] leading-[1.08] tracking-[-0.03em] sm:text-[2.5rem]" style={{ fontStretch: '110%' }}>
        {title}
      </h2>
      <p className="mt-3.5 text-[17px] leading-7 text-ink-2">{children}</p>
    </div>
  );
}

function HowItWorks() {
  const steps = [
    {
      title: 'Paste a repository',
      text: 'Any public GitHub URL. RepoInsight reads the default branch through the GitHub API.',
      ring: 'border-accent text-accent',
      body: (
        <div className="flex gap-1.5">
          <span className="flex-1 truncate rounded-lg border border-line px-2.5 py-2 font-mono text-[12.5px]">github.com/shrish98/RepoInsight</span>
          <span className="btn-primary h-9 px-3 text-[13.5px]">Analyze</span>
        </div>
      ),
    },
    {
      title: 'It reads every file',
      text: 'Skips dependencies and build output, splits the rest into chunks and embeds them.',
      ring: 'border-[#22a6c8] text-[#178ba8]',
      body: (
        <div className="font-mono text-[12.5px] leading-8">
          {[
            ['client/', '32 files', '#f1e05a'],
            ['server/', '23 files', '#f1e05a'],
            ['scripts/', '1 file', '#f1e05a'],
          ].map(([dir, count, color]) => (
            <div key={dir} className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
              {dir}
              <span className="ml-auto text-ink-3">{count}</span>
            </div>
          ))}
          <div className="flex items-center gap-2 text-ink-3">
            <span className="h-2.5 w-2.5 rounded-full bg-line" />
            <span className="line-through">node_modules/</span>
            <span className="ml-auto">skipped</span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-subtle">
            <div className="fill-up h-full w-3/4 rounded-full bg-gradient-to-r from-accent to-[#22c7e8]" />
          </div>
        </div>
      ),
    },
    {
      title: 'Ask anything',
      text: 'Answers cite the files and lines they came from, so you can open them and check.',
      ring: 'border-[#ff6a55] text-[#d9442f]',
      body: (
        <div className="text-[13.5px] leading-relaxed">
          <p className="font-semibold">Which model answers questions?</p>
          <p className="mt-1 text-ink-2">
            <code className="rounded bg-[rgb(175_184_193/0.2)] px-1 font-mono text-[12px] text-ink">openai/gpt-oss-120b</code> on Groq, unless{' '}
            <code className="rounded bg-[rgb(175_184_193/0.2)] px-1 font-mono text-[12px] text-ink">GROQ_MODEL</code> is set.
          </p>
          <p className="mt-2">
            <Pill href={fileOnGithub('server/config/llm.js', '#L5')}>server/config/llm.js#L5</Pill>
          </p>
        </div>
      ),
    },
  ];

  return (
    <section id="how" className="mx-auto max-w-7xl scroll-mt-4 px-5 py-24 sm:px-8">
      <SectionHead kicker="How it works" title="From a URL to an answer you can check">
        Indexing runs once per repository. After that, every question is answered from the code itself, not from what the
        model remembers.
      </SectionHead>

      <ol className="relative mt-14 grid gap-10 md:grid-cols-3 md:gap-7 [&>li]:min-w-0">
        <span aria-hidden className="absolute left-4 right-4 top-[15px] hidden h-0.5 bg-gradient-to-r from-accent via-[#22c7e8] to-[#ff6a55] opacity-35 md:block" />
        {steps.map((step, i) => (
          <li key={step.title} className="reveal relative" style={{ '--d': `${i * 0.12}s` }}>
            <span className={`relative grid h-8 w-8 place-items-center rounded-full border-2 bg-white text-sm font-bold ${step.ring}`}>{i + 1}</span>
            <h3 className="mt-5 text-lg font-bold tracking-[-0.01em]">{step.title}</h3>
            <p className="mt-1.5 text-ink-2">{step.text}</p>
            <div className="card mt-5 p-3.5 shadow-[0_16px_32px_-24px_rgb(31_35_40/0.35)]">{step.body}</div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Check({ children }) {
  return (
    <li className="flex gap-3 text-[#2f363d]">
      <svg viewBox="0 0 16 16" className="mt-1 h-[18px] w-[18px] shrink-0" fill="#1a7f37" aria-hidden="true">
        <path d="M8 16A8 8 0 1 1 8 0a8 8 0 0 1 0 16Zm3.78-9.72a.75.75 0 0 0-1.06-1.06L6.75 9.19 5.28 7.72a.75.75 0 0 0-1.06 1.06l2 2a.75.75 0 0 0 1.06 0Z" />
      </svg>
      {children}
    </li>
  );
}

function Grounded() {
  return (
    <section className="border-y border-line bg-subtle">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-24 sm:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        <div>
          <SectionHead kicker="Grounded answers" title="Every answer shows its sources">
            The agent only answers from code it retrieved. A second pass checks the answer actually addresses your question,
            and retries once if it doesn’t.
          </SectionHead>
          <ul className="reveal mt-7 space-y-3.5" style={{ '--d': '0.1s' }}>
            <Check>File and line links that open straight on GitHub</Check>
            <Check>Code quoted from the repository, not invented</Check>
            <Check>Questions about bugs also search the repo’s GitHub issues</Check>
          </ul>
        </div>
        <CodeView
          className="reveal shadow-[0_30px_60px_-36px_rgb(31_35_40/0.45)]"
          path="server/middleware/auth.js"
          note="cited in the answer"
          href={fileOnGithub('server/middleware/auth.js', '#L10-L15')}
          lines={AUTH_LINES}
        />
      </div>
    </section>
  );
}

function ReportSection() {
  const startHere = ['server/index.js', 'server/services/agentService.js', 'client/src/pages/Workspace.jsx'];
  return (
    <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
      <SectionHead kicker="The report" title="A map before you dive in">
        Every repository gets an overview, its languages and stack, where to start reading, and an architecture diagram
        generated from the code.
      </SectionHead>

      <div className="reveal card mt-12 grid overflow-hidden shadow-[0_24px_48px_-32px_rgb(31_35_40/0.4)] lg:grid-cols-[1fr_1.1fr]">
        <div className="space-y-6 p-6 lg:border-r lg:border-line">
          <div>
            <p className="eyebrow">About</p>
            <p className="mt-1.5 text-[15px] leading-7 text-[#3d444d]">
              RepoInsight indexes a GitHub repository, draws its architecture, and answers questions about it from the code
              it retrieves.
            </p>
          </div>
          <div>
            <p className="eyebrow">Languages</p>
            <LanguageBar shares={OWN_LANGUAGES} />
          </div>
          <div>
            <p className="eyebrow">Stack</p>
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {['React', 'Vite', 'Express', 'LangGraph', 'Groq', 'MongoDB Atlas', 'Docker'].map((t) => (
                <li key={t} className="rounded-full border border-line px-2.5 py-0.5 text-[13px] font-medium">
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="eyebrow">Start reading at</p>
            <ul className="mt-1.5 font-mono text-[13px] leading-7">
              {startHere.map((path) => (
                <li key={path}>
                  <a href={fileOnGithub(path)} target="_blank" rel="noopener noreferrer" className="text-link hover:underline">
                    {path}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="bg-subtle p-4 sm:p-6">
          <FullDiagram />
        </div>
      </div>
    </section>
  );
}

function FullDiagram() {
  return (
    <svg viewBox="0 0 520 330" className="block w-full font-sans" role="img" aria-label="RepoInsight architecture diagram">
      <defs>
        <marker id="full-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M0 0L10 5L0 10z" fill="#818b98" />
        </marker>
      </defs>
      <g fill="none" stroke="#818b98" strokeWidth="1.5" markerEnd="url(#full-arrow)">
        <path d="M260 66 V104" />
        <path d="M220 152 C190 176 150 186 140 196" />
        <path d="M300 152 C330 176 370 186 380 196" />
        <path d="M140 244 V272" />
        <path d="M220 222 H316" />
      </g>
      <g fontFamily="JetBrains Mono" fontSize="10.5" fill="#818b98">
        <text x="268" y="86" dominantBaseline="middle">/api/chat</text>
        <text x="124" y="174" dominantBaseline="middle">fetch</text>
        <text x="352" y="174" dominantBaseline="middle">ask</text>
        <text x="148" y="260" dominantBaseline="middle">embed</text>
        <text x="236" y="210" dominantBaseline="middle">chunks</text>
      </g>
      {[
        [180, 20, 'React client', 'frontend'],
        [180, 106, 'Express API', 'api'],
        [60, 198, 'GitHub API', 'none'],
        [320, 198, 'LangGraph agent', 'services'],
        [60, 274, 'MongoDB Atlas', 'data'],
      ].map(([x, y, label, layer]) => (
        <g key={label} className={`tint-${layer}`}>
          <rect x={x} y={y} width="160" height="46" rx="9" strokeWidth="1.5" style={{ fill: 'var(--tint-fill)', stroke: 'var(--tint-line)' }} />
          <text x={x + 80} y={y + 23.5} textAnchor="middle" dominantBaseline="middle" fontSize="14" fontWeight="650" style={{ fill: 'var(--tint-ink)' }}>
            {label}
          </text>
        </g>
      ))}
      <g className="tint-services">
        <rect x="320" y="274" width="160" height="46" rx="9" strokeWidth="1.5" strokeDasharray="5 4" style={{ fill: '#fff', stroke: 'var(--tint-line)' }} />
        <text x="400" y="297.5" textAnchor="middle" dominantBaseline="middle" fontSize="14" fontWeight="650" style={{ fill: 'var(--tint-ink)' }}>
          Groq · gpt-oss-120b
        </text>
      </g>
      <path d="M400 244 V270" fill="none" stroke="#818b98" strokeWidth="1.5" markerEnd="url(#full-arrow)" />
    </svg>
  );
}

function UnderTheHood() {
  return (
    <section className="bg-night text-white">
      <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
        <div className="reveal max-w-2xl">
          <p className="text-sm font-semibold text-[#a5b4ff]">Under the hood</p>
          <h2 className="mt-2.5 text-[2.1rem] font-[760] leading-[1.08] tracking-[-0.03em] sm:text-[2.5rem]" style={{ fontStretch: '110%' }}>
            Built like a real system
          </h2>
          <p className="mt-3.5 text-[17px] leading-7 text-[#aebbd2]">Two pipelines: one runs once per repository, the other on every question.</p>
        </div>

        <dl className="mt-12 grid grid-cols-2 gap-y-8 border-t border-white/10 pt-6 lg:grid-cols-4">
          {specs.map(([value, label], i) => (
            <div key={label} className="reveal pr-6 lg:border-r lg:border-white/10 lg:last:border-r-0 lg:[&:not(:first-child)]:pl-6" style={{ '--d': `${i * 0.08}s` }}>
              <dt className="text-[2rem] font-[750] tracking-[-0.02em]" style={{ fontStretch: '110%' }}>
                {value}
              </dt>
              <dd className="mt-1 text-sm text-[#aebbd2]">{label}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-12 grid gap-5 lg:grid-cols-2">
          <Pipeline title="When you add a repository" steps={['fetch', 'filter', 'split', 'embed', 'store']} />
          <Pipeline title="When you ask a question" steps={['retrieve', 'answer', 'check']} retry />
        </div>

        <dl className="reveal mt-6 grid overflow-hidden rounded-xl border border-white/10 sm:grid-cols-2 lg:grid-cols-4">
          {stack.map(([part, tech]) => (
            <div key={part} className="border-b border-white/10 px-4 py-3.5 sm:border-r">
              <dt className="text-xs text-[#7f8fad]">{part}</dt>
              <dd className="mt-0.5 font-mono text-[13px] text-[#e6ecf7]">{tech}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

function Pipeline({ title, steps, retry = false }) {
  return (
    <div className="reveal rounded-xl border border-white/10 bg-white/[0.03] p-5">
      <h3 className="text-sm font-semibold text-[#c9d3e6]">{title}</h3>
      <p className="mt-3 flex flex-wrap items-center gap-2 font-mono text-[13px]">
        {steps.map((step, i) => (
          <span key={step} className="flex items-center gap-2">
            {i > 0 && <span className="text-[#5d6f92]">→</span>}
            <span className="rounded-md border border-white/15 bg-white/[0.04] px-2.5 py-1 text-[#e6ecf7]">{step}</span>
          </span>
        ))}
        {retry && (
          <>
            <span className="text-[#5d6f92]">→</span>
            <span className="rounded-md border border-[#ff6a55]/60 px-2.5 py-1 text-[#ff9c8c]">↺ retry once</span>
          </>
        )}
      </p>
    </div>
  );
}
