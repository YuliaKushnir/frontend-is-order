import React, { useContext, useState } from "react";
import {
  Box,
  TextField,
  Typography,
  Button,
  Autocomplete,
  Tabs,
  Tab,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from "@mui/material";

import { useNavigate } from "react-router-dom";

import Toast from "../../../shared/components/UIComponents/Toast";
import { COLOR_LABELS } from "../../../utils/mappers/colorMapper";
import { SIZE_LABELS } from "../../../utils/mappers/sizeMapper";
import { addOrUpdateStock, decrementStock, getStockByProduct, searchProducts } from "../../../services/api";
import { AuthContext } from "react-oauth2-code-pkce";
import { hasAnyRole } from "utils/auth/auth";

const StockPage = () => {
  const navigate = useNavigate();
  const { token, tokenData } = useContext(AuthContext);

  const [tab, setTab] = useState(0);

  const [search, setSearch] = useState("");
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [stockList, setStockList] = useState([]);

  const [color, setColor] = useState("");
  const [size, setSize] = useState("");
  const [quantity, setQuantity] = useState("");

  const [selectedStock, setSelectedStock] = useState(null);
  const [removeQty, setRemoveQty] = useState("");

  const [toast, setToast] = useState(null);

  // Search
  const handleSearch = async (value) => {
    setSearch(value);

    if (!value || value.length < 2) {
      setProducts([]);
      return;
    }

    try {
      const response = await searchProducts(value);
      const data = response.data;
      setProducts(data);
    } catch (e) {
      setToast({ message: "Помилка пошуку", type: "error" });
    }
  };

  // Load stock by productId
  const loadStock = async (productId) => {
    try {
      const response = await getStockByProduct(productId);
      const data = response.data;
      setStockList(data);
    } catch (e) {
      console.error("Error loading stock:", e);
      setToast({ message: "Помилка завантаження складу", type: "error" });
    }
  };

  // Вибір товару
  const onSelectProduct = (value) => {
    setSelectedProduct(value);
    setColor("");
    setSize("");
    setQuantity("");

    setSelectedStock(null);
    setRemoveQty("");

    if (value?.id) {
      loadStock(value.id);
    }
  };

  const resetForm = () => {
    setSelectedProduct(null);
    setColor("");
    setSize("");
    setQuantity("");
    setSearch("");
    setStockList([]);
  };

  // Додати на склад
  const saveStock = async () => {
    if (!selectedProduct || !size || !quantity || !color) {
      setToast({ message: "Заповніть всі поля", type: "error" });
      return;
    }

    try {
      const payload = {
        productId: selectedProduct.id,
        color,
        size,
        quantity: Number(quantity)
      };

      await addOrUpdateStock(payload);

      setToast({ message: "Склад оновлено", type: "success" });
      loadStock(selectedProduct.id);
      resetForm();
    } catch (e) {
      setToast({ message: "Помилка збереження", type: "error" });
    }
  };

  // Списати зі складу
  const removeStock = async () => {
    if (!selectedStock || !removeQty) {
        setToast({ message: "Оберіть позицію і кількість", type: "error" });
        return;
    }

    try {
      await decrementStock(selectedStock.id, removeQty);
      setToast({ message: "Товар списано", type: "success" });
      loadStock(selectedProduct.id);
      setSelectedStock(null);
      setRemoveQty("");
    } catch (e) {
      setToast({ message: e.message || "Помилка списання", type: "error" });
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 900, mx: "auto" }}>

      {toast && (<Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} /> )}

      <Typography variant="h4" mb={2}>Склад товарів</Typography>

      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        {hasAnyRole(tokenData, ["ROLE_ADMIN"]) && (
          <Button onClick={() => navigate("/products/new")} variant="contained">Створити товар</Button>
        )}

        <Button onClick={() => navigate("/stock/all")} variant="outlined">Переглянути наявність</Button>
      </Box>

        {hasAnyRole(tokenData, ["ROLE_ADMIN"]) && (
          <div>
            <Tabs value={tab} onChange={(e, v) => setTab(v)}>
              <Tab label="Додати на склад" />
              <Tab label="Списати зі складу" />
            </Tabs>

            {tab === 0 && (
              <Box sx={{ mt: 3, display: "flex", flexDirection: "column", gap: 2 }}>

                <Autocomplete
                  options={products}
                  getOptionLabel={(o) => o?.name || ""}
                  onInputChange={(e, v) => handleSearch(v)}
                  onChange={(e, v) => onSelectProduct(v)}
                  renderInput={(params) => (
                    <TextField {...params} label="Пошук товару" />
                  )}
                />

                {selectedProduct && (
                  <FormControl>
                    <InputLabel>Колір</InputLabel>
                    <Select value={color} onChange={(e) => setColor(e.target.value)}>
                      {selectedProduct.colors.map(c => (
                        <MenuItem key={c} value={c}> {COLOR_LABELS[c]} </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}

                {selectedProduct && (
                  <FormControl>
                    <InputLabel>Розмір</InputLabel>
                    <Select value={size} onChange={(e) => setSize(e.target.value)}>
                      {Object.keys(SIZE_LABELS).map(s => (
                        <MenuItem key={s} value={s}> {SIZE_LABELS[s]} </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}

                {selectedProduct && (
                  <TextField type="number" label="Кількість"
                    value={quantity} onChange={(e) => setQuantity(e.target.value)} />
                )}

                <Button variant="contained" onClick={saveStock}>
                  Зберегти
                </Button>
              </Box>
            )}

            {tab === 1 && (
              <Box sx={{ mt: 3, display: "flex", flexDirection: "column", gap: 2 }}>

                <Autocomplete
                  options={products}
                  getOptionLabel={(o) => o?.name || ""}
                  onInputChange={(e, v) => handleSearch(v)}
                  onChange={(e, v) => onSelectProduct(v)}
                  renderInput={(params) => (
                    <TextField {...params} label="Пошук товару" />
                  )}
                />

                {stockList.length > 0 && (
                  <FormControl>
                    <InputLabel>Позиція складу</InputLabel>
                    <Select
                      value={selectedStock?.id || ""}
                      onChange={(e) => setSelectedStock( stockList.find(s => s.id === e.target.value)) }
                    >
                      {stockList.map(s => (
                        <MenuItem key={s.id} value={s.id}>
                          {COLOR_LABELS[s.color]} · {SIZE_LABELS[s.size]} · {s.quantity} шт
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}

                {selectedStock && (
                  <TextField type="number" label="Списати кількість"
                    value={removeQty} onChange={(e) => setRemoveQty(e.target.value)}
                  /> )}

                <Button variant="contained" color="error" onClick={removeStock} disabled={!selectedStock} >
                  Списати
                </Button>      
              </Box>
            )}
          </div>
        )}
      </Box>
  );
};

export default StockPage;