/**
 * @file UnsupervisedHero.jsx
 * @description The main interactive component for demonstrating the unsupervised
 * learning model (DBSCAN). It visualizes live data and allows users to adjust
 * model parameters and upload their own datasets for comparison.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Slider, Grid, Button, Stack, useTheme,
} from '@mui/material';
import LiveHistogram from './LiveHistogram';
import DatasetMetrics from './DatasetMetrics';
import ScrollProgressBar from '../misc/ScrollProgressBar';

// Constants defined outside the component to prevent re-creation on render.
const PRESETS = {
  'High-Volume Anomaly': { eps: 0.1, min_samples: 2 },
  'Subtle Anomaly': { eps: 0.5, min_samples: 5 },
  'Baseline Traffic': { eps: 1, min_samples: 10 },
};

const DEFAULT_PARAMS = { eps: 0.5, min_samples: 5 };

const MODEL_PARAMS_CONFIG = {
  eps: { min: 0.1, max: 2, step: 0.05 },
  min_samples: { min: 2, max: 20, step: 1 },
};

export default function UnsupervisedHero() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [liveData, setLiveData] = useState([]);
  const [modelParams, setModelParams] = useState(DEFAULT_PARAMS);
  const [activePreset, setActivePreset] = useState('Subtle Anomaly');

  const generateDataPoint = useCallback(() => {
    const isMalicious = Math.random() < 0.15;
    const type = isMalicious
      ? ['Bruteforce', 'DoS', 'Mirai'][Math.floor(Math.random() * 3)]
      : ['Background', 'Audio', 'Video'][Math.floor(Math.random() * 3)];
    const bytes = isMalicious ? 5000 + Math.random() * 10000 : 100 + Math.random() * 4000;
    return { time: new Date().toISOString(), bytes, type };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveData((prevData) => {
        const newData = [...prevData, generateDataPoint()];
        const twentySecondsAgo = new Date().getTime() - 20000;
        return newData.filter((d) => new Date(d.time).getTime() > twentySecondsAgo);
      });
    }, 1200);
    return () => clearInterval(interval);
  }, [generateDataPoint]);

  const handleSliderChange = (param, value) => {
    setModelParams((prev) => ({ ...prev, [param]: value }));
    setActivePreset(null);
  };

  const handlePresetClick = (presetName) => {
    setActivePreset(presetName);
    setModelParams(PRESETS[presetName]);
  };

  return (
    <Box sx={{ px: { xs: 2, sm: 4 }, textAlign: 'center', py: 4 }}>
      <Typography variant="h4" sx={{ fontWeight: 'bold', color: isDark ? '#F0C966' : '#D95C39', mb: 2 }}>
        Live Unsupervised Learning with DBSCAN
      </Typography>
      <Typography sx={{ mb: 3, color: isDark ? '#AAA' : '#555', maxWidth: '700px', mx: 'auto' }}>
        Observe real-time traffic data being clustered. Adjust the DBSCAN model's
        parameters or load presets to see how it affects anomaly detection.
      </Typography>

      <Box sx={{ my: 4 }}>
        <LiveHistogram data={liveData} isDark={isDark} />
      </Box>

      <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 4 }}>
        {Object.keys(PRESETS).map((presetName) => (
          <Button
            key={presetName}
            variant={activePreset === presetName ? 'contained' : 'outlined'}
            onClick={() => handlePresetClick(presetName)}
            sx={{
              ...(activePreset === presetName && {
                backgroundColor: isDark ? "#F0C966" : "#000",
                color: isDark ? "#000" : "#FFF",
                '&:hover': {
                  backgroundColor: isDark ? '#e6b94e' : '#333',
                },
              }),
              ...(activePreset !== presetName && {
                borderColor: isDark ? "#F0C966" : "#000",
                color: isDark ? "#F0C966" : "#000",
                '&:hover': {
                  borderColor: isDark ? '#e6b94e' : '#333',
                  backgroundColor: isDark ? 'rgba(240, 201, 102, 0.1)' : 'rgba(0, 0, 0, 0.04)',
                },
              }),
            }}
          >
            {presetName}
          </Button>
        ))}
      </Stack>

      <Grid
        container
        spacing={4}
        justifyContent="center"
        alignItems="center"
        sx={{
          maxWidth: '700px', margin: '0 auto', mt: 3, p: 4,
          backgroundColor: isDark ? '#1C1C1C' : '#EFF0EB', borderRadius: '16px',
        }}
      >
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography gutterBottom sx={{ color: isDark ? '#FFF' : '#000' }}>
            Epsilon (eps):
            {' '}
            {modelParams.eps.toFixed(2)}
          </Typography>
          <Slider
            value={modelParams.eps}
            onChange={(e, val) => handleSliderChange('eps', val)}
            min={MODEL_PARAMS_CONFIG.eps.min}
            max={MODEL_PARAMS_CONFIG.eps.max}
            step={MODEL_PARAMS_CONFIG.eps.step}
            aria-labelledby="eps-slider"
            sx={{
              color: isDark ? '#F0C966' : '#000',
              '& .MuiSlider-rail': {
                color: isDark ? '#555' : '#ccc',
              },
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography gutterBottom sx={{ color: isDark ? '#FFF' : '#000' }}>
            Minimum Samples:
            {' '}
            {modelParams.min_samples}
          </Typography>
          <Slider
            value={modelParams.min_samples}
            onChange={(e, val) => handleSliderChange('min_samples', val)}
            min={MODEL_PARAMS_CONFIG.min_samples.min}
            max={MODEL_PARAMS_CONFIG.min_samples.max}
            step={MODEL_PARAMS_CONFIG.min_samples.step}
            aria-labelledby="min-samples-slider"
            sx={{
              color: isDark ? '#F0C966' : '#000',
              '& .MuiSlider-rail': {
                color: isDark ? '#555' : '#ccc',
              },
            }}
          />
        </Grid>
      </Grid>

      <Box sx={{ my: 10 }}>
        <ScrollProgressBar />
      </Box>

      {/* CORRECTED: Dataset Upload and Metrics Section Container */}
      <Box sx={{
        background: isDark ? '#222' : 'transparent',
        borderRadius: '16px',
        p: { xs: 2, md: 4 },
        maxWidth: '800px', // Set a max-width for larger screens
        width: '100%',     // Ensure it takes up available width on mobile
        mx: 'auto',        // Center the block horizontally
      }}
      >
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: isDark ? '#F0C966' : '#D95C39', mb: 2 }}>
          Test With Your Own Data
        </Typography>
        <Typography sx={{ mb: 3, color: isDark ? '#AAA' : '#555', maxWidth: '700px', mx: 'auto' }}>
          Upload your own CSV file to see how it compares with the training dataset and get a usability score.
        </Typography>
        <DatasetMetrics />
      </Box>
    </Box>
  );
}