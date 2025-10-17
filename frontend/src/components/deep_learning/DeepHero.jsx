import React, { useState, useEffect } from "react";
import { useTheme, Box, Typography, CircularProgress, Slider, Grid, Button, Stack } from "@mui/material";
import { ProbabilityColumnChart } from "./ProbabilityColumnChart"; 

const simulationPresets = {
    'DoS': [0.0, 0.000336, 0.0, 0.0, 4.7e-05, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
    'Bruteforce':  [0.525122, 0.000336, 0.352941, 0.165951, 0.000944, 0.001881, 7e-05, 9.3e-05, 0.643275, 0.0, 0.067669, 0.197067, 0.783383, 0.0, 0.049119],
    'Background': [0.924297, 0.000336, 0.352941, 0.0, 4.7e-05, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]
};

const topFeatures = [
    { name: 'Flow Duration', index: 0 },
    { name: 'Fwd Packet Length Max', index: 1 },
    { name: 'FWD Init Win Bytes', index: 2 },
    { name: 'Flow Bytes/s', index: 3 },
    { name: 'Flow IAT Mean', index: 4 }
];

const DeepHero = () => {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";
    const [probabilities, setProbabilities] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [featureVector, setFeatureVector] = useState(simulationPresets['DoS']);
    const [activePreset, setActivePreset] = useState('DoS');
    const CLASS_LABELS = [
        "Audio", "Background", "Bruteforce", "DoS",
        "Information Gathering", "Mirai", "Text", "Video"
    ];

    useEffect(() => {
        setIsLoading(true);
        const handler = setTimeout(() => {
            fetch('http://127.0.0.1:8000/predict', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ model: 'mlp', instances: [featureVector] })
            })
            .then(res => res.json())
            .then(data => {
                if (data.probabilities && data.probabilities.length > 0) {
                    setProbabilities(data.probabilities[0]);
                }
                setIsLoading(false);
            })
            .catch(err => {
                console.error("Prediction failed:", err);
                setIsLoading(false);
            });
        }, 300);

        return () => { clearTimeout(handler); };
    }, [featureVector]);

    const handlePresetClick = (presetName) => {
        setActivePreset(presetName);
        setFeatureVector(simulationPresets[presetName]);
    };
    
    const handleSliderChange = (featureIndex, newValue) => {
        setActivePreset(null);
        const newVector = [...featureVector];
        newVector[featureIndex] = newValue;
        setFeatureVector(newVector);
    };
    return (
        <Box sx={{ px: 4, textAlign: 'center' }}>            
            <Box sx={{ display: 'inline-block', position: 'relative', minHeight: '400px', mt: 8 }}>
                {isLoading && <CircularProgress sx={{ position: 'absolute', top: '50%', left: '50%', zIndex: 11, mt: '-20px', ml: '-20px' }} />}
                
                <Box sx={{ opacity: isLoading ? 0.3 : 1, transition: 'opacity 0.3s' }}>
                    {probabilities ? (
                        <ProbabilityColumnChart probabilities={probabilities} classLabels={CLASS_LABELS} isDark={isDark} />
                    ) : (
                         <Box sx={{width: '860px', height: '575px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                            <Typography sx={{ color: isDark ? '#AAA' : '#555' }}>Loading prediction...</Typography>
                         </Box>
                    )}
                </Box>
                <Stack 
                    direction="row" 
                    spacing={2} 
                    justifyContent="center" 
                    sx={{
                        position: 'absolute',
                        top: '65px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: 10,
                        width: '100%'
                    }}
                >
                    {Object.keys(simulationPresets).map((presetName) => (
                        <Button
                            key={presetName}
                            variant={activePreset === presetName ? "contained" : "outlined"}
                            onClick={() => handlePresetClick(presetName)}
                            sx={{
                                ...(activePreset === presetName && {
                                    backgroundColor: isDark ? '#F0C966' : '#000',
                                    color: isDark ? '#000' : '#FFF',
                                    '&:hover': { backgroundColor: isDark ? '#e6b94e' : '#333' },
                                }),
                                ...(activePreset !== presetName && {
                                    borderColor: isDark ? '#F0C966' : '#000',
                                    color: isDark ? '#F0C966' : '#000',
                                    '&:hover': {
                                        borderColor: isDark ? '#e6b94e' : '#333',
                                        backgroundColor: isDark ? 'rgba(240, 201, 102, 0.1)' : 'rgba(0, 0, 0, 0.04)',
                                    },
                                }),
                            }}
                        >
                           Load {presetName} Simulation
                        </Button>
                    ))}
                </Stack>
            </Box>
            
            <Grid 
                container 
                spacing={4} 
                justifyContent="center" 
                alignItems="center"
                sx={{ 
                    maxWidth: '960px', margin: '0 auto', mt: '-20px',
                    position: 'relative', zIndex: 1,
                    p: {xs: 2, md: 4}, borderRadius: '16px',
                    backgroundColor: isDark ? '#1C1C1C' : '#EFF0EB',
                    boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.4)' : '0 4px 12px rgba(0,0,0,0.1)',
                }}
            >
                {topFeatures.map((feature) => (
                    <Grid item xs={12} sm={4} md={2.4} key={feature.index} sx={{ textAlign: 'center', minWidth: 150 }}>
                        <Typography variant="caption" sx={{ fontWeight: 500, color: isDark ? '#FFF' : '#000', display: 'block', mb: 1 }}>
                            {feature.name}
                        </Typography>
                        <Slider
                            value={featureVector[feature.index] || 0}
                            onChange={(e, newValue) => handleSliderChange(feature.index, newValue)}
                            min={0} max={1} step={0.01}
                            sx={{ color: isDark ? '#F0C966' : '#000', '& .MuiSlider-rail': { color: isDark ? '#555' : '#ccc' } }}
                        />
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default DeepHero;