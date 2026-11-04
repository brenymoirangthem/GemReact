const mongoose = require("mongoose");

const documentChunkSchema = new mongoose.Schema(
    {
        documentId: {
            type: String,
            required: true,
            index: true
        },

        chunkIndex: {
            type: Number,
            required: true
        },

        text: {
            type: String,
            required: true
        },

        embedding: {
            type: [Number],
            required: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "DocumentChunk",
    documentChunkSchema
);