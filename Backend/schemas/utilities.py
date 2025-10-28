from typing import List, Dict, Any
from pydantic import BaseModel

class DatasetCompareResponse(BaseModel):
	reference_dataset: str
	records_uploaded: int
	features_uploaded: int
	matching_features: int
	similarity_score: float
	missing_features: List[str]
	extra_features: List[str]

class ModelArchitectureResponse(BaseModel):
	n_layers: int
	hidden_layer_sizes: List[int] | Any
	out_activation: str
	layers: List[Dict[str, Any]]