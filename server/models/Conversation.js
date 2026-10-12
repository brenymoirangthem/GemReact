const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            default: "New Chat",
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

const Conversation = mongoose.model(
    "Conversation",
    conversationSchema
);

module.exports = Conversation;