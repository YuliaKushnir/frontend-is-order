import React, { useContext, useEffect, useState } from "react";
import ProductList from "../components/ProductList";
import ProductFilter from "../components/ProductFilter";
import Pagination from "../components/Pagination";

import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { getAllProducts } from "../../../services/api";
import { hasAnyRole } from "utils/auth/auth";
import { AuthContext } from "react-oauth2-code-pkce";

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState({
    categories: [],
    colors: [],
    material: "",
    gender: "",
    page: 0,
    pageSize: 10
  });

  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { token, tokenData } = useContext(AuthContext);
  // фомрмування body без пустих полів
  const buildRequestBody = (filters) => {
    const body = {
      page: filters.page,
      pageSize: filters.pageSize
    };

    if (filters.categories && filters.categories.length > 0) {
      body.categories = filters.categories;
    }

    if (filters.colors && filters.colors.length > 0) {
      body.colors = filters.colors;
    }

    if (filters.material && filters.material.trim() !== "") {
      body.material = filters.material;
    }

    if (filters.gender && filters.gender !== "") {
      body.gender = filters.gender;
    }

    return body;
  };

  // отримати всі товари
  const fetchProducts = async () => {
    setLoading(true);

    try {
      const requestBody = buildRequestBody(filters);
      const response = await getAllProducts(requestBody);
      const data = response.data;

      setProducts(data.productDtoList || []);
      setTotalPages(data.totalPages || 0);

    } catch (err) {
      console.error("Error fetching products:", err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, [filters]);

  // const applyFilters = (newFilters) => { setFilters(prev => ({ ...prev, ...newFilters, page: 0, })); };

  const changePage = (page) => { setFilters(prev => ({ page })); };

  return (
    <div className="product-layout">
        {/* ліва панель */}
        <aside className="filters-sidebar">
            <ProductFilter filters={filters} setFilters={setFilters} />
        </aside>

        {/* права панель */}
        <main className="products-content">
          {hasAnyRole(tokenData, ["ROLE_ADMIN"]) && (
            <Button variant="contained" onClick={() => navigate("/products/new")}
                sx={{ mb: 2, backgroundColor: "#2e7d32", "&:hover": { backgroundColor: "#1b5e20" }}}>
                Додати товар
            </Button>
          )}

        {loading && <p>Завантаження...</p>}
        {!loading && <ProductList products={products} />}
        {!loading && (<Pagination currentPage={filters.page} totalPages={totalPages} onPageChange={changePage}/>)}
        </main>
    </div>
  );
};

export default ProductsPage;