function chunkText(text, chunkSize = 1000, overlap = 200) {
    if (!text || typeof text !== "string") {
        return [];
    }

    if (chunkSize <= 0 || overlap < 0 || overlap >= chunkSize) {
        throw new Error("Invalid chunk size or overlap.");
    }

    const chunks = [];
    let start = 0;

    while (start < text.length) {
        const end = Math.min(start + chunkSize, text.length);

        const chunk = text.slice(start, end).trim();

        if (chunk) {
            chunks.push(chunk);
        }

        if (end === text.length) {
            break;
        }

        start += chunkSize - overlap;
    }

    return chunks;
}

module.exports = chunkText;