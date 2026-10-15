import { Link } from 'react-router-dom';
import Wordmark from '../components/Wordmark';

const SOURCE_URL = 'https://github.com/shrish98/RepoInsight';
const AUTHOR_URL = 'https://my-portfolio-beta-steel-ih418ur0sz.vercel.app';

const indexing = [
  { name: 'Fetch', detail: 'Reads the default branch through the GitHub API.' },
  { name: 'Filter', detail: 'Skips node_modules, build output and binary files.' },
  { name: 'Split', detail: '1,000-character chunks with 200 characters of overlap.' },
  { name: 'Embed', detail: 'gemini-embedding-001, 3,072 dimensions per chunk.' },
  { name: 'Store', detail: 'Written to a MongoDB Atlas vector index.' },
];

const answering = [
  { name: 'Retrieve', detail: 'Vector search over this repository’s chunks, with a keyword fallback.' },
  { name: 'Answer', detail: 'gpt-oss-120b on Groq writes from those files, and can search the repo’s issues.' },
  { name: 'Check', detail: 'A second pass asks whether the answer actually answers the question.' },
  { name: 'Retry', detail: 'If it doesn’t, search again with better keywords. Once.' },
];

const features = [
  ['Overview', 'A few sentences on what the project does, its stack, and where to start reading.'],
  ['Architecture diagram', 'A Mermaid flowchart of the main pieces, expandable to full screen.'],
  ['Answers from the code', 'Written from the retrieved files, with paths and snippets you can check.'],
  ['Suggested questions', 'Four starting points written for that specific repository.'],
  ['Issue search', 'Questions about bugs or pull requests search the repo’s GitHub issues.'],
  ['History', 'Every repository you’ve asked about stays in the sidebar.'],
];

