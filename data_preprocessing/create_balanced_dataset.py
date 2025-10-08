#!/usr/bin/env python3
"""
Extract 1000 samples for each 'Traffic Type'
- Shuffle and save as `data_preprocessing/input/data.csv`
"""

import pandas as pd
import numpy as np
import os
from collections import defaultdict


def filter_n_samples(data_path: str, traffic_type_n_samples: int = 1000, random_state: int = 42):
    """Create a balanced dataset with up to N REAL samples per class (no SMOTE)."""
    # Set random seed
    np.random.seed(random_state)
    
    with open (data_path, 'r') as file:
        df = pd.read_csv(file)
        
    sampled_frames = [
        group.sample(n=min(traffic_type_n_samples, len(group)), random_state=random_state, replace=False)
        for _, group in df.groupby('Traffic Type')
    ]
    df = pd.concat(sampled_frames).sample(frac=1, random_state=random_state).reset_index(drop=True)
    
    return df

def create_visualization(df):
    """Create visualization of the balanced dataset"""
    import matplotlib.pyplot as plt
    
    traffic_counts = df['Traffic Type'].value_counts()
    
    plt.figure(figsize=(12, 5))
    
    # Balanced distribution
    plt.subplot(1, 2, 1)
    traffic_counts.plot(kind='bar', color='lightgreen')
    plt.title(f'Balanced Dataset Distribution\n({len(df):,} total samples)')
    plt.xlabel('Traffic Type')
    plt.ylabel('Count')
    plt.xticks(rotation=45)
    
    # Sample of the data
    plt.subplot(1, 2, 2)
    # Show distribution of a few key features
    if 'Flow Duration' in df.columns:
        df.boxplot(column='Flow Duration', by='Traffic Type', ax=plt.gca())
        plt.title('Flow Duration by Traffic Type')
        plt.xticks(rotation=45)
    
    plt.tight_layout()
    path = 'data_preprocessing/input/balanced_real_only_visualization.png'
    os.makedirs(os.path.dirname(path), exist_ok=True)
    plt.savefig(path, dpi=300, bbox_inches='tight')
    plt.show()

def main():
    """Main function"""
    # Path to the raw dataset
    raw_data_path = r"C:\Users\User\OneDrive - Swinburne University\COS30049-Computing Technology Innovation Project\data.csv"
    
    if not os.path.exists(raw_data_path):
        print(f"Dataset not found at: {raw_data_path}")
        return
    
    # Create balanced dataset with up to 1000 real samples per class
    df = filter_n_samples(raw_data_path, traffic_type_n_samples=1000)
    
    if df is not None:
        # Create visualization
        create_visualization(df)
        
        # Save the balanced dataset
        output_dir = 'data_preprocessing/input'
        os.makedirs(output_dir, exist_ok=True)

        # Save balanced dataset
        df.to_csv(output_dir + '/data.csv', index=False)
        print(f"Balanced 1000-sample dataset saved to: {output_dir}")
        
        print(f"\nBalanced dataset creation complete!")
        print(f"Total samples: {len(df):,}")
        print(f"Classes: {len(df['Traffic Type'].unique())}")
    else:
        print("Failed to create balanced dataset")

if __name__ == "__main__":
    main()
