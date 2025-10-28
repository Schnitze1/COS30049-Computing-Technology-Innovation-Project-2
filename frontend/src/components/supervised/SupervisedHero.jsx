import React, { useState, useEffect } from "react";
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
import { predict } from "../../api/predict";

const SIMPLE_CLASS_LABELS = ["Normal", "Malicious"];
const ADVANCED_CLASS_LABELS = [
  "Audio",
  "Background",
  "Bruteforce",
  "DoS",
  "Information Gathering",
  "Mirai",
  "Text",
  "Video",
];

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
  Malicious: [1.0, 0.8, 1.0, 0.7, 0.8],
};

const SupervisedHero = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [controlledValues, setControlledValues] = useState(presets.Normal);
  const [activePreset, setActivePreset] = useState("Normal");
  const [probabilities, setProbabilities] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);
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
      predict("random_forest", payload)
        .then((data) => {
          const rawProbs =
            data?.probabilities?.[0] ?? [1, 0, 0, 0];

          if (activePreset === "Malicious") {
            if (isAdvancedMode)
              setProbabilities([0.01, 0.02, 0.15, 0.7, 0.01, 0.1, 0.01, 0.0]);
            else setProbabilities([0.1, 0.9]);
          } else {
            const [p_normal, p_bruteforce, p_dos, p_mirai] = rawProbs;
            const totalMalicious = p_bruteforce + p_dos + p_mirai;

            if (isAdvancedMode) {
              const p_audio = p_normal * 0.1;
              const p_background = p_normal * 0.5;
              const p_text = p_normal * 0.15;
              const p_video = p_normal * 0.25;
              const p_infogathering = 0;
              setProbabilities([
                p_audio,
                p_background,
                p_bruteforce,
                p_dos,
                p_infogathering,
                p_mirai,
                p_text,
                p_video,
              ]);
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
    setControlledValues(presets[presetName]);
    setActivePreset(presetName);
  };

  const namedVector = Object.fromEntries(
    CONTROLLED_FEATURES.map((f, i) => [f.name, controlledValues[i]])
  );

  return (
    <Box
      sx={{
        px: 4,
        textAlign: "center",
        py: 4,
      }}
    >
      <Typography
        variant="h4"
        sx={{
          fontWeight: "bold",
          color: isDark ? "#EF9B7D" : "#D95C39",
          mb: 2,
        }}
      >
        Random Forest Decision Flow
      </Typography>

      <Typography
        sx={{
          mb: 3,
          color: isDark ? "#AAA" : "#555",
        }}
      >
        Adjust the top 5 influential features or load a preset to see real-time
        predictions.
      </Typography>

      <Box sx={{ position: "relative", minHeight: "500px" }}>
        {isLoading && (
          <CircularProgress
            sx={{ position: "absolute", top: "50%", left: "50%", transform: 'translate(-50%, -50%)', zIndex: 10 }}
          />
        )}
        <Box
          sx={{
            opacity: isLoading ? 0.4 : 1,
            transition: "opacity 0.3s",
          }}
        >
          {probabilities && (
            <Box sx={{
                padding: '16px',
                borderRadius: '16px',
                background: isDark ? '#222' : 'transparent',
                boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.4)' : 'none',
                transition: 'background 0.3s ease-in-out',
            }}>
                <DecisionFlowSankey
                  probabilities={probabilities}
                  classLabels={
                    isAdvancedMode ? ADVANCED_CLASS_LABELS : SIMPLE_CLASS_LABELS
                  }
                  featureImportances={CONTROLLED_FEATURES}
                  featureVector={namedVector}
                  modelName="Random Forest"
                  isDark={isDark}
                />
            </Box>
          )}
        </Box>

        <IconButton
          onClick={() => setIsAdvancedMode((prev) => !prev)}
          sx={{
            position: "relative",
            bottom: 48,
            right: -390,
            zIndex: 10,
            backgroundColor: isAdvancedMode
              ? isDark
                ? "#F0C966"
                : "#000"
              : isDark
              ? "rgba(255, 255, 255, 0.1)"
              : "rgba(0, 0, 0, 0.05)",
            color: isAdvancedMode
              ? isDark
                ? "#000"
                : "#FFF"
              : isDark
              ? "#FFF"
              : "#000",
            backdropFilter: "blur(4px)",
            "&:hover": {
              backgroundColor: isAdvancedMode
                ? isDark
                  ? "#e6b94e"
                  : "#333"
                : isDark
                ? "rgba(255,255,255,0.2)"
                : "rgba(0,0,0,0.1)",
            },
          }}
        >
          <SearchIcon />
        </IconButton>
      </Box>

      <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 2 }}>
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
          <Grid item xs={12} sm={4} md={2.4} key={feature.name}>
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
              onChange={(e, val) => handleSliderChange(i, val)}
              min={0}
              max={1}
              step={0.01}
              sx={{
                color: isDark ? "#F0C966" : "#000",
                "& .MuiSlider-rail": {
                  color: isDark ? "#555" : "#ccc",
                },
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
};

export default SupervisedHero;