import React, { useContext } from "react";
import "./Main.css";
import { assets } from "../../assets/assets";
import { Context } from "../../Context/Context";

const Main = () => {
    const {
        onSent,
        recentPrompt,
        showResult,
        loading,
        resultData,
        input,
        setInput,
        currentMessages,
    } = useContext(Context);

    // Submit the message when Enter is pressed
    const handleKeyDown = (event) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();

            if (input.trim() && !loading) {
                onSent(input);
            }
        }
    };

    return (
        <div className="main">
            <div className="nav">
                <p>Gemini</p>
                <img src={assets.gemini_icon} alt="Gemini" />
            </div>

            <div className="main-container">
                {!showResult ? (
                    <>
                        <div className="greet">
                            <p>
                                <span>Hello, Breny.</span>
                            </p>
                            <p>How can I help you today?</p>
                        </div>

                        <div className="cards">
                            <div
                                className="card"
                                onClick={() =>
                                    onSent(
                                        "Suggest beautiful places to see on an upcoming road trip"
                                    )
                                }
                            >
                                <p>
                                    Suggest beautiful places to see on an
                                    upcoming road trip
                                </p>
                                <img src={assets.compass_icon} alt="" />
                            </div>

                            <div
                                className="card"
                                onClick={() =>
                                    onSent(
                                        "Briefly summarize the concept of urban planning"
                                    )
                                }
                            >
                                <p>
                                    Briefly summarize the concept: urban
                                    planning
                                </p>
                                <img src={assets.bulb_icon} alt="" />
                            </div>

                            <div
                                className="card"
                                onClick={() =>
                                    onSent(
                                        "Brainstorm team bonding activities for work"
                                    )
                                }
                            >
                                <p>
                                    Brainstorming team bonding activities
                                    for our work
                                </p>
                                <img src={assets.message_icon} alt="" />
                            </div>

                            <div
                                className="card"
                                onClick={() =>
                                    onSent(
                                        "Improve the readability of the following code"
                                    )
                                }
                            >
                                <p>
                                    Improve the readability of the following
                                    code
                                </p>
                                <img src={assets.code_icon} alt="" />
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="result">
                        {/* Display every saved message in the conversation */}
                        {currentMessages.map((chat) => (
                            <React.Fragment key={chat._id}>
                                <div className="result-title">
                                    <img
                                        src={assets.message_icon}
                                        alt="User"
                                    />
                                    <p>{chat.userMessage}</p>
                                </div>

                                <div className="result-data">
                                    <img
                                        src={assets.gemini_icon}
                                        alt="Gemini"
                                    />

                                    <p
                                        dangerouslySetInnerHTML={{
                                            __html: chat.aiResponse
                                                .split("**")
                                                .map((part, index) =>
                                                    index % 2 === 1
                                                        ? `<b>${part}</b>`
                                                        : part
                                                )
                                                .join("")
                                                .split("*")
                                                .join("<br/>"),
                                        }}
                                    />
                                </div>
                            </React.Fragment>
                        ))}

                        {/* Display the latest response while generating */}
                        {loading && (
                            <>
                                <div className="result-title">
                                    <img
                                        src={assets.message_icon}
                                        alt="User"
                                    />
                                    <p>{recentPrompt}</p>
                                </div>

                                <div className="result-data">
                                    <img
                                        src={assets.gemini_icon}
                                        alt="Gemini"
                                    />

                                    <div className="loader">
                                        <hr />
                                        <hr />
                                        <hr />
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Display the latest response after generation */}
                        {!loading &&
                            currentMessages.length === 0 &&
                            resultData && (
                                <>
                                    <div className="result-title">
                                        <img
                                            src={assets.message_icon}
                                            alt="User"
                                        />
                                        <p>{recentPrompt}</p>
                                    </div>

                                    <div className="result-data">
                                        <img
                                            src={assets.gemini_icon}
                                            alt="Gemini"
                                        />

                                        <p
                                            dangerouslySetInnerHTML={{
                                                __html: resultData,
                                            }}
                                        />
                                    </div>
                                </>
                            )}
                    </div>
                )}
            </div>

            <div className="main-bottom">
                <div className="search-box">
                    <input
    onChange={(e) => setInput(e.target.value)}
    onKeyDown={(event) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();

            if (input.trim() && !loading) {
                onSent(input);
            }
        }
    }}
    value={input}
    type="text"
    placeholder="Enter a prompt here"
    disabled={loading}
/>

                    <div>
                        <img src={assets.gallery_icon} alt="Gallery" />
                        <img src={assets.mic_icon} alt="Microphone" />

                        {input.trim() && (
                            <img
                                onClick={() => {
                                    if (!loading) {
                                        onSent(input);
                                    }
                                }}
                                src={assets.send_icon}
                                alt="Send"
                            />
                        )}
                    </div>
                </div>

                <p className="bottom-info">
                    Gemini may incorporate information from the internet
                </p>
            </div>
        </div>
    );
};

export default Main;