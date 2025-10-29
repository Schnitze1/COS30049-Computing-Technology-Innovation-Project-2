/**
 * @file App.js
 * @description The root component of the application. It sets up the theme,
 * routing, and overall page layout.
 */

import React, { useState, useMemo } from 'react';
import { ThemeProvider, createTheme, CssBaseline, Box } from '@mui/material';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import layout components
import TopBar from './components/misc/TopBar';
import Footer from './components/misc/Footer';
import FloatingDarkModeButton from './components/misc/FloatingDarkModeButton';

// Import page components
import Home from './pages/Home';
import About from './pages/About';
import Supervised from './pages/Supervised';
import Unsupervised from './pages/Unsupervised';
import DeepLearning from './pages/Deep_Learning';
import Testing from './pages/Testing';

/**
 * The main application component.
 * It manages the dark mode theme state and defines the application's routes.
 */
export default function App() {
  // State to manage the light/dark theme.
  const [darkMode, setDarkMode] = useState(false);

  /**
   * Toggles the theme between light and dark mode.
   */
  const handleDarkModeToggle = () => setDarkMode((prevMode) => !prevMode);

  // The Material-UI theme is memoized to prevent it from being recalculated
  // on every render, which is a performance best practice.
  const theme = useMemo(() => createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      background: {
        default: darkMode ? '#1A1414' : '#EFF0EB',
        paper: darkMode ? '#272121' : '#EFE9E0',
      },
    },
  }), [darkMode]);

  return (
    <ThemeProvider theme={theme}>
      {/* CssBaseline provides a consistent baseline of styles across browsers. */}
      <CssBaseline />
      <Router>
        {/* Main container for the entire application layout. */}
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: 'background.default',
          }}
        >
          <TopBar darkMode={darkMode} />

          {/* Main content area that grows to fill available space. */}
          <Box component="main" sx={{ flex: 1, mt: '80px' }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/testing" element={<Testing />} />
              <Route path="/testing/supervised" element={<Supervised />} />
              <Route path="/testing/unsupervised" element={<Unsupervised />} />
              <Route path="/testing/deep-learning" element={<DeepLearning />} />
            </Routes>
          </Box>

          <Footer />
          <FloatingDarkModeButton toggleDarkMode={handleDarkModeToggle} />
        </Box>
      </Router>
    </ThemeProvider>
  );
}