import { StateGraph, END, START } from "@langchain/langgraph";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { ChatGroq } from "@langchain/groq";
import { MongoDBAtlasVectorSearch } from "@langchain/mongodb";
import mongoose from 'mongoose';
import { tool } from "@langchain/core/tools";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { z } from "zod";
import { searchGithubIssues } from "./githubService.js";
import { normalizeRepoUrl } from "../utils/urlHelper.js";
import { ToolNode } from "@langchain/langgraph/prebuilt";

const githubIssuesTool = tool(async ({ query }, config) => {
    const repoUrl = config?.configurable?.repoUrl;
    if (!repoUrl) {
        return "No repository URL was provided to the tool.";
    }
    return await searchGithubIssues(repoUrl, query);
}, {
    name: "github_issues_tool",
    description: "Search for open and closed GitHub issues and pull requests by keywords. Use this if the user asks about bugs, features, PRs, or issues.",
    schema: z.object({
        query: z.string().describe("The search query keywords to find issues (e.g. 'authentication', 'bug')."),
    }),
});

const tools = [githubIssuesTool];
const toolNode = new ToolNode(tools);

const agentState = {
    question: { value: (x, y) => y ? y : x, default: () => "" },
    searchQuery: { value: (x, y) => y ? y : x, default: () => "" },
    repoUrl: { value: (x, y) => y ? y : x, default: () => "" },
    context: { value: (x, y) => y ? y : x, default: () => [] },
    answer: { value: (x, y) => y ? y : x, default: () => "" },
    isGoodAnswer: { value: (x, y) => y !== undefined ? y : x, default: () => false },
    loopCount: { value: (x, y) => x + (y || 0), default: () => 0 },
    messages: { value: (x, y) => x.concat(y), default: () => [] } 
};

const getVectorStore = () => {
    const client = mongoose.connection.getClient();
    const collection = client.db("repoinsight").collection("code_chunks");
    const embeddings = new GoogleGenerativeAIEmbeddings({
        apiKey: process.env.GEMINI_API_KEY,
        model: "gemini-embedding-001",
    });
    return new MongoDBAtlasVectorSearch(embeddings, {
        collection: collection,
        indexName: "vector_index",
        textKey: "text",
        embeddingKey: "embedding",
    });
};

const retrieveNode = async (state) => {
    const activeQuery = state.searchQuery || state.question;
    const cleanRepoUrl = normalizeRepoUrl(state.repoUrl);
    const vectorStore = getVectorStore();
    
    let docs = [];
    
    try {
        const filter = cleanRepoUrl ? { preFilter: { repoUrl: { $eq: cleanRepoUrl } } } : undefined;
        docs = await vectorStore.similaritySearch(activeQuery, 10, filter);
    } catch (err) {
        console.warn("Vector search with preFilter failed or unindexed:", err.message);
    }

    if (cleanRepoUrl && docs.length > 0) {
        const matching = docs.filter(d => (d.metadata?.repoUrl === cleanRepoUrl || d.repoUrl === cleanRepoUrl));
        if (matching.length > 0) docs = matching;
    }

    if (docs.length === 0) {
        try {
            const allDocs = await vectorStore.similaritySearch(activeQuery, 50);
            if (cleanRepoUrl) {
                const matchedDocs = allDocs.filter(doc => (doc.metadata?.repoUrl === cleanRepoUrl || doc.repoUrl === cleanRepoUrl));
                docs = matchedDocs.length > 0 ? matchedDocs : allDocs.slice(0, 5);
            } else {
                docs = allDocs.slice(0, 5);
            }
        } catch (fallbackErr) {
            console.error("Fallback vector search failed:", fallbackErr.message);
        }
    }

    if (docs.length === 0 && cleanRepoUrl) {
        try {
            const client = mongoose.connection.getClient();
            const collection = client.db("repoinsight").collection("code_chunks");
            
            const keywords = activeQuery.split(/\s+/).filter(w => w.length > 2);
            const regexPattern = keywords.join("|");
            
            if (regexPattern) {
                const rawMongoDocs = await collection.find({
                    $and: [
                        { $or: [{ repoUrl: cleanRepoUrl }, { "metadata.repoUrl": cleanRepoUrl }] },
                        { text: { $regex: regexPattern, $options: "i" } }
                    ]
                }).limit(5).toArray();

                if (rawMongoDocs.length > 0) {
                    docs = rawMongoDocs.map(d => ({
                        pageContent: d.text,
                        metadata: { source: d.metadata?.source || d.source || "unknown", repoUrl: cleanRepoUrl }
                    }));
                }
            }
        } catch (mongoErr) {
            console.error("Direct MongoDB fallback search failed:", mongoErr.message);
        }
    }

    return { context: docs };
};

