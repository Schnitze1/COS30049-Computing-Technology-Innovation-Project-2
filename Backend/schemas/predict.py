from typing import List, Optional, Dict, Any
from pydantic import BaseModel

class PredictRequest(BaseModel):
	input_values: List[List[float]]

class PredictResponse(BaseModel):
	model: str
	predictions: List[int]
	probabilities: Optional[List[List[float]]] = None

class ModelsResponse(BaseModel):
	models: List[Dict[str, Any]]