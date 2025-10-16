import React from "react";
import { Box, Typography, Container } from "@mui/material";

export default function AboutMission() {
  return (
    <Container
      id="team"
      maxWidth="md"
      sx={{
        textAlign: "center",
        pb: 12,
        pt: 6,
        px: 3,
      }}
    >
      <Typography variant="h4" sx={{mb: 3, fontWeight: 600 }}>
        Project Mission
      </Typography>
      <Typography
        variant="body1"
        sx={{
          textAlign: "justify",
          color: "text.secondary",
          maxWidth: 700,
          mx: "auto",
          lineHeight: 1.6,
        }}
      >
        The goal is to support early detection of cyberattacks and improve network security. 
        This project involves developing a comprehensive machine-learning solution that integrates project management, 
        design elements, and technical implementation to address real-world challenges. Students will work in teams to 
        complete the project in three phases: creating a detailed project management plan, implementing a machine 
        learning model, and developing a dynamic website to showcase their results.
        The Machine Learning Web Application aims to deliver an interactive platform for users to engage with 
        machine learning models and visualize data insights. The primary goal is to demonstrate practical machine
         learning applications in real-world scenarios, enhancing user interaction and understanding of the 
         underlying models.
      </Typography>
    </Container>
  );
}
