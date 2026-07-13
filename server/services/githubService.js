export const fetchRepoTree = async (repoUrl) => {
    console.log(`Starting to fetch repository tree for: ${repoUrl}`);

    const urlParts = repoUrl.replace('https://github.com/', '').split('/');
    const owner = urlParts[0];
    const repo = urlParts[1];

    if (!owner || !repo) {
        throw new Error("Invalid GitHub URL provided.");
    }

    try {
        const headers = process.env.GITHUB_TOKEN 
            ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN.trim()}` } 
            : {};
            
        // 1. Fetch repo info to get default branch
        const repoInfoUrl = `https://api.github.com/repos/${owner}/${repo}`;
        const infoResponse = await fetch(repoInfoUrl, { headers });
        const infoData = await infoResponse.json();
        
        if (!infoResponse.ok) {
            throw new Error(infoData.message || 'Failed to fetch repository information.');
        }
        
        const branch = infoData.default_branch || 'main';

        // 2. Fetch tree
        const apiUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`;
        const response = await fetch(apiUrl, { headers });
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || `Failed to fetch repository tree for branch "${branch}".`);
        }

        const relevantFiles = data.tree.filter(item => {
            return item.type === 'blob' && 
                   !item.path.includes('node_modules/') && 
                   !item.path.includes('.git/') &&
                   !item.path.endsWith('.png') && 
                   !item.path.endsWith('.svg') && 
                   !item.path.endsWith('.lock');  
        });

        console.log(`Successfully found ${relevantFiles.length} relevant files to analyze.`);
        
        return { owner, repo, branch, files: relevantFiles }; 

    } catch (error) {
        console.error("Error in fetchRepoTree:", error);
        throw error;
    }
}


// NEW HARVESTER FUNCTION
export const fetchFileContent = async (owner, repo, branch, filePath) => {
    // We use raw.githubusercontent.com which gives us the raw text of the code directly.
    const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filePath}`;
    
    try {
        const headers = process.env.GITHUB_TOKEN 
            ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN.trim()}` } 
            : {};

        const response = await fetch(rawUrl, { headers });
        
        if (!response.ok) {
            console.warn(`Skipping file ${filePath}: Failed to fetch content.`);
            return null; // Return null if a file fails, so it doesn't crash the whole app
        }

        // Return the actual raw code as a giant string of text
        const codeText = await response.text();
        return codeText;

    } catch (error) {
        console.error(`Error fetching file content for ${filePath}:`, error);
        return null;
    }
}
