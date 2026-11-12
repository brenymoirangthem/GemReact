import React, { useContext, useEffect, useRef, useState } from "react";
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
        transcribeAudio,
        audioTranscribing,
    } = useContext(Context);

    // Reference to the hidden PDF input
    const imageInputRef = useRef(null);
    const fileInputRef = useRef(null);
    const recorderRef = useRef(null);
    const mountedRef = useRef(true);
    const [isListening, setIsListening] = useState(false);

    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
            const recorder = recorderRef.current;
            if (recorder?.state === "recording") {
                recorder.stop();
            }
            recorder?.stream.getTracks().forEach((track) => track.stop());
        };
    }, []);

    const handleVoiceInput = async () => {
        if (recorderRef.current?.state === "recording") {
            recorderRef.current.stop();
            return;
        }

        if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
            alert("Audio recording is not supported by this browser.");
            return;
        }

        let stream;
        try {
            stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
            });
            const supportedMimeType = [
                "audio/webm;codecs=opus",
                "audio/webm",
                "audio/mp4",
                "audio/ogg;codecs=opus",
            ].find((mimeType) => MediaRecorder.isTypeSupported(mimeType));
            const recorder = new MediaRecorder(
                stream,
                supportedMimeType ? { mimeType: supportedMimeType } : undefined
            );
            const chunks = [];

            recorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    chunks.push(event.data);
                }
            };

            recorder.onstop = async () => {
                stream.getTracks().forEach((track) => track.stop());
                recorderRef.current = null;
                if (!mountedRef.current) return;
                setIsListening(false);

                const audio = new Blob(chunks, {
                    type: recorder.mimeType || "audio/webm",
                });
                if (!audio.size) {
                    alert("No audio was recorded. Please try again.");
                    return;
                }

                try {
                    const transcript = (await transcribeAudio(audio)).trim();
                    if (!transcript) {
                        throw new Error("No speech was detected. Please try again.");
                    }
                    setInput((current) =>
                        `${current}${current && !current.endsWith(" ") ? " " : ""}${transcript}`
                    );
                } catch (error) {
                    console.error("Audio transcription failed:", error);
                    alert(error.message || "Unable to transcribe audio.");
                }
            };

            recorder.onerror = (event) => {
                stream.getTracks().forEach((track) => track.stop());
                recorderRef.current = null;
                if (!mountedRef.current) return;
                setIsListening(false);
                console.error("Audio recording failed:", event.error);
                alert("Audio recording failed. Please check microphone permissions and try again.");
            };

            recorderRef.current = recorder;
            recorder.start();
            setIsListening(true);
        } catch (error) {
            stream?.getTracks().forEach((track) => track.stop());
            console.error("Microphone access failed:", error);
            alert("Could not access your microphone. Please allow microphone access and try again.");
        }
    };

    // Handle Enter key
    const handleKeyDown = (event) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();

            if (input.trim() && !loading && !pdfUploading && !imageUploading && !audioTranscribing && !isListening) {
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
        if (!input.trim() || loading || pdfUploading || imageUploading || audioTranscribing || isListening) return;
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
            disabled={loading || pdfUploading || imageUploading || audioTranscribing || isListening}
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
            disabled={loading || imageUploading || audioTranscribing || isListening}
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
                {(isListening || audioTranscribing) && (
                    <p className="upload-status" role="status">
                        {isListening
                            ? "Listening... Click the microphone when you are done."
                            : "Transcribing audio..."}
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
                        disabled={loading || pdfUploading || imageUploading || audioTranscribing || isListening}
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
                            onClick={() => fileInputRef.current?.click()}
                            disabled={loading || pdfUploading || imageUploading || audioTranscribing || isListening}
                            title="Upload PDF"
                            aria-label="Upload PDF"
                        >
                            <img src={assets.gallery_icon} alt="" />
                        </button>

                        {/* Image upload button */}
                        <button
                            type="button"
                            onClick={() => imageInputRef.current?.click()}
                            disabled={loading || pdfUploading || imageUploading || audioTranscribing || isListening}
                            title="Upload image"
                            aria-label="Upload image"
                        >
                            <span aria-hidden="true">🖼️</span>
                        </button>
                        {/* Microphone */}
                        <button
                            type="button"
                            onClick={handleVoiceInput}
                            disabled={loading || pdfUploading || imageUploading || audioTranscribing}
                            title={isListening ? "Finish voice input" : "Start voice input"}
                            aria-label={isListening ? "Finish voice input" : "Start voice input"}
                            aria-pressed={isListening}
                            className={isListening ? "listening" : ""}
                        >
                            <img src={assets.mic_icon} alt="" />
                        </button>

                        {/* Send button */}
                        {input.trim() && (
                            <button
                                type="button"
                                onClick={handleSend}
                                disabled={loading || pdfUploading || imageUploading || audioTranscribing || isListening}
                                title="Send message"
                                aria-label="Send message"
                            >
                                <img src={assets.send_icon} alt="" />
                            </button>
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