import React, { useState } from "react";
import {
  Box,
  Button,
  Typography,
  Grid,
  CircularProgress,
} from "@mui/material";
import { compareDataset } from "../../api/predict";
const AnimatedStat = ({ value, label, duration = 800 }) => {
  const [displayValue, setDisplayValue] = useState(0);

  React.useEffect(() => {
    if (value === 0) return;
    let start = 0;
    const stepTime = Math.abs(Math.floor(duration / value));
    const interval = setInterval(() => {
      start += 1;
      setDisplayValue(start);
      if (start >= value) clearInterval(interval);
    }, stepTime);
    return () => clearInterval(interval);
  }, [value, duration]);

  return (
    <Box textAlign="center" sx={{ px: 2 }}>
      <Typography
        variant="h4"
        sx={{
          fontWeight: 600,
          background: "linear-gradient(45deg, #b06ab3, #4568dc)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        {displayValue.toLocaleString()}
      </Typography>
      <Typography variant="body1" sx={{ mt: 0.5, color: "text.primary" }}>
        {label}
      </Typography>
    </Box>
  );
};

const UsabilityGauge = ({ usability }) => {
  const percentage = Math.round(usability * 100);

  return (
    <Box textAlign="center" sx={{ mt: 4 }}>
      <Box sx={{ position: "relative", display: "inline-flex" }}>
        <CircularProgress
          variant="determinate"
          value={percentage}
          size={130}
          thickness={5}
          sx={{
            color:
              percentage > 80
                ? "#4caf50"
                : percentage > 60
                ? "#ffb300"
                : "#f44336",
          }}
        />
        <Box
          sx={{
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            position: "absolute",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography variant="h6" color="text.primary">
            {percentage}%
          </Typography>
        </Box>
      </Box>
      <Typography variant="body2" sx={{ mt: 1, color: "text.secondary" }}>
        Dataset Usability Score
      </Typography>
    </Box>
  );
};

const DatasetMetrics = () => {
  const [fileName, setFileName] = useState("");
  const [numRecords, setNumRecords] = useState(0);
  const [numFeatures, setNumFeatures] = useState(0);
  const [featureOverlap, setFeatureOverlap] = useState(0);
  const [usability, setUsability] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    setLoading(true);
    setErrorMsg("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const result = await compareDataset(file);
      setNumRecords(result.records_uploaded);
      setNumFeatures(result.features_uploaded);
      setFeatureOverlap(result.matching_features);
      setUsability(result.similarity_score || 0);
    } catch (err) {
      console.error("Dataset comparison failed:", err);
      setErrorMsg("Failed to process dataset. Please check your file format.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        textAlign: "center",
        py: -15,
        px: 2,
        backgroundColor: "transparent",
      }}
    >
      <Button
        variant="contained"
        component="label"
        sx={{
          background: "linear-gradient(45deg, #6a11cb, #2575fc)",
          color: "#fff",
          mb: 3,
          "&:hover": {
            background: "linear-gradient(45deg, #5b0eb3, #1f63e0)",
          },
        }}
      >
        Upload CSV
        <input hidden accept=".csv" type="file" onChange={handleFileUpload} />
      </Button>

      {loading && (
        <Typography sx={{ mt: 2, color: "text.secondary" }}>
          Processing dataset...
        </Typography>
      )}

      {errorMsg && (
        <Typography sx={{ color: "error.main", mt: 2 }}>{errorMsg}</Typography>
      )}

      {fileName && !loading && (
        <>
          <Typography
            variant="body2"
            sx={{ mb: 3, color: "text.secondary", fontStyle: "italic" }}
          >
            Uploaded file: <strong>{fileName}</strong>
          </Typography>
          <Grid container spacing={4} justifyContent="center">
            <Grid item xs={6} md={3}>
              <AnimatedStat value={numFeatures} label="Features" />
            </Grid>
            <Grid item xs={6} md={3}>
              <AnimatedStat value={numRecords} label="Records" />
            </Grid>
            <Grid item xs={6} md={3}>
              <AnimatedStat value={featureOverlap} label="Matching Features" />
            </Grid>
          </Grid>
          <UsabilityGauge usability={usability} />
          <Typography
            variant="body2"
            sx={{
              mt: 3,
              color: "text.secondary",
              maxWidth: 500,
              mx: "auto",
            }}
          >
            {featureOverlap} of {numFeatures} features matched the{" "}
            <strong>TII-SSRC-23</strong> dataset.
          </Typography>
        </>
      )}
    </Box>
  );
};

export default DatasetMetrics;