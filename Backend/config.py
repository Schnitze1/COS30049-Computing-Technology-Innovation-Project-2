import os


def get_model_dir() -> str:
	return os.getenv('MODEL_DIR', 'cache/models')


