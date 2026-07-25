import { normalizeRepoUrl } from '../utils/urlHelper.js';

const safeFetchGithub = async (url) => {
    const token = process.env.GITHUB_TOKEN?.trim();
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    let response = await fetch(url, { headers });

    if (!response.ok && headers.Authorization) {
        console.warn(`GitHub request with token failed (${response.status}). Retrying unauthenticated for: ${url}`);
        response = await fetch(url, {});
    }

    return response;
};

export const fetchRepoTree = async (rawRepoUrl) => {
    const repoUrl = normalizeRepoUrl(rawRepoUrl);

    const urlParts = repoUrl.replace('https://github.com/', '').split('/');
    const owner = urlParts[0];
    const repo = urlParts[1];

    if (!owner || !repo) {
        throw new Error("Invalid GitHub URL provided.");
    }

    try {
        const repoInfoUrl = `https://api.github.com/repos/${owner}/${repo}`;
        const infoResponse = await safeFetchGithub(repoInfoUrl);
        const infoData = await infoResponse.json();
        
        if (!infoResponse.ok) {
            throw new Error(infoData.message || 'Failed to fetch repository information.');
        }
        
        const branch = infoData.default_branch || 'main';

        const apiUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`;
        const response = await safeFetchGithub(apiUrl);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || `Failed to fetch repository tree for branch "${branch}".`);
        }

        const ignoredExtensions = [
            '.png', '.jpg', '.jpeg', '.gif', '.ico', '.svg', '.webp',
            '.woff', '.woff2', '.eot', '.ttf', '.otf',
            '.pdf', '.zip', '.tar', '.gz', '.7z',
            '.mp3', '.mp4', '.avi', '.mov',
            '.lock', 'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml'
        ];

        const ignoredDirs = ['node_modules/', '.git/', '.next/', 'dist/', 'build/', 'coverage/'];

        const relevantFiles = data.tree.filter(item => {
            if (item.type !== 'blob') return false;
            const lowerPath = item.path.toLowerCase();
            if (ignoredDirs.some(dir => lowerPath.includes(dir))) return false;
            if (ignoredExtensions.some(ext => lowerPath.endsWith(ext))) return false;
            return true;
        });

        return { owner, repo, branch, files: relevantFiles, repoUrl }; 

    } catch (error) {
        console.error("Error in fetchRepoTree:", error);
        throw error;
    }
};

export const fetchFileContent = async (owner, repo, branch, filePath) => {
    const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filePath}`;
    
    try {
        const response = await safeFetchGithub(rawUrl);
        
        if (!response.ok) {
            return null;
        }

        const codeText = await response.text();
        return codeText;

    } catch (error) {
        console.error(`Error fetching file content for ${filePath}:`, error);
        return null;
    }
};

export const searchGithubIssues = async (rawRepoUrl, query) => {
    const repoUrl = normalizeRepoUrl(rawRepoUrl);
    const urlParts = repoUrl.replace('https://github.com/', '').split('/');
    const owner = urlParts[0];
    const repo = urlParts[1];

    if (!owner || !repo) {
        return "Invalid GitHub URL provided.";
    }

    try {
        const searchUrl = `https://api.github.com/search/issues?q=repo:${owner}/${repo}+${encodeURIComponent(query)}&per_page=5`;
        const response = await safeFetchGithub(searchUrl);
        const data = await response.json();

        if (!response.ok) {
            return `Failed to search GitHub issues: ${data.message}`;
        }

        if (!data.items || data.items.length === 0) {
            return `No open/closed GitHub issues or pull requests found for query "${query}".`;
        }

        const issuesList = data.items.map(issue => 
            `- [${issue.html_url.includes('/pull/') ? 'PR' : 'Issue'} #${issue.number}] ${issue.title} (${issue.state}): ${issue.html_url}`
        ).join("\n");

        return `Found the following relevant GitHub issues/PRs:\n${issuesList}`;

    } catch (error) {
        console.error("Error in searchGithubIssues tool:", error);
        return `Error searching GitHub issues: ${error.message}`;
    }
};
