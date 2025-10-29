/**
 * @file ScrollProgressBar.jsx
 * @description A component that displays a progress bar which animates to completion
 * when it scrolls
 */

import React, { useEffect, useState, useRef } from "react";
import { Box, useTheme } from "@mui/material";

/**
 * Renders a sticky progress bar that fills up when its container section
 * becomes visible on the screen
 * It uses the IntersectionObserver API for efficient visibility detection
 */
export default function SectionScrollProgressBar() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  // State to track whether the progress bar should be filled
  const [isFilled, setIsFilled] = useState(false);
  // A ref attached to the parent container to observe its visibility
  const sectionRef = useRef(null);

  // Effect to set up the IntersectionObserver
  useEffect(() => {
    // The observer callback is triggered when the element's visibility changes
    const observer = new IntersectionObserver(
      ([entry]) => {
        // When the element is intersecting the viewport, fill the bar
        if (entry.isIntersecting) {
          setIsFilled(true);
          observer.unobserve(entry.target);
        }
      },
      // The threshold of 0 means the callback fires as soon as any part
      // of the element is visible
      { threshold: 0 },
    );

    const currentSectionRef = sectionRef.current;
    if (currentSectionRef) {
      observer.observe(currentSectionRef);
    }

    // Cleanup function to unobserve the element when refresing the page
    return () => {
      if (currentSectionRef) {
        observer.unobserve(currentSectionRef);
      }
    };
  }, []);

  return (
    <Box ref={sectionRef} sx={{ position: "relative" }}>
      {/* The sticky container for the progress bar to ensure cross device compatability*/}
      <Box
        sx={{
          position: "sticky",
          top: 0,
          left: 0,
          width: "100%",
          height: "3px",
          px: { xs: 3, md: 8 },
          zIndex: 1300,
          overflow: "hidden",
        }}
      >
        {/* The background of the progress bar */}
        <Box
          sx={{
            width: "100%",
            height: "100%",
            backgroundColor: isDark
              ? "rgba(255, 255, 255, 0.1)"
              : "rgba(0, 0, 0, 0.1)",
            borderRadius: "2px",
          }}
        >
          {/* Fill the progress bar */}
          <Box
            sx={{
              height: "100%",
              width: isFilled ? "100%" : "0%",
              background: "linear-gradient(90deg, #ff4b1f, #ff9068, #4286f4)",
              borderRadius: "2px",
              transition: "width 1.8s cubic-bezier(0.4, 0, 0.2, 1), opacity 1s",
              opacity: isFilled ? 1 : 0.3,
            }}
          />
        </Box>
      </Box>
    </Box>
  );
}