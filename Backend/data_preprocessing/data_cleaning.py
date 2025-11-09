import os
import pickle
from datetime import datetime
import json
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import seaborn as sns
from imblearn.over_sampling import SMOTE
from sklearn.ensemble import RandomForestClassifier
from sklearn.compose import ColumnTransformer
from sklearn.feature_selection import VarianceThreshold
from sklearn.impute import SimpleImputer
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import LabelEncoder, OneHotEncoder, StandardScaler

"""
Clean and preprocess the traffic dataset for machine learning.

This script performs the following tasks:
- Reads input data and generates exploratory data analysis (EDA) visuals.
- Removes redundant features based on correlation analysis.
- Encodes target variables and performs feature selection.
- Applies SMOTE for balancing class distributions.
- Saves processed data, metadata, and logs for downstream modeling.

:param
    input_file_path: path to the raw input data file
:return
    processed_data: compressed .npz file containing preprocessed training and testing sets
    feature_metadata: pickle file containing label encoders, feature names, and scalers
    data_preprocessing_log: JSON log file summarizing preprocessing details
"""

# Create directories for processed output and exploratory analysis
output_dir = "data_preprocessing/output"
eda_dir = "data_preprocessing/EDA"
os.makedirs(output_dir, exist_ok=True)
os.makedirs(eda_dir, exist_ok=True)


# Read input data
df = pd.read_csv("data_preprocessing/input/data.csv", index_col=False)
og_shape = df.shape


# Plot distribution of labels
plt.figure(figsize=(10, 6))
ax = sns.countplot(x="Label", data=df)
plt.title("Distribution of Labels")
plt.xlabel("Label")
plt.ylabel("Count")
plt.xticks(rotation=45, ha="right")

# Add count numbers on top of bars
for p in ax.patches:
    ax.annotate(
        f"{p.get_height()}",
        (p.get_x() + p.get_width() / 2.0, p.get_height()),
        ha="center",
        va="center",
        fontsize=10,
        color="black",
        xytext=(0, 5),
        textcoords="offset points",
    )

plt.tight_layout()
# plt.show()


# Drop unnecessary columns for correlation analysis
corr_df = df.drop(
    columns=[
        "Flow ID",
        "Src IP",
        "Dst IP",
        "Src Port",
        "Dst Port",
        "Timestamp",
        "Label",
        "Traffic Type",
        "Traffic Subtype",
    ]
)

# Compute and visualize correlation matrix
corr_df1 = corr_df.corr()

plt.figure(figsize=(20, 15))
sns.heatmap(
    corr_df1,
    annot=False,
    fmt=".2f",
    cmap="coolwarm",
    vmin=-1,
    vmax=1,
    linewidths=0.5,
)
plt.title("Correlation Matrix Heatmap - Original Features")
plt.tight_layout()
plt.savefig(f"{eda_dir}/correlation_matrix_original.png", dpi=300, bbox_inches="tight")

# Identify redundant features (correlation > 0.8)
corr_matrix = corr_df1.abs()
upper = corr_df1.where(np.triu(np.ones(corr_matrix.shape), k=1).astype(bool))
to_drop = [col for col in upper.columns if any(upper[col] > 0.8)]
df_reduced = df.drop(columns=to_drop)

# Plot correlation matrix after feature reduction
corr_df_reduced = corr_df.drop(columns=to_drop).corr()
plt.figure(figsize=(20, 15))
sns.heatmap(
    corr_df_reduced,
    annot=False,
    fmt=".2f",
    cmap="coolwarm",
    vmin=-1,
    vmax=1,
    linewidths=0.5,
)
plt.title("Correlation Matrix Heatmap - After Removing Redundant Features")
plt.tight_layout()
plt.savefig(f"{eda_dir}/correlation_matrix_reduced.png", dpi=300, bbox_inches="tight")


# Define preprocessing parameters
TARGET_VARIABLE = "Traffic Type"
DROP_COLUMNS = ["Flow ID", "Src IP", "Src Port", "Dst IP", "Dst Port", "Timestamp"]
TARGET_TO_DROP = {
    "Label": ["Traffic Type", "Traffic Subtype"],
    "Traffic Type": ["Label", "Traffic Subtype"],
    "Traffic Subtype": ["Label", "Traffic Type"],
}

