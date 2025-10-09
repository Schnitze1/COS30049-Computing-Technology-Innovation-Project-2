import os
from typing import Dict, List
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np
from sklearn.decomposition import PCA

import os
from typing import Dict, List, Optional
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np

# Binary & multiclass classification reports
def results_to_dataframe(results: Dict[str, Dict[str, float]]) -> pd.DataFrame:
	rows = []
	for model_name, metrics in results.items():
		row = { 'model': model_name }
		row.update(metrics)
		rows.append(row)
	return pd.DataFrame(rows)

def save_results_csv(results: Dict[str, Dict[str, float]], out_dir: str = None, filename: str = None) -> str:
	df = results_to_dataframe(results)
	out_path = os.path.join(out_dir, filename)
	df.to_csv(out_path, index=False)
	return out_path

def plot_confusion_matrices(results: Dict[str, Dict[str, float]], 
							out_dir: str = 'evaluation_reports/multiclass', 
							class_labels: Optional[List[str]] = None) -> str:
	"""
		Plot confusion matrices for all models
	"""
	model_confusion_matrices = [(model_name, res['confusion_matrix']) for model_name, res in results.items() if isinstance(res, dict) and 'confusion_matrix' in res]
	if not model_confusion_matrices:
		raise ValueError('No confusion matrices available')
	cols = min(3, len(model_confusion_matrices))
	rows = (len(model_confusion_matrices) + cols - 1) // cols
	plt.figure(figsize=(5*cols, 4*rows))

	for idx, (model_name, confusion_matrix) in enumerate(model_confusion_matrices, start=1):
		ax = plt.subplot(rows, cols, idx)
		# Determine if binary or multiclass
		if hasattr(confusion_matrix, 'shape') and confusion_matrix.shape == (2, 2):
			labels = ['False', 'True'] if class_labels is None else class_labels[:2]
			sns.heatmap(confusion_matrix, annot=True, fmt='d', cmap='Blues', cbar=False,
					xticklabels=labels, yticklabels=labels, ax=ax)
		else:
			if class_labels is not None and len(class_labels) == confusion_matrix.shape[0]:
				labels = class_labels
			else:
				labels = [f'Class {i}' for i in range(confusion_matrix.shape[0])]
			annot = True if confusion_matrix.shape[0] <= 10 else False
			sns.heatmap(confusion_matrix, annot=annot, fmt='d', cmap='Blues', cbar=True,
					xticklabels=labels, yticklabels=labels, ax=ax)
		ax.set_title(model_name)
		ax.set_xlabel('Predicted')
		ax.set_ylabel('True')

	plt.tight_layout()
	out_path = os.path.join(out_dir, 'confusion_matrices.png')
	plt.savefig(out_path, dpi=150)
	plt.close()
	return out_path

def plot_multiclass_metrics(results: Dict[str, Dict[str, float]], out_dir: str = 'evaluation_reports/multiclass') -> str:
	"""
		Create comprehensive multiclass metrics visualization
	"""
	results_df = results_to_dataframe(results)
	
	# Define multiclass metrics to plot (using weighted averages for better imbalanced dataset representation)
	multiclass_metrics = ['accuracy', 'precision_weighted', 'recall_weighted', 'f1_weighted', 'roc_auc_ovr']
	available_metrics = [m for m in multiclass_metrics if m in results_df.columns]
	
	if not available_metrics:
		raise ValueError('No multiclass metrics available')
	
	rows, cols = len(available_metrics), 1
	plt.figure(figsize=(8, 3*len(available_metrics)))

	for idx, metric in enumerate(available_metrics, start=1):
		ax = plt.subplot(rows, cols, idx)
		plot_df = results_df[['model', metric]].copy()
		plot_df = plot_df.sort_values(metric, ascending=False)
		
		bars = ax.bar(plot_df['model'], plot_df[metric])
		ax.set_title(f'{metric.replace("_", " ").title()}')
		ax.set_ylabel(metric.replace("_", " ").title())
		ax.set_xlabel('Model')
		
		# Color bars based on performance
		for i, bar in enumerate(bars):
			value = plot_df[metric].iloc[i]
			if value >= 0.9:
				bar.set_color('green')
			elif value >= 0.8:
				bar.set_color('orange')
			else:
				bar.set_color('red')
		
		# Add value annotations
		for i, v in enumerate(plot_df[metric].tolist()):
			ax.text(i, v + 0.01, f"{v:.3f}", ha='center', va='bottom')
		
		# Set ticks and labels properly
		ax.set_xticks(range(len(plot_df['model'])))
		ax.set_xticklabels(plot_df['model'], rotation=45, ha='right')
		ax.set_ylim(0, 1.1)

	plt.tight_layout()
	out_path = os.path.join(out_dir, 'multiclass_metrics_comparison.png')
	plt.savefig(out_path, dpi=150)
	plt.close()
	return out_path

