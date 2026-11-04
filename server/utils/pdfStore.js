const DocumentChunk = require("../models/DocumentChunk");

async function saveDocument(documentId, chunks) {
    await DocumentChunk.deleteMany({ documentId });

    const documents = chunks.map((chunk, index) => ({
        documentId,
        chunkIndex: index,
        text: chunk.text,
        embedding: chunk.embedding
    }));

    return await DocumentChunk.insertMany(documents);
}

async function getDocument(documentId) {
    return await DocumentChunk.find({ documentId })
        .sort({ chunkIndex: 1 })
        .lean();
}

async function deleteDocument(documentId) {
    return await DocumentChunk.deleteMany({ documentId });
}

module.exports = {
    saveDocument,
    getDocument,
    deleteDocument
};