import { StateGraph, END, START } from "@langchain/langgraph";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { ChatGroq } from "@langchain/groq";
import { MongoDBAtlasVectorSearch } from "@langchain/mongodb";
import mongoose from 'mongoose';

// 1. Define the State (The Agent's Memory)
const agentState = {
    question: { value: (x, y) => y ? y : x, default: () => "" },
    repoUrl: { value: (x, y) => y ? y : x, default: () => "" },
    context: { value: (x, y) => y ? y : x, default: () => [] },
    answer: { value: (x, y) => y ? y : x, default: () => "" },
    isGoodAnswer: { value: (x, y) => y !== undefined ? y : x, default: () => false },
    loopCount: { value: (x, y) => x + (y || 0), default: () => 0 }
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

const generateNode = async (state) => {
    console.log("--- AGENT: Generating Answer with Groq ---");
    const llm = new ChatGroq({ apiKey: process.env.GROQ_API_KEY, model: "llama-3.3-70b-versatile", temperature: 0 });

    const formattedContext = state.context.map(doc => 
        `File: ${doc.metadata.source}\nCode:\n${doc.pageContent}`
    ).join("\n\n");

    const prompt = `You are a Senior Software Engineer analyzing a GitHub repository.
Use the following pieces of retrieved code context to answer the user's question.
If the answer is not in the context, just say "I don't know based on the provided code." Do not guess.

Question: ${state.question}

Code Context:
${formattedContext}

Answer:`;

    const response = await llm.invoke(prompt);
    return { answer: response.content };
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
        .addNode("evaluate", evaluateNode)
        .addEdge(START, "retrieve")
        .addEdge("retrieve", "generate")
        .addEdge("generate", "evaluate")
        .addConditionalEdges("evaluate", shouldContinue, {
            "retrieve": "retrieve",
            "end": END
        });

    const app = workflow.compile();
    const finalState = await app.invoke({ question: userQuestion, repoUrl: repoUrl, loopCount: 0, isGoodAnswer: false });
    
    return finalState.answer;
};
