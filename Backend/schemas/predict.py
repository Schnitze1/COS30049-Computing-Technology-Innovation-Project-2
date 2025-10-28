"""Pydantic models for prediction API requests and responses."""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel


class PredictRequest(BaseModel):
    """Request model for prediction endpoint."""
    input_values: List[List[float]]


class PredictResponse(BaseModel):
    """Response model for prediction endpoint."""
    model: str
    predictions: List[int]
    probabilities: Optional[List[List[float]]] = None


class ModelsResponse(BaseModel):
    """Response model for models listing endpoint."""
    models: List[Dict[str, Any]]