/**
 * @file DeepHero.jsx
 * @description This component provides an interactive interface for the MLP 
 * model. It allows users to simulate different network traffic scenarios,
 * adjust feature values with sliders, and view the resulting classification
 * probabilities in a real-time chart
 */

import React, { useState, useEffect } from "react";
import {
  useTheme,
  Box,
  Typography,
  CircularProgress,
  Slider,
  Grid,
  Button,
  Stack
} from "@mui/material";
import { ProbabilityColumnChart } from "./ProbabilityColumnChart";

// Predefined feature vectors for network traffic simulations
const SIMULATION_PRESETS = {
  'DoS': [0.0, 0.000336, 0.0, 0.0, 4.7e-05, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
  'Bruteforce': [0.85, 0.000336, 0.75, 0.165951, 0.000944, 0.001881, 7e-05, 9.3e-05, 0.643275, 0.0, 0.067669, 0.197067, 0.783383, 0.0, 0.049119],
  'Background': [0.924297, 0.000336, 0.352941, 0.0, 4.7e-05, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]
};

// The top five most impactful features for the model, used to create the sliders
const TOP_FEATURES = [
  { name: 'Flow Duration', index: 0 },
  { name: 'Fwd Packet Length Max', index: 1 },
  { name: 'FWD Init Win Bytes', index: 2 },
  { name: 'Flow Bytes/s', index: 3 },
  { name: 'Flow IAT Mean', index: 4 }
];

// The labels for the possible classification outcomes from the model
const CLASS_LABELS = [
  "Audio", "Background", "Bruteforce", "DoS",
  "Information Gathering", "Mirai", "Text", "Video"
];

/**
 * Renders the main interactive hero section for the deep learning model.
 * It manages the state for feature inputs, handles API requests for predictions,
 * and displays the results
 */
export default function DeepHero() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [probabilities, setProbabilities] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [featureVector, setFeatureVector] = useState(SIMULATION_PRESETS.DoS);
  const [activePreset, setActivePreset] = useState('DoS');

  useEffect(() => {
    setIsLoading(true);
    const requestTimer = setTimeout(() => {
      const apiUrl = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000';
      fetch(`${apiUrl}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'mlp', instances: [featureVector] })
      })
        .then(res => res.json())
        .then(data => {
          if (data.probabilities && data.probabilities.length > 0) {
            setProbabilities(data.probabilities[0]);
          }
          setIsLoading(false);
        })
        .catch(err => {
          console.error("Prediction failed:", err);
          setIsLoading(false);
        });
    }, 300);

    return () => clearTimeout(requestTimer);
  }, [featureVector]);

  const handlePresetClick = (presetName) => {
    setActivePreset(presetName);
    setFeatureVector(SIMULATION_PRESETS[presetName]);
  };

  const handleSliderChange = (featureIndex, newValue) => {
    setActivePreset(null);
    const newVector = [...featureVector];
    newVector[featureIndex] = newValue;
    setFeatureVector(newVector);
  };

  return (
    <Box sx={{ px: { xs: 2, sm: 4 }, textAlign: 'center' }}>
      <Box sx={{
        display: 'inline-block',
        position: 'relative',
        minHeight: '400px',
        mt: 8,
        width: '100%',
        maxWidth: '924px',
      }}>
        {isLoading && (
          <CircularProgress
            sx={{ position: 'absolute', top: '50%', left: '50%', zIndex: 11, mt: '-20px', ml: '-20px' }}
          />
        )}
        <Box
          sx={{
            // Add responsive top padding to make space for buttons on mobile
            pt: { xs: '180px', sm: '32px' },
            px: { xs: 2, sm: '32px' },
            pb: { xs: 2, sm: '32px' },
            borderRadius: '16px',
            background: isDark ? '#222' : 'transparent',
            boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.4)' : 'none',
            transition: 'background 0.3s ease-in-out',
          }}
        >
          <Box sx={{ opacity: isLoading ? 0.3 : 1, transition: 'opacity 0.3s' }}>
            {probabilities ? (
              <Box sx={{ width: '100%', mx: 'auto' }}>
                <ProbabilityColumnChart probabilities={probabilities} classLabels={CLASS_LABELS} isDark={isDark} />
              </Box>
            ) : (
              <Box sx={{ width: '100%', height: { xs: '300px', sm: '400px', md: '575px' }, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography sx={{ color: isDark ? '#AAA' : '#555' }}>Loading prediction...</Typography>
              </Box>
            )}
          </Box>
        </Box>

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          alignItems="center"
          justifyContent="center"
          sx={{
            position: 'absolute',
            // Adjust top position to sit in the new padded area on mobile
            top: { xs: '20px', sm: '97px' },
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10,
            width: '90%',
          }}
        >
          {Object.keys(SIMULATION_PRESETS).map((presetName) => (
            <Button
              key={presetName}
              variant={activePreset === presetName ? "contained" : "outlined"}
              onClick={() => handlePresetClick(presetName)}
              sx={{
                width: { xs: '80%', sm: 'auto' }, // Allow buttons to be wider on mobile
                ...(activePreset === presetName && {
                  backgroundColor: isDark ? '#F0C966' : '#000',
                  color: isDark ? '#000' : '#FFF',
                  '&:hover': { backgroundColor: isDark ? '#e6b94e' : '#333' },
                }),
                ...(activePreset !== presetName && {
                  borderColor: isDark ? '#F0C966' : '#000',
                  color: isDark ? '#F0C966' : '#000',
                  '&:hover': {
                    borderColor: isDark ? '#e6b94e' : '#333',
                    backgroundColor: isDark ? 'rgba(240, 201, 102, 0.1)' : 'rgba(0, 0, 0, 0.04)',
                  },
                }),
              }}
            >
              Load {presetName} Simulation
            </Button>
          ))}
        </Stack>
      </Box>

      <Grid
        container
        spacing={4}
        justifyContent="center"
        alignItems="center"
        sx={{
          maxWidth: '960px',
          margin: '0 auto',
          mt: '-20px',
          position: 'relative',
          zIndex: 1,
          p: { xs: 2, md: 4 },
          borderRadius: '16px',
          backgroundColor: isDark ? '#1C1C1C' : '#EFF0EB',
          boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.4)' : '0 4px 12px rgba(0,0,0,0.1)',
        }}
      >
        {TOP_FEATURES.map((feature) => (
          <Grid item xs={12} sm={4} md={2.4} key={feature.index} sx={{ textAlign: 'center', minWidth: 150 }}>
            <Typography variant="caption" sx={{ fontWeight: 500, color: isDark ? '#FFF' : '#000', display: 'block', mb: 1 }}>
              {feature.name}
            </Typography>
            <Slider
              value={featureVector[feature.index] || 0}
              onChange={(e, newValue) => handleSliderChange(feature.index, newValue)}
              min={0}
              max={1}
              step={0.01}
              sx={{
                color: isDark ? '#F0C966' : '#000',
                '& .MuiSlider-rail': { color: isDark ? '#555' : '#ccc' }
              }}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}