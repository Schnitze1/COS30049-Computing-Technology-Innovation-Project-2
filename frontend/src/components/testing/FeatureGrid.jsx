import { Grid, TextField, Typography, Box } from '@mui/material';
import { FEATURE_NAMES } from '../../constants/model_playground';

export default function FeatureGrid({ values, onChange }) {
  return (
    <Box sx={{ flex:1, overflow:'auto' }}>
      <Typography variant="subtitle2" gutterBottom sx={{ mb:2 }}>Input Features (Key-Value Pairs):</Typography>
      <Grid container spacing={2}>
        {FEATURE_NAMES.map((name, i)=>(
          <Grid key={i} size={6}>
            <TextField
              fullWidth size="small"
              label={name || `Feature ${i+1}`}
              type="number"
              value={values?.[i] ?? ''}
              onChange={(e)=> onChange?.(i, e.target.value === '' ? '' : Number(e.target.value))}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}