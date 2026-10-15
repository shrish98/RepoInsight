// A GitHub repository URL: host, owner and repo, optionally followed by a path like /tree/main.
const GITHUB_REPO_URL = /^https?:\/\/(www\.)?github\.com\/[^/\s?#]+\/[^/\s?#]+/;

// Returns '' for anything that isn't a GitHub repository URL, so callers can reject it with a 400.
export const normalizeRepoUrl = (url) => {
    if (!url || typeof url !== 'string') return '';
    let clean = url.trim();
    clean = clean.replace(/\/+$/, '');
    clean = clean.replace(/\.git$/i, '');

    if (clean.startsWith('git@github.com:')) {
        clean = clean.replace('git@github.com:', 'https://github.com/');
    }

    if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
        clean = 'https://' + clean;
    }

    clean = clean.toLowerCase();
    return GITHUB_REPO_URL.test(clean) ? clean : '';
};

// User input ends up inside MongoDB $regex queries; escape it so it's matched literally.
export const escapeRegExp = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
