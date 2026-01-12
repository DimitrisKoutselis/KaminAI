# KaminAI

A personal blog and portfolio website built with FastAPI (Clean Architecture), React (Vite + TypeScript), and MongoDB, featuring an AI-powered chat assistant.

## Features

- **Blog Platform**: Create, edit, and publish markdown-based articles
- **Portfolio Showcase**: Display your GitHub projects automatically
- **Admin Dashboard**: Manage articles with a clean admin interface
- **AI Chat Assistant**: Multi-agent chat system that can answer questions about your blog posts and GitHub repositories

## Tech Stack

### Backend

- **FastAPI** - Modern Python web framework
- **MongoDB** - Document database for articles
- **LangGraph** - Multi-agent orchestration
- **Google Gemini** - LLM for chat responses
- **FAISS** - Vector store for semantic code search

### Frontend

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Client-side routing

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Google API Key (for AI chat features)

### Setup

1. Clone the repository:

```bash
git clone https://github.com/DimitrisKoutselis/KaminAI.git
cd KaminAI
```

2. Create a `.env` file in the project root:

```bash
cp .env.example .env
```

3. Configure your environment variables in `.env`:

```env
# Required for AI Chat
GOOGLE_API_KEY=your_google_api_key_here

# Optional - for GitHub portfolio integration
GITHUB_USERNAME=YourGitHubUsername
GITHUB_TOKEN=your_github_token_here
```

4. Create a `my_bio.md` file in the project root with information about yourself (used by the AI to respond as you).

5. Start the application:

```bash
docker-compose up --build
```

### Access Points

| Service     | URL                           | Description      |
| ----------- | ----------------------------- | ---------------- |
| Frontend    | <http://localhost:3000>       | React application |
| Backend API | <http://localhost:8000>       | FastAPI endpoints |
| API Docs    | <http://localhost:8000/docs>  | Swagger UI       |

## AI Chat System

The chat assistant uses a multi-agent architecture powered by LangGraph:

### Agents

1. **Orchestrator Agent** - Routes user queries to the appropriate specialist agent
2. **Repo Investigator Agent** - Answers questions about GitHub repositories using FAISS semantic search
3. **Blog Explainer Agent** - Answers questions about blog articles from MongoDB
4. **Response Generator Agent** - Generates final responses in the persona defined in `my_bio.md`

### Chat Features

- **Semantic Code Search**: Uses FAISS vector store with Google's text-embedding-004 model
- **Streaming Responses**: Real-time SSE streaming for smooth chat experience
- **Markdown Support**: Full markdown rendering including code blocks with syntax highlighting
- **Context-Aware**: Agents have access to your actual code and blog content

### Chat Setup

1. Get a Google API Key from [Google AI Studio](https://aistudio.google.com/apikey)
2. Add it to your `.env` file as `GOOGLE_API_KEY`
3. (Optional) Index your GitHub repos by calling `POST /api/v1/chat/index-repos`
4. (Optional) Enable LangSmith tracing for debugging by setting `LANGSMITH_TRACING=true`

## Project Structure

```text
KaminAI/
├── src/                          # Backend source code
│   ├── domain/                   # Business entities and interfaces
│   │   ├── entities/             # Article entity
│   │   └── repositories/         # Repository interfaces
│   ├── application/              # Use cases and services
│   │   ├── services/             # Article, Portfolio services
│   │   └── dto/                  # Data transfer objects
│   ├── infrastructure/           # External implementations
│   │   ├── persistence/          # MongoDB implementation
│   │   ├── config/               # Settings
│   │   └── ai/                   # AI chat system
│   │       ├── agents/           # LangGraph agents
│   │       ├── tools/            # Agent tools
│   │       ├── mcp/              # GitHub & MongoDB clients
│   │       └── vectorstore/      # FAISS vector store
│   └── presentation/             # API layer
│       ├── api/v1/               # REST endpoints
│       └── schemas/              # Request/response schemas
├── frontend/                     # React frontend
│   ├── src/
│   │   ├── components/           # Reusable components
│   │   │   └── chat/             # Chat UI components
│   │   ├── pages/                # Page components
│   │   ├── hooks/                # Custom React hooks
│   │   ├── services/             # API clients
│   │   └── types/                # TypeScript types
│   ├── Dockerfile
│   └── nginx.conf
├── my_bio.md                     # Your bio for AI persona
├── docker-compose.yml
├── Dockerfile
└── pyproject.toml
```

## API Endpoints

### Articles

- `POST /api/v1/articles` - Create article
- `GET /api/v1/articles` - List articles
- `GET /api/v1/articles/{id}` - Get by ID
- `GET /api/v1/articles/slug/{slug}` - Get by slug
- `PUT /api/v1/articles/{id}` - Update article
- `DELETE /api/v1/articles/{id}` - Delete article

### Portfolio

- `GET /api/v1/portfolio/projects` - Get GitHub projects

### Chat

- `POST /api/v1/chat` - Send message (SSE streaming response)
- `POST /api/v1/chat/index-repos` - Index GitHub repositories
- `GET /api/v1/chat/stats` - Get vector store statistics

### Health

- `GET /api/v1/health` - Health check

## Configuration

### Environment Variables

| Variable                | Description                   | Default                                    |
| ----------------------- | ----------------------------- | ------------------------------------------ |
| `MONGODB_URI`           | MongoDB connection string     | `mongodb://admin:password123@mongodb:27017` |
| `MONGODB_DATABASE`      | Database name                 | `kaminai`                                  |
| `GITHUB_TOKEN`          | GitHub personal access token  | Optional                                   |
| `GITHUB_USERNAME`       | Your GitHub username          | Optional                                   |
| `JWT_SECRET_KEY`        | Secret key for JWT tokens     | Required                                   |
| `ADMIN_USERNAME`        | Admin login username          | `admin`                                    |
| `ADMIN_PASSWORD`        | Admin login password          | Required                                   |
| `GOOGLE_API_KEY`        | Google AI API key             | Required for chat                          |
| `GEMINI_MODEL`          | Gemini model for chat         | `gemini-2.5-flash`                         |
| `GEMINI_EMBEDDING_MODEL`| Model for embeddings          | `text-embedding-004`                       |
| `FAISS_INDEX_PATH`      | Path for FAISS index          | `./data/faiss_index`                       |
| `BIO_FILE_PATH`         | Path to bio markdown          | `./my_bio.md`                              |
| `LANGSMITH_API_KEY`     | LangSmith API key             | Optional                                   |
| `LANGSMITH_TRACING`     | Enable LangSmith tracing      | `false`                                    |

## Development

### Running Locally (without Docker)

**Backend:**

```bash
# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # or `.venv\Scripts\activate` on Windows

# Install dependencies
pip install -e .

# Run the server
uvicorn src.main:app --reload
```

**Frontend:**

```bash
cd frontend
npm install
npm run dev
```

### Docker Commands

```bash
# Start all services
docker-compose up --build

# Start in background
docker-compose up --build -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

### Testing and Linting

```bash
# Backend
pytest                           # Run tests
black src/                       # Format code
ruff check src/                  # Lint
mypy src/                        # Type check

# Frontend
cd frontend
npm run lint                     # Lint
npm run build                    # Type check via build
```

## License

MIT
