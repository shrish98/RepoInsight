// "https://github.com/owner/repo/tree/main" -> "owner/repo"
export const repoName = (url = '') =>
  url
    .replace(/^https?:\/\/(www\.)?github\.com\//, '')
    .split('/')
    .slice(0, 2)
    .join('/')
    .replace(/\.git$/, '');

// "server/lib/queue.js", "auth.js:42", "Dockerfile": inline code that names a file.
// The extension list keeps things like `resend.emails.send` from counting as files.
export const FILE_REF =
  /^(?:[\w@.-]+\/)*[\w.-]*\.(?:[cm]?[jt]sx?|json|py|go|rs|java|kt|rb|php|cs|c|cpp|h|swift|vue|svelte|css|scss|html|md|mdx|ya?ml|toml|env|sh|sql|prisma|graphql|gql|xml|ini|txt|lock)(?:[:#]L?\d+(?:-L?\d+)?)?$|^(?:[\w@.-]+\/)*(?:Dockerfile|Makefile|Procfile)$/i;

// Link to a file on GitHub, with its line range if the reference has one ("a/b.js:12-14").
// Only paths with a folder are linked: a bare "auth.js" could live anywhere in the repo.
export function githubFileUrl(repoUrl, ref) {
  const name = repoName(repoUrl);
  const match = ref.trim().match(/^(.+?)(?:[:#]L?(\d+)(?:-L?(\d+))?)?$/);
  if (!name || !match || !match[1].includes('/')) return null;
  const [, path, start, end] = match;
  const lines = start ? `#L${start}${end ? `-L${end}` : ''}` : '';
  return `https://github.com/${name}/blob/HEAD/${path.replace(/^\.?\//, '')}${lines}`;
}
