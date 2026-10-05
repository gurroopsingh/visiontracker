"""
VisionTracker AI Microservice
==============================
FastAPI service providing CLIP-based image similarity matching.

Endpoints:
    GET  /health          — Liveness / readiness probe
    POST /embed           — Generate embedding for a single image
    POST /match           — Compare two images and return similarity score
    POST /match-batch     — Compare one image against multiple candidates
"""

import os
import io
import time
import logging
from contextlib import asynccontextmanager
from typing import Optional

import numpy as np
import torch
from PIL import Image
from fastapi import FastAPI, File, UploadFile, Form, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from transformers import CLIPProcessor, CLIPModel

# ── Configuration ──────────────────────────────────────────────────────────────
load_dotenv()

MODEL_NAME: str = os.getenv("CLIP_MODEL_NAME", "openai/clip-vit-base-patch32")
AI_MATCH_THRESHOLD: float = float(os.getenv("AI_MATCH_THRESHOLD", "0.75"))
PORT: int = int(os.getenv("AI_SERVICE_PORT", "8000"))
SERVICE_VERSION = "1.0.0"

# ── Logging ────────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
log = logging.getLogger("ai-service")

# ── CLIP Model (singleton, loaded at startup) ──────────────────────────────────
_model: Optional[CLIPModel] = None
_processor: Optional[CLIPProcessor] = None


def load_model() -> None:
    """Load CLIP model into memory. Called once at startup."""
    global _model, _processor
    log.info(f"Loading CLIP model: {MODEL_NAME} …")
    t0 = time.time()
    _processor = CLIPProcessor.from_pretrained(MODEL_NAME)
    _model = CLIPModel.from_pretrained(MODEL_NAME)
    _model.eval()
    log.info(f"CLIP model loaded in {time.time() - t0:.2f}s — threshold={AI_MATCH_THRESHOLD}")


def get_model_and_processor():
    if _model is None or _processor is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="CLIP model is not yet loaded. Retry in a moment.",
        )
    return _model, _processor


# ── Helpers ────────────────────────────────────────────────────────────────────

def bytes_to_image(data: bytes) -> Image.Image:
    """Convert raw bytes to a PIL Image, enforcing RGB mode."""
    try:
        img = Image.open(io.BytesIO(data))
        return img.convert("RGB")
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Could not decode image: {exc}",
        )


def compute_embedding(image: Image.Image) -> np.ndarray:
    """Run image through CLIP vision encoder and return L2-normalised embedding."""
    model, processor = get_model_and_processor()
    inputs = processor(images=image, return_tensors="pt")
    with torch.no_grad():
        features = model.get_image_features(**inputs)
    # transformers >= 4.x may return a Tensor or a ModelOutput depending on version.
    # Unwrap if needed.
    if hasattr(features, "image_embeds"):
        features = features.image_embeds
    elif hasattr(features, "pooler_output"):
        features = features.pooler_output
    elif not isinstance(features, torch.Tensor):
        # Last resort: extract first tensor value from dataclass
        features = list(features.values())[0]
    # L2-normalise so cosine similarity == dot product
    features = features / features.norm(dim=-1, keepdim=True)
    return features.squeeze().cpu().numpy()


def cosine_similarity(a: np.ndarray, b: np.ndarray) -> float:
    """Compute cosine similarity between two unit-norm vectors."""
    return float(np.dot(a, b))


# ── App lifecycle ──────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    load_model()
    yield
    log.info("AI service shutting down.")


# ── FastAPI App ────────────────────────────────────────────────────────────────
app = FastAPI(
    title="VisionTracker AI Service",
    description="CLIP-based image similarity matching for campus lost & found",
    version=SERVICE_VERSION,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Routes ────────────────────────────────────────────────────────────────────

@app.get("/health", tags=["System"])
def health():
    """Liveness + readiness probe. Used by Docker & Kubernetes health checks."""
    model_ready = _model is not None and _processor is not None
    return {
        "status": "ok" if model_ready else "loading",
        "model": MODEL_NAME,
        "model_version": SERVICE_VERSION,
        "threshold": AI_MATCH_THRESHOLD,
        "device": "cpu",
    }


@app.post("/embed", tags=["AI"])
async def embed(file: UploadFile = File(...)):
    """
    Generate a CLIP image embedding for a single uploaded image.
    Returns the embedding vector as a JSON array.
    """
    data = await file.read()
    image = bytes_to_image(data)
    embedding = compute_embedding(image)
    return {
        "success": True,
        "model": MODEL_NAME,
        "embedding_dim": len(embedding),
        "embedding": embedding.tolist(),
    }


@app.post("/match", tags=["AI"])
async def match(
    image_a: UploadFile = File(...),
    image_b: UploadFile = File(...),
):
    """
    Compare two images and return a similarity score.

    Returns:
        similarity  — cosine similarity (0.0 – 1.0)
        is_match    — True if similarity >= AI_MATCH_THRESHOLD
        threshold   — the threshold used (from env)
        model       — model name / version
    """
    data_a, data_b = await image_a.read(), await image_b.read()
    img_a = bytes_to_image(data_a)
    img_b = bytes_to_image(data_b)

    emb_a = compute_embedding(img_a)
    emb_b = compute_embedding(img_b)

    similarity = cosine_similarity(emb_a, emb_b)
    is_match = similarity >= AI_MATCH_THRESHOLD

    log.info(f"/match: similarity={similarity:.4f} is_match={is_match}")

    return {
        "success": True,
        "similarity": round(similarity, 6),
        "match": is_match,        # alias used by Node.js matchService.js
        "is_match": is_match,
        "threshold": AI_MATCH_THRESHOLD,
        "model": MODEL_NAME,
        "model_version": SERVICE_VERSION,
    }


@app.post("/match-batch", tags=["AI"])
async def match_batch(
    query_image: UploadFile = File(...),
    candidate_images: list[UploadFile] = File(...),
    candidate_ids: str = Form(...),   # comma-separated item IDs
):
    """
    Compare one query image against multiple candidate images in a single call.

    - candidate_ids: comma-separated list matching the order of candidate_images.

    Returns a ranked list of {id, similarity, is_match} objects sorted by
    descending similarity, for fast look-up in the Node.js backend.
    """
    # Decode query
    query_data = await query_image.read()
    query_img = bytes_to_image(query_data)
    query_emb = compute_embedding(query_img)

    ids = [cid.strip() for cid in candidate_ids.split(",")]
    if len(ids) != len(candidate_images):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"candidate_ids count ({len(ids)}) != candidate_images count ({len(candidate_images)})",
        )

    results = []
    for cid, candidate_file in zip(ids, candidate_images):
        cdata = await candidate_file.read()
        cimg = bytes_to_image(cdata)
        cemb = compute_embedding(cimg)
        sim = cosine_similarity(query_emb, cemb)
        results.append({
            "id": cid,
            "similarity": round(sim, 6),
            "is_match": sim >= AI_MATCH_THRESHOLD,
        })

    # Sort by similarity descending
    results.sort(key=lambda r: r["similarity"], reverse=True)

    log.info(f"/match-batch: {len(results)} candidates, top={results[0] if results else None}")

    return {
        "success": True,
        "threshold": AI_MATCH_THRESHOLD,
        "model": MODEL_NAME,
        "model_version": SERVICE_VERSION,
        "results": results,
    }