const stack = [
  ['Frontend', 'React 19, Vite, Tailwind CSS'],
  ['API', 'Node.js, Express 5'],
  ['Agent', 'LangGraph'],
  ['Language model', 'openai/gpt-oss-120b on Groq'],
  ['Embeddings', 'Google gemini-embedding-001'],
  ['Vector store', 'MongoDB Atlas Vector Search'],
  ['Auth', 'JWT, bcrypt'],
  ['Hosting', 'Docker on AWS EC2'],
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-page">
      <header className="sticky top-0 z-20 border-b border-line bg-page/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5">
          <Wordmark />
          <nav className="flex items-center gap-1 text-sm" aria-label="Main">
            <a href="#how" className="hidden px-3 py-2 text-ink-2 hover:text-ink sm:inline">
              How it works
            </a>
            <a href={SOURCE_URL} target="_blank" rel="noopener noreferrer" className="hidden px-3 py-2 text-ink-2 hover:text-ink sm:inline">
              Source
            </a>
            <Link to="/login" className="px-3 py-2 text-ink-2 hover:text-ink">
              Sign in
            </Link>
            <Link to="/register" className="btn-primary ml-1">
              Create account
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-6xl gap-14 px-5 pb-20 pt-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-16 lg:pt-24">
          <div className="max-w-xl">
            <p className="eyebrow">For reading unfamiliar code</p>
            <h1 className="mt-4 text-[2.5rem] font-semibold leading-[1.08] tracking-[-0.025em] sm:text-[3.25rem]">
              Ask a repository how it works.
            </h1>
            <p className="mt-6 text-lg leading-8 text-ink-2">
              Paste a GitHub link. RepoInsight indexes the code, sketches the architecture, and answers your questions
              from the files it found, so you can check its work.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/register" className="btn-primary px-5 py-2.5 text-[15px]">
                Create an account
              </Link>
              <Link to="/login" className="btn-secondary px-5 py-2.5 text-[15px]">
                Sign in
              </Link>
            </div>
            <p className="mt-4 text-sm text-ink-3">Works with public GitHub repositories.</p>
          </div>

          <ExampleAnswer />
        </section>

        <section id="how" className="border-t border-line bg-surface">
          <div className="mx-auto max-w-6xl px-5 py-20">
            <div className="max-w-2xl">
              <p className="eyebrow">How it works</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight">Two pipelines</h2>
              <p className="mt-4 leading-7 text-ink-2">
                The first runs once, when you add a repository. The second runs for every question you ask.
              </p>
            </div>

            <Pipeline title="When you add a repository" steps={indexing} />
            <p className="mt-4 max-w-3xl text-sm leading-6 text-ink-2">
              Then the model reads the file tree and <code className="font-mono text-[13px]">package.json</code> to write
              the overview, stack, entry points, suggested questions and architecture diagram.
            </p>

            <Pipeline title="When you ask a question" steps={answering} loop />
          </div>
        </section>

        <section className="border-t border-line">
          <div className="mx-auto grid max-w-6xl gap-16 px-5 py-20 lg:grid-cols-2">
            <div>
              <p className="eyebrow">What you get</p>
              <dl className="mt-6 divide-y divide-line border-y border-line">
                {features.map(([term, detail]) => (
                  <div key={term} className="grid gap-1 py-4 sm:grid-cols-[11rem_1fr] sm:gap-6">
                    <dt className="font-medium">{term}</dt>
                    <dd className="text-ink-2">{detail}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div>
              <p className="eyebrow">Under the hood</p>
              <table className="mt-6 w-full border-y border-line text-left text-[15px]">
                <tbody className="divide-y divide-line">
                  {stack.map(([part, tech]) => (
                    <tr key={part}>
                      <th scope="row" className="w-40 py-3 pr-4 align-top font-normal text-ink-3">
                        {part}
                      </th>
                      <td className="py-3 font-mono text-[13.5px]">{tech}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
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

function Pipeline({ title, steps, loop = false }) {
  return (
    <div className="mt-12">
      <h3 className="text-[15px] font-medium">{title}</h3>
      <ol className={`mt-4 grid overflow-hidden rounded-lg border border-line-strong bg-surface sm:grid-cols-2 ${steps.length === 5 ? 'lg:grid-cols-5' : 'lg:grid-cols-4'}`}>
        {steps.map((step, i) => (
          <li key={step.name} className="relative border-line-strong p-5 [&:not(:last-child)]:border-b lg:[&:not(:last-child)]:border-b-0 lg:[&:not(:last-child)]:border-r">
            <p className="flex items-center gap-2 font-mono text-xs text-ink-3">
              <span>{String(i + 1).padStart(2, '0')}</span>
              {i < steps.length - 1 && <span aria-hidden className="text-ink-3/60">→</span>}
            </p>
            <p className="mt-3 font-medium">{step.name}</p>
            <p className="mt-1.5 text-sm leading-6 text-ink-2">{step.detail}</p>
          </li>
        ))}
      </ol>
      {loop && (
        <p className="mt-3 font-mono text-xs text-ink-3">
          ↺ Retry goes back to 01 with new keywords. A weak answer gets at most one more attempt.
        </p>
      )}
    </div>
  );
}

function ExampleAnswer() {
  return (
    <figure className="min-w-0">
      <div className="overflow-hidden rounded-lg border border-line-strong bg-surface shadow-[0_1px_2px_rgb(0_0_0/0.04),0_12px_32px_-12px_rgb(0_0_0/0.12)]">
        <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
          <span className="font-mono text-[13px]">shrish98/RepoInsight</span>
          <span className="eyebrow">Example</span>
        </div>

        <div className="px-5 py-5 sm:px-6">
          <div className="flex gap-3">
            <span className="mt-0.5 font-mono text-xs text-ink-3">Q1</span>
            <p className="font-medium">Where does authentication happen?</p>
          </div>

          <div className="prose-answer mt-4 border-l-2 border-line pl-4 text-[14.5px] leading-[1.7]">
            <p>It’s token-based, in three places:</p>
            <ul>
              <li>
                <code>server/controllers/authController.js</code> hashes passwords with bcrypt on sign-up, checks them on
                sign-in, and signs a JWT holding the <code>userId</code> that expires after 7 days.
              </li>
              <li>
                <code>server/middleware/auth.js</code> reads the <code>Bearer</code> token, verifies it with{' '}
                <code>JWT_SECRET</code> and puts the payload on <code>req.user</code>. Anything else gets a 401.
              </li>
              <li>
                <code>server/routes/repo.js</code> puts that middleware in front of <code>/analyze</code>,{' '}
                <code>/summary</code> and <code>/chat</code>.
              </li>
            </ul>
            <pre className="whitespace-pre-wrap [overflow-wrap:anywhere]">
              <code>
                <span className="text-ink-3">{'// server/controllers/authController.js\n'}</span>
                {'const isMatch = await bcrypt.compare(password, user.password);\n'}
                {"if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });\n\n"}
                {"const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });"}
              </code>
            </pre>
          </div>
        </div>
      </div>
      <figcaption className="mt-3 text-sm text-ink-3">RepoInsight answering a question about its own source.</figcaption>
    </figure>
  );
}
