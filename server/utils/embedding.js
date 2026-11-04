let extractor = null;

async function getExtractor() {
    if (!extractor) {
        const { pipeline } = await import("@huggingface/transformers");

        extractor = await pipeline(
            "feature-extraction",
            "Xenova/all-MiniLM-L6-v2"
        );
    }

    return extractor;
}

async function generateEmbedding(text) {
    try {
        const model = await getExtractor();

        const output = await model(text, {
            pooling: "mean",
            normalize: true
        });

        return {
            success: true,
            embedding: Array.from(output.data)
        };

    } catch (error) {
        console.error("Embedding generation error:", error);

        return {
            success: false,
            error: "Unable to generate embedding."
        };
    }
}

module.exports = {
    generateEmbedding
};