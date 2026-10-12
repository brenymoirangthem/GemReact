import { createContext, useState, useEffect } from "react";
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
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

    // Fetch the conversation list when the app loads
    const fetchChatHistory = async () => {
        setHistoryLoading(true);

        try {
            const response = await fetch(
                "http://localhost:5000/api/conversations"
            );

            if (!response.ok) {
                throw new Error("Failed to fetch conversations.");
            }

            const data = await response.json();

            setChatHistory(data);
            setPrevPrompts(data.map((conversation) => conversation.title));
        } catch (error) {
            console.error("Error loading conversations:", error);
        } finally {
            setHistoryLoading(false);
        }
    };

    useEffect(() => {
        fetchChatHistory();
    }, []);

    // Display the answer one word at a time
    const delayPara = (index, nextWord) => {
        setTimeout(() => {
            setResultData((prev) => prev + nextWord);
        }, index * 35);
    };

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

    // Send a prompt to Gemini through the backend
    const onSent = async (prompt) => {
        if (typeof prompt !== "string" || !prompt.trim() || loading) {
            return;
        }

        const cleanPrompt = prompt.trim();

        setRecentPrompt(cleanPrompt);
        setResultData("");
        setLoading(true);
        setShowResult(true);

        try {
            const response = await fetch(
                "http://localhost:5000/api/chat",
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

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || "Failed to generate an answer."
                );
            }

            if (typeof data.answer !== "string") {
                throw new Error("The backend returned an invalid answer.");
            }

            // Store the conversation ID returned by the backend
            setCurrentConversationId(data.conversationId);

            // Store the current message and response
            const savedMessage = {
                _id: data.id,
                conversationId: data.conversationId,
                userMessage: data.message,
                aiResponse: data.answer,
                createdAt: data.createdAt,
            };

            setCurrentMessages((previous) => [...previous, savedMessage]);

            // Display the answer gradually
            const formattedAnswer = formatAnswer(data.answer);
            const words = formattedAnswer.split(" ");

            words.forEach((word, index) => {
                delayPara(index, word + " ");
            });

            // Refresh the sidebar with the latest conversations
            await fetchChatHistory();
        } catch (error) {
    console.error("Frontend chat error:", error);

    if (error instanceof TypeError) {
        setResultData(
            "Unable to connect to the backend. Please make sure the GemReact server is running and try again."
        );
    } else {
        setResultData(
            error.message || "Something went wrong. Please try again."
        );
    }
} finally {
            setLoading(false);
            setInput("");
        }
    };

    // Load a complete conversation from MongoDB
    const loadChat = async (conversation) => {
        if (!conversation?._id) {
            console.error("Invalid conversation selected.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(
                `http://localhost:5000/api/conversations/${conversation._id}/messages`
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
                setResultData(formatAnswer(latestMessage.aiResponse));
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
            `http://localhost:5000/api/conversations/${conversationId}`,
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

        // Remove the deleted conversation from the sidebar
        setChatHistory((previous) =>
            previous.filter(
                (conversation) => conversation._id !== conversationId
            )
        );

        // Update the list of previous prompts
        setPrevPrompts((previous) =>
            previous.filter((prompt) => {
                return !chatHistory.some(
                    (conversation) =>
                        conversation._id === conversationId &&
                        conversation.title === prompt
                );
            })
        );

        // Clear the current chat if the deleted conversation is open
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