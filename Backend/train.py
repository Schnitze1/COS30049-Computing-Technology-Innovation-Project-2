from typing import Dict
from sklearn.cluster import DBSCAN, KMeans
from sklearn.ensemble import RandomForestClassifier
from sklearn.neural_network import MLPClassifier

"""Module for training supervised and unsupervised models for multiclass classification."""


def train_models(
        X_train_supervised,
        y_train_supervised,
        X_train_unsupervised,
        n_classes: int,
) -> Dict[str, object]:
    """
    Train supervised and unsupervised models for multiclass classification.

    Supervised models (Random Forest, MLP) are trained on SMOTE-augmented data,
    while unsupervised models (KMeans, DBSCAN) are trained on non-SMOTE data.

    :param X_train_supervised: Training dataset after SMOTE augmentation.
    :param y_train_supervised: Labels for the supervised training data.
    :param X_train_unsupervised: Original training data before SMOTE augmentation.
    :param n_classes: Number of distinct traffic type classes.
    :return: Dictionary containing trained model instances keyed by model name.
    """
    models = {
        "random_forest": RandomForestClassifier(
            n_estimators=200,
            random_state=42,
            n_jobs=-1,
            class_weight="balanced",  # Handle class imbalance
        ),
        "mlp": MLPClassifier(
            hidden_layer_sizes=(100, 100),
            solver="adam",
            learning_rate_init=1e-3,
            max_iter=1000,
            early_stopping=True,
            n_iter_no_change=10,
            tol=1e-4,
            random_state=42,
        ),
        # Unsupervised baseline clustering models
        "kmeans": KMeans(n_clusters=n_classes, random_state=42, n_init=20),
        "dbscan": DBSCAN(eps=0.5, min_samples=5),
    }

    for name, model in models.items():
        print(f"Training {name}...")

        if name in ("kmeans", "dbscan"):
            # Unsupervised models: train with original (unSMOTE) data
            print(f"  Using unsmote data: {X_train_unsupervised.size} samples")
            model.fit(X_train_unsupervised)
        else:
            # Supervised models: train with SMOTE-augmented data
            print(f"  Using SMOTE data: {X_train_supervised.size} samples")
            model.fit(X_train_supervised, y_train_supervised)

    return models