const generateNode = async (state, config) => {
    const llm = new ChatGroq({ apiKey: process.env.GROQ_API_KEY, model: "llama-3.3-70b-versatile", temperature: 0 });
    
    const llmWithTools = llm.bindTools(tools);

    const formattedContext = state.context.map(doc => 
        `File: ${doc.metadata?.source || 'Unknown'}\nCode:\n${doc.pageContent}`
    ).join("\n\n");

    const systemPrompt = `You are a Senior Software Engineer analyzing a GitHub repository.
Use the following pieces of retrieved code context from the repository to answer the user's question clearly, accurately, and in detail.
Explain relevant architecture, component functions, API routes, or configuration where applicable.
If the answer is not fully present in the code context, you can use the github_issues_tool to search the repository's open/closed issues and pull requests.
If no relevant implementation exists in the codebase or issues, state clearly what was analyzed and that no matching implementation was found.

Code Context:
${formattedContext}`;

    const llmMessages = [
        new SystemMessage(systemPrompt),
        new HumanMessage(state.question),
        ...(state.messages || [])
    ];

    const response = await llmWithTools.invoke(llmMessages, config);
    
    const update = { messages: [response] };
    if (typeof response.content === "string" && response.content.trim().length > 0) {
        update.answer = response.content;
    }
    
    return update;
};

const evaluateNode = async (state) => {
    const llm = new ChatGroq({ apiKey: process.env.GROQ_API_KEY, model: "llama-3.3-70b-versatile", temperature: 0 });

    const currentAnswer = state.answer || "I don't know based on the provided code or issues.";

    const prompt = `You are a strict QA Evaluator. 
The user asked: "${state.question}"
The Writer generated this answer: "${currentAnswer}"

Does this answer properly address the user's question? Or does it say "I don't know" / fail to provide a substantive answer?
If it's a good, helpful answer, reply exactly with: YES
If it's a bad answer or says it doesn't know, reply with NO, followed by a better, broader search query (keywords) to search the codebase.
Format: [YES/NO] | [New Search Keywords]`;

    const response = await llm.invoke(prompt);
    const output = response.content.trim();
    
    if (output.startsWith("YES")) {
        return { isGoodAnswer: true, loopCount: 1 };
    } else {
        const parts = output.split("|");
        const newQuery = parts.length > 1 ? parts[1].trim() : state.question;
        return { isGoodAnswer: false, loopCount: 1, searchQuery: newQuery };
    }
};

const routeAfterGenerate = (state) => {
    const lastMessage = state.messages[state.messages.length - 1];
    
    if (lastMessage && lastMessage.tool_calls && lastMessage.tool_calls.length > 0) {
        return "tools";
    }
    
    return "evaluate";
};

const shouldContinue = (state) => {
    if (state.isGoodAnswer || state.loopCount >= 2) {
        return "end";
    } else {
        return "retrieve";
    }
};

export const runAgent = async (userQuestion, rawRepoUrl) => {
    const repoUrl = normalizeRepoUrl(rawRepoUrl);
    const workflow = new StateGraph({ channels: agentState })
        .addNode("retrieve", retrieveNode)
        .addNode("generate", generateNode)
        .addNode("tools", toolNode)
        .addNode("evaluate", evaluateNode)
        .addEdge(START, "retrieve")
        .addEdge("retrieve", "generate")
        .addConditionalEdges("generate", routeAfterGenerate, {
            "tools": "tools",
            "evaluate": "evaluate"
        })
        .addEdge("tools", "generate")
        .addConditionalEdges("evaluate", shouldContinue, {
            "retrieve": "retrieve",
            "end": END
        });

    const app = workflow.compile();
    const finalState = await app.invoke({ 
        question: userQuestion,
        searchQuery: userQuestion,
        repoUrl: repoUrl, 
        loopCount: 0, 
        isGoodAnswer: false, 
        messages: [] 
    }, {
        configurable: { repoUrl }
    });
    
    return finalState.answer;
};

