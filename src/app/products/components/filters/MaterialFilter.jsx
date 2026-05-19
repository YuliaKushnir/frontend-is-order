import React from "react";
import {
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox
} from "@mui/material";

const materials = [
  "100% бавовна",
  "95% бавовна, 5% еластан"
];

function MaterialFilter({ filters, setFilters }) {
  const toggle = (material) => {
    const current = filters.material ? [filters.material] : [];
    const updated = current.includes(material) ? "" : material;

    setFilters({
      ...filters,
      material: updated,
      page: 0
    });
  };

  return (
    <FormControl sx={{ mb: 3 }}>
      <FormLabel>Матеріал</FormLabel>
      <FormGroup>
        {materials.map(mat => (
          <FormControlLabel
            key={mat}
            control={ <Checkbox checked={filters.material === mat} onChange={() => toggle(mat)} /> }
            label={mat}
          />
        ))}
      </FormGroup>
    </FormControl>
  );
}

export default MaterialFilter;