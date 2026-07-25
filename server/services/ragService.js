import { fetchRepoTree, fetchFileContent } from './githubService.js';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { normalizeRepoUrl } from '../utils/urlHelper.js';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { MongoDBAtlasVectorSearch } from '@langchain/mongodb';
import mongoose from 'mongoose';

const getCollection = () => {
    const client = mongoose.connection.getClient();
    return client.db("repoinsight").collection("code_chunks");
}

export const processRepository = async (rawRepoUrl) => {
    try {
        const repoUrl = normalizeRepoUrl(rawRepoUrl);
        console.log(`Processing repository for vector indexing: ${repoUrl}`);
        
        const repoData = await fetchRepoTree(repoUrl);
        const { owner, repo, branch, files } = repoData;

        const filesToProcess = files;
        let allChunks = [];

        const splitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1000,    
            chunkOverlap: 200,  
        });

        for (const file of filesToProcess) {
            const codeContent = await fetchFileContent(owner, repo, branch, file.path);
            
            if (codeContent) {
                const chunks = await splitter.createDocuments(
                    [codeContent], 
                    [{ source: file.path, repoUrl }] 
                );
                allChunks = allChunks.concat(chunks);
            }
        }

        console.log(`Generated ${allChunks.length} chunks for ${repoUrl}`);

        const collection = getCollection();

        try {
            await collection.deleteMany({
                $or: [
                    { repoUrl: repoUrl },
                    { "metadata.repoUrl": repoUrl }
                ]
            });
        } catch (delErr) {
            console.warn("Could not delete existing chunks prior to indexing:", delErr.message);
        }

        const embeddings = new GoogleGenerativeAIEmbeddings({
            apiKey: process.env.GEMINI_API_KEY,
            model: "gemini-embedding-001",
        });
        
        await MongoDBAtlasVectorSearch.fromDocuments(allChunks, embeddings, {
            collection: collection,
            indexName: "vector_index",
            textKey: "text",
            embeddingKey: "embedding",
        });

        console.log(`Successfully indexed ${allChunks.length} embedded chunks for ${repoUrl}`);
        return true;

    } catch (error) {
        console.error("Error in processRepository:", error);
        throw error;
    }
}


