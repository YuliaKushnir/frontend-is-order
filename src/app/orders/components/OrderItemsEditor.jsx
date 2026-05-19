import {
  Box,
  TextField,
  Select,
  MenuItem,
  IconButton,
  Typography,
  Button,
  Autocomplete,
  FormControl,
  InputLabel,
  Checkbox,
  ListItemText
} from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";
import { useEffect, useState, useRef } from "react";
import { COLOR_LABELS } from "../../../utils/mappers/colorMapper";
import { getAllPrintTypes, getPrintPrice, getPrintPricesByType, getStockByProduct, searchProducts } from "../../../services/api";

export default function OrderItemsEditor({ item, onChange, onDelete }) {

  const isPrintOnly = item.type === "PRINT_ONLY";

  const [products, setProducts] = useState([]);
  const [stock, setStock] = useState([]);
  const [printTypes, setPrintTypes] = useState([]);

  const printFileInputs = useRef({});
  const previewInputRef = useRef(null);

  const PRINT_COLORS = Object.keys(COLOR_LABELS);

  useEffect(() => {
    const loadPrintTypes = async () => {
      try {
        const response = await getAllPrintTypes();

        setPrintTypes(
          Array.isArray(response.data)
            ? response.data
            : []
        );
      } catch (e) {
        console.error(e);
        setPrintTypes([]);
      }
    };

    loadPrintTypes();
  }, []);

  const loadProducts = async (value) => {
    try {
      if (!value || value.length < 2) {
        setProducts([]);
        return;
      }

      const response = await searchProducts(value);

      setProducts(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (e) {
      console.error(e);
      setProducts([]);
    }
  };


  const loadStock = async (productId) => {
    try {
      const response = await getStockByProduct(productId);

      setStock(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (e) {
      console.error(e);
      setStock([]);
    }
  };

  const loadPrices = async (typeId) => {
    try {
      const response = await getPrintPricesByType(typeId);

      return Array.isArray(response.data)
        ? response.data
        : [];
    } catch (e) {
      console.error(e);
      return [];
    }
  };

  // update item
  const update = (field, value) => {
    onChange({ ...item, [field]: value });
  };

  // update price
  const calculateTotal = (p) => {
    let multiplier = 1;

    if (p.typeName?.toLowerCase().includes("флекс")) {
      if (p.colorCount === 2) multiplier = 1.5;
      if (p.colorCount >= 3) multiplier = 2;
    }

    return (p.price || 0) * multiplier * (p.quantity || 1);
  };

  // update print
  const updatePrint = async (id, field, value) => {

    let updated = [...(item.prints || [])];

    for (let p of updated) {
      if (p.id !== id) continue;

      let u = { ...p, [field]: value };

      // update type
      if (field === "typeId") {
        const type = printTypes.find(t => t.id === value);

        u.typeName = type?.name || "";
        u.size = "";
        u.price = 0;

        const isDigital = type?.name?.toLowerCase().includes("цифр");

        if (isDigital) {
          u.colors = ["FULL"];
          u.colorCount = 4;
        } else {
          u.colors = [];
          u.colorCount = 0;
        }

        const prices = await loadPrices(value);
        u.availablePrices = prices;
      }

      // update size
      if (field === "size" && u.typeId) {
        try {
          const response = await getPrintPrice(
            u.typeId,
            value
          );

          u.price = response.data || 0;
        } catch (e) {
          console.error(e);
          u.price = 0;
        }
      }

      // update colors
      if (field === "colors") {
        u.colors = value.slice(0, 5);
        u.colorCount = u.colors.length;
      }

      updated = updated.map(x => x.id === id ? u : x);
    }

    onChange({ ...item, prints: updated });
  };

  // update prints
  const addPrint = () => {
    onChange({
      ...item,
      prints: [
        ...(item.prints || []),
        {
          id: Date.now(),
          typeId: null,
          typeName: "",
          size: "",
          placement: "",
          quantity: 1,
          price: 0,
          colorCount: 0,
          colors: [],
          availablePrices: [],
          files: [],
          comment: ""
        }
      ]
    });
  };

  const removePrint = (id) => {
    onChange({
      ...item,
      prints: (item.prints || []).filter(p => p.id !== id)
    });
  };

  // files
  const addPrintFiles = (printId, files) => {
    const newFiles = Array.from(files).map(file => ({
      file,
      url: URL.createObjectURL(file)
    }));

    const updated = (item.prints || []).map(p =>
      p.id === printId
        ? { ...p, files: [...(p.files || []), ...newFiles] }
        : p
    );

    onChange({ ...item, prints: updated });
  };

  const removePrintFile = (printId, index) => {
    const updated = (item.prints || []).map(p => {
      if (p.id !== printId) return p;

      const files = [...(p.files || [])];
      URL.revokeObjectURL(files[index]?.url);
      files.splice(index, 1);

      return { ...p, files };
    });

    onChange({ ...item, prints: updated });
  };

  // preview
  const addPreviewFiles = (files) => {
    const newFiles = Array.from(files).map(file => ({
      file,
      url: URL.createObjectURL(file)
    }));

    onChange({
      ...item,
      previewFiles: [...(item.previewFiles || []), ...newFiles]
    });
  };

  const removePreviewFile = (index) => {
    const files = [...(item.previewFiles || [])];
    URL.revokeObjectURL(files[index]?.url);
    files.splice(index, 1);

    onChange({
      ...item,
      previewFiles: files
    });
  };

  const availableColors = [...new Set(stock.map(s => s.color))];

  const availableSizes = stock
    .filter(s => s.color === item.textileColor)
    .map(s => s.size);

  const maxQty =
    stock.find(s =>
      s.color === item.textileColor && s.size === item.size
    )?.quantity || 0;

  const textileTotal =
    item.manualTotal
      ? item.totalPrice || 0
      : (item.basePrice || 0) * (item.quantity || 1);

  return (
    <Box sx={{ border: "1px solid #ddd", p: 2, mb: 2 }}>

      <Box display="flex" justifyContent="space-between">
        <Typography fontWeight="bold">
          {isPrintOnly ? "Клієнтський текстиль" : item.productName || "Нова позиція"}
        </Typography>

        <IconButton onClick={onDelete}>
          <DeleteIcon />
        </IconButton>
      </Box>

      {!isPrintOnly && (
        <Box sx={{ display: "flex", gap: 2, mt: 2, flexWrap: "wrap" }}>

        <Autocomplete
          freeSolo={false}
          sx={{ minWidth: 260 }}
          options={products}
          value={
            item.productId
              ? {
                  id: item.productId,
                  name: item.productName,
                  price: item.basePrice
                }
              : null
          }
          getOptionLabel={(o) => o?.name || ""}
          isOptionEqualToValue={(option, value) =>
            option.id === value.id
          }

          onInputChange={(e, value, reason) => {
            if (reason === "input") {
              loadProducts(value);
            }
          }}

          onChange={(e, value) => {
            if (!value || !value.id) {
              onChange({
                ...item,
                productId: null,
                productName: "",
                basePrice: 0,
                textileColor: "",
                size: ""
              });
              setStock([]);
              return;
            }

            onChange({
              ...item,
              productId: value.id,
              productName: value.name,
              basePrice: value.price || 0
            });

            loadStock(value.id);
          }}

          renderInput={(params) => (
            <TextField
              {...params}
              label="Текстиль"
              size="small"
            />
          )}
        />

          <FormControl sx={{ minWidth: 140 }}>
            <InputLabel>Колір</InputLabel>
            <Select
              size="small"
              value={item.textileColor || ""}
              onChange={(e) => update("textileColor", e.target.value)}
            >
              {availableColors.map(c => (
                <MenuItem key={c} value={c}>
                  {COLOR_LABELS[c] || c}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Розмір</InputLabel>
            <Select
              size="small"
              value={item.size || ""}
              onChange={(e) => update("size", e.target.value)}
            >
              {availableSizes.map(s => (
                <MenuItem key={s} value={s}>{s}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            type="number"
            size="small"
            label="К-сть"
            value={item.quantity}
            onChange={(e) =>
              update("quantity", Math.min(Number(e.target.value), maxQty))
            }
            sx={{ width: 90 }}
          />

          <TextField
            size="small"
            label="Ціна/шт"
            value={item.basePrice || 0}
            InputProps={{ readOnly: true }}
            sx={{ width: 110 }}
          />

          <TextField
            size="small"
            label="Сума"
            value={textileTotal}
            sx={{ width: 130 }}
          />
        </Box>
      )}

      <Box mt={2}>
        {(item.prints || []).map(p => {

          const isDigital = p.typeName?.toLowerCase().includes("цифр");
          const total = calculateTotal(p);

          return (
            <Box key={p.id} sx={{ mb: 2 }}>

              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>

                <Select
                  size="small"
                  value={p.typeId || ""}
                  onChange={(e) => updatePrint(p.id, "typeId", e.target.value)}
                  sx={{ width: 160 }}
                >
                  {printTypes.map(t => (
                    <MenuItem key={t.id} value={t.id}>
                      {t.name}
                    </MenuItem>
                  ))}
                </Select>

                <Select
                  size="small"
                  value={p.size || ""}
                  onChange={(e) => updatePrint(p.id, "size", e.target.value)}
                  sx={{ width: 70 }}
                >
                  {(p.availablePrices || []).map(pr => (
                    <MenuItem key={pr.size} value={pr.size}>{pr.size}</MenuItem>
                  ))}
                </Select>

                <TextField
                  size="small"
                  placeholder="Розміщення"
                  value={p.placement}
                  onChange={(e) => updatePrint(p.id, "placement", e.target.value)}
                />

                <TextField
                  type="number"
                  size="small"
                  label="К-сть"
                  value={p.quantity}
                  onChange={(e) => updatePrint(p.id, "quantity", Number(e.target.value))}
                  sx={{ width: 60 }}
                />

                <TextField
                  size="small"
                  label="Ціна"
                  value={p.price || 0}
                  InputProps={{ readOnly: true }}
                  sx={{ width: 80 }}
                />

                <FormControl sx={{ width: 150 }}>
                  <InputLabel>Кольори</InputLabel>
                  <Select
                    multiple
                    size="small"
                    value={p.colors || []}
                    disabled={isDigital}
                    onChange={(e) =>
                      updatePrint(p.id, "colors", e.target.value)
                    }
                    renderValue={(selected) =>
                      isDigital
                        ? "Повнокольоровий"
                        : selected.map(c => COLOR_LABELS[c] || c).join(", ")
                    }
                  >
                    {PRINT_COLORS.map(c => (
                      <MenuItem key={c} value={c}>
                        <Checkbox checked={(p.colors || []).includes(c)} />
                        <ListItemText primary={COLOR_LABELS[c] || c} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  size="small"
                  label="К-сть кольорів"
                  value={isDigital ? "FULL" : p.colorCount || 0}
                  InputProps={{ readOnly: true }}
                  sx={{ width: 60 }}
                />

                <TextField
                  size="small"
                  label="Сума"
                  value={total.toFixed(0)}
                  InputProps={{ readOnly: true }}
                  sx={{ width: 110 }}
                />

                <IconButton onClick={() => removePrint(p.id)}>
                  <DeleteIcon />
                </IconButton>
              </Box>

              <Box mt={1}>
                <input
                  type="file"
                  multiple
                  hidden
                  ref={(el) => printFileInputs.current[p.id] = el}
                  onChange={(e) => addPrintFiles(p.id, e.target.files)}
                />

                <Button onClick={() => printFileInputs.current[p.id]?.click()}>
                  Додати файли
                </Button>
              </Box>

              <Box sx={{ display: "flex", gap: 1, mt: 1, flexWrap: "wrap" }}>
                {(p.files || []).map((f, i) => (
                  <Box key={i}>
                    <img src={f.url} width={60} height={60} />
                    <Button onClick={() => removePrintFile(p.id, i)}>✕</Button>
                  </Box>
                ))}
              </Box>

            </Box>
          );
        })}

        <Button onClick={addPrint}>
          + Додати принт
        </Button>

        <Box mt={2}>
          <input
            type="file"
            multiple
            hidden
            ref={previewInputRef}
            onChange={(e) => addPreviewFiles(e.target.files)}
          />

          <Button onClick={() => previewInputRef.current?.click()}>
            Додати прев’ю
          </Button>

          <Box sx={{ display: "flex", gap: 1, mt: 1, flexWrap: "wrap" }}>
            {(item.previewFiles || []).map((f, i) => (
              <Box key={i}>
                <img src={f.url} width={80} height={80} />
                <Button onClick={() => removePreviewFile(i)}>✕</Button>
              </Box>
            ))}
          </Box>

          {/* COMMENT */}
          <Box sx={{ mt: 1 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Коментар до позиції..."
              value={item.comment || ""}
              onChange={(e) =>
                onChange({
                  ...item,
                  comment: e.target.value
                })
              }
            />
          </Box>

        </Box>
      </Box>
    </Box>
  );
}