import React from "react";
import { Box, Typography } from "@mui/material";

export default function AboutHero() {
  return (
    <Box sx={{ textAlign: "center", py: 10 }}>
      <Typography variant="h3" sx={{ fontFamily: "Consolas, monospace", mb: 2 }}>
        About AurisAI
      </Typography>
      <Typography variant="body1" sx={{textAlign: "justify", maxWidth: 600, mx: "auto" }}>
        Classify network traffic and detect unusual or potentially malicious activity. 
        Students will analyse network data, extract features such as packet size and timing, 
        and train models to distinguish normal behaviour from anomalies. 
      </Typography>
    </Box>
  );
}
