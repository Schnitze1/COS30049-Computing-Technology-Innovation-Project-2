import React, { useState } from "react";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import TopBar from "./components/TopBar";
import FloatingDarkModeButton from "./components/FloatingDarkModeButton";
import HeroSection from "./components/HeroSection";
import ContentIsland from "./components/ContentIsland";
import Footer from "./components/Footer";

function App() {
    const [darkMode, setDarkMode] = useState(false);

    const theme = createTheme({
        palette: {
            mode: darkMode ? "dark" : "light",
            background: {
                default: darkMode ? "#1A1414" : "#EFF0EB",
                paper: darkMode ? "#272121" : "#EFE9E0",
            }
        },
    });

    const handleDarkModeToggle = () => setDarkMode((prev) => !prev);

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <TopBar darkMode={darkMode} />
            <HeroSection />
            <ContentIsland />
            <FloatingDarkModeButton toggleDarkMode={handleDarkModeToggle} />
            <Footer />
        </ThemeProvider>
    );
}

export default App;