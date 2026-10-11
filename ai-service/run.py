#!/usr/bin/env python3
"""
Startup script for the VisionTracker AI microservice.
Usage:
    python run.py
"""
import os
from dotenv import load_dotenv
import uvicorn

load_dotenv()

if __name__ == "__main__":
    port = int(os.getenv("AI_SERVICE_PORT", "8000"))
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=True,
        log_level="info",
    )
