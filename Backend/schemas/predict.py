from typing import Any, Dict, List, Optional
from pydantic import BaseModel

"""Pydantic models for prediction API requests and responses."""


class PredictRequest(BaseModel):
    """Request model for the prediction endpoint."""

    input_values: List[List[float]]

    class Config:
        json_schema_extra = {
            "example": {
                "input_values": [
                    [
                        0.1, 0.2, 0.3, 0.4, 0.5,
                        0.6, 0.7, 0.8, 0.9, 1.0,
                        1.1, 1.2, 1.3, 1.4, 1.5
                    ]
                ]
            }
        }


class PredictResponse(BaseModel):
    """Response model for the prediction endpoint."""

    model: str
    predictions: List[int]
    probabilities: Optional[List[List[float]]] = None

    class Config:
        json_schema_extra = {
            "example": {
                "model": "mlp",
                "predictions": [0, 1],
                "probabilities": [
                    [0.9, 0.1],
                    [0.2, 0.8]
                ],
            }
        }


class ModelsResponse(BaseModel):
    """Response model for the models listing endpoint."""

    models: List[Dict[str, Any]]

    class Config:
        json_schema_extra = {
            "example": {
                "models": [
                    {"model_name": "random_forest", "model_type": "supervised"},
                    {"model_name": "dbscan", "model_type": "unsupervised"},
                ]
            }
        }
