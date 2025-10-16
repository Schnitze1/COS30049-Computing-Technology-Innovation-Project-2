// src/App.jsx
import React, { useState } from "react";
import { ThemeProvider, createTheme, CssBaseline, Box } from "@mui/material";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import TopBar from "./components/TopBar";
import Footer from "./components/Footer";
import FloatingDarkModeButton from "./components/FloatingDarkModeButton";


import Home from "./pages/Home";
import About from "./pages/About";
import Supervised from "./pages/Supervised";
import Unsupervised from "./pages/Unsupervised";
import DeepLearning from "./pages/Deep_Learning";
import Testing from "./pages/Testing";

function App() {
  const [darkMode, setDarkMode] = useState(false);

  const theme = createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
      background: {
        default: darkMode ? "#1A1414" : "#EFF0EB",
        paper: darkMode ? "#272121" : "#EFE9E0",
      },
    },
  });

  const handleDarkModeToggle = () => setDarkMode((prev) => !prev);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box
          sx={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            backgroundColor: theme.palette.background.default,
          }}
        >
          <TopBar darkMode={darkMode} />

          <Box sx={{ flex: 1, mt: "80px" }}>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/testing/supervised" element={<Supervised />} />
                <Route path="/testing/unsupervised" element={<Unsupervised />} />
                <Route path="/testing/deep-learning" element={<DeepLearning />} />
                <Route path="/testing" element={<Testing />} />
            </Routes>
            </Box>
          <Footer />
          <FloatingDarkModeButton toggleDarkMode={handleDarkModeToggle} />
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;
