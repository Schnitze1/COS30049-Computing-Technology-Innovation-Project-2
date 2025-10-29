from typing import List, Optional, Tuple
from fastapi import HTTPException
from utils.model_io import list_models, load_model
from config import get_model_dir
from utils.predict import run_prediction
from .features import preprocess_input_data


def ensure_model_exists(model_name: str) -> None:
    models = list_models(out_dir=get_model_dir())
    if model_name not in models:
        raise HTTPException(status_code=404, detail={"message": f"Model '{model_name}' not found"})


def predict_with_preprocessing(model_name: str, instances: List[List[float]]) -> Tuple[List[int], Optional[List[List[float]]]]:
    ensure_model_exists(model_name)
    processed = preprocess_input_data(instances)
    model = load_model(model_name, out_dir=get_model_dir())
    preds, proba = run_prediction(model, processed.tolist())
    return preds, proba


