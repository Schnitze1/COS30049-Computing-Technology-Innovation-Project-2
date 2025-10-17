# Network Traffic Anomaly Detection Pipeline

Machine learning pipeline for multiclass network traffic classification and anomaly detection using multiple supervised and unsupervised models.

## Features

- **Multiple Model Types**: Random Forest, MLP (Neural Network), K-means, and DBSCAN
- **Comprehensive Evaluation**: 
  - Multiclass metrics (8 traffic types): Audio, Background, Bruteforce, DoS, Information Gathering, Mirai, Text, Video
  - Binary classification (Malicious vs Benign traffic)
  - Per-class performance analysis
- **Metrics**: Accuracy, Precision, Recall, F1-Score (Weighted), ROC AUC, Confusion Matrices
- **Clustering Evaluation**: Silhouette, Calinski-Harabasz, Davies-Bouldin (K-means, DBSCAN)
- **Automated Reporting**: CSV exports, comprehensive visualizations, and per-class metrics charts
- **Model Caching**: Trained models are cached for faster subsequent runs
- **REST API**: FastAPI-based inference server for real-time predictions
- **Modular Architecture**: Clean separation of data processing, training, evaluation, and serving

## Quick Start

### 1. Setup Environment

```bash
# Clone project if you haven't already
git clone "https://github.com/Schnitze1/COS30049-Computing-Technology-Innovation-Project-2.git"

# Move to backend root folder
cd COS30049-Computing-Technology-Innovation-Project-2/Backend

# Create virtual environment
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
```

### 2) Preprocess data (generate 15-feature dataset and scaler)

```bash
python data_preprocessing\data_cleaning.py
```

This writes processed artifacts into `data_preprocessing/output/`:
- `processed_data.npz` (train/test with 15 features)
- `feature_metadata.pkl` (feature names, label encoder, 15-feature scaler)

### 3) Train and evaluate models

```bash
python main.py
```

### 4) Start the inference API (FastAPI)

```bash
uvicorn serve:app --host 127.0.0.1 --port 8000 --reload
```

Access API documentation at: `http://127.0.0.1:8000/docs`

## Project Structure

```
├── main.py                           # Orchestrates training, evaluation, reporting
├── train.py                          # Model definitions and training
├── serve.py                          # FastAPI inference server
├── config.py                         # Configuration settings
├── requirements.txt                  # Python dependencies
├── README.md                         # Project documentation
├── cache/
│   └── models/                       # Cached trained models
├── data_preprocessing/
│   ├── data_cleaning.ipynb           # Data preprocessing notebook
│   ├── data_cleaning.py              # Scriptable preprocessing utilities
│   ├── create_balanced_dataset.py    # Balancing/visualization helpers
│   ├── EDA/                          # Exploratory data analysis artifacts
│   ├── input/                        # Raw data files
│   └── output/                       # Processed data files
│       ├── processed_data.npz        # Preprocessed dataset
│       └── feature_metadata.pkl      # Feature metadata and encoders
├── evaluation/
│   ├── calc_eval_metrics.py          # Metrics (supervised + clustering) and printing
│   └── create_reports.py             # Report generation and plotting utilities
├── evaluation_reports/               # Generated reports and visualizations
│   ├── multiclass/
│   │   ├── multiclass_metrics_summary.csv
│   │   ├── multiclass_metrics_comparison.png
│   │   ├── confusion_matrices.png
│   │   ├── per_class_metrics_random_forest.png
│   │   ├── per_class_metrics_mlp.png
│   │   ├── per_class_metrics_kmeans.png
│   │   └── per_class_metrics_dbscan.png
│   ├── binary_label/
│   │   └── label_from_type_metrics.csv
│   └── clustering/
│       ├── kmeans_pca_by_cluster.png
│       ├── kmeans_cluster_label_heatmap.png
│       ├── dbscan_pca_by_cluster.png
│       └── dbscan_cluster_label_heatmap.png
├── utils/
│   ├── model_io.py                   # Save/load model utilities
│   └── predict.py                    # Prediction helpers
└── .gitignore                        # Git ignore rules
```

## Models Included

### Supervised Models
- **Random Forest**: Ensemble method with 200 estimators, balanced class weights
- **MLP (Multi-layer Perceptron)**: Neural network with (100, 100) hidden layers, early stopping

### Unsupervised Models
- **K-means**: 8 clusters with majority-vote class mapping for evaluation
- **DBSCAN**: Density-based clustering (includes noise label -1), evaluated via majority-vote mapping

