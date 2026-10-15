import { StateGraph, END, START } from "@langchain/langgraph";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { createChatModel } from "../config/llm.js";
import { MongoDBAtlasVectorSearch } from "@langchain/mongodb";
import mongoose from 'mongoose';
import { tool } from "@langchain/core/tools";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { z } from "zod";
import { searchGithubIssues } from "./githubService.js";
import { normalizeRepoUrl, escapeRegExp } from "../utils/urlHelper.js";
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
    const repoPathPart = cleanRepoUrl.replace('https://github.com/', '');
    const vectorStore = getVectorStore();
    
    const matchesRepo = (d) => {
        const dUrl = normalizeRepoUrl(d.metadata?.repoUrl || d.repoUrl || '');
        if (!dUrl) return false;
        return dUrl === cleanRepoUrl || (repoPathPart && dUrl.includes(repoPathPart));
    };

    let docs = [];
    
    // 1. Try similarity search across vector store
    try {
        const rawDocs = await vectorStore.similaritySearch(activeQuery, 25);
        docs = rawDocs.filter(matchesRepo);
    } catch (err) {
        console.warn("Vector similarity search warning:", err.message);
    }

    // 2. Keyword / Regex Fallback in MongoDB for target repoUrl
    if (docs.length === 0 && cleanRepoUrl) {
        try {
            const client = mongoose.connection.getClient();
            const collection = client.db("repoinsight").collection("code_chunks");
            // Both patterns come from user input, so escape them before they reach $regex.
            const repoRegex = new RegExp(escapeRegExp(repoPathPart || cleanRepoUrl), "i");

            const keywords = activeQuery.split(/\s+/).filter(w => w.length > 2).slice(0, 20);
            const regexPattern = keywords.map(escapeRegExp).join("|");
            
            if (regexPattern) {
                const rawMongoDocs = await collection.find({
                    $and: [
                        { $or: [{ repoUrl: repoRegex }, { "metadata.repoUrl": repoRegex }] },
                        { text: { $regex: regexPattern, $options: "i" } }
                    ]
                }).limit(10).toArray();

                if (rawMongoDocs.length > 0) {
                    docs = rawMongoDocs.map(d => ({
                        pageContent: d.text,
                        metadata: { source: d.metadata?.source || d.source || "unknown", repoUrl: cleanRepoUrl }
                    }));
                }
            }

            // 3. Fallback to overview chunks of target repo
            if (docs.length === 0) {
                const overviewDocs = await collection.find({
                    $or: [{ repoUrl: repoRegex }, { "metadata.repoUrl": repoRegex }]
                }).limit(10).toArray();

                if (overviewDocs.length > 0) {
                    docs = overviewDocs.map(d => ({
                        pageContent: d.text,
                        metadata: { source: d.metadata?.source || d.source || "unknown", repoUrl: cleanRepoUrl }
                    }));
                }
            }

            // 4. Auto-indexing on-the-fly if repository context is completely missing from database
            if (docs.length === 0 && cleanRepoUrl.includes('github.com/')) {
                console.log(`Repository context missing for ${cleanRepoUrl}. Auto-indexing on-the-fly...`);
                const { processRepository } = await import('./ragService.js');
                await processRepository(cleanRepoUrl);

                const autoIndexedDocs = await collection.find({
                    $or: [{ repoUrl: repoRegex }, { "metadata.repoUrl": repoRegex }]
                }).limit(10).toArray();

                if (autoIndexedDocs.length > 0) {
                    docs = autoIndexedDocs.map(d => ({
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

// Keeps a single question inside Groq's free-tier token budget (8k tokens/minute for gpt-oss-120b).
const MAX_CONTEXT_CHUNKS = 12;
// Stops generate -> tools -> generate from looping if the model keeps asking for issue searches.
const MAX_TOOL_ROUNDS = 2;

// gpt-oss sometimes calls tools it was trained with but that we never declared
// (e.g. "repo_browser.print_tree"); Groq rejects those requests with tool_use_failed.
const isInvalidToolCall = (err) =>
    err?.error?.error?.code === 'tool_use_failed' || /tool_use_failed|tool call validation failed/i.test(err?.message || '');

// For a tool-less request, pass earlier issue-search results as plain text. Sending the raw
// tool-call history makes the model try to call tools again, which Groq rejects.
const toolResultsAsText = (messages = []) => {
    const results = messages
        .filter(m => m._getType?.() === 'tool')
        .map(m => (typeof m.content === 'string' ? m.content : JSON.stringify(m.content)))
        .filter(Boolean);
    return results.length > 0
        ? [new HumanMessage(`Results from the GitHub issue search you ran:\n\n${results.join('\n\n')}`)]
        : [];
};

const generateNode = async (state, config) => {
    const llm = createChatModel();
    const toolRounds = (state.messages || []).filter(m => m.tool_calls?.length > 0).length;

    const formattedContext = state.context.length > 0
        ? state.context.slice(0, MAX_CONTEXT_CHUNKS).map(doc => `File: ${doc.metadata?.source || 'Unknown'}\nCode:\n${doc.pageContent}`).join("\n\n")
        : "No code snippets were found for this repository.";

    const systemPrompt = `You are a Senior Software Engineer analyzing the GitHub repository "${state.repoUrl}".
Answer the user's question clearly, accurately, and in detail based on the provided code context.
Explain relevant architecture, API routes, database schemas, framework controllers, or configuration files found in the code context.

Rules:
1. Base your answer strictly on the provided codebase context.
2. Only when the user asks about GitHub issues, bug reports, feature requests or pull requests, call
   "github_issues_tool" directly. It searches issues, not code, so never use it to look for code.
   It is the only tool you have. Never call any other tool name.
3. NEVER tell the user to run internal functions or tool names like "github_issues_tool" in plain text.
4. Do NOT hallucinate frameworks (e.g. do not state it is Next.js unless Next.js files are in the context).

Code Context:
${formattedContext}`;

    const baseMessages = [new SystemMessage(systemPrompt), new HumanMessage(state.question)];

    const answerWithoutTools = async () => {
        const messages = [...baseMessages, ...toolResultsAsText(state.messages)];
        try {
            return await llm.invoke(messages, config);
        } catch (err) {
            if (!isInvalidToolCall(err)) throw err;
            return llm.invoke([...messages, new HumanMessage("No tools are available now. Answer directly in prose.")], config);
        }
    };

    let response;
    if (toolRounds < MAX_TOOL_ROUNDS) {
        try {
            response = await llm.bindTools(tools).invoke([...baseMessages, ...(state.messages || [])], config);
        } catch (err) {
            if (!isInvalidToolCall(err)) throw err;
            console.warn("Model called an undeclared tool; answering without tools instead.");
            response = await answerWithoutTools();
        }
    } else {
        response = await answerWithoutTools();
    }

    let answerText = "";
    if (typeof response.content === "string") {
        answerText = response.content;
    } else if (Array.isArray(response.content)) {
        answerText = response.content
            .map(c => (typeof c === "string" ? c : c.text || ""))
            .filter(Boolean)
            .join("\n");
    }

    const update = { messages: [response] };
    if (answerText.trim().length > 0) {
        update.answer = answerText;
    }
    
    return update;
};

const evaluateNode = async (state) => {
    if (state.answer && state.answer.trim().length > 30) {
        return { isGoodAnswer: true, loopCount: 1 };
    }

    const llm = createChatModel();

    const currentAnswer = state.answer || "I don't know based on the provided code or issues.";

    const prompt = `You are a strict QA Evaluator. 
The user asked: "${state.question}"
The Writer generated this answer: "${currentAnswer}"

Does this answer properly address the user's question? Or does it say "I don't know" / fail to provide a substantive answer?
If it's a good, helpful answer, reply exactly with: YES
If it's a bad answer or says it doesn't know, reply with NO, followed by a better, broader search query (keywords) to search the codebase.
Format: [YES/NO] | [New Search Keywords]`;

    try {
        const response = await llm.invoke(prompt);
        const output = (typeof response.content === 'string' ? response.content : '').trim();
        
        if (output.startsWith("YES")) {
            return { isGoodAnswer: true, loopCount: 1 };
        } else {
            const parts = output.split("|");
            const newQuery = parts.length > 1 ? parts[1].trim() : state.question;
            return { isGoodAnswer: false, loopCount: 1, searchQuery: newQuery };
        }
    } catch (err) {
        console.warn("Evaluator node error, accepting current answer:", err.message);
        return { isGoodAnswer: true, loopCount: 1 };
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
    
    let finalAnswer = finalState.answer;
    if (!finalAnswer && finalState.messages && finalState.messages.length > 0) {
        for (let i = finalState.messages.length - 1; i >= 0; i--) {
            const msg = finalState.messages[i];
            const content = typeof msg.content === 'string' 
                ? msg.content 
                : Array.isArray(msg.content) 
                    ? msg.content.map(c => c.text || '').join('\n') 
                    : '';
            if (content && content.trim()) {
                finalAnswer = content;
                break;
            }
        }
    }

    return finalAnswer || "I analyzed the repository context but could not format a response. Please try asking again.";
};


