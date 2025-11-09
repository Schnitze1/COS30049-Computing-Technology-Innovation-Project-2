from typing import Any, Dict, List, Union
from pydantic import BaseModel

"""Pydantic models for utility API endpoints."""


class DatasetCompareResponse(BaseModel):
    """Response model for the dataset comparison endpoint."""

    reference_dataset: str
    records_uploaded: int
    features_uploaded: int
    matching_features: int
    similarity_score: float
    missing_features: List[str]
    extra_features: List[str]

    class Config:
        json_schema_extra = {
            "example": {
                "reference_dataset": "TII-SSRC-23",
                "records_uploaded": 1000,
                "features_uploaded": 15,
                "matching_features": 12,
                "similarity_score": 0.8,
                "missing_features": ["feature_x", "feature_y"],
                "extra_features": ["new_feature_a"],
            }
        }


class ModelArchitectureResponse(BaseModel):
    """Response model for the model architecture endpoint."""

    n_layers: int
    hidden_layer_sizes: Union[List[int], Any]  # Tolerant type for sklearn
    out_activation: str
    layers: List[Dict[str, Any]]

    class Config:
        json_schema_extra = {
            "example": {
                "n_layers": 3,
                "hidden_layer_sizes": [100, 100],
                "out_activation": "logistic",
                "layers": [
                    {
                        "layer_index": 0,
                        "input_dim": 15,
                        "output_dim": 100,
                        "edges": [
                            {"src": 0, "tgt": 0, "weight": 0.123},
                            {"src": 1, "tgt": 0, "weight": -0.456},
                        ],
                    },
                    {
                        "layer_index": 1,
                        "input_dim": 100,
                        "output_dim": 100,
                        "edges": [
                            {"src": 0, "tgt": 0, "weight": 0.789},
                            {"src": 1, "tgt": 1, "weight": -0.321},
                        ],
                    },
                ],
            }
        }
