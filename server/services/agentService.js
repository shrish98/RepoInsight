import { StateGraph, END, START } from "@langchain/langgraph";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { ChatGroq } from "@langchain/groq";
import { MongoDBAtlasVectorSearch } from "@langchain/mongodb";
import mongoose from 'mongoose';
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { searchGithubIssues } from "./githubService.js";
import { ToolNode } from "@langchain/langgraph/prebuilt";

// 1. Define Tools
const githubIssuesTool = tool(async ({ query }, config, { configurable }) => {
    return await searchGithubIssues(configurable.repoUrl, query);
}, {
    name: "github_issues_tool",
    description: "Search for open and closed GitHub issues and pull requests by keywords. Use this if the user asks about bugs, features, PRs, or issues.",
    schema: z.object({
        query: z.string().describe("The search query keywords to find issues (e.g. 'authentication', 'bug')."),
    }),
});

const tools = [githubIssuesTool];
const toolNode = new ToolNode(tools);

// 2. Define the State (The Agent's Memory)
const agentState = {
    question: { value: (x, y) => y ? y : x, default: () => "" },
    repoUrl: { value: (x, y) => y ? y : x, default: () => "" },
    context: { value: (x, y) => y ? y : x, default: () => [] },
    answer: { value: (x, y) => y ? y : x, default: () => "" },
    isGoodAnswer: { value: (x, y) => y !== undefined ? y : x, default: () => false },
    loopCount: { value: (x, y) => x + (y || 0), default: () => 0 },
    // Track tool calls and responses
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
    console.log(`--- AGENT: Retrieving Context for query: "${state.question}" on repo: ${state.repoUrl} ---`);
    const vectorStore = getVectorStore();
    
    // Filter by repoUrl to prevent fetching chunks from other repositories
    const filter = state.repoUrl ? { preFilter: { repoUrl: { $eq: state.repoUrl } } } : undefined;
    const docs = await vectorStore.similaritySearch(state.question, 5, filter); 
    return { context: docs };
};

const generateNode = async (state, config) => {
    console.log("--- AGENT: Generating Answer with Groq (Tools Enabled) ---");
    const llm = new ChatGroq({ apiKey: process.env.GROQ_API_KEY, model: "llama-3.3-70b-versatile", temperature: 0 });
    
    // Bind the tools to our LLM
    const llmWithTools = llm.bindTools(tools);

    const formattedContext = state.context.map(doc => 
        `File: ${doc.metadata.source}\nCode:\n${doc.pageContent}`
    ).join("\n\n");

    const systemPrompt = `You are a Senior Software Engineer analyzing a GitHub repository.
Use the following pieces of retrieved code context to answer the user's question.
If the answer is not in the code context, you can use the github_issues_tool to search the live repository for open/closed issues and pull requests.
If you still don't know, just say "I don't know based on the provided code or issues." Do not guess.

Code Context:
${formattedContext}`;

    // Build the conversational payload
    let llmMessages = [
        ["system", systemPrompt],
        ["human", state.question]
    ];
    
    if (state.messages && state.messages.length > 0) {
        llmMessages = llmMessages.concat(state.messages);
    }

    const response = await llmWithTools.invoke(llmMessages, config);
    
    // Check if the LLM output a final answer (text) rather than calling a tool
    const textAnswer = response.content ? response.content : "Used a tool...";
    
    return { messages: [response], answer: textAnswer };
};

const evaluateNode = async (state) => {
    console.log("--- AGENT: Evaluator checking the answer with Groq ---");
    const llm = new ChatGroq({ apiKey: process.env.GROQ_API_KEY, model: "llama-3.3-70b-versatile", temperature: 0 });

    const prompt = `You are a strict QA Evaluator. 
The user asked: "${state.question}"
The Writer generated this answer: "${state.answer}"

Does this answer properly address the user's question? Or does it say "I don't know"?
If it's a good answer, reply exactly with: YES
If it's a bad answer or says it doesn't know, reply with NO, followed by a better, broader search query to help find the right code.
Format: [YES/NO] | [New Search Query]`;

    const response = await llm.invoke(prompt);
    const output = response.content.trim();
    
    if (output.startsWith("YES")) {
        console.log(`--- EVALUATOR DECISION: APPROVED ✅ ---`);
        return { isGoodAnswer: true, loopCount: 1 };
    } else {
        const parts = output.split("|");
        const newQuery = parts.length > 1 ? parts[1].trim() : state.question;
        console.log(`--- EVALUATOR DECISION: REJECTED ❌. Rewriting query to: "${newQuery}" ---`);
        return { isGoodAnswer: false, loopCount: 1, question: newQuery };
    }
};

// Route condition after generate
const routeAfterGenerate = (state) => {
    const lastMessage = state.messages[state.messages.length - 1];
    
    // If the LLM returned tool calls, go to the tool execution node
    if (lastMessage && lastMessage.tool_calls && lastMessage.tool_calls.length > 0) {
        console.log("--- ROUTING: Tool Call Detected -> Routing to Tools ---");
        return "tools";
    }
    
    console.log("--- ROUTING: No Tools -> Routing to Evaluator ---");
    return "evaluate";
};

const shouldContinue = (state) => {
    if (state.isGoodAnswer || state.loopCount >= 2) {
        console.log("--- ROUTING: Ending Workflow ---");
        return "end";
    } else {
        console.log("--- ROUTING: Looping back to Researcher! ---");
        return "retrieve";
    }
}

export const runAgent = async (userQuestion, repoUrl) => {
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
        .addEdge("tools", "generate") // Loop back to generate after tool execution
        .addConditionalEdges("evaluate", shouldContinue, {
            "retrieve": "retrieve",
            "end": END
        });

    const app = workflow.compile();
    const finalState = await app.invoke({ 
        question: userQuestion, 
        repoUrl: repoUrl, 
        loopCount: 0, 
        isGoodAnswer: false, 
        messages: [] 
    }, {
        configurable: { repoUrl }
    });
    
    return finalState.answer;
};
