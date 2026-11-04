function cosineSimilarity(vectorA, vectorB) {
    if (
        !Array.isArray(vectorA) ||
        !Array.isArray(vectorB) ||
        vectorA.length === 0 ||
        vectorA.length !== vectorB.length
    ) {
        throw new Error("Invalid vectors.");
    }

    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;

    for (let i = 0; i < vectorA.length; i++) {
        dotProduct += vectorA[i] * vectorB[i];

        magnitudeA += vectorA[i] * vectorA[i];
        magnitudeB += vectorB[i] * vectorB[i];
    }

    if (magnitudeA === 0 || magnitudeB === 0) {
        throw new Error("Cannot compare zero vectors.");
    }

    return dotProduct / (
        Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB)
    );
}

module.exports = cosineSimilarity;