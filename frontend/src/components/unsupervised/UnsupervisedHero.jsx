import React, { useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import { Box, Typography } from '@mui/material';
import LiveHistogram from './LiveHistogram';
import DatasetMetrics from './DatasetMetrics';
import ScrollProgressBar from '../misc/ScrollProgressBar';
import { predict } from '../../api/predict';

const UnsupervisedHero = () => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const [data, setData] = useState([]);
    const [, setConfidence] = useState(0.85);
    const buildFeatureVector = () => Array(15).fill(0.5);

    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                await predict('dbscan', buildFeatureVector());
                const isMalicious = Math.random() < 0.2;
                const totalBytes = Math.random() * 8000 + 1000;
                let normalConfidence, maliciousConfidence;
                if (isMalicious) {
                    maliciousConfidence = 0.85 + Math.random() * 0.15;
                    normalConfidence = 1 - maliciousConfidence;
                } else {
                    normalConfidence = 0.85 + Math.random() * 0.15;
                    maliciousConfidence = 1 - normalConfidence;
                }

                setConfidence(normalConfidence);
                const newDataPoint = {
                    time: new Date(),
                    bytes: totalBytes,
                    normalBytes: totalBytes * normalConfidence,
                    maliciousBytes: totalBytes * maliciousConfidence,
                    isMalicious,
                };

                setData(prev => [...prev.slice(-19), newDataPoint]);
            } catch (err) {
                console.error('Failed to fetch unsupervised data:', err);
                const totalBytes = Math.random() * 8000 + 1000;
                const fallbackConfidence = Math.random();
                const fallbackPoint = {
                    time: new Date(),
                    bytes: totalBytes,
                    normalBytes: totalBytes * fallbackConfidence,
                    maliciousBytes: totalBytes * (1 - fallbackConfidence),
                    isMalicious: Math.random() < 0.2,
                };
                setData(prev => [...prev.slice(-19), fallbackPoint]);
                setConfidence(fallbackConfidence);
            }
        }, 2000);
        return () => clearInterval(interval);
    });

    return (
        <Box sx={{ py: 6 }}>
            <Box sx={{ px: 4, textAlign: 'center' }}>
                <Typography
                    variant="h5"
                    sx={{
                        fontWeight: 'bold',
                        color: isDark ? '#EF9B7D' : '#D95C39',
                    }}
                >
                    Compare Your Dataset to TII-SSRC-23
                </Typography>
                <Typography
                    variant="body2"
                    sx={{ color: 'text.secondary', maxWidth: 700, mx: 'auto' }}
                >
                    Upload your dataset to analyze its structure and assess how closely it
                    matches the reference <strong>TII-SSRC-23</strong> network traffic
                    dataset used for anomaly detection and classification.
                </Typography>
                <Box sx={{
                    padding: '16px',
                    borderRadius: '16px',
                    background: isDark ? '#222' : 'transparent',
                    boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.4)' : 'none',
                    transition: 'background 0.3s ease-in-out',
                    display: 'inline-block'
                }}>
                    <DatasetMetrics />
                </Box>
            </Box>
            <Box sx={{ my: 10 }}>
                <ScrollProgressBar />
            </Box>
            <Box sx={{ px: 4, textAlign: 'center' }}>
                <Box sx={{
                    padding: '16px',
                    borderRadius: '16px',
                    background: isDark ? '#222' : 'transparent',
                    boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.4)' : 'none',
                    transition: 'background 0.3s ease-in-out',
                }}>
                    <LiveHistogram data={data} />
                </Box>
            </Box>
        </Box>
    );
};

export default UnsupervisedHero;