import { FormControl, InputLabel, Select, MenuItem, Box, Chip, Typography } from '@mui/material';
import { AVAILABLE_MODELS } from '../../constants/model_playground';

export default function ModelSelector({ value, onChange }) {
  return (
    <FormControl fullWidth>
      <InputLabel>Select model</InputLabel>
      <Select value={value} onChange={(e)=>onChange(e.target.value)} label="Select model">
        {Object.entries(AVAILABLE_MODELS).map(([name, info])=>(
          <MenuItem key={name} value={name}>
            <Box sx={{ display:'flex', alignItems:'center', gap:1 }}>
              <Typography>{name}</Typography>
              <Chip label={info.type} size="small" color={info.type==='supervised'?'primary':'secondary'} />
            </Box>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}