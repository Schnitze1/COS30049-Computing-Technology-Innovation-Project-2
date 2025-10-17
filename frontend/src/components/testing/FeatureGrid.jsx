import { Grid, TextField, Typography, Box } from '@mui/material';
import { FEATURE_NAMES, SAMPLES } from '../../constants/model_playground';

export default function FeatureGrid({ sampleType }) {
  const values = SAMPLES[sampleType] ?? [];
  return (
    <Box sx={{ flex:1, overflow:'auto' }}>
      <Typography variant="subtitle2" gutterBottom sx={{ mb:2 }}>Input Features (Key-Value Pairs):</Typography>
      <Grid container spacing={2}>
        {values.map((v, i)=>(
          <Grid key={i} size={6}>
            <TextField
              fullWidth size="small"
              label={FEATURE_NAMES[i] || `Feature ${i+1}`}
              value={v} InputProps={{ readOnly:true }}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}