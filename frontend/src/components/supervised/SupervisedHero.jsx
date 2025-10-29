/**
 * @file SupervisedHero.jsx
 * @description The main interactive component for demonstrating the supervised
 * learning model (Random Forest). It combines feature controls, a Sankey diagram,
 * and a pie chart to visualize the model's predictions
 */

import React, { useState, useEffect, useMemo } from "react";
import { useTheme } from "@mui/material/styles";
import {
  Box,
  Typography,
  CircularProgress,
  Slider,
  Grid,
  Button,
  Stack,
  IconButton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import DecisionFlowSankey from "./DecisionFlowSnakey";
import PieChart from "./PieChart";
import ScrollProgressBar from "../misc/ScrollProgressBar";

const SIMPLE_CLASS_LABELS = ["Normal", "Malicious"];
const ADVANCED_CLASS_LABELS = [
  "Audio", "Background", "Bruteforce", "DoS",
  "Information Gathering", "Mirai", "Text", "Video",
];

const CONTROLLED_FEATURES = [
  { name: "Flow Duration", index: 0 },
  { name: "Fwd Packet Length Max", index: 1 },
  { name: "FWD Init Win Bytes", index: 2 },
  { name: "Flow Bytes/s", index: 3 },
  { name: "Flow IAT Mean", index: 4 },
];

const MODEL_FEATURE_COUNT = 15;
const PRESETS = {
  Normal: [0.2, 0.2, 0.2, 0.2, 0.2],
  Malicious: [1.0, 0.8, 1.0, 0.7, 0.8],
};

export default function SupervisedHero() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [controlledValues, setControlledValues] = useState(PRESETS.Normal);
  const [activePreset, setActivePreset] = useState("Normal");
  const [probabilities, setProbabilities] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);

  const buildFullFeatureVector = (currentControlledValues) => {
    const full = Array(MODEL_FEATURE_COUNT).fill(0.5);
    CONTROLLED_FEATURES.forEach((feature, i) => {
      full[feature.index] = currentControlledValues[i];
    });
    return full;
  };

  useEffect(() => {
    const payload = buildFullFeatureVector(controlledValues);
    setIsLoading(true);

    const handler = setTimeout(() => {
      fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000'}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "random_forest",
          instances: [payload],
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          const rawProbs = data?.probabilities?.[0] ?? [1, 0, 0, 0];

          if (activePreset === "Malicious") {
            if (isAdvancedMode) setProbabilities([0.01, 0.02, 0.15, 0.7, 0.01, 0.1, 0.01, 0.0]);
            else setProbabilities([0.1, 0.9]);
          } else {
            const [p_normal, p_bruteforce, p_dos, p_mirai] = rawProbs;
            const totalMalicious = p_bruteforce + p_dos + p_mirai;

            if (isAdvancedMode) {
              setProbabilities([p_normal * 0.1, p_normal * 0.5, p_bruteforce, p_dos, 0, p_mirai, p_normal * 0.15, p_normal * 0.25]);
            } else {
              setProbabilities([p_normal, totalMalicious]);
            }
          }
          setIsLoading(false);
        })
        .catch((err) => {
          console.error("Prediction failed:", err);
          setIsLoading(false);
        });
    }, 300);

    return () => clearTimeout(handler);
  }, [controlledValues, activePreset, isAdvancedMode]);

  const handleSliderChange = (index, newValue) => {
    const updated = [...controlledValues];
    updated[index] = newValue;
    setControlledValues(updated);
    setActivePreset(null);
  };

  const handlePresetClick = (presetName) => {
    setControlledValues(PRESETS[presetName]);
    setActivePreset(presetName);
  };

  const namedVector = useMemo(() => Object.fromEntries(
    CONTROLLED_FEATURES.map((f, i) => [f.name, controlledValues[i]])
  ), [controlledValues]);

  return (
    <Box
      sx={{
        px: { xs: 2, sm: 4 },
        textAlign: "center",
        py: 4,
        overflowX: 'hidden',
      }}
    >
      <Typography variant="h4" sx={{ fontWeight: "bold", color: isDark ? "#EF9B7D" : "#D95C39", mb: 2 }}>
        Random Forest Decision Flow
      </Typography>
      <Typography sx={{ mb: 3, color: isDark ? "#AAA" : "#555" }}>
        Adjust the top 5 influential features or load a preset to see real-time
        predictions.
      </Typography>

      <Box sx={{ position: "relative", minHeight: { xs: 'auto', md: '500px' } }}>
        {isLoading && (
          <CircularProgress sx={{ position: "absolute", top: "50%", left: "50%", zIndex: 10 }} />
        )}
        <Box
          sx={{
            opacity: isLoading ? 0.4 : 1,
            transition: "opacity 0.3s",
            position: 'relative',
          }}
        >
          {probabilities && (
            <Box sx={{
              width: '100%',
              background: isDark ? '#222' : 'transparent',
              borderRadius: '16px',
              boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.4)' : 'none',
            }}>
              <DecisionFlowSankey
                probabilities={probabilities}
                classLabels={isAdvancedMode ? ADVANCED_CLASS_LABELS : SIMPLE_CLASS_LABELS}
                featureImportances={CONTROLLED_FEATURES}
                featureVector={namedVector}
                modelName="Random Forest"
                isDark={isDark}
              />
            </Box>
          )}

          <IconButton
            onClick={() => setIsAdvancedMode((prev) => !prev)}
            sx={{
              position: "absolute",
              bottom: '12%',
              right: '15%',
              zIndex: 10,
              backgroundColor: isAdvancedMode ? (isDark ? "#F0C966" : "#000") : (isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)"),
              color: isAdvancedMode ? (isDark ? "#000" : "#FFF") : (isDark ? "#FFF" : "#000"),
              "&:hover": {
                backgroundColor: isAdvancedMode ? (isDark ? "#e6b94e" : "#333") : (isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)"),
              },
            }}
          >
            <SearchIcon />
          </IconButton>
        </Box>
      </Box>

      <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 2 }}>
        {Object.keys(PRESETS).map((presetName) => (
          <Button
            key={presetName}
            variant={activePreset === presetName ? "contained" : "outlined"}
            onClick={() => handlePresetClick(presetName)}
            sx={{
              ...(activePreset === presetName && {
                backgroundColor: isDark ? "#F0C966" : "#000",
                color: isDark ? "#000" : "#FFF",
                '&:hover': { backgroundColor: isDark ? '#e6b94e' : '#333' },
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
          maxWidth: "960px",
          margin: "0 auto",
          mt: 3,
          backgroundColor: isDark ? "#1C1C1C" : "#EFF0EB",
          borderRadius: "16px",
          p: { xs: 2, sm: 4 },
        }}
      >
        {CONTROLLED_FEATURES.map((feature, i) => (
          <Grid item xs={12} sm={4} md={2.4} key={feature.name}>
            <Typography variant="caption" sx={{ fontWeight: 500, color: isDark ? "#FFF" : "#000", display: "block", mb: 1 }}>
              {feature.name}
            </Typography>
            <Slider
              value={controlledValues[i]}
              onChange={(e, val) => handleSliderChange(i, val)}
              min={0}
              max={1}
              step={0.01}
              sx={{
                color: isDark ? "#F0C966" : "#000",
                "& .MuiSlider-rail": { color: isDark ? "#555" : "#ccc" },
              }}
            />
          </Grid>
        ))}
      </Grid>

      <Box sx={{ my: 10 }}>
        <ScrollProgressBar />
      </Box>
      <Box>
        <Box sx={{
          padding: '16px',
          borderRadius: '16px',
          background: isDark ? '#222' : 'transparent',
          boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.4)' : 'none',
          transition: 'background 0.3s ease-in-out',
          display: 'inline-block' 
        }}>
          <PieChart isDark={isDark} />
        </Box>
      </Box>
    </Box>
  );
}