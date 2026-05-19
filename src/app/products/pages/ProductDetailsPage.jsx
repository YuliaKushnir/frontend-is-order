import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ProductDetails from "../components/ProductDetails";
import { getProductById } from "../../../services/api";

const ProductDetailsPage = () => {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProduct = async () => {
    setLoading(true);

    try {
      const response = await getProductById(id);
      const data = response.data;

      setProduct(data);

    } catch (err) {
      console.error("Error fetching product:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProduct(); }, [id]);

  if (loading) return <p>Завантаження...</p>;
  if (!product) return <p>Товар не знайдено</p>;

  return <ProductDetails product={product} />;
};

export default ProductDetailsPage;