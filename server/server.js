const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const generateResponse = require("./config/gemini");

const Chat = require("./models/chat");
const Conversation = require("./models/Conversation");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Home route
app.get("/", (req, res) => {
    res.json({
        message: "GemReact backend is running!",
    });
});

// Create a new conversation
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

// Get all conversations
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

// Get messages belonging to a conversation
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

// Delete a conversation and all its messages
app.delete("/api/conversations/:id", async (req, res) => {
    try {
        const { id } = req.params;

        // Validate the conversation ID
        if (!/^[a-fA-F0-9]{24}$/.test(id)) {
            return res.status(400).json({
                error: "Invalid conversation ID.",
            });
        }

        // Check whether the conversation exists
        const conversation = await Conversation.findById(id);

        if (!conversation) {
            return res.status(404).json({
                error: "Conversation not found.",
            });
        }

        // Delete all messages belonging to this conversation
        await Chat.deleteMany({
            conversationId: id,
        });

        // Delete the conversation itself
        await Conversation.findByIdAndDelete(id);

        // Send a success response
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

// Send a message and save it under a conversation
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

        // Continue an existing conversation or create a new one
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

        // Retrieve earlier messages for conversational context
        const previousMessages = await Chat.find({
            conversationId: conversation._id,
        }).sort({ createdAt: 1 });

        // Build a prompt containing the earlier conversation
        const conversationContext = previousMessages
            .map(
                (chat) =>
                    `User: ${chat.userMessage}\nAssistant: ${chat.aiResponse}`
            )
            .join("\n\n");

        const fullPrompt = conversationContext
            ? `${conversationContext}\n\nUser: ${cleanMessage}\nAssistant:`
            : cleanMessage;

        // Generate the AI response
        const answer = await generateResponse(fullPrompt);

        // Save this message under the conversation
        const savedChat = await Chat.create({
            conversationId: conversation._id,
            userMessage: cleanMessage,
            aiResponse: answer,
        });

        // Update the conversation's last activity
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

    // Handle Gemini API quota errors
    if (
        error.status === 429 ||
        errorMessage.includes("quota") ||
        errorMessage.includes("resource_exhausted")
    ) {
        return res.status(429).json({
            error: "Gemini's request limit has been reached. Please try again later.",
        });
    }

    // Handle invalid API key or authentication errors
    if (
        error.status === 401 ||
        error.status === 403
    ) {
        return res.status(error.status).json({
            error: "Gemini API authentication failed. Please check the server configuration.",
        });
    }

    // Handle other errors
    return res.status(500).json({
        error: "Unable to generate or save the AI response. Please try again later.",
    });
}
});

// Start the backend after connecting to MongoDB
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
        console.error("Failed to start the backend:", error.message);
        process.exit(1);
    }
}

startServer();