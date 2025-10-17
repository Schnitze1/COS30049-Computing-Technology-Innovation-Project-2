# uvicorn serve:app --host 0.0.0.0 --port 8000 --reload
# UI: http://127.0.0.1:8000/docs
import os
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, HTTPException, Path
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from utils.model_io import list_models, load_model
from config import get_model_dir
from utils.predict import run_prediction
import pickle
import numpy as np
import pandas as pd


class PredictRequest(BaseModel):
    instances: List[List[float]]
    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "instances": [
                        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
                    ]
                }
            ]
        }
    }


class PredictResponse(BaseModel):
    model: str
    predictions: List[int]
    probabilities: Optional[List[List[float]]] = None


app = FastAPI(title="Model Inference API", version="1.0.0")

# Load and cache the scaler for 15 selected features
def load_selected_features_scaler():
    """Load the scaler for the 15 selected features"""
    try:
        with open('data_preprocessing/output/feature_metadata.pkl', 'rb') as f:
            metadata = pickle.load(f)
        return metadata.get('selected_features_scaler')
    except Exception as e:
        print(f"Warning: Could not load selected features scaler: {e}")
        return None

# Cache the scaler at module level
selected_features_scaler = load_selected_features_scaler()

def preprocess_input_data(raw_features: List[List[float]]) -> np.ndarray:
    """Preprocess raw input features using the selected features scaler"""
    if selected_features_scaler is None:
        print("Warning: No scaler available, returning raw features")
        return np.array(raw_features)
    
    try:
        # Apply the same scaling used during training for the 15 selected features
        raw_array = np.array(raw_features)
        scaled_features = selected_features_scaler.transform(raw_array)
        return scaled_features
    except Exception as e:
        print(f"Error in preprocessing: {e}")
        return np.array(raw_features)

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "*",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/models")
def get_models():
    """Get list of available models with their feature requirements"""
    models = list_models(out_dir=get_model_dir())
    model_info = {}
    for model_name in models:
        model_info[model_name] = {
            "name": model_name,
            "type": "supervised" if model_name in ['random_forest', 'mlp'] else "unsupervised"
        }
    return model_info


@app.post("/predict/{model_name}", response_model=PredictResponse)
def predict_by_model(model_name: str, request: PredictRequest):
    """Make predictions using a specific model"""
    models = list_models(out_dir=get_model_dir())
    if model_name not in models:
        raise HTTPException(status_code=404, detail=f"Model '{model_name}' not found")
    
    # Preprocess the input data using the same pipeline as training
    processed_instances = preprocess_input_data(request.instances)
    
    model = load_model(model_name, out_dir=get_model_dir())
    preds, proba = run_prediction(model, processed_instances.tolist())
    
    return PredictResponse(
        model=model_name,
        predictions=preds,
        probabilities=proba,
    )


@app.get("/model-architecture/{model_name}")
def get_model_architecture(model_name: str, top_k: int = 5):
    models = list_models(out_dir=get_model_dir())
    if model_name not in models:
        raise HTTPException(status_code=404, detail=f"Model '{model_name}' not found")

    model = load_model(model_name, out_dir=get_model_dir())

    if not hasattr(model, "coefs_"):
        raise HTTPException(status_code=400, detail=f"Model '{model_name}' has no accessible architecture")

    layers = []
    for i, weights in enumerate(model.coefs_):
        edges = []
        for j in range(weights.shape[1]):
            sorted_idx = abs(weights[:, j]).argsort()[::-1][:top_k]
            for src_idx in sorted_idx:
                edges.append({
                    "src": int(src_idx),
                    "tgt": int(j),
                    "weight": float(weights[src_idx, j])
                })

        layers.append({
            "layer_index": i,
            "input_dim": weights.shape[0],
            "output_dim": weights.shape[1],
            "edges": edges
        })

    return {
        "n_layers": model.n_layers_,
        "hidden_layer_sizes": model.hidden_layer_sizes,
        "out_activation": model.out_activation_,
        "layers": layers
    }

if __name__ == "__main__":
    import uvicorn
    os.makedirs(get_model_dir(), exist_ok=True)
    uvicorn.run("serve:app", host="0.0.0.0", port=8000, reload=True)