### Model Features
- **Class Imbalance Handling**: Balanced class weights for Random Forest
- **Early Stopping**: MLP uses early stopping to prevent overfitting
- **Deterministic Results**: All models use random_state=42 for reproducibility
- **Model Caching**: Trained models are automatically saved and reused

## Output Files

The pipeline generates:

### CSV Reports
1. **multiclass_metrics_summary.csv**: Complete multiclass evaluation metrics for all models
2. **label_from_type_metrics.csv**: Binary classification metrics (Malicious vs Benign)

### Visualizations
1. **multiclass_metrics_comparison.png**: Weighted average metrics comparison across models
2. **confusion_matrices.png**: Confusion matrices for all models
3. **per_class_metrics_*.png**: Individual per-class performance charts for each model

### Key Metrics Included
- **Accuracy**: Overall classification accuracy
- **Precision/Recall/F1**: Macro, Micro, and Weighted averages
- **ROC AUC**: One-vs-Rest multiclass AUC
- **Per-class Metrics**: Individual class performance analysis
- **Clustering Metrics**: Silhouette, Calinski-Harabasz, Davies-Bouldin (K-means/DBSCAN), Inertia (K-means)

## Data Format

### Input Data
Expected data structure in `processed_data.npz`:
- `X_train`: Training features (standardized)
- `X_test`: Test features (standardized)
- `y_train`: Training labels (encoded)
- `y_test`: Test labels (encoded)

### Traffic Types (8 classes)
- **Benign**: Audio, Background, Text, Video
- **Malicious**: Bruteforce, DoS, Information Gathering, Mirai

### Feature Metadata
`feature_metadata.pkl` contains:
- Label encoder for traffic types
- Feature names and preprocessing information
- Target variable configuration

## API Usage

### Start the Server
```bash
python serve.py
```

### Make Predictions
```bash
curl -X POST "http://127.0.0.1:8000/predict/{model}" \
     -H "Content-Type: application/json" \
     -d '{
       "instances": [[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]]
     }'
```

### Available Endpoints
- `GET /health`: Health check
- `GET /models`: List available models
- `POST /predict`: Make predictions
- `GET /docs`: Interactive API documentation

## Requirements

- Python 3.8+
- scikit-learn
- fastapi
- uvicorn
- pandas
- matplotlib
- seaborn
- numpy
- joblib

See `requirements.txt` for specific versions.

## Performance Results

Dataset split and classes
- Supervised train (SMOTE): 96,000 samples
- Unsupervised train (raw): 63,150 samples
- Test: 15,795 samples
- Traffic types (8): Audio, Background, Bruteforce, DoS, Information Gathering, Mirai, Text, Video

Multiclass (accuracy / weighted F1)

| Model | Accuracy | Weighted F1 | Extra |
|---|---:|---:|---|
| Random Forest | 0.9335 | 0.9335 | AUC 0.9756 |
| MLP | 0.8746 | 0.8816 | AUC 0.9813 |
| K-means | 0.4169 | 0.3403 | Sil 0.4414, CH 387.42, DB 0.8752, Inertia 22560.51 |
| DBSCAN | 0.6182 | 0.6077 | Sil 0.3606, CH 35.57, DB 1.5915 |

Binary (Malicious vs Benign)

| Model | Accuracy | Precision | Recall | F1 |
|---|---:|---:|---:|---:|
| Random Forest | 0.9630 | 0.9712 | 0.9630 | 0.9671 |
| MLP | 0.9430 | 0.9768 | 0.9210 | 0.9481 |
| K-means | 0.6201 | 0.7396 | 0.5059 | 0.6008 |
| DBSCAN | 0.7217 | 0.9081 | 0.5647 | 0.6964 |

### Reports glossary
- See `evaluation_reports/` (multiclass, binary_label, clustering) for CSVs and visualizations.
- `multiclass/multiclass_metrics_summary.csv`: Per-model multiclass metrics (accuracy, precision/recall/F1 weighted, AUC where applicable).
- `binary_label/label_from_type_metrics.csv`: Per-model binary metrics (Malicious vs Benign): accuracy, precision, recall, F1.
- `multiclass/multiclass_metrics_comparison.png`: Bar chart comparing key multiclass metrics across models.
- `multiclass/confusion_matrices.png`: Confusion matrices per model (rows = true, cols = predicted).
- `multiclass/per_class_metrics_*.png`: Per-class precision, recall, F1 for a given model.
- `clustering/*_pca_by_cluster.png`: PCA 2D scatter colored by cluster IDs.
- `clustering/*_cluster_label_heatmap.png`: Cluster-vs-true-label contingency heatmap.
