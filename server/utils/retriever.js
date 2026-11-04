const DocumentChunk = require("../models/DocumentChunk");
const { generateEmbedding } = require("./embedding");

async function retrieveRelevantChunks(question, documentId, topK = 3) {
    if (!question || !documentId) {
        return [];
    }

    // Generate embedding for the user's question
    const questionResult = await generateEmbedding(question);

    if (!questionResult.success) {
        throw new Error("Unable to generate question embedding.");
    }

    const questionEmbedding = questionResult.embedding;

    // Search MongoDB Atlas Vector Search
    const results = await DocumentChunk.aggregate([
        {
            $vectorSearch: {
                index: "vector_index",
                path: "embedding",
                queryVector: questionEmbedding,
                numCandidates: Math.max(topK * 10, 50),
                limit: topK,
                filter: {
                    documentId: {
                        $eq: documentId
                    }
                }
            }
        },
        {
            $project: {
                _id: 0,
                text: 1,
                score: {
                    $meta: "vectorSearchScore"
                }
            }
        }
    ]);

const MINIMUM_SCORE = 0.5;

return results
    .filter((item) => item.score >= MINIMUM_SCORE)
    .map((item) => item.text);
}

module.exports = retrieveRelevantChunks;