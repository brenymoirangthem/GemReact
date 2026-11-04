const { GoogleGenAI } = require("@google/genai");
require("dotenv").config();

let ai;

function getAIClient() {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is missing from .env");
    }

    if (!ai) {
        ai = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY,
        });
    }

    return ai;
}

// Generate mock response
async function generateMockResponse(contents) {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const prompt = typeof contents === "string"
        ? contents
        : JSON.stringify(contents);

    return `🤖 [MOCK AI MODE]

Hello! I'm GemReact's development assistant.

I received your message successfully.

Your message:
${prompt.slice(-300)}

This is a simulated response. Gemini API is disabled in mock mode.`;
}

// Normal AI response
async function generateResponse(contents, options = {}) {
    try {
        if (process.env.MOCK_AI === "true") {
            return await generateMockResponse(contents);
        }

        const client = getAIClient();

        const config = {
            temperature: options.temperature ?? 0.7,
            topP: options.topP ?? 0.95,
            maxOutputTokens: options.maxOutputTokens ?? 2048,
        };

        if (options.systemInstruction) {
            config.systemInstruction = options.systemInstruction;
        }

        const response = await client.models.generateContent({
            model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
            contents,
            config,
        });

        return response.text;

    } catch (error) {
        console.error("AI Service Error:", error.message);
        throw error;
    }
}

// Mock streaming response
async function* generateMockStream(contents) {
    const response = await generateMockResponse(contents);

    const words = response.split(" ");

    for (const word of words) {
        await new Promise(resolve => setTimeout(resolve, 40));
        yield word + " ";
    }
}

// Real Gemini streaming response
async function* generateGeminiStream(contents, options = {}) {
    const client = getAIClient();

    const config = {
        temperature: options.temperature ?? 0.7,
        topP: options.topP ?? 0.95,
        maxOutputTokens: options.maxOutputTokens ?? 2048,
    };

    if (options.systemInstruction) {
        config.systemInstruction = options.systemInstruction;
    }

    const response = await client.models.generateContentStream({
        model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
        contents,
        config,
    });

    for await (const chunk of response) {
        if (chunk.text) {
            yield chunk.text;
        }
    }
}

// Main streaming function
async function* generateStream(contents, options = {}) {
    if (process.env.MOCK_AI === "true") {
        yield* generateMockStream(contents);
        return;
    }

    yield* generateGeminiStream(contents, options);
}

module.exports = {
    generateResponse,
    generateStream,
};