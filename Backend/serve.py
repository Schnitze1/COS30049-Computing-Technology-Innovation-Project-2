"""FastAPI application for network anomaly detection model inference."""

import os
import time

from config import get_model_dir
from fastapi import FastAPI, File, HTTPException, Request, UploadFile
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from schemas.predict import ModelsResponse, PredictRequest, PredictResponse
from schemas.utilities import DatasetCompareResponse, ModelArchitectureResponse
from services.dataset_compare import compare_dataset_service
from services.model_inspect import model_architecture_service
from services.prediction import (
    ensure_model_exists,
    predict_with_preprocessing_service,
)
from utils.model_io import list_models
from validators.input import validate_input_values


app = FastAPI(title="Model Inference API", version="2.0.0")

# Configure allowed origins for CORS
origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in origins if origin.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# EXCEPTION HANDLERS:
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Handle HTTP exceptions with proper status codes."""
    return JSONResponse(
        status_code=exc.status_code,
        content={"message": exc.detail if isinstance(exc.detail, str) else str(exc.detail)},
    )


# Validation error handler for consistent error payloads
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """
    Handle validation errors with a consistent JSON format.

    :param request: Incoming FastAPI request object.
    :param exc: Exception instance raised during request validation.
    :return: JSONResponse with validation error details.
    """
    return JSONResponse(
        status_code=422,
        content={
            "message": "Validation error",
            "errors": exc.errors(),
        },
    )


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """
    Handle any unhandled exception globally and return a uniform error response.

    :param request: Incoming FastAPI request object.
    :param exc: Unhandled exception instance.
    :return: JSONResponse with status code 500 and error message.
    """
    return JSONResponse(
        status_code=500,
        content={"message": f"An unexpected error occurred: {str(exc)}"},
    )


@app.middleware("http")
async def log_requests(request: Request, call_next):
    """
    Middleware to log and measure request processing time.

    :param request: Incoming HTTP request.
    :param call_next: Callable that executes the next middleware or route.
    :return: FastAPI Response object with timing header.
    """
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response


@app.get("/health")
def health():
    """
    Health check endpoint to verify API availability.

    :return: Dictionary indicating API status.
    """
    return {"status": "ok"}


@app.get("/models")
def get_models():
    """
    Retrieve a list of available trained models with metadata.

    :return: ModelsResponse containing model names and their types.
    """
    models = list_models(out_dir=get_model_dir())
    return ModelsResponse(
        models=[
            {
                "model_name": model_name,
                "model_type": (
                    "supervised"
                    if model_name in ["random_forest", "mlp"]
                    else "unsupervised"
                ),
            }
            for model_name in models
        ]
    )


@app.post(
    "/predict/{model_name}",
    response_model=PredictResponse,
    tags=["Inference API"],
)
def predict(model_name: str, request: PredictRequest):
    """
    Perform prediction using a specified model on given input data.

    :param model_name: Name of the model to be used for inference.
    :param request: PredictRequest containing input feature values.
    :return: PredictResponse with predictions and probabilities.
    """
    ensure_model_exists(model_name)
    validate_input_values(
        request.input_values,
        allow_negative=False,
        expected_num_features=15,
    )

    preds, proba = predict_with_preprocessing_service(
        model_name,
        request.input_values,
    )

    return PredictResponse(
        model=model_name,
        predictions=preds,
        probabilities=proba,
    )


@app.get(
    "/model-architecture/{model_name}",
    response_model=ModelArchitectureResponse,
    tags=["Utilities"],
)
def get_model_architecture(model_name: str, top_k: int = 2):
    """
    Retrieve and summarize a neural network model’s architecture.

    :param model_name: Name of the model whose architecture to inspect.
    :param top_k: Number of top layers to display in the summary.
    :return: ModelArchitectureResponse containing architecture details.
    """
    return ModelArchitectureResponse(
        **model_architecture_service(model_name, top_k=top_k)
    )


@app.post("/compare-dataset", response_model=DatasetCompareResponse, tags=["Utilities"])
async def compare_dataset_file(file: UploadFile = File(...)):
    """Compare a dataset file with the training dataset (TII-SSRC-23)."""
    return DatasetCompareResponse(**compare_dataset_service(file.file))


if __name__ == "__main__":
    import uvicorn

    # Ensure model directory exists before running the API server
    os.makedirs(get_model_dir(), exist_ok=True)
    uvicorn.run("serve:app", host="0.0.0.0", port=8000, reload=True)