def plot_per_class_metrics(results: Dict[str, Dict[str, float]], traffic_types: List[str], 
							out_dir: str = 'evaluation_reports/multiclass') -> List[str]:
	"""
		Plot per-class metrics for all models with per-class metrics
	"""
	paths = []
	
	# Find all models with per-class metrics
	models_with_per_class = []
	for model_name, metrics in results.items():
		if 'precision_per_class' in metrics:
			models_with_per_class.append(model_name)
	
	if not models_with_per_class:
		raise ValueError('No per-class metrics available')
	
	# Create plots for each model
	for model_name in models_with_per_class:
		metrics_data = results[model_name]
		precision_per_class = metrics_data['precision_per_class']
		recall_per_class = metrics_data['recall_per_class']
		f1_per_class = metrics_data['f1_per_class']
		
		# Create DataFrame for plotting
		df_per_class = pd.DataFrame({
			'Traffic_Type': traffic_types,
			'Precision': precision_per_class,
			'Recall': recall_per_class,
			'F1_Score': f1_per_class
		})
		
		# Melt for easier plotting
		df_melted = df_per_class.melt(id_vars=['Traffic_Type'], 
		                             value_vars=['Precision', 'Recall', 'F1_Score'],
		                             var_name='Metric', value_name='Score')
		
		plt.figure(figsize=(12, 6))
		sns.barplot(data=df_melted, x='Traffic_Type', y='Score', hue='Metric')
		plt.title(f'Per-Class Metrics - {model_name.upper()}')
		plt.xlabel('Traffic Type')
		plt.ylabel('Score')
		plt.xticks(rotation=45, ha='right')
		plt.legend(title='Metric')
		plt.tight_layout()
		
		out_path = os.path.join(out_dir, f'per_class_metrics_{model_name}.png')
		plt.savefig(out_path, dpi=150)
		plt.close()
		paths.append(out_path)
	
	return paths

def export_reports(results: Dict[str, Dict[str, float]], traffic_types: List[str], 
					label_metrics: Dict[str, Dict[str, float]] = None,
					models: Dict[str, object] = None,
					X: np.ndarray = None,
					y_true: np.ndarray = None,
					clustering_out_dir: str = 'evaluation_reports/clustering') -> Dict[str, str]:
	"""
		Export all binary and multiclass reports and clustering visualizations
	"""
	paths = {}
	multiclass_out_dir = os.path.join('evaluation_reports', 'multiclass')
	binary_label_out_dir = os.path.join('evaluation_reports', 'binary_label')
	
	# Save multiclass metrics summary CSV
	paths['Multiclass Summary CSV'] = save_results_csv(results, multiclass_out_dir, 'multiclass_metrics_summary.csv')
	
	# Save label metrics if provided
	if label_metrics:
		paths['Label-from-type CSV'] = save_results_csv(label_metrics, binary_label_out_dir, 'label_from_type_metrics.csv')
	
	# Create multiclass visualizations
	paths['Multiclass Metrics Comparison'] = plot_multiclass_metrics(results, multiclass_out_dir)
	
	paths['Confusion Matrices'] = plot_confusion_matrices(results, multiclass_out_dir, traffic_types)
	
	per_class_paths = plot_per_class_metrics(results, traffic_types, multiclass_out_dir)
	for i, path in enumerate(per_class_paths):
		model_name = path.split('_')[-1].replace('.png', '')
		paths[f'Per-Class Metrics ({model_name})'] = path
	
	# Optionally include clustering plots if models and data are supplied
	if models is not None and X is not None and y_true is not None:
		clustering_paths = export_clustering_reports(models, X, y_true, traffic_types, out_dir=clustering_out_dir)
		paths.update(clustering_paths)

	return paths

# Clustering reports
def export_clustering_reports(models: Dict[str, object], X: np.ndarray, y_true: np.ndarray,
							traffic_types: List[str], out_dir: str = 'evaluation_reports/clustering') -> Dict[str, str]:
	"""Generate clustering plots (PCA + heatmap) for supported clustering models found in models dict.

	Parameters
	----------
	models : Dict[str, object]
		Dictionary of trained models keyed by model name (expects keys like 'kmeans', 'dbscan').
	X : np.ndarray
		Feature matrix to compute cluster assignments on (typically test set).
	y_true : np.ndarray
		True class labels for the samples.
	traffic_types : List[str]
		Class label names.
	out_dir : str
		Output directory for plots.

	Returns
	-------
	Dict[str, str]
		Mapping of plot description to saved file paths.
	"""
	paths = {}
	for clustering_model in ['kmeans', 'dbscan']:
		if clustering_model in models:
			model = models[clustering_model]
			if clustering_model == 'kmeans':
				y_clusters = model.predict(X)
			else:
				y_clusters = model.fit_predict(X)

			# Generate PCA scatter plot
			pca_path = plot_clustering_pca_scatter(X, y_clusters, clustering_model, out_dir)
			paths[f'{clustering_model.upper()} PCA by Cluster'] = pca_path

			# Generate cluster-label heatmap
			heatmap_path = plot_cluster_label_heatmap(y_clusters, y_true, traffic_types, clustering_model, out_dir)
			paths[f'{clustering_model.upper()} Cluster-Label Heatmap'] = heatmap_path
	return paths

