import React, { useContext, useRef } from "react";
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
        selectedDocument,
        pdfUploading,
        uploadPDF,
        askPDF,
        clearSelectedDocument,
        selectedImage,
        imageUploading,
        uploadImage,
        askImage,
        clearSelectedImage,
    } = useContext(Context);

    // Reference to the hidden PDF input
    const imageInputRef = useRef(null);
    const fileInputRef = useRef(null);
    // Handle Enter key
    const handleKeyDown = (event) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();

            if (input.trim() && !loading && !pdfUploading && !imageUploading) {
                if (selectedDocument) {
    askPDF(input);
} else if (selectedImage) {
    askImage(input);
} else {
    onSent(input);
}
            }
        }
    };

    // Handle PDF selection
    const handlePDFUpload = (event) => {
        const file = event.target.files?.[0];

        if (file) {
            uploadPDF(file);
        }

        event.target.value = "";
    };

    // Handle image selection
const handleImageUpload = (event) => {
    const file = event.target.files?.[0];

    if (file) {
        uploadImage(file);
    }

    event.target.value = "";
};

    // Handle send button
    const handleSend = () => {
        if (!input.trim() || loading || pdfUploading || imageUploading) return;
        if (selectedDocument) {
    askPDF(input);
} else if (selectedImage) {
    askImage(input);
} else {
    onSent(input);
}
    };

    return (
        <div className="main">

            {/* Navigation */}
            <div className="nav">
                <p>Gemini</p>
                <img src={assets.gemini_icon} alt="Gemini" />
            </div>

            <div className="main-container">
                            {!showResult ? (
                    <>
                        {/* Welcome section */}
                        <div className="greet">
                            <p>
                                <span>Hello, Breny.</span>
                            </p>

                            <p>How can I help you today?</p>
                        </div>

                        {/* Suggestion cards */}
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

                    /* Chat results */
                    <div className="result">

                        {/* Previously saved messages */}
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

                        {/* Current question and loading response */}
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

                                    {resultData ? (
                                        <p
                                            dangerouslySetInnerHTML={{
                                                __html: resultData,
                                            }}
                                        />
                                    ) : (
                                        <div className="loader">
                                            <hr />
                                            <hr />
                                            <hr />
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        {/* Latest completed response */}
                        {!loading &&
                            resultData &&
                            (currentMessages.length === 0 ||
                                selectedDocument) && (
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
                        {/* Bottom input section */}
            <div className="main-bottom">

                {/* Selected PDF information */}
                {selectedDocument && (
    <div className="selected-document">
        <span>
            📄 {selectedDocument.name}
            {" "}· {selectedDocument.pages} pages
        </span>

        <button
            type="button"
            onClick={clearSelectedDocument}
            disabled={loading || pdfUploading || imageUploading}
            title="Remove PDF"
        >
            ✕
        </button>
    </div>
)}
{/* Selected image preview */}
{selectedImage && (
    <div className="selected-document">
        <div>
            <img
                src={selectedImage.previewUrl}
                alt="Selected upload"
                style={{
                    width: "60px",
                    height: "60px",
                    objectFit: "cover",
                    borderRadius: "8px",
                    verticalAlign: "middle",
                    marginRight: "10px"
                }}
            />

            <span>{selectedImage.name}</span>
        </div>

        <button
            type="button"
            onClick={clearSelectedImage}
            disabled={loading || imageUploading}
            title="Remove image"
        >
            ✕
        </button>
    </div>
)}
                {/* PDF upload status */}
                {pdfUploading && (
                    <p className="upload-status">
                        Processing PDF... Please wait.
                    </p>
                )}

                <div className="search-box">

                    {/* Message input */}
                    <input
                        type="text"
                        placeholder={
    selectedDocument
        ? "Ask a question about your PDF..."
        : selectedImage
        ? "Ask a question about your image..."
        : "Enter a prompt here"
}
                        value={input}
                        onChange={(event) =>
                            setInput(event.target.value)
                        }
                        onKeyDown={handleKeyDown}
                        disabled={loading || pdfUploading || imageUploading}
                    />

                    <div>

                        {/* Hidden PDF input */}
                        <input
                            type="file"
                            accept=".pdf,application/pdf"
                            ref={fileInputRef}
                            onChange={handlePDFUpload}
                            style={{ display: "none" }}
                        />
                        <input
    type="file"
    accept="image/jpeg,image/png,image/webp"
    ref={imageInputRef}
    onChange={handleImageUpload}
    style={{ display: "none" }}
/>
   {/* PDF upload button */}
<button
    type="button"
    onClick={() => {
        if (!loading && !pdfUploading) {
            fileInputRef.current?.click();
        }
    }}
    disabled={loading || pdfUploading || imageUploading}
    title="Upload PDF"
    style={{
        background: "none",
        border: "none",
        padding: 0,
        cursor: "pointer",
        opacity: pdfUploading ? 0.5 : 1,
    }}
>
    <img
        src={assets.gallery_icon}
        alt="Upload PDF"
    />
</button>

{/* Image upload button */}
<button
    type="button"
    onClick={() => imageInputRef.current?.click()}
    disabled={loading || pdfUploading || imageUploading}
    title="Upload image"
>
    🖼️
</button>
                        {/* Microphone */}
                        <img
                            src={assets.mic_icon}
                            alt="Microphone"
                        />

                        {/* Send button */}
                        {input.trim() && (
                            <img
                                onClick={handleSend}
                                src={assets.send_icon}
                                alt="Send"
                                style={{ cursor: "pointer" }}
                            />
                        )}

                    </div>
                </div>

                <p className="bottom-info">
                    Gemini may incorporate information from the internet.
                    Always verify important information.
                </p>

            </div>

        </div>
    );
};

export default Main;