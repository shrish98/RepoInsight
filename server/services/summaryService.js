import { ChatGroq } from '@langchain/groq';
import { fetchRepoTree, fetchFileContent } from './githubService.js';
import { RepoSummary } from '../models/RepoSummary.js';
import { normalizeRepoUrl } from '../utils/urlHelper.js';

export const getOrGenerateSummary = async (rawRepoUrl) => {
    const repoUrl = normalizeRepoUrl(rawRepoUrl);
    if (!repoUrl) return null;

    try {
        let existingSummary = await RepoSummary.findOne({ repoUrl });
        if (existingSummary && existingSummary.techStack && existingSummary.techStack.length > 0) {
            return existingSummary;
        }

        const repoData = await fetchRepoTree(repoUrl);
        const { owner, repo, branch, files } = repoData;

        const filePaths = files.map(f => f.path);
        
        let packageJsonText = '';
        const pkgFile = files.find(f => f.path === 'package.json' || f.path.endsWith('/package.json'));
        if (pkgFile) {
            packageJsonText = await fetchFileContent(owner, repo, branch, pkgFile.path) || '';
        }

        const llm = new ChatGroq({
            apiKey: process.env.GROQ_API_KEY,
            model: 'llama-3.3-70b-versatile',
            temperature: 0.1
        });

        const prompt = `You are a Principal Software Architect analyzing a GitHub repository.
Repository: ${repoUrl}
Sample File Tree Structure (${filePaths.length} files total):
${filePaths.slice(0, 80).join('\n')}

package.json / Config snippet:
${packageJsonText.substring(0, 1500)}

Generate a clean JSON summary object with the following fields:
- overview: A concise 2-3 sentence overview of what this application does.
- techStack: Array of 4-8 detected technologies/frameworks (e.g. ["Next.js", "React", "Supabase", "Tailwind CSS", "Docker", "Node.js"]).
- entryPoints: Array of 3-5 key entry point files (e.g. ["app/page.jsx", "server/index.js", "components/AuthModal.jsx"]).
- architectureDiagram: A valid, dark-mode friendly Mermaid.js flowchart code block starting with "graph TD".
CRITICAL MERMAID SYNTAX RULES:
1. Every node MUST have quoted text inside brackets: NodeA["Label Name"] --> NodeB["Another Label"].
2. Do NOT put unquoted parentheses (), slashes /, or brackets [] inside node labels.
3. Do NOT use subgraphs. Keep it a clean, linear 4 to 8 node flowchart.
- suggestedQuestions: Array of 4 repository-specific questions a developer would ask (e.g. ["Explain authentication flow", "How are cron jobs executed?", "List main API endpoints", "What database tables are used?"]).

Output ONLY raw valid JSON without markdown wrapping or code blocks.`;

        const response = await llm.invoke(prompt);
        let rawText = response.content.trim();
        
        if (rawText.startsWith('```')) {
            rawText = rawText.replace(/^```json/i, '').replace(/^```/, '').replace(/```$/, '').trim();
        }

        let parsedData = {};
        try {
            parsedData = JSON.parse(rawText);
        } catch (jsonErr) {
            console.warn("Failed to parse JSON response for summary, using defaults.");
            parsedData = {
                overview: `A repository containing ${filePaths.length} files analyzed by RepoInsight.`,
                techStack: ["JavaScript", "Node.js"],
                entryPoints: filePaths.slice(0, 3),
                architectureDiagram: `graph TD\n  Client["Frontend Client"] --> API["API / Backend Services"]\n  API --> DB[("Database")]`,
                suggestedQuestions: [
                    "Explain the architecture",
                    "What are the main entry points?",
                    "How to set up this repository?"
                ]
            };
        }

        if (parsedData.architectureDiagram) {
            parsedData.architectureDiagram = parsedData.architectureDiagram
                .replace(/^```mermaid/i, '')
                .replace(/^```/g, '')
                .replace(/```$/g, '')
                .trim();
        }

        const summaryDoc = await RepoSummary.findOneAndUpdate(
            { repoUrl },
            {
                repoUrl,
                overview: parsedData.overview || '',
                techStack: parsedData.techStack || [],
                entryPoints: parsedData.entryPoints || [],
                architectureDiagram: parsedData.architectureDiagram || '',
                suggestedQuestions: parsedData.suggestedQuestions || []
            },
            { upsert: true, new: true }
        );

        return summaryDoc;
    } catch (error) {
        console.error("Error generating repo summary:", error);
        return null;
    }
};

