import React from "react";
import {
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox
} from "@mui/material";

const genders = [
  { value: "MALE", label: "Чоловік" },
  { value: "FEMALE", label: "Жінка" },
  { value: "UNISEX", label: "Унісекс" }
];

function GenderFilter({ filters, setFilters }) {
  const toggle = (gender) => {
    const updated = filters.gender === gender ? "" : gender;

    setFilters({
      ...filters,
      gender: updated,
      page: 0
    });
  };

  return (
    <FormControl sx={{ mb: 3 }}>
      <FormLabel>Стать</FormLabel>

      <FormGroup>
        {genders.map(g => (
          <FormControlLabel
            key={g.value} 
            control={ <Checkbox checked={filters.gender === g.value} onChange={() => toggle(g.value)} /> }
            label={g.label}
          />
        ))}
      </FormGroup>
    </FormControl>
  );
}

export default GenderFilter;