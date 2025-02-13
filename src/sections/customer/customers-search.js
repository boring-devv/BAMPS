import MagnifyingGlassIcon from '@heroicons/react/24/solid/MagnifyingGlassIcon';
import { Card, InputAdornment, OutlinedInput, SvgIcon } from '@mui/material';

export const CustomersSearch = ({ search, onSearchChange }) => (
  <Card sx={{ p: 2 }}>
    <OutlinedInput
      fullWidth
      value={search} // Ensure it reflects the current search state
      onChange={(e) => onSearchChange(e.target.value)} // Pass only the value
      placeholder="Search priest"
      startAdornment={(
        <InputAdornment position="start">
          <SvgIcon color="action" fontSize="small">
            <MagnifyingGlassIcon />
          </SvgIcon>
        </InputAdornment>
      )}
      sx={{ maxWidth: 500 }}
    />
  </Card>
);
