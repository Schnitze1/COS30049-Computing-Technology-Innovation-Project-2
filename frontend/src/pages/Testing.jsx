import React, { useState } from 'react';
import { Box, Typography, Button, Grid, Alert, CircularProgress, Paper, Stack } from '@mui/material';
import { SAMPLES } from '../constants/model_playground';
import ModelSelector from '../components/testing/ModelSelector';
import SampleSelector from '../components/testing/SampleSelector';
import FeatureGrid from '../components/testing/FeatureGrid';
import PredictionPanel from '../components/testing/PredictionPanel';
import { predict } from '../api/predict';

const Testing = () => {
  const [selectedModel, setSelectedModel] = useState('random_forest');
  const [selectedSample, setSelectedSample] = useState('Audio');
  const [predictions, setPredictions] = useState(null);
  const [values, setValues] = useState(SAMPLES['Audio']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handlePredict = async () => {
    setLoading(true); setError(null); setSuccess(null);
    try {
      const result = await predict(selectedModel, values);
      setPredictions(result);
      setSuccess('Prediction completed successfully!');
    } catch (err) {
      setError(`Prediction failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSampleChange = (s) => {
    setSelectedSample(s);
    setValues(SAMPLES[s]);
  };

  const handleValueChange = (index, newVal) => {
    setValues((prev)=> {
      const next = [...prev];
      next[index] = newVal === '' ? '' : Number(newVal);
      return next;
    });
  };

  return (
    <Box sx={{ p:3, maxWidth:1400, mx:'auto', minHeight:'100vh', bgcolor:'background.default' }}>
      <Typography variant="h4" gutterBottom sx={{ mb:4, textAlign:'center' }}>Model Playground</Typography>
      <Grid container spacing={4} sx={{ height:'calc(100vh - 200px)' }}>
        <Grid size={6}>
          <Paper sx={{ p:3, height:'100%', display:'flex', flexDirection:'column' }}>
            <Typography variant="h6" gutterBottom sx={{ mb:3 }}>Model Playground</Typography>
            <Stack spacing={3} sx={{ flex:1 }}>
              <ModelSelector value={selectedModel} onChange={setSelectedModel} />
              <SampleSelector value={selectedSample} onChange={handleSampleChange} />
              <FeatureGrid values={values} onChange={handleValueChange} />
              <Button variant="contained" onClick={handlePredict} disabled={loading} fullWidth size="large"
                sx={{ bgcolor:'success.main', '&:hover':{bgcolor:'success.dark'}, py:1.5 }}>
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Predict'}
              </Button>
            </Stack>
          </Paper>
        </Grid>
        <Grid size={6}>
          <Paper sx={{ p:3, height:'100%', display:'flex', flexDirection:'column' }}>
            <Typography variant="h6" gutterBottom sx={{ mb:3 }}>Predicted Output</Typography>
            <Box sx={{ flex:1, display:'flex', flexDirection:'column' }}>
              {error && <Alert severity="error" sx={{ mb:2 }}>{error}</Alert>}
              {success && <Alert severity="success" sx={{ mb:2 }}>{success}</Alert>}
              {predictions
                ? <PredictionPanel predictions={predictions} />
                : <Box sx={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', color:'text.secondary' }}>
                    <Typography variant="body1">Select a model and sample, then click Predict to see results</Typography>
                  </Box>}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Testing;