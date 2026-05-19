import React, { useEffect, useState } from "react";
import {
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Button
} from "@mui/material";
import { getAllCategories } from "../../../../services/api";

function CategoryFilter({ filters, setFilters }) {
  const [categories, setCategories] = useState([]);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    getAllCategories()
      .then(res => setCategories(res.data))
      .catch(err => console.error(err));
  }, []);

  const visible = showAll ? categories : categories.slice(0, 3);

  const toggle = (name) => {
    const current = filters.categories || [];

    const updated = current.includes(name)
      ? current.filter(c => c !== name)
      : [...current, name];

    setFilters({ ...filters, categories: updated, page: 0 });
  };

  return (
    <FormControl component="fieldset" sx={{ mb: 3 }}>
      <FormLabel>Категорії</FormLabel>

      <FormGroup>
        {visible.map(cat => (
          <FormControlLabel
            key={cat.id}
            control={ <Checkbox checked={filters.categories?.includes(cat.name) || false} onChange={() => toggle(cat.name)} /> }
            label={cat.name}
          />
        ))}
      </FormGroup>

      {categories.length > 3 && (
        <Button size="small" onClick={() => setShowAll(!showAll)}>
          {showAll ? "Менше" : "Більше"}
        </Button>
      )}
    </FormControl>
  );
}

export default CategoryFilter;