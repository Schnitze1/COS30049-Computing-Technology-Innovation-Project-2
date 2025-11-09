import os
from collections import defaultdict
import numpy as np
import pandas as pd

"""
Extract 1000 samples for each 'Traffic Type'.
Shuffle and save as `data_preprocessing/input/data.csv`.

:param
    data_file_path: path to the input data file
:return
    data.csv: balanced dataset saved to `data_preprocessing/input/data.csv`
"""


def filter_n_samples(data_path: str, traffic_type_n_samples: int = 1000, random_state: int = 42):
    """
    Create a balanced dataset with up to N REAL samples per class (no SMOTE).

    :param
        data_path: str
            Path to the raw dataset CSV file.
        traffic_type_n_samples: int
            Maximum number of samples to include per traffic type (default: 1000).
        random_state: int
            Random seed used for reproducible sampling (default: 42).
    :return
        df: pandas.DataFrame
            Balanced dataset containing up to N samples for each traffic type.
    """
    # Set random seed for reproducibility
    np.random.seed(random_state)

    with open(data_path, "r") as file:
        df = pd.read_csv(file)

    # Sample up to N rows per traffic type without replacement
    sampled_frames = [
        group.sample(
            n=min(traffic_type_n_samples, len(group)),
            random_state=random_state,
            replace=False
        )
        for _, group in df.groupby("Traffic Type")
    ]

    # Combine samples and shuffle them
    df = pd.concat(sampled_frames).sample(
        frac=1, random_state=random_state
    ).reset_index(drop=True)

    return df


def create_visualization(df):
    """
    Create a visualization of the balanced dataset distribution.

    :param
        df: pandas.DataFrame
            The balanced dataset containing traffic types and flow features.
    :return
        None
    """
    import matplotlib.pyplot as plt

    traffic_counts = df["Traffic Type"].value_counts()

    plt.figure(figsize=(12, 5))

    # Balanced distribution bar chart
    plt.subplot(1, 2, 1)
    traffic_counts.plot(kind="bar", color="lightgreen")
    plt.title(f"Balanced Dataset Distribution\n({len(df): ,} total samples)")
    plt.xlabel("Traffic Type")
    plt.ylabel("Count")
    plt.xticks(rotation=45)

    # Sample visualization of feature distribution
    plt.subplot(1, 2, 2)
    if "Flow Duration" in df.columns:
        df.boxplot(column="Flow Duration", by="Traffic Type", ax=plt.gca())
        plt.title("Flow Duration by Traffic Type")
        plt.xticks(rotation=45)

    plt.tight_layout()
    path = "data_preprocessing/input/balanced_real_only_visualization.png"
    os.makedirs(os.path.dirname(path), exist_ok=True)
    plt.savefig(path, dpi=300, bbox_inches="tight")
    plt.show()


def main():
    """
    Main function for creating and saving a balanced dataset.

    :param
        None
    :return
        None
    """
    # Path to the raw dataset
    raw_data_path = os.path.join(
        "C:\\Users\\User",
        "OneDrive - Swinburne University",
        "COS30049-Computing Technology Innovation Project",
        "data.csv",
    )

    if not os.path.exists(raw_data_path):
        print(f"Dataset not found at: {raw_data_path}")
        return

    # Create a balanced dataset with up to 1000 real samples per traffic class
    df = filter_n_samples(raw_data_path, traffic_type_n_samples=1000)

    if df is not None:
        # Generate dataset visualization
        create_visualization(df)

        # Create output directory if it doesn't exist
        output_dir = "data_preprocessing/input"
        os.makedirs(output_dir, exist_ok=True)

        # Save balanced dataset as CSV
        df.to_csv(os.path.join(output_dir, "data.csv"), index=False)
        print(f"Balanced 1000-sample dataset saved to: {output_dir}")

        print("\nBalanced dataset creation complete!")
        print(f"Total samples: {len(df): ,}")
        print(f"Classes: {len(df['Traffic Type'].unique())}")
    else:
        print("Failed to create balanced dataset")


if __name__ == "__main__":
    main()
