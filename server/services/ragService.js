import { fetchRepoTree, fetchFileContent } from './githubService.js';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';

// NEW: Import Gemini Embeddings and MongoDB Vector Store
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { MongoDBAtlasVectorSearch } from '@langchain/mongodb';
import mongoose from 'mongoose';

// Helper function to get the MongoDB collection
const getCollection = () => {
    // getClient() returns the native MongoClient which LangChain requires
    const client = mongoose.connection.getClient();
    return client.db("repoinsight").collection("code_chunks");
}

export const processRepository = async (repoUrl) => {
    try {
        console.log(`--- Starting RAG Processing for ${repoUrl} ---`);
        
        // 1. Call the Scout
        const repoData = await fetchRepoTree(repoUrl);
        const { owner, repo, branch, files } = repoData;

        // Processing all files in the repository
        const filesToProcess = files;
        
        let allChunks = [];

        // 2. Initialize the Text Splitter (The Chopper)
        const splitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1000,    
            chunkOverlap: 200,  
        });

        // 3. Call the Harvester & Chop the code
        for (const file of filesToProcess) {
            console.log(`Downloading: ${file.path}...`);
            const codeContent = await fetchFileContent(owner, repo, branch, file.path);
            
            if (codeContent) {
                const chunks = await splitter.createDocuments(
                    [codeContent], 
                    [{ source: file.path, repoUrl }] 
                );
                allChunks = allChunks.concat(chunks);
            }
        }

        console.log(`✅ Generated ${allChunks.length} total chunks. Starting Embedding Phase...`);

        // ==========================================
        // STEP 4: EMBEDDINGS & VECTOR STORAGE
        // ==========================================

        // 4a. Initialize Gemini (The Translator)
        // This converts English/Code into mathematical numbers (vectors)
        const embeddings = new GoogleGenerativeAIEmbeddings({
            apiKey: process.env.GEMINI_API_KEY,
            model: "gemini-embedding-001", // Standard Gemini embedding model
        });

        // 4b. Get the MongoDB Collection
        const collection = getCollection();
        
        console.log(`Uploading vectors to MongoDB Atlas...`);
        
        // 4c. The Magic Upload
        // This takes all our code chunks, sends them to Gemini to get the math vectors, 
        // and then saves the text + the math into MongoDB instantly.
        await MongoDBAtlasVectorSearch.fromDocuments(allChunks, embeddings, {
            collection: collection,
            indexName: "vector_index", // Important: We must create this exact index name in the Atlas UI later
            textKey: "text",
            embeddingKey: "embedding",
        });

        console.log(`🎉 Successfully uploaded ${allChunks.length} embedded chunks to MongoDB!`);
        return true;

    } catch (error) {
        console.error("Error in processRepository:", error);
        throw error;
    }
}
