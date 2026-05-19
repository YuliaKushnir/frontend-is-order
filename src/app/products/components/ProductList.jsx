import React from "react";
import ProductItem from "./ProductItem";
import "../styles/ProductStyles.css";

const ProductList = ({ products }) => {
  if (!products.length) {
    return <p>Не знайдено жодного товару</p>;
  }

  return (
    <div className="products-wrapper">
      <ul className="products-grid">
        {products.map((p) => (
          <ProductItem key={p.id} product={p} />
        ))}
      </ul>
    </div>
  );
};

export default ProductList;