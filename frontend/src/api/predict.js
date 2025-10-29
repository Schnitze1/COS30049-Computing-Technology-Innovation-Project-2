const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000';

// POST /predict/{model_name}
export async function predict(modelName, inputValues) {
  const res = await fetch(`${API_BASE}/predict/${modelName}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input_values: [inputValues] })
  });
  if (!res.ok) {
    let detail = 'Prediction failed';
    try { detail = (await res.json()).detail || detail; } catch {}
    throw new Error(detail);
  }
  return res.json();
}

// POST /compare-dataset
export async function compareDataset(formData) {
  const res = await fetch(`${API_BASE}/compare-dataset`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    let detail = 'Dataset comparison failed';
    try { detail = (await res.json()).detail || detail; } catch {}
    throw new Error(detail);
  }
  return res.json();
}

// GET /model-architecture/{model_name}?topK=2
export async function getModelArchitecture(modelName, topK = 2) {
  const res = await fetch(`${API_BASE}/model-architecture/${modelName}?topK=${topK}`);
  if (!res.ok) {
    throw new Error('Model architecture failed');
  }
  return res.json();
}
