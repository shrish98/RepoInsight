import { normalizeRepoUrl } from '../utils/urlHelper.js';

// Safe GitHub fetch helper that retries without Authorization if token request fails (400, 401, 403)
const safeFetchGithub = async (url) => {
    const token = process.env.GITHUB_TOKEN?.trim();
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    let response = await fetch(url, { headers });

    // If request with GITHUB_TOKEN fails (e.g. 400 Bad Request, 401 Bad Credentials, 403 Rate Limit), retry unauthenticated
    if (!response.ok && headers.Authorization) {
        console.warn(`⚠️ GitHub request with token failed (${response.status}). Retrying unauthenticated for: ${url}`);
        response = await fetch(url, {});
    }

    return response;
};

export const fetchRepoTree = async (rawRepoUrl) => {
    const repoUrl = normalizeRepoUrl(rawRepoUrl);
    console.log(`Starting to fetch repository tree for: ${repoUrl}`);

    const urlParts = repoUrl.replace('https://github.com/', '').split('/');
    const owner = urlParts[0];
    const repo = urlParts[1];

    if (!owner || !repo) {
        throw new Error("Invalid GitHub URL provided.");
    }

    try {
        // 1. Fetch repo info to get default branch
        const repoInfoUrl = `https://api.github.com/repos/${owner}/${repo}`;
        const infoResponse = await safeFetchGithub(repoInfoUrl);
        const infoData = await infoResponse.json();
        
        if (!infoResponse.ok) {
            throw new Error(infoData.message || 'Failed to fetch repository information.');
        }
        
        const branch = infoData.default_branch || 'main';

        // 2. Fetch tree
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

        console.log(`Successfully found ${relevantFiles.length} relevant files to analyze.`);
        
        return { owner, repo, branch, files: relevantFiles, repoUrl }; 

    } catch (error) {
        console.error("Error in fetchRepoTree:", error);
        throw error;
    }
};

// HARVESTER FUNCTION: Fetch raw code content
export const fetchFileContent = async (owner, repo, branch, filePath) => {
    const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filePath}`;
    
    try {
        const response = await safeFetchGithub(rawUrl);
        
        if (!response.ok) {
            console.warn(`Skipping file ${filePath}: Failed to fetch content.`);
            return null;
        }

        const codeText = await response.text();
        return codeText;

    } catch (error) {
        console.error(`Error fetching file content for ${filePath}:`, error);
        return null;
    }
};

// TOOL FUNCTION: Search GitHub Issues and PRs
export const searchGithubIssues = async (rawRepoUrl, query) => {
    const repoUrl = normalizeRepoUrl(rawRepoUrl);
    console.log(`Searching GitHub issues for: ${query} on ${repoUrl}`);
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

        if (data.items.length === 0) {
            return "No related issues or pull requests found on GitHub.";
        }

        const results = data.items.map(item => (
            `Title: ${item.title}\nState: ${item.state}\nURL: ${item.html_url}\nSnippet: ${item.body ? item.body.substring(0, 150) + '...' : 'No description.'}`
        )).join('\n\n');

        return results;

    } catch (error) {
        console.error("Error searching GitHub issues:", error);
        return "An error occurred while searching GitHub issues.";
    }
};
