"""FastAPI application for network anomaly detection model inference."""

import os
import time

from config import get_model_dir
from fastapi import FastAPI, File, Request, UploadFile
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from schemas.predict import ModelsResponse, PredictRequest, PredictResponse
from schemas.utilities import DatasetCompareResponse, ModelArchitectureResponse
from services.dataset_compare import compare_dataset_service
from services.model_inspect import model_architecture_service
from services.prediction import ensure_model_exists, predict_with_preprocessing_service
from utils.model_io import list_models
from validators.input import validate_input_values

# FASTAPI APP SETUP:
app = FastAPI(title="Model Inference API", version="2.0.0")
origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")

# CORS Middleware: allow requests from the frontend (localhost or production environment).
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in origins if o.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# EXCEPTION HANDLERS:
# Validation error handler for consistent error payloads
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle validation errors with consistent error format."""
    return JSONResponse(
        status_code=422,
        content={
            "message": "Validation error",
            "errors": exc.errors(),
        },
    )


# Global Exception Handler: bind to all unhandled exceptions to catch all exceptions.
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Handle unexpected errors with consistent error format."""
    return JSONResponse(
        status_code=500, content={"message": f"An unexpected error occurred: {str(exc)}"}
    )


# Middleware for Debugging: track req and res cycles, execution time
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log request processing time and add performance headers."""
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response


# ENDPOINTS:
@app.get("/health")
def health():
    """Health check endpoint."""
    return {"status": "ok"}


@app.get("/models")
def get_models():
    """Get list of available models with metadata."""
    models = list_models(out_dir=get_model_dir())
    return ModelsResponse(
        models=[
            {
                "model_name": model_name,
                "model_type": (
                    "supervised" if model_name in ["random_forest", "mlp"] else "unsupervised"
                ),
            }
            for model_name in models
        ]
    )


@app.post("/predict/{model_name}", response_model=PredictResponse, tags=["Inference API"])
def predict(model_name: str, request: PredictRequest):
    """
    Accepts raw input data, internally handles data scaling at backend for model inference :)
    Model existence and input data validation are handled in the below functions.
    """
    ensure_model_exists(model_name)
    validate_input_values(request.input_values, allow_negative=False, expected_num_features=15)
    preds, proba = predict_with_preprocessing_service(model_name, request.input_values)

    return PredictResponse(model=model_name, predictions=preds, probabilities=proba)


@app.get(
    "/model-architecture/{model_name}", response_model=ModelArchitectureResponse, tags=["Utilities"]
)
def get_model_architecture(model_name: str, top_k: int = 2):
    """Get the architecture of a neural network model."""
    return ModelArchitectureResponse(**model_architecture_service(model_name, top_k=top_k))


@app.post("/compare-dataset", response_model=DatasetCompareResponse, tags=["Utilities"])
def compare_dataset_file(file: UploadFile = File(...)):
    """Compare a dataset file with the training dataset (TII-SSRC-23)."""
    return DatasetCompareResponse(**compare_dataset_service(file.file))


if __name__ == "__main__":
    import uvicorn

    os.makedirs(
        get_model_dir(), exist_ok=True
    )  # Flexible model directory path, default: cache/models
    uvicorn.run("serve:app", host="0.0.0.0", port=8000, reload=True)
