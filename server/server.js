const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

const {
    generateResponse,
    generateStream,
} = require("./config/gemini");

const Chat = require("./models/chat");
const Conversation = require("./models/Conversation");

// ==========================================
// AI TOOLS
// ==========================================
const {
    executeTool,
    detectToolCall
} = require("./tools");
// ==========================================
// CONVERSATION CONTEXT MANAGER
// ==========================================

const MAX_CONTEXT_MESSAGES = 10;

async function buildConversationPrompt(conversationId, currentMessage) {

    // Fetch the 10 most recent messages
    const previousMessages = await Chat.find({
        conversationId,
    })
        .sort({ createdAt: -1 })
        .limit(MAX_CONTEXT_MESSAGES)
        .lean();

    // Restore chronological order
    previousMessages.reverse();

    // Build conversation context
    const conversationContext = previousMessages
        .map(
            (chat) =>
                `User: ${chat.userMessage}\nAssistant: ${chat.aiResponse}`
        )
        .join("\n\n");

    // Add the new user message
    return conversationContext
        ? `${conversationContext}\n\nUser: ${currentMessage}\nAssistant:`
        : currentMessage;
}

const app = express();

// ==========================================
// MIDDLEWARE
// ==========================================

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    console.log("REQUEST:", req.method, req.url);
    next();
});

// ==========================================
// HOME ROUTE
// ==========================================

app.get("/", (req, res) => {
    res.json({
        message: "GemReact backend is running!",
    });
});

// ==========================================
// CREATE NEW CONVERSATION
// ==========================================

app.post("/api/conversations", async (req, res) => {
    try {
        const conversation = await Conversation.create({
            title: "New Chat",
        });

        res.status(201).json(conversation);

    } catch (error) {
        console.error("Create conversation error:", error.message);

        res.status(500).json({
            error: "Unable to create a conversation.",
        });
    }
});

// ==========================================
// GET ALL CONVERSATIONS
// ==========================================

app.get("/api/conversations", async (req, res) => {
    try {
        const conversations = await Conversation.find()
            .sort({ updatedAt: -1 });

        res.status(200).json(conversations);

    } catch (error) {
        console.error("Fetch conversations error:", error.message);

        res.status(500).json({
            error: "Unable to fetch conversations.",
        });
    }
});

// ==========================================
// GET MESSAGES OF A CONVERSATION
// ==========================================

app.get("/api/conversations/:id/messages", async (req, res) => {
    try {
        const { id } = req.params;

        if (!/^[a-fA-F0-9]{24}$/.test(id)) {
            return res.status(400).json({
                error: "Invalid conversation ID.",
            });
        }

        const conversation = await Conversation.findById(id);

        if (!conversation) {
            return res.status(404).json({
                error: "Conversation not found.",
            });
        }

        const messages = await Chat.find({
            conversationId: id,
        }).sort({ createdAt: 1 });

        res.status(200).json({
            conversation,
            messages,
        });

    } catch (error) {
        console.error("Fetch messages error:", error.message);

        res.status(500).json({
            error: "Unable to fetch conversation messages.",
        });
    }
});

// ==========================================
// DELETE CONVERSATION
// ==========================================

app.delete("/api/conversations/:id", async (req, res) => {
    try {
        const { id } = req.params;

        if (!/^[a-fA-F0-9]{24}$/.test(id)) {
            return res.status(400).json({
                error: "Invalid conversation ID.",
            });
        }

        const conversation = await Conversation.findById(id);

        if (!conversation) {
            return res.status(404).json({
                error: "Conversation not found.",
            });
        }

        await Chat.deleteMany({
            conversationId: id,
        });

        await Conversation.findByIdAndDelete(id);

        res.status(200).json({
            message: "Conversation deleted successfully.",
            conversationId: id,
        });

    } catch (error) {
        console.error("Delete conversation error:", error.message);

        res.status(500).json({
            error: "Unable to delete the conversation.",
        });
    }
});

// ==========================================
// NORMAL CHAT API
// ==========================================
// ==========================================
// TOOL EXECUTION API
// ==========================================

app.post("/api/tools/execute", (req, res) => {
    try {
        const { toolName, args } = req.body;

        // Validate tool name
        if (!toolName || typeof toolName !== "string") {
            return res.status(400).json({
                success: false,
                error: "Please provide a valid tool name."
            });
        }

        // Execute registered tool
        const result = executeTool(toolName, args || {});

        return res.status(200).json(result);

    } catch (error) {
        console.error("Tool execution error:", error.message);

        return res.status(500).json({
            success: false,
            error: "Unable to execute tool."
        });
    }
});

