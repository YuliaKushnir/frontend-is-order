import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  TextField,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Chip,
  Button
} from "@mui/material";

import { useNavigate } from "react-router-dom";

import { COLOR_LABELS } from "../../../utils/mappers/colorMapper";
import { SIZE_LABELS } from "../../../utils/mappers/sizeMapper";
import { getAllStock } from "../../../services/api";

const StockAllPage = () => {
  const navigate = useNavigate();

  const [stock, setStock] = useState([]);

  const [search, setSearch] = useState("");
  const [sizes, setSizes] = useState([]);
  const [colors, setColors] = useState([]);

  useEffect(() => {
    getAllStock()
      .then(response => {
        setStock(response.data || []);
      })
      .catch(err => {
        console.error("Error fetching stock:", err);
      });
  }, []);

  const filteredStock = useMemo(() => {
    return stock.filter(item => {
      const matchesSearch = !search || item.productName.toLowerCase().includes(search.toLowerCase());
      const matchesSize = sizes.length === 0 || sizes.includes(item.size);
      const matchesColor = colors.length === 0 || colors.includes(item.color);
      return matchesSearch && matchesSize && matchesColor;
    });
  }, [stock, search, sizes, colors]);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <Button variant="outlined" onClick={() => navigate("/stock")}>← До керування складом</Button>
        <Typography variant="h5" sx={{ ml: 2 }}>Всі позиції складу</Typography>
      </Box>

      <Box sx={{ display: "flex", gap: 2, mb: 3, alignItems: "center", flexWrap: "wrap" }}>
        <TextField label="Пошук товару" value={search} onChange={(e) => setSearch(e.target.value)} size="small" sx={{ width: 220 }}/>

        {/* Фільтр розміру */}
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Розмір</InputLabel>
          <Select multiple value={sizes}
            onChange={(e) => setSizes(e.target.value)}
            input={<OutlinedInput label="Розмір" />}
            renderValue={(selected) => (
              <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                {selected.map((v) => (
                  <Chip key={v} label={SIZE_LABELS[v]} size="small" />
                ))}
              </Box>
            )}
          >
            {Object.keys(SIZE_LABELS).map(size => (
              <MenuItem key={size} value={size}> {SIZE_LABELS[size]} </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Фільтр кольору */}
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Колір</InputLabel>
          <Select multiple value={colors}
            onChange={(e) => setColors(e.target.value)}
            input={<OutlinedInput label="Колір" />}
            renderValue={(selected) => (
              <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                {selected.map((v) => ( <Chip key={v} label={COLOR_LABELS[v]} size="small" /> ))}
              </Box>
            )}
          >
            {Object.keys(COLOR_LABELS).map(color => (
              <MenuItem key={color} value={color}>
                {COLOR_LABELS[color]}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

      </Box>

      {/* Таблиця наявності */}
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Товар</TableCell>
            <TableCell>Колір</TableCell>
            <TableCell>Розмір</TableCell>
            <TableCell>Кількість</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {filteredStock.map((s) => (
            <TableRow key={s.id}>
              <TableCell>{s.productName}</TableCell>
              <TableCell>{COLOR_LABELS[s.color]}</TableCell>
              <TableCell>{SIZE_LABELS[s.size]}</TableCell>
              <TableCell>{s.quantity}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {filteredStock.length === 0 && (
        <Typography sx={{ mt: 2 }} color="text.secondary">
          Не знайдено товарів на складі...
        </Typography>
      )}
    </Box>
  );
};

export default StockAllPage;