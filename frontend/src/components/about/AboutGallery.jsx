/**
 * @file AboutGallery.jsx
 * @description This component displays a responsive, auto-playing image gallery.
 * It uses client-side processing for desktop and falls back to raw images
 * with CSS scaling for mobile to ensure reliability and performance
 */

import React, { useState, useEffect } from "react";
import { Box } from "@mui/material";

const SOURCE_IMAGES = [
  "/gallery_image1.png",
  "/gallery_image2.png",
  "/gallery_image3.png",
];

const TARGET_WIDTH = 692;
const TARGET_HEIGHT = 351;

function processImageToDataUrl(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    const fallback = () => resolve(src); 

    img.onload = () => {
      try {
        const tempCanvas = document.createElement("canvas");
        const ctx = tempCanvas.getContext("2d");
        if (!ctx) return fallback();

        tempCanvas.width = img.width;
        tempCanvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        const data = imageData.data;
        let minX = img.width, minY = img.height, maxX = 0, maxY = 0;
        for (let y = 0; y < img.height; y++) {
          for (let x = 0; x < img.width; x++) {
            if (data[(y * img.width + x) * 4 + 3] > 10) {
              minX = Math.min(x, minX);
              minY = Math.min(y, minY);
              maxX = Math.max(x, maxX);
              maxY = Math.max(y, maxY);
            }
          }
        }
        const cropWidth = maxX - minX + 1;
        const cropHeight = maxY - minY + 1;
        const canvas = document.createElement("canvas");
        canvas.width = TARGET_WIDTH;
        canvas.height = TARGET_HEIGHT;
        const outCtx = canvas.getContext("2d");
        if (!outCtx) return fallback();

        const scale = Math.max(cropWidth / TARGET_WIDTH, cropHeight / TARGET_HEIGHT);
        const drawWidth = cropWidth / scale;
        const drawHeight = cropHeight / scale;
        const dx = (TARGET_WIDTH - drawWidth) / 2;
        const dy = (TARGET_HEIGHT - drawHeight) / 2;
        outCtx.drawImage(img, minX, minY, cropWidth, cropHeight, dx, dy, drawWidth, drawHeight);
        resolve(canvas.toDataURL("image/png"));
      } catch (err) {
        fallback();
      }
    };
    img.onerror = fallback;
    img.src = src;
  });
}

export default function AboutGallery() {
  const [processedImages, setProcessedImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    let mounted = true;
    const isMobile = window.innerWidth < 768; // Check for mobile devices

    if (isMobile) {
      // On mobile, skip the heavy processing and use original images
      setProcessedImages(SOURCE_IMAGES);
    } else {
      // On desktop, run the full image processing
      Promise.all(SOURCE_IMAGES.map(processImageToDataUrl))
        .then((imageUrls) => {
          if (mounted) {
            setProcessedImages(imageUrls);
          }
        });
    }

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!processedImages.length) return undefined;
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % processedImages.length);
    }, 20000);
    return () => clearInterval(timer);
  }, [processedImages]);

  if (!processedImages.length) {
    return (
      <Box sx={{ width: "100%", display: "flex", justifyContent: "center", py: 6 }}>
        <div>Loading images…</div>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: "100%", display: "flex", justifyContent: "center",
        alignItems: "center", mt: 6, mb: 10, px: { xs: 2, md: 0 },
      }}
    >
      <Box
        sx={{
          position: "relative",
          width: { xs: '100%', md: TARGET_WIDTH },
          height: { xs: 0, md: TARGET_HEIGHT },
          maxWidth: "100%",
          overflow: "hidden",
          // Aspect ratio is only needed for the mobile responsive view
          paddingTop: { xs: `${(TARGET_HEIGHT / TARGET_WIDTH) * 100}%`, md: 0 },
        }}
      >
        {processedImages.map((src, index) => (
          <Box
            key={index}
            component="img"
            src={src}
            alt={`Slide ${index + 1}`}
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              // Use 'contain' to ensure the entire image is visible without cropping
              objectFit: 'contain',
              opacity: currentIndex === index ? 1 : 0,
              transition: "opacity 0.6s ease-in-out",
            }}
          />
        ))}

        <Box
          sx={{
            position: "absolute",
            bottom: 8,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            gap: 1,
          }}
        >
          {processedImages.map((_, index) => (
            <Box
              key={index}
              onClick={() => setCurrentIndex(index)}
              sx={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                bgcolor: currentIndex === index ? "text.primary" : "grey.400",
                opacity: currentIndex === index ? 0.95 : 0.45,
                cursor: "pointer",
              }}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
}