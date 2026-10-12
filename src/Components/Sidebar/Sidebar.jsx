import React, { useContext, useState } from "react";
import "./Sidebar.css";
import { assets } from "../../assets/assets";
import { Context } from "../../Context/Context";

const Sidebar = () => {
    const [extended, setExtended] = useState(false);

    const {
        chatHistory,
        historyLoading,
        loadChat,
        newChat,
        deleteConversation,
    } = useContext(Context);

    // Delete a conversation after confirmation
    const handleDelete = async (event, conversation) => {
        event.stopPropagation();

        const confirmed = window.confirm(
            `Are you sure you want to delete "${conversation.title}"?`
        );

        if (!confirmed) {
            return;
        }

        await deleteConversation(conversation._id);
    };

    return (
        <div className="sidebar">
            <div className="top">
                <img
                    onClick={() => setExtended((previous) => !previous)}
                    className="menu"
                    src={assets.menu_icon}
                    alt="Menu"
                />

                <div className="new-chat" onClick={newChat}>
                    <img src={assets.plus_icon} alt="" />
                    {extended ? <p>New Chat</p> : null}
                </div>

                {extended && (
                    <div className="recent">
                        <p className="recent-title">Recent</p>

                        {historyLoading && <p>Loading history...</p>}

                        {!historyLoading && chatHistory.length === 0 && (
                            <p>No conversations yet.</p>
                        )}

                        {chatHistory.map((conversation) => (
                            <div
                                key={conversation._id}
                                className="recent-entry"
                                onClick={() => loadChat(conversation)}
                                title={conversation.title}
                            >
                                <img
                                    src={assets.message_icon}
                                    alt=""
                                />

                                <p>
                                    {conversation.title.length > 18
                                        ? conversation.title.slice(0, 18) + "..."
                                        : conversation.title}
                                </p>

                                <button
                                    type="button"
                                    className="delete-chat"
                                    title="Delete conversation"
                                    aria-label={`Delete ${conversation.title}`}
                                    onClick={(event) =>
                                        handleDelete(event, conversation)
                                    }
                                >
                                    🗑️
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="bottom">
                <div className="bottom-item recent-entry">
                    <img src={assets.question_icon} alt="" />
                    {extended ? <p>Help</p> : null}
                </div>

                <div className="bottom-item recent-entry">
                    <img src={assets.history_icon} alt="" />
                    {extended ? <p>Activity</p> : null}
                </div>

                <div className="bottom-item recent-entry">
                    <img src={assets.setting_icon} alt="" />
                    {extended ? <p>Settings</p> : null}
                </div>
            </div>
        </div>
    );
};

export default Sidebar;