# Drop identifier and timestamp columns
df = df_reduced.drop(columns=DROP_COLUMNS)

# Filter duplicates and drop target-related columns
df = df.round(3)
df = df.drop_duplicates()
df = df.drop(columns=TARGET_TO_DROP[TARGET_VARIABLE])


# Split features and target variable
X = df.drop(TARGET_VARIABLE, axis=1)
y = df[TARGET_VARIABLE]

# Encode target variable
le = LabelEncoder()
y = le.fit_transform(y)

# Train-test split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, stratify=y, test_size=0.2, random_state=42
)

# Save original feature names
X_train_raw_columns = X_train.columns.tolist()

# Identify numerical and categorical columns
numerical_cols = X_train.select_dtypes(include=[np.number]).columns.to_list()
categorical_cols = X_train.select_dtypes(include=[object]).columns.to_list()


# Define data transformation pipelines
numerical_transformer = Pipeline(
    steps=[
        ("imputer", SimpleImputer(strategy="mean")),
        ("var", VarianceThreshold(threshold=0.0)),
        ("scaler", StandardScaler()),
    ]
)

categorical_transformer = Pipeline(
    steps=[
        ("imputer", SimpleImputer(strategy="most_frequent")),
        ("onehot", OneHotEncoder(handle_unknown="ignore", sparse_output=False)),
    ]
)

# Combine numerical and categorical transformers
preprocessor = ColumnTransformer(
    transformers=[
        ("num", numerical_transformer, numerical_cols),
        ("cat", categorical_transformer, categorical_cols),
    ]
)


# Feature selection using Random Forest importance
rf_selector = RandomForestClassifier(n_estimators=100, class_weight="balanced", random_state=42)
rf_selector.fit(X_train, y_train)

importance_df = (
    pd.DataFrame(
        {"feature_name": X_train.columns, "importance": rf_selector.feature_importances_}
    )
    .sort_values("importance", ascending=False)
    .reset_index(drop=True)
)

original_indices = [
    list(X_train.columns).index(fn) for fn in importance_df["feature_name"].head(15)
]
top_feature_indices = original_indices
top_feature_names = importance_df["feature_name"].head(15).to_list()

# Save feature importance results
importance_df.to_csv(f"{output_dir}/feature_importance_analysis.csv", index=False)

# Select top 15 features
X_train_selected = X_train.iloc[:, top_feature_indices]
X_test_selected = X_test.iloc[:, top_feature_indices]

# Standardize selected features
selected_features_scaler = StandardScaler()
X_train = selected_features_scaler.fit_transform(X_train_selected)
X_test = selected_features_scaler.transform(X_test_selected)


# Plot feature importance
top_15_importance = importance_df.head(15)
plt.figure(figsize=(12, 8))
plt.barh(range(len(top_15_importance)), top_15_importance["importance"])
plt.yticks(range(len(top_15_importance)), top_15_importance["feature_name"])
plt.xlabel("Feature Importance")
plt.title("Top 15 Most Important Features")
plt.gca().invert_yaxis()
plt.tight_layout()
plt.savefig(f"{output_dir}/feature_importance_top15.png", dpi=300, bbox_inches="tight")


# Generate boxplots for top numerical features
num_top = [n for n in top_feature_names if n.startswith("num__")]
plot_cols = []
for n in num_top:
    base = n.split("__", 1)[1]
    if base in df.columns and pd.api.types.is_numeric_dtype(df[base]) and df[base].nunique() > 1:
        plot_cols.append(base)

n = len(plot_cols)
rows = max(1, int(np.ceil(n / 3)))
fig, axes = plt.subplots(rows, 3, figsize=(18, 5 * rows))
axes = np.array(axes).ravel()

for i, col in enumerate(plot_cols):
    sns.boxplot(data=df, x="Traffic Type", y=col, showfliers=False, ax=axes[i])
    axes[i].set_title(col)
    axes[i].tick_params(axis="x", rotation=45)

for ax in axes[len(plot_cols):]:
    ax.set_visible(False)

plt.tight_layout()
plt.savefig(f"{output_dir}/feature_boxplots_top15.png", dpi=300, bbox_inches="tight")


# Apply SMOTE for balancing classes
X_train_unSMOTE = X_train.copy()

unique_labels, label_counts = np.unique(y_train, return_counts=True)

