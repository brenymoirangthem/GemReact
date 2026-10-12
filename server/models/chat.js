const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
    {
        conversationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Conversation",
            required: true,
        },

        userMessage: {
            type: String,
            required: true,
            trim: true,
        },

        aiResponse: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const Chat = mongoose.model("Chat", chatSchema);

module.exports = Chat;