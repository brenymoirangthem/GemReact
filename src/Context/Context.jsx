import { createContext, useState, useEffect } from "react";

const API_BASE_URL = "http://localhost:5000";

export const Context = createContext();

const ContextProvider = (props) => {
    const [prevPrompts, setPrevPrompts] = useState([]);
    const [recentPrompt, setRecentPrompt] = useState("");
    const [showResult, setShowResult] = useState(false);

    const [loading, setLoading] = useState(false);
    const [resultData, setResultData] = useState("");
    const [input, setInput] = useState("");

    const [chatHistory, setChatHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [currentConversationId, setCurrentConversationId] = useState(null);
    const [currentMessages, setCurrentMessages] = useState([]);

    // Fetch conversation history
    const fetchChatHistory = async () => {
        setHistoryLoading(true);

        try {
            const response = await fetch(
                `${API_BASE_URL}/api/conversations`
            );

            if (!response.ok) {
                throw new Error("Failed to fetch conversations.");
            }

            const data = await response.json();

            setChatHistory(data);
            setPrevPrompts(
                data.map((conversation) => conversation.title)
            );
        } catch (error) {
            console.error("Error loading conversations:", error);
        } finally {
            setHistoryLoading(false);
        }
    };

    useEffect(() => {
        fetchChatHistory();
    }, []);

    // Format the answer for the existing result display
    const formatAnswer = (answer) => {
        const responseArray = answer.split("**");
        let formattedResponse = "";

        for (let i = 0; i < responseArray.length; i++) {
            if (i === 0 || i % 2 !== 1) {
                formattedResponse += responseArray[i];
            } else {
                formattedResponse += "<b>" + responseArray[i] + "</b>";
            }
        }

        return formattedResponse.split("*").join("<br/>");
    };

    // Send a message using real-time streaming
    const onSent = async (prompt) => {
        if (typeof prompt !== "string" || !prompt.trim() || loading) {
            return;
        }

        const cleanPrompt = prompt.trim();

        setRecentPrompt(cleanPrompt);
        setResultData("");
        setLoading(true);
        setShowResult(true);

        let streamedAnswer = "";
        let completed = false;

        try {
            // Send request to streaming endpoint
            const response = await fetch(
                `${API_BASE_URL}/api/chat/stream`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        message: cleanPrompt,
                        conversationId: currentConversationId,
                    }),
                }
            );

            if (!response.ok) {
                const errorData = await response.json();

                throw new Error(
                    errorData.error || "Failed to generate an answer."
                );
            }

            if (!response.body) {
                throw new Error("Streaming is not supported by this browser.");
            }

            // Create a reader for the streaming response
            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            let buffer = "";
            let conversationData = null;

            // Read incoming chunks continuously
            while (true) {
                const { value, done } = await reader.read();

                if (done) {
                    break;
                }

                buffer += decoder.decode(value, {
                    stream: true,
                });

                // NDJSON sends one JSON object per line
                const lines = buffer.split("\n");

                // Keep incomplete data for the next read
                buffer = lines.pop();

                for (const line of lines) {
                    if (!line.trim()) {
                        continue;
                    }

                    const event = JSON.parse(line);

                    // Receive conversation information
                    if (event.type === "meta") {
                        conversationData = event;

                        setCurrentConversationId(
                            event.conversationId
                        );
                    }

                    // Receive and display response chunks
                    else if (event.type === "chunk") {
                        streamedAnswer += event.text;

                        setResultData(
                            formatAnswer(streamedAnswer)
                        );
                    }

                    // Response completed and saved
                    else if (event.type === "done") {
                        completed = true;

                        const savedMessage = {
                            _id: event.id,
                            conversationId: event.conversationId,
                            userMessage: event.message,
                            aiResponse: streamedAnswer,
                            createdAt: event.createdAt,
                        };

                        setCurrentConversationId(
                            event.conversationId
                        );

                        setCurrentMessages((previous) => [
                            ...previous,
                            savedMessage,
                        ]);
                    }

                    // Backend reported an error
                    else if (event.type === "error") {
                        throw new Error(
                            event.error || "Streaming failed."
                        );
                    }
                }
            }

            // Process any remaining data
            buffer += decoder.decode();

            if (buffer.trim()) {
                const event = JSON.parse(buffer);

                if (event.type === "chunk") {
                    streamedAnswer += event.text;

                    setResultData(
                        formatAnswer(streamedAnswer)
                    );
                } else if (event.type === "done") {
                    completed = true;

                    const savedMessage = {
                        _id: event.id,
                        conversationId: event.conversationId,
                        userMessage: event.message,
                        aiResponse: streamedAnswer,
                        createdAt: event.createdAt,
                    };

                    setCurrentConversationId(
                        event.conversationId
                    );

                    setCurrentMessages((previous) => [
                        ...previous,
                        savedMessage,
                    ]);
                } else if (event.type === "error") {
                    throw new Error(event.error);
                }
            }

            if (!completed) {
                throw new Error(
                    "The streaming connection ended before completion."
                );
            }

            // Refresh conversation sidebar
            await fetchChatHistory();

        } catch (error) {
            console.error("Frontend streaming error:", error);

            setResultData(
                streamedAnswer
                    ? formatAnswer(streamedAnswer) +
                      "<br/><br/>Connection interrupted. Please try again."
                    : error.message ||
                      "Unable to generate a response. Please try again."
            );
        } finally {
            setLoading(false);
            setInput("");
        }
    };

    // Load an existing conversation
    const loadChat = async (conversation) => {
        if (!conversation?._id) {
            console.error("Invalid conversation selected.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(
                `${API_BASE_URL}/api/conversations/${conversation._id}/messages`
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || "Failed to load conversation."
                );
            }

            setCurrentConversationId(conversation._id);
            setCurrentMessages(data.messages);

            if (data.messages.length > 0) {
                const latestMessage =
                    data.messages[data.messages.length - 1];

                setRecentPrompt(latestMessage.userMessage);

                setResultData(
                    formatAnswer(latestMessage.aiResponse)
                );

                setShowResult(true);
            } else {
                setRecentPrompt("");
                setResultData("");
                setShowResult(false);
            }

            setInput("");

        } catch (error) {
            console.error("Error loading conversation:", error);
        } finally {
            setLoading(false);
        }
    };

    // Delete a conversation
    const deleteConversation = async (conversationId) => {
        if (!conversationId) {
            console.error("Invalid conversation ID.");
            return false;
        }

        try {
            const response = await fetch(
                `${API_BASE_URL}/api/conversations/${conversationId}`,
                {
                    method: "DELETE",
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || "Failed to delete conversation."
                );
            }

            // Remove conversation from sidebar
            setChatHistory((previous) =>
                previous.filter(
                    (conversation) =>
                        conversation._id !== conversationId
                )
            );

            // Update previous prompts
            setPrevPrompts((previous) =>
                previous.filter((prompt) => {
                    return !chatHistory.some(
                        (conversation) =>
                            conversation._id === conversationId &&
                            conversation.title === prompt
                    );
                })
            );

            // Clear current chat if deleted
            if (currentConversationId === conversationId) {
                setCurrentConversationId(null);
                setCurrentMessages([]);
                setRecentPrompt("");
                setResultData("");
                setShowResult(false);
                setInput("");
            }

            console.log("Conversation deleted successfully.");

            return true;

        } catch (error) {
            console.error("Delete conversation error:", error);
            return false;
        }
    };

    // Start a new conversation
    const newChat = () => {
        setCurrentConversationId(null);
        setCurrentMessages([]);
        setRecentPrompt("");
        setResultData("");
        setShowResult(false);
        setLoading(false);
        setInput("");
    };

    const contextvalue = {
        prevPrompts,
        setPrevPrompts,
        onSent,
        recentPrompt,
        setRecentPrompt,
        showResult,
        loading,
        resultData,
        input,
        setInput,
        newChat,
        chatHistory,
        historyLoading,
        loadChat,
        currentConversationId,
        currentMessages,
        deleteConversation,
    };

    return (
        <Context.Provider value={contextvalue}>
            {props.children}
        </Context.Provider>
    );
};

export default ContextProvider;