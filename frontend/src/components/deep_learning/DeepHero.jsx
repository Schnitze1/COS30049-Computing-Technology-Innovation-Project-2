import React, { useState, useEffect } from "react";
import { useTheme, Box, Typography, CircularProgress, Slider, Grid, Button, Stack } from "@mui/material";
import { ProbabilityColumnChart } from "./ProbabilityColumnChart"; 
import { SAMPLES, FEATURE_NAMES } from "../../constants/model_playground";
import { predict } from "../../api/predict";

const simulationPresets = {
    'DoS': SAMPLES['DoS'],
    'Bruteforce': SAMPLES['Bruteforce'],
    'Background': SAMPLES['Background'],
};

// Use names then derive indices from FEATURE_NAMES to avoid mismatches
const topFeatureNames = [
    'Flow Duration',
    'Fwd Packet Length Max',
    'FWD Init Win Bytes',
    'Flow Bytes/s',
    'Flow IAT Mean'
];
const topFeatures = topFeatureNames.map((name) => ({ name, index: FEATURE_NAMES.indexOf(name) }));

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
            predict('mlp', featureVector)
                .then((data) => {
                    if (data.probabilities && data.probabilities.length > 0) {
                        setProbabilities(data.probabilities[0]);
                    }
                    setIsLoading(false);
                })
                .catch((err) => {
                    // eslint-disable-next-line no-console
                    console.error('Prediction failed:', err);
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
                <Box sx={{
                    padding: '32px',
                    borderRadius: '16px',
                    background: isDark ? '#222' : 'transparent',
                    boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.4)' : 'none',
                    transition: 'background 0.3s ease-in-out',
                }}>
                    <Box sx={{ opacity: isLoading ? 0.3 : 1, transition: 'opacity 0.3s' }}>
                        {probabilities ? (
                            <ProbabilityColumnChart probabilities={probabilities} classLabels={CLASS_LABELS} isDark={isDark} />
                        ) : (
                            <Box sx={{width: '860px', height: '575px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                <Typography sx={{ color: isDark ? '#AAA' : '#555' }}>Loading prediction...</Typography>
                            </Box>
                        )}
                    </Box>
                </Box>
                <Stack 
                    direction="row" 
                    spacing={2} 
                    justifyContent="center" 
                    sx={{
                        position: 'absolute',
                        top: '97px',
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
                        Load {presetName} Sample
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
                    maxWidth: '960px', margin: '0 auto', mt: '-20px', position: 'relative', zIndex: 1,
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