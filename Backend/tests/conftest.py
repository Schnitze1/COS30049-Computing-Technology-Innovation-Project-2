import os
import sys
from pathlib import Path
import pytest
from fastapi.testclient import TestClient

# Ensure model cache dir env if used
os.environ.setdefault("MODEL_DIR", "cache/models")

# Make repo root importable so `serve` resolves regardless of where pytest is run
ROOT = Path(__file__).resolve().parent.parent
if str(ROOT) not in sys.path:
	sys.path.insert(0, str(ROOT))

from serve import app  # noqa: E402

@pytest.fixture(scope="session")
def client():
	return TestClient(app)

@pytest.fixture()
def sample_vector_15():
	# Reasonable dummy values in [0,1] range
	return [0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9,0.1,0.2,0.3,0.4,0.5,0.6]