app.post("/api/chat", async (req, res) => {
    try {
        const { message, conversationId } = req.body;

        if (typeof message !== "string" || !message.trim()) {
            return res.status(400).json({
                error: "Please provide a valid message.",
            });
        }

        const cleanMessage = message.trim();

        let conversation;

        // Continue existing conversation or create a new one
        if (conversationId) {
            if (!/^[a-fA-F0-9]{24}$/.test(conversationId)) {
                return res.status(400).json({
                    error: "Invalid conversation ID.",
                });
            }

            conversation = await Conversation.findById(conversationId);

            if (!conversation) {
                return res.status(404).json({
                    error: "Conversation not found.",
                });
            }

        } else {
            conversation = await Conversation.create({
                title:
                    cleanMessage.length > 40
                        ? cleanMessage.slice(0, 40) + "..."
                        : cleanMessage,
            });
        }

        // Retrieve previous messages
     // Build conversation prompt using context manager
const fullPrompt = await buildConversationPrompt(
    conversation._id,
    cleanMessage
);

console.log("\n===== CONVERSATION CONTEXT =====");
console.log(fullPrompt);
console.log("================================\n");

        console.log("Normal chat request received!");
        console.log("Using mock mode:", process.env.MOCK_AI);

        // Generate AI response
// ==========================================
// AUTOMATIC TOOL EXECUTION
// ==========================================

const toolCall = detectToolCall(cleanMessage);

if (toolCall) {

    console.log("Tool detected:", toolCall.toolName);

    const toolResult = executeTool(
        toolCall.toolName,
        toolCall.args
    );

    let answer;

    if (toolResult.success) {
        answer = `The result of ${toolResult.expression} is ${toolResult.result}.`;
    } else {
        answer = `Calculation failed: ${toolResult.error}`;
    }

    // Save tool response in MongoDB
    const savedChat = await Chat.create({
        conversationId: conversation._id,
        userMessage: cleanMessage,
        aiResponse: answer,
    });

    conversation.updatedAt = new Date();
    await conversation.save();

    return res.status(201).json({
        id: savedChat._id,
        conversationId: conversation._id,
        conversationTitle: conversation.title,
        message: savedChat.userMessage,
        answer: savedChat.aiResponse,
        createdAt: savedChat.createdAt,
    });
}

// ==========================================
// NORMAL AI RESPONSE
// ==========================================

const answer = await generateResponse(fullPrompt, {
    temperature: 0.7,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 2048,
    systemInstruction:
        "You are GemReact, a helpful AI assistant. Provide clear, accurate and friendly responses."
});
        // Save chat
        const savedChat = await Chat.create({
            conversationId: conversation._id,
            userMessage: cleanMessage,
            aiResponse: answer,
        });

        // Update conversation activity
        conversation.updatedAt = new Date();
        await conversation.save();

        res.status(201).json({
            id: savedChat._id,
            conversationId: conversation._id,
            conversationTitle: conversation.title,
            message: savedChat.userMessage,
            answer: savedChat.aiResponse,
            createdAt: savedChat.createdAt,
        });

    } catch (error) {
        console.error("Chat API error:", error.message);

        const errorMessage = String(error.message || "").toLowerCase();

        // Gemini quota errors
        if (
            error.status === 429 ||
            errorMessage.includes("quota") ||
            errorMessage.includes("resource_exhausted")
        ) {
            return res.status(429).json({
                error: "Gemini's request limit has been reached. Please try again later.",
            });
        }

        // Authentication errors
        if (error.status === 401 || error.status === 403) {
            return res.status(error.status).json({
                error: "Gemini API authentication failed. Please check the server configuration.",
            });
        }

        res.status(500).json({
            error: "Unable to generate or save the AI response. Please try again later.",
        });
    }
});

// ==========================================
// STREAMING CHAT API
// ==========================================

