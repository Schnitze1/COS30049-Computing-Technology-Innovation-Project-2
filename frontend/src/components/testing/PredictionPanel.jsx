import { Box, Typography, Divider, Grid, Chip } from '@mui/material';
import { SAMPLES } from '../../constants/model_playground';

const trafficTypes = Object.keys(SAMPLES);
const nameOf = (idx)=> trafficTypes[idx] || `Unknown (${idx})`;
const isBenign = (name)=> (name === 'Audio' || name === 'Background' || name === 'Text' || name === 'Video');

export default function PredictionPanel({ predictions }) {
  if (!predictions) return null;
  const predIdx = predictions.predictions?.[0];
  const predName = nameOf(predIdx);
  const probs = predictions.probabilities?.[0] || [];
  const confidence = Number.isFinite(probs[predIdx]) ? (probs[predIdx] * 100) : null;
  const label = isBenign(predName) ? 'Benign' : 'Malicious';
  return (
    <Box sx={{ flex:1 }}>
      <Box sx={{ mb:3 }}>
        <Typography variant="h6" gutterBottom>
          Predicted: <span style={{ color:'#4caf50' }}>{predName}</span>
        </Typography>
        <Box sx={{ display:'flex', gap:1, alignItems:'center' }}>
          <Chip label={`Type: ${label}`} color={label==='Benign' ? 'success' : 'error'} variant="outlined" />
          {confidence !== null && <Chip label={`Confidence: ${confidence.toFixed(1)}%`} variant="outlined" />}
        </Box>
      </Box>
      <Divider sx={{ my:2 }} />
      <Grid container spacing={2}>
        <Grid size={6}>
          <Typography variant="subtitle2" gutterBottom>Predictions:</Typography>
          <Box sx={{ display:'flex', gap:1, flexWrap:'wrap' }}>
            {predictions.predictions.map((p,i)=>(
              <Chip key={i} label={`Sample ${i+1}: ${nameOf(p)} (${p})`} color="primary" variant="outlined" />
            ))}
          </Box>
        </Grid>
        <Grid size={6}>
          <Typography variant="subtitle2" gutterBottom>Probabilities:</Typography>
          <Box sx={{ maxHeight:300, overflow:'auto' }}>
            {predictions.probabilities?.map((probs,i)=>(
              <Box key={i} sx={{ mb:1 }}>
                <Typography variant="caption">Sample {i+1}:</Typography>
                <Box sx={{ display:'flex', flexDirection:'column', gap:0.5 }}>
                  {probs.map((prob, ci)=>(
                    <Chip key={ci} label={`${nameOf(ci)}: ${prob.toFixed(3)}`} size="small" variant="outlined" sx={{ alignSelf:'flex-start' }} />
                  ))}
                </Box>
              </Box>
            )) ?? <Typography variant="body2" color="text.secondary">No probabilities available for this model</Typography>}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}