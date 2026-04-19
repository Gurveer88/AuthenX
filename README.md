# AuthenX 

> **A Multi-Modal, Agentic Generator-Validator Pipeline powered by Amazon Bedrock**

AuthenX is an intelligent orchestration platform built for high-quality, validated generations. By utilizing a dual-model LLM framework (Generator $\rightarrow$ Validator), AuthenX ensures that the requested UI components, charts, and data structures are robustly reviewed and refined before being presented to the user.

---

##  Features

- **Agentic Pipeline**: Advanced continuous loop where a Generator LLM builds content and a Validator LLM critiques it. The pipeline iterates iteratively until the output adheres to rigorous validation thresholds or reaches the max rounds.
- **Multi-Modal Renderers**: Dynamic extraction and visualization of multiple data types seamlessly inside a React UI:
  -  **Charts** (via `Chart.js`)
  -  **Graphs & Networks** (via `react-force-graph-2d`)
  -  **Flowcharts & Diagrams** (via `mermaid.js`)
  -  **Markdown Documents & Forms**
- **LLM-Powered Search**: Integrates `SerpAPI` for augmenting generations with real-time web context.
- **FastAPI Backend**: Asynchronous operations, session handling, and background task processing for scalable UX.
- **Interactive API Documentation**: Swagger UI automatically available.

---

##  Architecture

AuthenX adopts a continuous validation flow:
1. **Prompt & Context Injection**: User submits a complex prompt with a specified tool modality (e.g., "Generate a flowchart detailing API OAuth2").
2. **Generation**: The **Generator Model** draft an initial output.
3. **Validation**: The **Validator Model** evaluates the output strictly against the modality schema and constraints. 
4. **Feedback Loop**: If validation fails, feedback is iteratively piped back to the Generator for revision.
5. **Client Presentation**: Validated payload is sent to the React frontend engine which routes the structured JSON/markdown to the correct dynamic component renderer.

---

##  Tech Stack 

**Backend:**
- **Python Framework**: `FastAPI`
- **Models**: `Amazon Bedrock` natively driving Meta's `Llama-4-maverick-17b-instruct-v1:0`
- **LLM Orchestration**: `LangChain AWS`
- **Search**: `SerpAPI`

**Frontend:**
- **Framework**: `React 19` + `Vite`
- **Styling**: `TailwindCSS v4`
- **Visualization Libraries**: `react-chartjs-2`, `react-force-graph-2d`, `mermaid`, `react-markdown`

---

##  Getting Started

To run AuthenX locally, you will need to start both the Python backend and Vite frontend separately.

### 1. Setup Backend
```bash
cd src/backend
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate
pip install -r requirements.txt
```

**Environment Variables**:
Create a `.env` in `src/backend/` and configure:
```env
AWS_REGION=us-east-1
# Make sure your AWS CLI/Credentials are configured with Bedrock access
GENERATOR_MODEL_ID=us.meta.llama4-maverick-17b-instruct-v1:0
VALIDATOR_MODEL_ID=us.meta.llama4-maverick-17b-instruct-v1:0
MAX_VALIDATION_ROUNDS=10
SERPAPI_KEY=your_serpapi_key
```

**Run FastAPI App:**
```bash
fastapi dev main.py
# Server starts on http://localhost:8000
```

### 2. Setup Frontend
```bash
cd src/frontend
pnpm install  # (or npm install / yarn)
pnpm run dev
# Vite runs on http://localhost:5173
```

---