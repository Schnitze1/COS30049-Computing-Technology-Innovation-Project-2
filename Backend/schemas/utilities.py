"""Pydantic models for utility API endpoints."""

from typing import List, Dict, Any, Union
from pydantic import BaseModel


class DatasetCompareResponse(BaseModel):
    """Response model for dataset comparison endpoint."""
    reference_dataset: str
    records_uploaded: int
    features_uploaded: int
    matching_features: int
    similarity_score: float
    missing_features: List[str]
    extra_features: List[str]


class ModelArchitectureResponse(BaseModel):
    """Response model for model architecture endpoint."""
    n_layers: int
    hidden_layer_sizes: Union[List[int], Any]  # Tolerant type for sklearn
    out_activation: str
    layers: List[Dict[str, Any]]