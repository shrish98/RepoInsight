// "https://github.com/owner/repo/tree/main" -> "owner/repo"
export const repoName = (url = '') =>
  url
    .replace(/^https?:\/\/(www\.)?github\.com\//, '')
    .split('/')
    .slice(0, 2)
    .join('/')
    .replace(/\.git$/, '');
