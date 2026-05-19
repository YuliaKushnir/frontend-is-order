import React from "react";
import {
  FormControl,
  FormLabel,
  RadioGroup,
  Box,
  Tooltip
} from "@mui/material";

import { COLOR_HEX, COLOR_LABELS } from "../../../../utils/mappers/colorMapper";

const ColorFilter = ({ filters, setFilters }) => {

  const handleChange = (value) => {
    setFilters(prev => {
      const current = prev.colors?.[0];
      return { ...prev, colors: current === value ? [] : [value], page: 0 };
    });
  };

  return (
    <FormControl sx={{ mb: 3 }}>
      <FormLabel>Колір</FormLabel>

      <RadioGroup value={filters.colors?.[0] || ""}>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }} >
          {Object.keys(COLOR_LABELS).map((key) => {
            const selected = filters.colors?.includes(key);

            return (
              <Tooltip title={COLOR_LABELS[key]} key={key}>
                <Box
                  onClick={() => handleChange(key)}
                  sx={{ width: 30, height: 30, borderRadius: "50%", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: COLOR_HEX[key] || "#eee",
                    border: key === "WHITE" ? "1px solid #ccc" : "none",
                    outline: selected ? "3px solid black" : "2px solid transparent",
                    outlineOffset: "2px",
                    transition: "0.2s",
                    "&:hover": { transform: "scale(1.1)" }
                  }}
                />
              </Tooltip>
            );
          })}
        </Box>
      </RadioGroup>
    </FormControl>
  );
};

export default ColorFilter;