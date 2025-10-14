import React, { useEffect, useState, useRef } from "react";
import { Box, useTheme } from "@mui/material";

export default function SectionScrollProgressBar({ children }) {
  const theme = useTheme();
  const [isFilled, setIsFilled] =useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsFilled(true);
          observer.unobserve(sectionRef.current);
        }
      },
      {
        threshold: 0,
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <Box ref={sectionRef} sx={{ position: "relative" }}>
      <Box
        sx={{
          position: "sticky",
          top: 0,
          left: 0,
          width: "100%",
          height: "2px",
          px: { xs: 3, md: 8 },
          zIndex: 1300,
        }}
      >
        <Box
          sx={{
            width: "100%",
            height: "100%",
            backgroundColor:
              theme.palette.mode === "dark"
                ? "rgba(255, 255, 255, 0.15)"
                : "rgba(0, 0, 0, 0.1)",
          }}
        >
          <Box
            sx={{
              height: "100%",
              width: isFilled ? "100%" : "0%",
              backgroundColor:
                theme.palette.mode === "dark" ? "#F0C966" : "#000",
              transition: "width 1.5s ease-in-out",
            }}
          />
        </Box>
      </Box>

      {children}
    </Box>
  );
}