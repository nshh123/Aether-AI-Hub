# Aether AI Hub

Aether AI Hub is a modern, high-performance **LLM API Gateway** and **FinOps Analytics Dashboard**. It acts as a transparent, OpenAI-compatible proxy to cloud LLMs (such as GitHub Models and Azure AI Inference), automatically measuring request latency, tracking token usage, calculating token-level costs, and providing rich visual analytics.

With Aether AI Hub, teams gain full visibility and control over their LLM consumption, latency distribution, and cost efficiency in real-time.

---

## 🚀 Features

- **OpenAI-Compatible Gateway**: Simple drop-in proxy at `/v1/chat/completions` that seamlessly forwards payloads to your LLM provider.
- **FinOps Cost Interceptor**: Automatically calculates cost based on precise input/output token rates (configured for free tiers or custom paid tiers).
- **Latency & Performance Tracking**: Monitors wall-clock response latency per model to detect performance degradation or upstream anomalies.
- **Interactive Analytics Dashboard**: Beautiful React dashboard built with Vite, Tailwind CSS, and Recharts showing:
  - **7-Day Aggregated Metrics**: Requests, token consumption, latency trends, and cumulative cost.
  - **Daily Cost Trends**: Graphing token costs over time.
  - **Token Volume Distribution**: Breakdowns of input vs. output token counts.
  - **Model Latency Tracking**: Average request latency over time segmented by active models.
- **Production-Ready & Highly Deployable**: Includes predefined configs for deployment to **Render** (backend), **Vercel** or **Netlify** (frontend).

---

## 🛠️ Tech Stack

### Backend
- **FastAPI**: Fast, asynchronous Web API framework in Python 3.10+.
- **SQLAlchemy**: ORM for robust database connection management.
- **SQLite**: Local, lightweight relational database storage.
- **HTTPX**: Non-blocking asynchronous HTTP client for request proxying.
- **Uvicorn**: High-performance ASGI web server.

### Frontend
- **React 19 & TypeScript**: Component-driven UI framework with strict type safety.
- **Vite 8**: Next-generation, ultra-fast frontend build tooling.
- **Tailwind CSS 4**: Modern utility-first CSS framework for slick styling.
- **Recharts**: Modular charting library for rich, animated visual reports.
- **Lucide React**: Clean and polished vector iconography.

---

## 📐 Architecture Overview

```
 ┌───────────────┐
 │  LLM Clients  │ (OpenAI SDK, LangChain, curl, etc.)
 └───────┬───────┘
         │  POST /v1/chat/completions
         ▼
 ┌───────────────┐           ┌────────────────────┐
 │               │ ────────> │ GitHub/Azure LLMs  │
 │ Aether API    │  Proxy    └─────────┬──────────┘
 │ Gateway       │                     │ Returns
 │ (FastAPI)     │ <───────────────────┘ Response + Usage
 │               │
 │               │ ── Logging ──> ┌──────────────┐
 └───────┬───────┘                │  SQLite DB   │
         │                        │ (aether.db)  │
         │ GET /api/metrics/dash  └──────┬───────┘
         ▼                               │
 ┌───────────────┐                       │ Reads
 │ Aether Dashboard                      │
 │ (React/Vite)  │ <─────────────────────┘
 └───────────────┘
```

---

## ⚙️ Environment Variables

### Backend Configuration
Create a `.env` file inside the `backend` directory:
```env
GITHUB_TOKEN=your_github_token_here
GITHUB_BASE_URL=https://models.inference.ai.azure.com
```
- `GITHUB_TOKEN`: Your GitHub Personal Access Token (PAT) authorized to use GitHub Models, or your Azure API key.
- `GITHUB_BASE_URL`: Base URL for the upstream LLM host (defaults to GitHub Models endpoint).

---

## 📦 Getting Started

### Prerequisites
- **Python 3.10+**
- **Node.js 18+ & npm**

### 1. Run the Backend (FastAPI)

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   # On Windows
   python -m venv venv
   venv\Scripts\activate

   # On macOS/Linux
   python3 -m venv venv
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the development server:
   ```bash
   uvicorn main:app --reload --port 8000
   ```
   *The backend will be running at `http://127.0.0.1:8000`.*
   *Interactive API Docs (Swagger) will be available at `http://127.0.0.1:8000/docs`.*

---

### 2. Run the Frontend (React + Vite)

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install the frontend dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
   *The frontend application will be running at `http://localhost:5173`.*

---

## 📊 Gateway Verification & Testing

To test if the gateway is proxying correctly, you can make a standard OpenAI-compatible curl request pointing to Aether's proxy endpoint:

```bash
curl -X POST http://127.0.0.1:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o-mini",
    "messages": [
      {"role": "system", "content": "You are a helpful assistant."},
      {"role": "user", "content": "Hello! Say hi in 3 words."}
    ]
  }'
```

Once the request completes:
1. The response will match the standard OpenAI format.
2. The request logs, latency, and estimated costs will be persisted to `aether.db`.
3. Open your browser to `http://localhost:5173` to see the new metrics populated in the live dashboard charts.

---

## 📂 Project Structure

```
Aether AI Hub/
├── backend/
│   ├── main.py              # FastAPI app setup, gateway proxy, and analytics endpoints
│   ├── models.py            # SQLAlchemy schema for RequestLog
│   ├── database.py          # SQLite engine & session management
│   ├── pricing.py           # Model pricing configurations
│   ├── requirements.txt     # Python backend dependencies
│   └── aether.db            # SQLite database file (auto-generated)
├── frontend/
│   ├── src/                 # React source code (components, charts, dashboard)
│   ├── package.json         # npm dependencies & script commands
│   ├── tailwind.config.js   # Custom Tailwind system configurations
│   ├── vite.config.js       # Vite server proxy configurations
│   └── index.html           # Main SPA entry point
├── render.yaml              # Render IAC deployment definition
└── LICENSE                  # MIT License
```

---

## 🌐 Deployment

### Backend
The repository includes a `render.yaml` configuration for deploying the FastAPI backend as a web service on **Render**:
1. Connect this repo to your Render dashboard.
2. Render will automatically provision the FastAPI service and configure the SQLite disk.

### Frontend
Deploy the frontend static build to **Vercel** or **Netlify**:
1. Build the production package via `npm run build`.
2. Deploy the resulting `/dist` folder using the included `vercel.json` or `netlify.toml` redirects settings to enable single-page-app routing.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more details.
