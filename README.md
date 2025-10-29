## Auris AI - Network Anomaly Detection

Detect unusual or potentially malicious network activity by distinguishing normal behaviour from anomalies using a mix of supervised, unsupervised, and deep learning models.

![Auris demo](frontend/public/auris.gif)

Live site: [auris-network-anomaly-detection-ai.vercel.app](https://auris-network-anomaly-detection-ai.vercel.app/)


## Quick Start

### Backend

```bash
cd Backend
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt

# Start API server
uvicorn serve:app --host 127.0.0.1 --port 8000 --reload
```
- Backend SwaggerUI: `http://127.0.0.1:8000/docs`.

- Optional backend data preprocessing & models training:
```bash
# (Optional): Preprocess data (creates processed_data.npz and feature_metadata.pkl)
python data_preprocessing\data_cleaning.py

# (Optional): Train and evaluate models (caches to Backend/cache/models)
python main.py
```

### Frontend

```bash
cd frontend
npm install
npm start
```
Front end URL: `http://127.0.0.1:3000`.
The frontend expects the backend at `http://127.0.0.1:8000`.

### Testing

**Backend Testing:**
```bash
cd Backend
pytest -q
```

**Test Coverage:**
- **Unit Tests**: Input validation (`test_validators.py`)
- **API Tests**: All endpoints with TestClient (`test_api.py`)
- **Integration Tests**: End-to-end prediction workflow
- **Error Handling**: 422, 404, 400, 500 status codes
- **Data Validation**: Non-negative inputs, 15-feature requirement

**Test Files:**
- `tests/conftest.py` - Pytest configuration and fixtures
- `tests/test_validators.py` - Unit tests for input validation
- `tests/test_api.py` - API endpoint integration tests

## API Endpoints

The FastAPI backend provides 5 RESTful endpoints:

| # | Method | Endpoint | Description | Tags |
|---|--------|----------|-------------|------|
| 1 | `GET` | `/health` | Health check endpoint | - |
| 2 | `GET` | `/models` | List all available ML models | - |
| 3 | `POST` | `/predict/{model_name}` | Make predictions using specified model | Inference API |
| 4 | `GET` | `/model-architecture/{model_name}` | Get neural network architecture details | Utilities |
| 5 | `POST` | `/compare-dataset` | Compare uploaded dataset with reference | Utilities |

### Detailed API Documentation

#### 1. `GET /health`
**Description**: Health check endpoint to verify API server status.
**Response (200 OK)**:
```json
{
  "status": "ok"
}
```

#### 2. `GET /models`
**Description**: Lists all available machine learning models with metadata.
**Response (200 OK)**:
```json
{
  "models": [
    {
      "model_name": "random_forest",
      "model_type": "supervised"
    },
    {
      "model_name": "mlp", 
      "model_type": "supervised"
    },
    {
      "model_name": "dbscan",
      "model_type": "unsupervised"
    }
  ]
}
```

#### 3. `POST /predict/{model_name}`
**Description**: Makes predictions using the specified model. Accepts raw (unscaled) input values.
**Parameters**:
- `model_name` (path): The name of the model to use (e.g., `mlp`, `random_forest`, `dbscan`).
**Request Body (application/json)**:
```json
{
  "input_values": [
    [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.1, 1.2, 1.3, 1.4, 1.5]
  ]
}
```
**Response (200 OK)**:
```json
{
  "model": "mlp",
  "predictions": [0],
  "probabilities": [[0.9, 0.1]]
}
```
**Error Responses**:
- `404 Not Found`: `{"message": "Model '{model_name}' not found"}`
- `422 Unprocessable Entity`: `{"message": "Validation error", "errors": [...]}` (e.g., wrong number of features, non-numeric input, negative values)
- `400 Bad Request`: `{"message": "Error during data preprocessing: ..."}`

#### 4. `GET /model-architecture/{model_name}`
**Description**: Retrieves the architecture details of a neural network model.
**Parameters**:
- `model_name` (path): The name of the MLP model (e.g., `mlp`).
- `top_k` (query, optional): Number of top weighted edges to return per neuron. Defaults to 2.
**Response (200 OK)**:
```json
{
  "n_layers": 3,
  "hidden_layer_sizes": [100, 100],
  "out_activation": "logistic",
  "layers": [
    {
      "layer_index": 0,
      "input_dim": 15,
      "output_dim": 100,
      "edges": [{"src": 0, "tgt": 0, "weight": 0.123}]
    }
  ]
}
```
**Error Responses**:
- `404 Not Found`: `{"message": "Model '{model_name}' not found"}`
- `400 Bad Request`: `{"message": "Model '{model_name}' has no accessible architecture"}` (if not an MLP)

#### 5. `POST /compare-dataset`
**Description**: Compares an uploaded CSV dataset against a reference dataset.
**Request Body (multipart/form-data)**:
- `file` (form data): The CSV file to upload.
**Response (200 OK)**:
```json
{
  "reference_dataset": "TII-SSRC-23",
  "records_uploaded": 1000,
  "features_uploaded": 15,
  "matching_features": 12,
  "similarity_score": 0.8,
  "missing_features": ["feature_x", "feature_y"],
  "extra_features": ["new_feature_a"]
}
```
**Error Responses**:
- `400 Bad Request`: `{"message": "Invalid CSV format. Please upload a valid CSV file."}`
- `404 Not Found`: `{"message": "Reference dataset not found at ..."}`
- `500 Internal Server Error`: `{"message": "Dataset comparison failed: ..."}`

## Architecture

```mermaid
graph TB
    subgraph "Frontend Layer"
        UI[React Web App]
        UI --> |User Interactions| COMP[Model Selection]
        UI --> |Visualizations| VIZ[Charts & Plots]
    end
    
    subgraph "Backend Layer"
        API[FastAPI Server<br/>serve.py]
        API --> |/predict| MODELS[Model Registry]
        API --> |/train| TRAIN[Training Pipeline]
    end
    
    subgraph "Data Pipeline"
        RAW[Raw Dataset<br/>data.csv]
        RAW --> CLEAN[Data Cleaning<br/>data_cleaning.py]
        CLEAN --> FEAT[Feature Engineering]
        FEAT --> BALANCE[Class Balancing]
        BALANCE --> PROC[Processed Data<br/>processed_data.npz]
    end
    
    subgraph "ML Models"
        RF[Random Forest]
        MLP[Neural Network]
        DBSCAN[DBSCAN Clustering]
        KMEANS[K-Means]
    end
    
    subgraph "Storage"
        CACHE[Model Cache<br/>cache/models/]
        METADATA[Feature Metadata<br/>feature_metadata.pkl]
    end
    
    UI --> |REST API| API
    PROC --> TRAIN
    TRAIN --> MODELS
    MODELS --> RF
    MODELS --> MLP
    MODELS --> DBSCAN
    MODELS --> KMEANS
    MODELS --> CACHE
    PROC --> METADATA
    TRAIN --> CACHE
```

**Components:**
- **Frontend (React, `frontend/`)**: Web App for exploration, model selection, and visualisation (probabilities, confusion matrices, clustering views). Talks to the backend via REST.
- **Backend (Python/FastAPI, `Backend/`)**: Data preprocessing, training, model registry, and prediction API. Trained artefacts cached in `Backend/cache/models` and loaded at serve time.
- **Data pipeline (`Backend/data_preprocessing/`)**: Cleans https://ieeexplore.ieee.org/document/10262330 dataset, engineers features, balances classes, and persists `processed_data.npz` plus `feature_metadata.pkl`.
- **Serving (`Backend/serve.py`)**: Exposes endpoints (e.g., `/predict`) that the frontend calls during interactive testing.

## Code Structure

### Frontend (`frontend/`)
```
frontend/
├── public/                     # Static assets
│   ├── auris-bg.mp4            # Background video
│   ├── auris.gif               # Demo animation
│   └── *.png                   # Images and icons
├── src/
│   ├── components/             # React components
│   │   ├── about/              # About page components
│   │   ├── deep_learning/      # Deep learning visualization
│   │   ├── misc/               # Shared components (TopBar, Footer)
│   │   ├── supervised/         # Supervised learning charts
│   │   ├── testing/            # Model testing interface
│   │   └── unsupervised/       # Unsupervised learning views
│   ├── pages/                  # Page components
│   │   ├── About.jsx
│   │   ├── Deep_Learning.jsx
│   │   ├── Home.jsx
│   │   ├── Supervised.jsx
│   │   ├── Testing.jsx
│   │   └── Unsupervised.jsx
│   ├── api/                    # API client functions
│   │   └── predict.js          # Backend communication
│   ├── constants/              # Configuration
│   │   └── model_playground.js # Feature names and defaults
│   ├── App.js                  # Main app component
│   └── index.js                # Entry point
├── package.json                # Dependencies and scripts
└── build/                      # Production build output
```

### Backend (`Backend/`)
```
Backend/
├── serve.py                   # FastAPI application entry point
├── main.py                    # Training pipeline
├── config.py                  # Configuration settings
├── requirements.txt           # Python dependencies
├── services/                  # Business logic layer
│   ├── prediction.py          # Model loading and prediction
│   ├── features.py            # Feature preprocessing and scaling
│   ├── model_inspect.py       # Model architecture inspection
│   └── dataset_compare.py     # Dataset comparison logic
├── validators/                # Input validation
│   └── input.py               # Input validation functions
├── schemas/                   # Pydantic models
│   ├── predict.py             # Prediction request/response models
│   └── utilities.py           # Utility endpoint models
├── utils/                     # Utility modules
│   ├── model_io.py            # Model loading/saving
│   └── predict.py             # Prediction execution
├── data_preprocessing/        # Data pipeline
│   ├── data_cleaning.py       # Main preprocessing script
│   ├── create_balanced_dataset.py
│   ├── input/
│   │   └── data.csv           # Raw dataset
│   ├── output/
│   │   ├── processed_data.npz # Processed features
│   │   └── feature_metadata.pkl # Feature scaler and names
│   └── EDA/                   # Exploratory data analysis
├── evaluation/                # Model evaluation
│   ├── calc_eval_metrics.py
│   └── create_reports.py
├── evaluation_reports/        # Generated evaluation reports
├── cache/                     # Model cache
│   └── models/                # Trained model files (.joblib)
├── tests/                     # Test suite
│   ├── conftest.py            # Pytest configuration
│   ├── test_validators.py     # Unit tests for validators
│   └── test_api.py            # API integration tests
└── README.md                  # Backend documentation
```

## Part 1: Backend development:
Details: `https://github.com/Schnitze1/COS30049-Computing-Technology-Innovation-Project`