// Available models for testing.
export const AVAILABLE_MODELS = {
    random_forest: { type: 'supervised' },
    mlp: { type: 'supervised' },
    kmeans: { type: 'unsupervised' },
    dbscan: { type: 'unsupervised' }
};

// Must match backend scaler feature order.
export const FEATURE_NAMES = [
    'Fwd Packet Length Max',
    'Flow Duration',
    'FWD Init Win Bytes',
    'Flow Bytes/s',
    'Flow IAT Mean',
    'Fwd Seg Size Min',
    'Fwd Header Length',
    'Flow Packets/s',
    'Flow IAT Std',
    'Total Fwd Packet',
    'Total Length of Bwd Packet',
    'Total Bwd packets',
    'Packet Length Std',
    'Bwd Packet Length Mean',
    'Protocol'
];

// Real data extracted & inversed transformed from X_test.
export const SAMPLES = {
    'Audio': [523.0, 20869869.0, 65280.0, 6128.884, 11498.55000000028, 32.0, 24296.0, 87.0150000000001, 7399.098999999929, 759.0, 108693.0, 1057.0, 61.475, 102.832, 6.0],
    'Background': [0.0, 84818131.0, 0.0, 0.0, 9424236.778, 0.0, 0.0, 0.11799999999993815, 13505304.221, 10.0, 0.0, 0.0, 0.0, 0.0, 0.0],
    'Bruteforce': [47.0, 18775736.0, 0.0, 9.161000000000058, 6258578.667, 8.000000000000002, 16.0, 0.21299999999996544, 10827164.587, 2.0, 86.0, 2.0, 4.381999999999998, 43.0, 17.0],
    'DoS': [30.0, 116304.00000000186, 512.0, 257.9449999999997, 116304.0, 40.0, 40.0, 17.195999999999913, 0.0, 1.0, 0.0, 1.0, 17.320999999999998, 0.0, 6.0],
    'Information Gathering': [0.0, 11923175.0, 512.0, 0.0, 11923175.0, 20.0, 40.0, 0.16799999999989268, 0.0, 2.0, 0.0, 0.0, 0.0, 0.0, 6.0],
    'Mirai': [0.0, 47434534.00000001, 0.0, 0.0, 47434534.0, 20.0, 40.0, 0.041999999999916326, 0.0, 2.0, 0.0, 0.0, 0.0, 0.0, 6.0],
    'Text': [420.0, 119998237.0, 502.0, 57.15899999999965, 754705.8930000002, 32.0, 2208.0, 1.3330000000000837, 1303790.976, 69.0, 1680.0, 91.0, 52.835, 18.462, 6.0],
    'Video': [137.0, 45667632.00000001, 65280.0, 19289.264, 27494.058999999892, 32.0, 30096.0, 36.39300000000003, 78974.75900000008, 827.0, 880758.0, 835.0, 651.8529999999998, 1054.8000000000002, 6.0]
};

