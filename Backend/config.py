"""Configuration module for the network anomaly detection system."""

import os


def get_model_dir() -> str:
    """Get the model directory path from environment variable or default.

    Returns:
        str: Path to the directory containing trained models.
    """
    return os.getenv("MODEL_DIR", "cache/models")
