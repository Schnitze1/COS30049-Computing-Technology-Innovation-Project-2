const API_BASE = 'http://127.0.0.1:8000';

export async function predict(modelName, values15) {
  const res = await fetch(`${API_BASE}/predict/${modelName}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ instances: [values15] })
  });
  if (!res.ok) {
    let detail = 'Prediction failed';
    try { detail = (await res.json()).detail || detail; } catch {}
    throw new Error(detail);
  }
  return res.json();
}