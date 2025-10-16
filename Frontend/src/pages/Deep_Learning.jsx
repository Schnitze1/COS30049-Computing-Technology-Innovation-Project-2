import React from "react";
import { useTheme, Box, Typography } from "@mui/material";
import DeepHero from "../components/deep_learning/DeepHero";
import DeepLearningDiagram from "../components/deep_learning/DeepLearningDiagram";
import ScrollProgressBar from "../components/ScrollProgressBar";

const DeepLearningPage = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";


  return (
    <Box sx={{ backgroundColor: isDark ? "#1A1414" : "#EAE6DE", transition: "background-color 0.5s ease", py: 4 }}>
      <Box sx={{ px: 4, textAlign: 'center' }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 4, color: isDark ? '#F0C966' : '#000' }}>
              MLP Model Architecture
          </Typography>
          <DeepLearningDiagram modelName="mlp" isDark={isDark} />
      </Box>
      <Box sx={{ my: 10 }}>
        <ScrollProgressBar />
      </Box>
      <DeepHero />
    </Box>
  );
};
export default DeepLearningPage;