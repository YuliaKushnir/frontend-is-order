import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../../../context/CartContext";

const ProductItem = ({ product }) => {
  const { addToCart } = useContext(CartContext);
  const navigate = useNavigate();

  const goToDetails = () => {
    navigate(`/products/${product.id}`);
  };

  return (
    <li
      className="product-item-card"
      onClick={goToDetails}
      style={{ cursor: "pointer" }}
    >
      <div className="product-title">{product.name}</div>

      {product.imageUrls?.length > 0 && (
        <img src={product.imageUrls[0]} alt={product.name} />
      )}

      <div className="product-price">
        {product.price} грн
      </div>

      <button
        className="add-to-cart-btn"
        onClick={(e) => {
          e.stopPropagation();
          addToCart(product);
        }}
      >
        Додати в кошик
      </button>
    </li>
  );
};

export default ProductItem;