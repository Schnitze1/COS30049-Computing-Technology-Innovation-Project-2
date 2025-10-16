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
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const tempCanvas = document.createElement("canvas");
        const ctx = tempCanvas.getContext("2d");
        tempCanvas.width = img.width;
        tempCanvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        const data = imageData.data;
        let minX = img.width,
          minY = img.height,
          maxX = 0,
          maxY = 0;
        for (let y = 0; y < img.height; y++) {
          for (let x = 0; x < img.width; x++) {
            const idx = (y * img.width + x) * 4 + 3;
            if (data[idx] > 10) {
              if (x < minX) minX = x;
              if (y < minY) minY = y;
              if (x > maxX) maxX = x;
              if (y > maxY) maxY = y;
            }
          }
        }

        const cropWidth = maxX - minX + 1;
        const cropHeight = maxY - minY + 1;
        const canvas = document.createElement("canvas");
        canvas.width = 692;
        canvas.height = 351;
        const outCtx = canvas.getContext("2d");
        const scale = Math.max(cropWidth / 692, cropHeight / 351);
        const drawWidth = cropWidth / scale;
        const drawHeight = cropHeight / scale;
        const dx = (692 - drawWidth) / 2;
        const dy = (351 - drawHeight) / 2;

        outCtx.drawImage(
          img,
          minX,
          minY,
          cropWidth,
          cropHeight,
          dx,
          dy,
          drawWidth,
          drawHeight
        );

        resolve(canvas.toDataURL("image/png"));
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

export default function AboutGallery() {
  const [processedImages, setProcessedImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    let mounted = true;
    Promise.all(SOURCE_IMAGES.map((s) => processImageToDataUrl(s)))
      .then((dataUrls) => {
        if (mounted) setProcessedImages(dataUrls);
      })
      .catch((err) => {
        console.error("Error processing images:", err);
        if (mounted) setProcessedImages(SOURCE_IMAGES);
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!processedImages.length) return;
    const handle = setInterval(() => {
      setCurrentIndex((p) => (p + 1) % processedImages.length);
    }, 20000);
    return () => clearInterval(handle);
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
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        mt: 6,
        mb: 10,
      }}
    >
      <Box
        sx={{
          position: "relative",
          width: TARGET_WIDTH,
          height: TARGET_HEIGHT,
          maxWidth: "100%", // stop overflow on small screens
          overflow: "hidden",
          background: "transparent",
          boxShadow: "none",
          border: "none",
        }}
      >
        {processedImages.map((src, i) => (
          <Box
            key={i}
            component="img"
            src={src}
            alt={`Slide ${i + 1}`}
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: `${TARGET_WIDTH}px`,
              height: `${TARGET_HEIGHT}px`,
              opacity: currentIndex === i ? 1 : 0,
              transition: "opacity 0.6s ease-in-out",
              display: "block",
              border: "none",
              margin: 0,
              padding: 0,
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
          {processedImages.map((_, i) => (
            <Box
              key={i}
              onClick={() => setCurrentIndex(i)}
              sx={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                bgcolor: currentIndex === i ? "text.primary" : "grey.400",
                opacity: currentIndex === i ? 0.95 : 0.45,
                cursor: "pointer",
              }}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
}
