// GitHub's own language colours (from linguist), so the bar looks like the one on a repo page.
const COLORS = {
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  Python: '#3572a5',
  Java: '#b07219',
  Go: '#00add8',
  Rust: '#dea584',
  Ruby: '#701516',
  PHP: '#4f5d95',
  'C#': '#178600',
  'C++': '#f34b7d',
  C: '#555555',
  Swift: '#f05138',
  Kotlin: '#a97bff',
  Dart: '#00b4ab',
  HTML: '#e34c26',
  CSS: '#663399',
  SCSS: '#c6538c',
  Vue: '#41b883',
  Svelte: '#ff3e00',
  Shell: '#89e051',
  Dockerfile: '#384d54',
  'Jupyter Notebook': '#da5b0b',
  MDX: '#fcb32c',
};

export const languageColor = (name) => COLORS[name] ?? '#8c959f';

// { JavaScript: 130147, CSS: 7740 } -> [{ name, percent, color }], largest first.
// Anything under 1% is folded into "Other", the way GitHub does it.
export function languageShares(bytesByLanguage = {}) {
  const entries = Object.entries(bytesByLanguage).filter(([, bytes]) => bytes > 0);
  const total = entries.reduce((sum, [, bytes]) => sum + bytes, 0);
  if (!total) return [];

  const shares = entries
    .map(([name, bytes]) => ({ name, percent: (bytes / total) * 100, color: languageColor(name) }))
    .sort((a, b) => b.percent - a.percent);

  const main = shares.filter((s) => s.percent >= 1);
  const other = shares.filter((s) => s.percent < 1).reduce((sum, s) => sum + s.percent, 0);
  return other > 0 ? [...main, { name: 'Other', percent: other, color: '#d1d9e0' }] : main;
}

// The dominant language's colour, for the dot next to a repo in the sidebar.
export const primaryLanguageColor = (bytesByLanguage) => languageShares(bytesByLanguage)[0]?.color;
