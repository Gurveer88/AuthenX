from __future__ import annotations
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.receive import router as receive_router
from routes.send import router as send_router
from routes.sessions import router as sessions_router
from routes.download import router as download_router
from contextlib import asynccontextmanager
from store import init_db



logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-7s | %(name)s | %(message)s",
    datefmt="%H:%M:%S",
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield

app = FastAPI(
    title="Gen-Val API",
    description=(
        "A dual-model Generator → Validator pipeline powered by Amazon Bedrock. "
        "Submit a prompt + tool type and receive validated, high-quality output."
    ),
    version="0.1.0",
    lifespan=lifespan,
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(receive_router, tags=["receive"])
app.include_router(send_router, tags=["send"])
app.include_router(sessions_router, tags=["sessions"])
app.include_router(download_router, tags=["download"])


@app.get("/", tags=["health"])
def health():
    return {
        "status": "ok",
        "service": "gen-val-api",
        "version": "0.1.0",
        "endpoints": {
            "receive": "POST /receive  — submit prompt + tool",
            "send": "GET /send/{task_id}  — retrieve result",
            "send_all": "GET /send  — list all tasks",
            "docs": "GET /docs  — interactive API docs",
        },
    }