import React from "react";
import CategoryFilter from "./filters/CategoryFilter";
import ColorFilter from "./filters/ColorFilter";
import MaterialFilter from "./filters/MaterialFilter";
import GenderFilter from "./filters/GenderFilter";

function ProductFilter({ filters, setFilters }) {
  return (
    <div className="filters-container">
      <CategoryFilter filters={filters} setFilters={setFilters} />
      <ColorFilter filters={filters} setFilters={setFilters} />
      <MaterialFilter filters={filters} setFilters={setFilters} />
      <GenderFilter filters={filters} setFilters={setFilters} />
    </div>
  );
}

export default ProductFilter;