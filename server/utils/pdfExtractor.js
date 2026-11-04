const fs = require("fs");
const { PDFParse } = require("pdf-parse");

async function extractPDFText(filePath) {
    let parser;

    try {
        const fileBuffer = fs.readFileSync(filePath);

        parser = new PDFParse({
            data: fileBuffer
        });

        const data = await parser.getText();

        return {
            success: true,
            text: data.text,
            pages: data.total
        };

    } catch (error) {
        console.error("PDF extraction error:", error);

        return {
            success: false,
            error: "Unable to extract PDF text."
        };

    } finally {
        if (parser) {
            await parser.destroy();
        }
    }
}

module.exports = extractPDFText;