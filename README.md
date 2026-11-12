# GemReact — AI Chat Assistant

GemReact is a full-stack AI chat application built using React, Node.js, Express, MongoDB, and Google Gemini API.

It provides AI-powered conversations, streaming responses, conversation history, tool execution, PDF question answering using Retrieval-Augmented Generation (RAG), and multimodal image input.

**Development mode:** GemReact supports a mock AI mode for testing without consuming Gemini API quota. Mock mode simulates responses but does not perform actual AI reasoning or image understanding.

## Features

* **AI Chat:** Gemini-powered conversational assistant.
* **Streaming Responses:** Displays AI responses progressively.
* **Conversation Memory:** Stores conversation history in MongoDB and includes recent messages as context.
* **AI Tools:** Calculator and date/time tools.
* **PDF Upload:** Extracts text from uploaded PDF documents.
* **RAG Pipeline:** Splits documents into chunks and generates vector embeddings.
* **Semantic Search:** Retrieves relevant document chunks using MongoDB Atlas Vector Search.
* **PDF Question Answering:** Answers questions using retrieved document context.
* **Image Upload:** Supports JPG, PNG, and WEBP image uploads.
* **Multimodal AI:** Sends image data and user questions to Gemini.
* **Security:** File validation, upload limits, rate limiting, and CORS configuration.

## Tech Stack

### Frontend

* React.js
* Vite
* JavaScript
* CSS

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* Google Gemini API
* Hugging Face Transformers
* Multer
* PDF Parse

### AI and RAG

* Google Gemini
* `Xenova/all-MiniLM-L6-v2`
* 384-dimensional embeddings
* MongoDB Atlas Vector Search
* Cosine similarity

## System Architecture

### Standard Chat Flow

1. User sends a message through the React frontend.
2. Express receives the request.
3. Previous conversation messages are retrieved from MongoDB.
4. The conversation context is constructed.
5. Gemini generates the response.
6. The response is returned to the frontend using streaming or a normal API response.

### RAG Pipeline

1. User uploads a PDF.
2. Backend validates the uploaded file.
3. PDF text is extracted using PDF Parse.
4. Extracted text is divided into smaller overlapping chunks.
5. Embeddings are generated using Hugging Face Transformers.
6. Text chunks and embeddings are stored in MongoDB.
7. MongoDB Atlas Vector Search retrieves relevant chunks when the user asks a question.
8. Retrieved context is passed to Gemini to generate a grounded answer.

### Multimodal Image Processing

1. User uploads an image.
2. Backend validates the file type, size, and image signature.
3. Image data is converted into Base64.
4. The image and user question are sent together to Gemini.
5. Gemini generates a response based on the image.

## Project Structure

```text
GemReact/
│
├── server/
│   ├── config/
│   │   ├── db.js
│   │   └── gemini.js
│   │
│   ├── models/
│   │   ├── chat.js
│   │   ├── Conversation.js
│   │   └── DocumentChunk.js
│   │
│   ├── tools/
│   │   ├── calculator.js
│   │   ├── datetime.js
│   │   └── index.js
│   │
│   ├── utils/
│   │   ├── embedding.js
│   │   ├── pdfExtractor.js
│   │   ├── pdfStore.js
│   │   ├── retriever.js
│   │   └── textChunker.js
│   │
│   ├── uploads/
│   ├── server.js
│   └── package.json
│
├── src/
│   ├── Components/
│   ├── Context/
│   └── ...
│
├── .env
├── package.json
└── README.md
```

## Installation and Setup

### Prerequisites

* Node.js
* npm
* MongoDB Atlas account
* Gemini API key (for real AI responses)

### 1. Clone the repository

```bash
git clone https://github.com/brenymoirangthem/GemReact.git
cd GemReact
git checkout llm-upgrade
```

### 2. Install frontend dependencies

```bash
npm install
```

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:5000
```

### 3. Install backend dependencies

```bash
cd server
npm install
```

Create `server/.env`:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
MOCK_AI=false
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
```

**Environment variables:**

| Variable       | Description                      |
| -------------- | -------------------------------- |
| PORT           | Backend server port              |
| MONGODB_URI    | MongoDB connection string        |
| MOCK_AI        | Enables or disables mock AI mode |
| GEMINI_API_KEY | Gemini API key                   |
| GEMINI_MODEL   | Gemini model name                |

Never commit `.env` files or expose API keys and database credentials.

### 4. Configure MongoDB Atlas Vector Search

Create a Vector Search index named `vector_index` on the `documentchunks` collection.

Use the following index definition:

```json
{
  "fields": [
    {
      "type": "vector",
      "path": "embedding",
      "numDimensions": 384,
      "similarity": "cosine"
    },
    {
      "type": "filter",
      "path": "documentId"
    }
  ]
}
```

Wait until the index status becomes `READY`.

### 5. Start the backend

From the `server` directory:

```bash
npm run dev
```

Backend:

```text
http://localhost:5000
```

### 6. Start the frontend

Open another terminal in the project root:

```bash
npm run dev
```

Open the local Vite URL displayed in the terminal, usually:

```text
http://localhost:5173
```

## API Endpoints

| Endpoint                          | Method | Description                 |
| --------------------------------- | ------ | --------------------------- |
| `/api/conversations`              | GET    | Fetch conversations         |
| `/api/conversations`              | POST   | Create conversation         |
| `/api/conversations/:id/messages` | GET    | Fetch conversation messages |
| `/api/conversations/:id`          | DELETE | Delete conversation         |
| `/api/chat`                       | POST   | Standard AI chat            |
| `/api/chat/stream`                | POST   | Streaming AI chat           |
| `/api/chat/pdf`                   | POST   | Ask questions about PDFs    |
| `/api/chat/image`                 | POST   | Ask questions about images  |
| `/api/upload/pdf`                 | POST   | Upload and process PDFs     |
| `/api/documents/:documentId`      | DELETE | Delete PDF document chunks  |
| `/api/tools/execute`              | POST   | Execute supported tools     |

Refer to `server/server.js` for exact request and response formats.

## Security and File Upload Limits

* Maximum PDF size: 5 MB.
* Maximum image size: 5 MB.
* Supported image formats: JPG, PNG, WEBP.
* PDF signature validation.
* Image signature validation.
* API rate limiting.
* CORS origin restrictions.
* Environment variables excluded from Git.

## Current Limitations

* Real Gemini responses require a valid API key and available API quota.
* Mock mode does not perform actual AI reasoning or image understanding.
* PDF retrieval requires MongoDB Atlas Vector Search.
* Scanned PDFs without extractable text are not supported by the current extraction pipeline.
* Tool selection currently uses application-side detection rather than Gemini native function calling.

## Deployment

The application uses separate frontend and backend deployments.

### Backend Deployment

Recommended configuration:

* Root directory: `server`
* Build/install command: `npm install`
* Start command: `npm start`

Configure the required environment variables in the hosting provider.

Update the backend CORS allowlist with the deployed frontend domain.

### Frontend Deployment

Recommended configuration:

* Build command: `npm run build`
* Output directory: `dist`

Set:

```env
VITE_API_BASE_URL=your_deployed_backend_url
```

Redeploy the frontend after changing environment variables.

## Future Improvements

* Advanced RAG optimization.
* Improved document retrieval.
* Gemini native function calling.
* Better conversation management.
* Additional AI tools.
* Improved multimodal capabilities.

## Author

**Breny Moirangthem**

GitHub: https://github.com/brenymoirangthem
a