try:
    target_size = int(max(label_counts))
    target_counts = {int(i): target_size for i in range(len(le.classes_))}

    smote = SMOTE(
        sampling_strategy=target_counts,
        random_state=42,
        k_neighbors=max(1, min(5, int(min(label_counts)) - 1)),
    )
    X_train, y_train = smote.fit_resample(X_train, y_train)
except Exception as e:
    print(f"SMOTE failed: {e}")
    print("Using original data with class_weight='balanced' in models.")

unique_labels, counts_after = np.unique(y_train, return_counts=True)


# Visualize class distributions before and after SMOTE
plt.figure(figsize=(15, 5))

# Before SMOTE
plt.subplot(1, 3, 1)
plt.bar(range(len(label_counts)), label_counts)
plt.title("Class Distribution Before SMOTE")
plt.xlabel("Class")
plt.ylabel("Count")
plt.xticks(range(len(le.classes_)), le.classes_, rotation=45)

# After SMOTE
plt.subplot(1, 3, 2)
plt.bar(range(len(counts_after)), counts_after)
plt.title("Class Distribution After SMOTE")
plt.xlabel("Class")
plt.ylabel("Count")
plt.xticks(range(len(le.classes_)), le.classes_, rotation=45)

# Comparison
plt.subplot(1, 3, 3)
x = np.arange(len(le.classes_))
width = 0.35
plt.bar(x - width / 2, label_counts, width, label="Before SMOTE", alpha=0.7)
plt.bar(x + width / 2, counts_after, width, label="After SMOTE", alpha=0.7)
plt.title("Class Distribution Comparison")
plt.xlabel("Class")
plt.ylabel("Count")
plt.xticks(x, le.classes_, rotation=45)
plt.legend()

plt.tight_layout()
plt.savefig(f"{output_dir}/class_distribution_comparison.png", dpi=300, bbox_inches="tight")


# Create preprocessing log
log_data = {
    "timestamp": datetime.now().isoformat(),
    "dataset_info": {
        "original_shape": list(og_shape),
        "after_correlation_cleanup": list(df_reduced.shape),
        "final_shape after target drop": list(df.shape),
        "dropped_correlation_features": to_drop,
        "dropped_columns": DROP_COLUMNS + TARGET_TO_DROP[TARGET_VARIABLE],
    },
    "feature_selection": {
        "total_features_analyzed": int(len(importance_df)),
        "selected_features_count": int(len(top_feature_names)),
        "top_features": top_feature_names,
        "feature_importance_scores": importance_df.head(15).to_dict("records"),
        "top_feature_indices": top_feature_indices,
    },
    "class_distribution": {
        "before_smote": {str(label): int(count) for label, count in zip(le.classes_, label_counts)},
        "after_smote": {str(label): int(count) for label, count in zip(le.classes_, counts_after)},
        "smote_improvements": {
            str(label): (
                f"{int(before)} → {int(after)} samples ("
                f"{(((after - before) / before) * 100) if before > 0 else 0:+.1f}%"
                ")"
            )
            for label, before, after in zip(le.classes_, label_counts, counts_after)
        },
    },
    "data_quality": {
        "target_variable": TARGET_VARIABLE,
        "classes": [str(label) for label in le.classes_],
        "train_test_split": {
            "train_samples": int(X_train.shape[0]),
            "test_samples": int(X_test.shape[0]),
            "train_features": int(X_train.shape[1]),
            "test_features": int(X_test.shape[1]),
        },
    },
}

# Save preprocessing log
with open(f"{output_dir}/data_preprocessing_log.json", "w") as f:
    json.dump(log_data, f, indent=2)

print(f"Preprocessing log saved to: {output_dir}/data_preprocessing_log.json")


# Save processed data and metadata
np.savez_compressed(
    f"{output_dir}/processed_data.npz",
    X_train_unSMOTE=X_train_unSMOTE,
    X_train=X_train,
    X_test=X_test,
    y_train=y_train,
    y_test=y_test,
)

with open(f"{output_dir}/feature_metadata.pkl", "wb") as f:
    pickle.dump(
        {
            "label_encoder": le,
            "feature_names": top_feature_names,
            "target_variable": "Traffic Type",
            "selected_features_scaler": selected_features_scaler,
        },
        f,
    )

print(f"\nData saved successfully! See log and output at {output_dir}")