app.post("/api/chat/stream", async (req, res) => {

    let clientDisconnected = false;

    try {
        const { message, conversationId } = req.body;

        // Validate message
        if (typeof message !== "string" || !message.trim()) {
            return res.status(400).json({
                error: "Please provide a valid message.",
            });
        }

        const cleanMessage = message.trim();

        let conversation;

        // Continue existing conversation or create a new one
        if (conversationId) {

            if (!/^[a-fA-F0-9]{24}$/.test(conversationId)) {
                return res.status(400).json({
                    error: "Invalid conversation ID.",
                });
            }

            conversation = await Conversation.findById(conversationId);

            if (!conversation) {
                return res.status(404).json({
                    error: "Conversation not found.",
                });
            }

        } else {

            conversation = await Conversation.create({
                title:
                    cleanMessage.length > 40
                        ? cleanMessage.slice(0, 40) + "..."
                        : cleanMessage,
            });
        }

        // Retrieve previous messages
      // Build conversation prompt using context manager
const fullPrompt = await buildConversationPrompt(
    conversation._id,
    cleanMessage
);

console.log("\n===== CONVERSATION CONTEXT =====");
console.log(fullPrompt);
console.log("================================\n");
        // Configure streaming response
        res.setHeader(
            "Content-Type",
            "application/x-ndjson; charset=utf-8"
        );

        res.setHeader("Cache-Control", "no-cache, no-transform");
        res.setHeader("Connection", "keep-alive");
        res.setHeader("X-Accel-Buffering", "no");

        res.flushHeaders();

        // Detect client disconnection
        res.on("close", () => {
            if (!res.writableEnded) {
                clientDisconnected = true;

                console.log(
                    "Client disconnected during streaming."
                );
            }
        });

        // Send conversation metadata
        res.write(
            JSON.stringify({
                type: "meta",
                conversationId: conversation._id,
                conversationTitle: conversation.title,
            }) + "\n"
        );


     let fullAnswer = "";

// ==========================================
// AUTOMATIC TOOL EXECUTION
// ==========================================

const toolCall = detectToolCall(cleanMessage);

if (toolCall) {
    console.log("Tool detected:", toolCall.toolName);

    const toolResult = executeTool(
        toolCall.toolName,
        toolCall.args
    );

    if (toolResult.success) {
        fullAnswer = `The result of ${toolResult.expression} is ${toolResult.result}.`;
    } else {
        fullAnswer = `Calculation failed: ${toolResult.error}`;
    }

    // Stream the response
    const words = fullAnswer.match(/\S+\s*/g) || [fullAnswer];

    for (const word of words) {
        if (clientDisconnected || res.destroyed) {
            return;
        }

        res.write(
            JSON.stringify({
                type: "chunk",
                text: word,
            }) + "\n"
        );
    }

    // Save response
    const savedChat = await Chat.create({
        conversationId: conversation._id,
        userMessage: cleanMessage,
        aiResponse: fullAnswer,
    });

    conversation.updatedAt = new Date();
    await conversation.save();

    // Send completion event
    res.write(
        JSON.stringify({
            type: "done",
            id: savedChat._id,
            conversationId: conversation._id,
            conversationTitle: conversation.title,
            message: savedChat.userMessage,
            createdAt: savedChat.createdAt,
        }) + "\n"
    );

    res.end();

    console.log("Tool execution completed successfully!");

    return;
}

console.log("Streaming chat request received!");
console.log("Using mock mode:", process.env.MOCK_AI);

        // Generate response progressively
        for await (const chunk of generateStream(fullPrompt, {
    temperature: 0.7,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 2048,
    systemInstruction:
        "You are GemReact, a helpful AI assistant. Provide clear, accurate and friendly responses."
})) {
            // Stop generation if client disconnects
            if (clientDisconnected || res.destroyed) {
                break;
            }

            fullAnswer += chunk;

            res.write(
                JSON.stringify({
                    type: "chunk",
                    text: chunk,
                }) + "\n"
            );
        }

        // Do not save incomplete responses
        if (clientDisconnected || res.destroyed) {
            console.log(
                "Streaming stopped because the client disconnected."
            );

            return;
        }

        // Save completed conversation
        const savedChat = await Chat.create({
            conversationId: conversation._id,
            userMessage: cleanMessage,
            aiResponse: fullAnswer,
        });

        // Update conversation activity
        conversation.updatedAt = new Date();
        await conversation.save();

        // Send completion information
        res.write(
            JSON.stringify({
                type: "done",
                id: savedChat._id,
                conversationId: conversation._id,
                conversationTitle: conversation.title,
                message: savedChat.userMessage,
                createdAt: savedChat.createdAt,
            }) + "\n"
        );

        res.end();

        console.log("Streaming response completed successfully!");

    } catch (error) {

        console.error("Streaming chat error:", error.message);

        // Do not write to a closed connection
        if (res.destroyed || res.writableEnded) {
            return;
        }

        const errorMessage = String(error.message || "").toLowerCase();

        let statusCode = 500;
        let userMessage =
            "Unable to generate the AI response. Please try again later.";

        // Gemini quota errors
        if (
            error.status === 429 ||
            errorMessage.includes("quota") ||
            errorMessage.includes("resource_exhausted")
        ) {
            statusCode = 429;
            userMessage =
                "Gemini's request limit has been reached. Please try again later.";
        }

        // Authentication errors
        else if (error.status === 401 || error.status === 403) {
            statusCode = error.status;
            userMessage =
                "Gemini API authentication failed. Please check the server configuration.";
        }

        // If streaming has already started, send an NDJSON error
        if (res.headersSent) {

            res.write(
                JSON.stringify({
                    type: "error",
                    error: userMessage,
                }) + "\n"
            );

            res.end();

        } else {

            res.status(statusCode).json({
                error: userMessage,
            });
        }
    }
});

// ==========================================
// START SERVER
// ==========================================

const PORT = process.env.PORT || 5000;

async function startServer() {
    try {
        await connectDB();

        app.listen(PORT, () => {
            console.log(
                `GemReact backend running at http://localhost:${PORT}`
            );
        });

    } catch (error) {
        console.error(
            "Failed to start the backend:",
            error.message
        );

        process.exit(1);
    }
}

startServer();