def plot_clustering_pca_scatter(X: np.ndarray, y_clusters: np.ndarray, algorithm_name: str,
								out_dir: str = 'evaluation_reports/clustering') -> str:
	"""Create a PCA scatter plot colored by cluster assignments (reusable for any clustering algorithm).

	Parameters
	----------
	X : np.ndarray
		Feature matrix used for evaluation (test set).
	y_clusters : np.ndarray
		Cluster assignments for the samples.
	algorithm_name : str
		Name of the clustering algorithm (e.g., 'kmeans', 'dbscan').
	out_dir : str
		Directory to save plots.

	Returns
	-------
	str
		Path to the saved plot file.
	"""
	# Reduce to 2D with PCA for visualization
	pca = PCA(n_components=2, random_state=42)
	features_2d = pca.fit_transform(X)

	# Plot colored by cluster assignments
	plt.figure(figsize=(8, 6))
	scatter = plt.scatter(features_2d[:, 0], features_2d[:, 1], c=y_clusters, cmap='tab20', s=10, alpha=0.7)
	plt.title(f'{algorithm_name.upper()} Clusters (PCA 2D)')
	plt.xlabel('PC1')
	plt.ylabel('PC2')
	
	# Handle colorbar for different clustering algorithms
	unique_clusters = np.unique(y_clusters)
	if algorithm_name.lower() == 'dbscan' and -1 in unique_clusters:
		# DBSCAN has noise points (-1), use special colorbar
		cbar = plt.colorbar(scatter, boundaries=np.arange(len(unique_clusters) + 1) - 0.5)
		cbar.set_label('Cluster ID (Noise=-1)')
	else:
		# Standard clustering (K-means, etc.)
		cbar = plt.colorbar(scatter, boundaries=np.arange(int(np.max(y_clusters)) + 2) - 0.5)
		cbar.set_label('Cluster ID')
	
	cluster_path = os.path.join(out_dir, f'{algorithm_name}_pca_by_cluster.png')
	plt.tight_layout()
	plt.savefig(cluster_path, dpi=150)
	plt.close()

	return cluster_path

def plot_cluster_label_heatmap(y_clusters: np.ndarray, y_true: np.ndarray, traffic_types: List[str],
							algorithm_name: str, out_dir: str = 'evaluation_reports/clustering') -> str:
	"""Heatmap of cluster vs true label counts (contingency matrix) - reusable for any clustering algorithm.
	
	Parameters
	----------
	y_clusters : np.ndarray
		Cluster assignments for the samples.
	y_true : np.ndarray
		True class indices for the samples.
	traffic_types : List[str]
		Class label names.
	algorithm_name : str
		Name of the clustering algorithm (e.g., 'kmeans', 'dbscan').
	out_dir : str
		Directory to save plots.
		
	Returns
	-------
	str
		Path to the saved plot file.
	"""
	# Ensure integers
	y_clusters = np.asarray(y_clusters).astype(int)
	y_true = np.asarray(y_true).astype(int)

	# Handle different clustering algorithms
	unique_clusters = np.unique(y_clusters)
	if algorithm_name.lower() == 'dbscan' and -1 in unique_clusters:
		# DBSCAN: include noise cluster (-1)
		n_clusters = len(unique_clusters)
		cluster_labels = [f'C{cluster_id}' if cluster_id != -1 else 'Noise' for cluster_id in unique_clusters]
	else:
		# Standard clustering (K-means, etc.)
		n_clusters = int(np.max(y_clusters)) + 1
		cluster_labels = [f'C{cluster_id}' for cluster_id in range(n_clusters)]
	
	cluster_vs_label_counts = np.zeros((n_clusters, len(traffic_types)), dtype=int)
	
	for row_index, cluster_id in enumerate(unique_clusters):
		member_indices = np.where(y_clusters == cluster_id)[0]
		if member_indices.size == 0:
			continue
		unique_true_labels, label_counts = np.unique(y_true[member_indices], return_counts=True)
		for label, count in zip(unique_true_labels, label_counts):
			cluster_vs_label_counts[row_index, int(label)] = int(count)

	plt.figure(figsize=(max(8, len(traffic_types)*0.9), max(5, n_clusters*0.4)))
	sns.heatmap(cluster_vs_label_counts, annot=False, fmt='d', cmap='Purples', cbar=True,
				yticklabels=cluster_labels,
				xticklabels=traffic_types)
	plt.xlabel('True Label')
	plt.ylabel('Cluster ID')
	plt.title(f'{algorithm_name.upper()} Cluster vs True Label Counts')
	out_path = os.path.join(out_dir, f'{algorithm_name}_cluster_label_heatmap.png')
	plt.tight_layout()
	plt.savefig(out_path, dpi=150)
	plt.close()
	return out_path

