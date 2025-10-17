import { FormControl, InputLabel, Select, MenuItem, Typography } from '@mui/material';
import { SAMPLES } from '../../constants/model_playground';

export default function SampleSelector({ value, onChange }) {
  const types = Object.keys(SAMPLES);
  return (
    <FormControl fullWidth>
      <InputLabel>Load Traffic Type Preset</InputLabel>
      <Select value={value} onChange={(e)=>onChange(e.target.value)} label="Load Traffic Type Preset">
        {types.map((t)=>(
          <MenuItem key={t} value={t}><Typography>{t}</Typography></MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}