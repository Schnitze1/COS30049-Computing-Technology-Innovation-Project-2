from typing import Dict
from sklearn.ensemble import RandomForestClassifier
from sklearn.neural_network import MLPClassifier
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.cluster import DBSCAN

def train_models(X_train_supervised, y_train_supervised, X_train_unsupervised, n_classes: int) -> Dict[str, object]:
    """
    Train models for multiclass classification
    Uses SMOTE data for supervised models and unsmote data for unsupervised models
    """
    models = {
        'random_forest': RandomForestClassifier(
            n_estimators=200, 
            random_state=42, 
            n_jobs=-1,
            class_weight='balanced'  # Handle class imbalance
        ),
        'mlp': MLPClassifier(
            hidden_layer_sizes=(100, 100),
            solver='adam',
            learning_rate_init=1e-3,
            max_iter=1000,
            early_stopping=True,
            n_iter_no_change=10,
            tol=1e-4,
            random_state=42
        ),
        # Baseline KMeans with k = num classes (e.g., 8 traffic types → k=8)
        'kmeans': KMeans(n_clusters=n_classes, random_state=42, n_init=20),
        'dbscan': DBSCAN(eps=0.5, min_samples=5),
    }

    for name, model in models.items():
        print(f"Training {name}...")
        if name == 'kmeans' or name == 'dbscan':  # Unsupervised: clustering - use unsmote data
            print(f"  Using unsmote data: {X_train_unsupervised.size} samples")
            model.fit(X_train_unsupervised)
        else:  # Supervised: classification - use SMOTE data
            print(f"  Using SMOTE data: {X_train_supervised.size} samples")
            model.fit(X_train_supervised, y_train_supervised)

    return models
