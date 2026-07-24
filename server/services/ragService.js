import { fetchRepoTree, fetchFileContent } from './githubService.js';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { normalizeRepoUrl } from '../utils/urlHelper.js';

// NEW: Import Gemini Embeddings and MongoDB Vector Store
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { MongoDBAtlasVectorSearch } from '@langchain/mongodb';
import mongoose from 'mongoose';

// Helper function to get the MongoDB collection
const getCollection = () => {
    const client = mongoose.connection.getClient();
    return client.db("repoinsight").collection("code_chunks");
}

export const processRepository = async (rawRepoUrl) => {
    try {
        const repoUrl = normalizeRepoUrl(rawRepoUrl);
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

        const collection = getCollection();

        // 4a. Clear old chunks for this repository to prevent duplicates
        try {
            const deleteResult = await collection.deleteMany({
                $or: [
                    { repoUrl: repoUrl },
                    { "metadata.repoUrl": repoUrl }
                ]
            });
            console.log(`Cleared ${deleteResult.deletedCount} existing chunks for ${repoUrl}`);
        } catch (delErr) {
            console.warn("Could not delete existing chunks prior to indexing:", delErr.message);
        }

        // 4b. Initialize Gemini (The Translator)
        const embeddings = new GoogleGenerativeAIEmbeddings({
            apiKey: process.env.GEMINI_API_KEY,
            model: "gemini-embedding-001",
        });
        
        console.log(`Uploading vectors to MongoDB Atlas...`);
        
        // 4c. The Magic Upload
        await MongoDBAtlasVectorSearch.fromDocuments(allChunks, embeddings, {
            collection: collection,
            indexName: "vector_index",
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

