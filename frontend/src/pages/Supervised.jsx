import React, { useState, useEffect } from "react";
import { useTheme, Box, Typography, CircularProgress, Slider, Grid, Button, Stack } from "@mui/material";
import DecisionFlowSankey from "../components/supervised/DecisionFlowSankey.jsx";

const CLASS_LABELS = ["Normal", "Bruteforce", "DoS", "Mirai"];
const CONTROLLED_FEATURES = [
  { name: "Flow Duration", index: 0 },
  { name: "Fwd Packet Length Max", index: 1 },
  { name: "FWD Init Win Bytes", index: 2 },
  { name: "Flow Bytes/s", index: 3 },
  { name: "Flow IAT Mean", index: 4 },
];
const MODEL_FEATURE_COUNT = 15;
const presets = {
  Normal: [0.2, 0.2, 0.2, 0.2, 0.2],
  Bruteforce: [0.7, 0.5, 0.6, 0.3, 0.4],
  DoS: [0.9, 0.7, 0.8, 0.6, 0.7],
  Mirai: [0.0, 0.0, 0.0, 0.0, 0.8],
};

const SupervisedPage = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const [controlledValues, setControlledValues] = useState(presets.Normal);
  const [activePreset, setActivePreset] = useState("Normal");
  const [probabilities, setProbabilities] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const buildFullFeatureVector = (controlledValues) => {
    const full = Array(MODEL_FEATURE_COUNT).fill(0.5);
    CONTROLLED_FEATURES.forEach((f, i) => {
      full[f.index] = controlledValues[i];
    });
    return full;
  };

  useEffect(() => {
    const payload = buildFullFeatureVector(controlledValues);
    setIsLoading(true);

    const handler = setTimeout(() => {
      fetch("http://127.0.0.1:8000/predict/random_forest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instances: [payload],
        }),
      })
        .then((res) => {
          if (!res.ok) throw new Error(`Server error: ${res.status}`);
          return res.json();
        })
        .then((data) => {
          if (data.probabilities && data.probabilities.length > 0) {
            setProbabilities(data.probabilities[0]);
          } else {
            console.error("Unexpected response:", data);
          }
          setIsLoading(false);
        })
        .catch((err) => {
          console.error("Prediction failed:", err);
          setIsLoading(false);
        });
    }, 300);

    return () => clearTimeout(handler);
  }, [controlledValues]);

  const handleSliderChange = (featureIndex, newValue) => {
    const updated = [...controlledValues];
    updated[featureIndex] = newValue;
    setControlledValues(updated);
    setActivePreset(null);
  };

  const handlePresetClick = (presetName) => {
    setControlledValues(presets[presetName]);
    setActivePreset(presetName);
  };
  const namedVector = Object.fromEntries(
    CONTROLLED_FEATURES.map((f, i) => [f.name, controlledValues[i]])
  );

  return (
    <Box
      sx={{
        backgroundColor: isDark ? "#1A1414" : "#EAE6DE",
        py: 4,
        minHeight: "100vh",
        transition: "background-color 0.4s ease",
      }}
    >
      <Box sx={{ px: 4, textAlign: "center" }}>
        <Typography
          variant="h4"
          sx={{ fontWeight: "bold", color: isDark ? "#F0C966" : "#000", mb: 2 }}
        >
          Random Forest Decision Flow
        </Typography>
        <Typography sx={{ mb: 3, color: isDark ? "#AAA" : "#555" }}>
          Adjust the top 5 influential features or load a preset to see real-time predictions.
        </Typography>
        <Box sx={{ position: "relative", minHeight: "500px" }}>
          {isLoading && (
            <CircularProgress
              sx={{
                position: "absolute",
                top: "45%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                zIndex: 10,
              }}
            />
          )}
          <Box sx={{ opacity: isLoading ? 0.4 : 1, transition: "opacity 0.3s" }}>
            {probabilities && CONTROLLED_FEATURES.length > 0 && Object.values(namedVector).every(v => v !== undefined) && (
                <DecisionFlowSankey
                    probabilities={probabilities}
                    classLabels={CLASS_LABELS}
                    featureImportances={CONTROLLED_FEATURES}
                    featureVector={namedVector}
                    modelName="Random Forest"
                    isDark={isDark}
                />
                )}

          </Box>
        </Box>
        
        <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 4 }}>
          {Object.keys(presets).map((presetName) => (
            <Button
              key={presetName}
              variant={activePreset === presetName ? "contained" : "outlined"}
              onClick={() => handlePresetClick(presetName)}
              sx={{
                ...(activePreset === presetName && {
                  backgroundColor: isDark ? "#F0C966" : "#000",
                  color: isDark ? "#000" : "#FFF",
                }),
                ...(activePreset !== presetName && {
                  borderColor: isDark ? "#F0C966" : "#000",
                  color: isDark ? "#F0C966" : "#000",
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
            p: 4,
          }}
        >
          {CONTROLLED_FEATURES.map((feature, i) => (
            <Grid item xs={12} sm={4} md={2.4} key={feature.name} sx={{ textAlign: "center" }}>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 500,
                  color: isDark ? "#FFF" : "#000",
                  display: "block",
                  mb: 1,
                }}
              >
                {feature.name}
              </Typography>
              <Slider
                value={controlledValues[i]}
                onChange={(e, newValue) => handleSliderChange(i, newValue)}
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
      </Box>
    </Box>
  );
};

export default SupervisedPage;
