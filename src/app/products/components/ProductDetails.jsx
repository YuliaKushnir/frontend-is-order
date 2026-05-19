// ProductDetails.jsx
import React, { useContext, useEffect, useState, useRef } from "react";
import { CartContext } from "../../../context/CartContext";
import { useNavigate } from "react-router-dom";

import {
  Box,
  Typography,
  IconButton,
  Button,
  Snackbar,
  Alert
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";

import { COLOR_HEX, COLOR_LABELS } from "../../../utils/mappers/colorMapper";
import { GENDER_LABELS } from "../../../utils/mappers/genderMapper";
import { MATERIAL_LABELS } from "../../../utils/mappers/materialMapper";

import {
  deleteProduct,
  getStockByProduct,
  getPrintPrice
} from "../../../services/api";
import { hasAnyRole } from "utils/auth/auth";
import { AuthContext } from "react-oauth2-code-pkce";
// import ImageGeneratorBlock from "./ImageGeneratorBlock";

const PRINT_SIZES = ["A6", "A5", "A4", "A3"];

const ProductDetails = ({ product }) => {
  const { token, tokenData } = useContext(AuthContext);
  const { addToCart } = useContext(CartContext);

  const navigate = useNavigate();

  const imageRef = useRef(null);
  const canvasRef = useRef(null);

  const [activeImage, setActiveImage] = useState(
    product.imageUrls?.[0] || ""
  );

  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);

  const [stock, setStock] = useState([]);

  const [prints, setPrints] = useState([]);
  const [showPrint, setShowPrint] = useState(false);

  const [draggingIndex, setDraggingIndex] = useState(null);

  const [printPrices, setPrintPrices] = useState({});

  const [notification, setNotification] = useState({
    open: false,
    type: "success",
    message: ""
  });

  useEffect(() => {
    if (!product?.id) return;

    getStockByProduct(product.id)
      .then(response => { setStock(response.data || []); })
      .catch(err => {
        console.error(err);
      });
  }, [product]);

  const getTypeId = (type) => {
    if (type === "simple") return 1;
    if (type === "full") return 2;
    return null;
  };

  const fetchPrice = async (typeId, size) => {
    if (!typeId || !size) return 0;

    const key = `${typeId}_${size}`;

    if (printPrices[key] !== undefined) {
      return printPrices[key];
    }

    try {
      const response = await getPrintPrice(typeId, size);
      const price = Number(response.data);

      setPrintPrices(prev => ({
        ...prev,
        [key]: price
      }));

      return price;
    } catch (e) {
      console.error(e);
      return 0;
    }
  };

  const getPrintPriceValue = (print) => {
    const typeId = getTypeId(print.type);

    if (!typeId || !print.size) return 0;

    return Number(
      printPrices[`${typeId}_${print.size}`] || 0
    );
  };

  const getTotalPrice = () => {
    let total = Number(product.price);

    prints.forEach(p => {
      total += getPrintPriceValue(p);
    });

    return total;
  };

  const allSizes = [...new Set(stock.map(s => s.size))];

  const availableColors = [
    ...new Set(
      stock
        .filter(s => s.quantity > 0)
        .map(s => s.color)
    )
  ];

  const sizesForSelectedColor = stock.filter(s => s.color === selectedColor && s.quantity > 0);

  const isSizeAvailable = (size) => {
    return sizesForSelectedColor.some(
      s => s.size === size
    );
  };

  const isAllSoldOut = stock.length > 0 && stock.every(s => s.quantity === 0);

  const handleEdit = () => {
    navigate(`/products/edit/${product.id}`);
  };

  const handleDelete = async () => {
    if (!window.confirm("Видалити товар?")) return;

    try {
      await deleteProduct(product.id);
      navigate("/products");
    } catch (e) {
      console.error(e);

      setNotification({
        open: true,
        type: "error",
        message: "Помилка при видаленні"
      });
    }
  };

  const getSizePx = (size) => {
    switch (size) {
      case "A6":
        return 60;

      case "A5":
        return 100;

      case "A4":
        return 140;

      case "A3":
        return 200;

      default:
        return 80;
    }
  };

  const handleDrag = (e) => {
    if (draggingIndex === null) return;

    const rect = imageRef.current.getBoundingClientRect();

    const x = ((e.clientX - rect.left) / rect.width) * 100;

    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setPrints(prev => {
      const copy = [...prev];
      copy[draggingIndex] = { ...copy[draggingIndex], x, y };
      return copy;
    });
  };

  const updatePrint = async (index, field, value) => {
    const copy = [...prints];

    if (!copy[index]) return;

    const updated = {
      ...copy[index],
      [field]: value
    };

    if (field === "type") {
      const typeId = getTypeId(value);

      for (const size of PRINT_SIZES) {
        await fetchPrice(typeId, size);
      }
    }

    if (field === "size") {
      updated.x = 50;
      updated.y = 50;

      const typeId = getTypeId(updated.type);

      await fetchPrice(typeId, value);
    }

    copy[index] = updated;

    setPrints(copy);
  };

  const removePrint = (index) => {
    setPrints(prev =>
      prev.filter((_, i) => i !== index)
    );
  };

  const addPrint = async () => {
    setShowPrint(true);

    const defaultType = "full";
    const typeId = getTypeId(defaultType);

    for (const size of PRINT_SIZES) {
      await fetchPrice(typeId, size);
    }

    setPrints(prev => [
      ...prev,
      {
        type: defaultType,
        size: null,
        image: null,
        x: 50,
        y: 50
      }
    ]);
  };

  const generatePreview = async () => {
    const canvas = canvasRef.current;

    const ctx = canvas.getContext("2d");

    return new Promise(resolve => {
      const base = new Image();

      base.crossOrigin = "anonymous";
      base.src = activeImage;

      base.onload = async () => {
        try {
          canvas.width = base.naturalWidth;
          canvas.height = base.naturalHeight;

          ctx.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
          );

          ctx.drawImage(base, 0, 0);

          for (const p of prints) {
            if (!p.image || !p.size) continue;

            const img = new Image();

            img.crossOrigin = "anonymous";

            img.src = URL.createObjectURL(p.image);

            await new Promise(res => {
              img.onload = () => {
                const baseSize = getSizePx(p.size);
                const size = baseSize * (canvas.width / 500);
                const x = (p.x / 100) * canvas.width;
                const y = (p.y / 100) * canvas.height;

                ctx.drawImage(img, x - size / 2, y - size / 2, size, size);

                res();
              };
            });
          }

          resolve(canvas.toDataURL("image/png"));
        } catch {
          resolve(activeImage);
        }
      };

      base.onerror = () => resolve(activeImage);
    });
  };

  const handleAddToCart = async () => {
    if (!selectedColor || !selectedSize) {
      setNotification({
        open: true,
        type: "warning",
        message: "Оберіть колір і розмір"
      });

      return;
    }

    const preview = await generatePreview();

    const preparedPrints = prints.map(p => ({
      size: p.size,
      type: p.type,
      fileUrl: p.image
        ? URL.createObjectURL(p.image)
        : null,
      price: getPrintPriceValue(p)
    }));

    const totalPrintPrice = preparedPrints.reduce((sum, p) => sum + p.price, 0);

    addToCart({
      ...product,
      selectedColor,
      selectedSize,
      preview,
      basePrice: product.price,
      printPrice: totalPrintPrice,
      price:
        Number(product.price) +
        totalPrintPrice,
      prints: preparedPrints,
      userId: 1
    });

    setNotification({
      open: true,
      type: "success",
      message: "Товар додано в кошик"
    });
  };

  return (
    <>
      <canvas ref={canvasRef} style={{ display: "none" }} />

      <Snackbar
        open={notification.open}
        autoHideDuration={3000}
        onClose={() =>
          setNotification(prev => ({
            ...prev,
            open: false
          }))
        }
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right"
        }}
      >
        <Alert
          severity={notification.type}
          variant="filled"
        >
          {notification.message}
        </Alert>
      </Snackbar>

      <Box
        sx={{ display: "flex", gap: 5, p: 4, flexDirection: { xs: "column", md: "row" }}} >
=
        <Box
          ref={imageRef}
          sx={{ flex: 1, position: "relative" }}
          onMouseMove={handleDrag}
          onMouseUp={() => setDraggingIndex(null)}
        >
          <Box
            component="img"
            src={activeImage}
            crossOrigin="anonymous"
            sx={{ width: "100%", maxHeight: 500, objectFit: "contain", borderRadius: 2, backgroundColor: "#fff" }}
          />

          {product.imageUrls?.length > 1 && (
            <Box
              sx={{ display: "flex", gap: 1, mt: 2, flexWrap: "wrap", justifyContent: "center" }}>
              {product.imageUrls.map((img, index) => {
                const isActive = activeImage === img;

                return (
                  <Box
                    key={index}
                    component="img"
                    src={img}
                    onClick={() =>
                      setActiveImage(img)
                    }
                    sx={{
                      width: 80,
                      height: 80,
                      objectFit: "cover",
                      borderRadius: 2,
                      cursor: "pointer",
                      border: isActive ? "3px solid #1976d2" : "1px solid #ddd",
                      opacity: isActive ? 1 : 0.7,
                      transition: "0.2s"
                    }}
                  />
                );
              })}
            </Box>
          )}

          {/* Друк */}
          {prints.map((p, i) => {
            if (!p.size) return null;

            const size = getSizePx(p.size);

            return (
              <Box
                key={i}
                onMouseDown={() => setDraggingIndex(i) }
                sx={{
                  position: "absolute",
                  top: `${p.y}%`,
                  left: `${p.x}%`,
                  width: size,
                  height: size,
                  transform: "translate(-50%, -50%)",
                  border: "2px dashed #000",
                  cursor: "move",
                  overflow: "hidden"
                }}
              >
                {p.image && (
                  <Box
                    component="img"
                    src={URL.createObjectURL(p.image)}
                    sx={{ width: "100%", height: "100%", objectFit: "contain" }}
                  />
                )}
              </Box>
            );
          })}
        </Box>

        <Box
          sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }} >
          {hasAnyRole(tokenData, ["ROLE_ADMIN"]) && (
            <Box sx={{ display: "flex", justifyContent: "flex-end" }} >
              <IconButton onClick={handleEdit}>
                <EditIcon sx={{ fontSize: 32 }} />
              </IconButton>

              <IconButton onClick={handleDelete}>
                <DeleteIcon sx={{ fontSize: 32 }} />
              </IconButton>
            </Box>
          )}

          <Typography variant="h4">
            {product.name}
          </Typography>

          <Typography variant="h5" sx={{ color: "#2e7d32", fontWeight: "bold" }}>
            {product.price} грн
          </Typography>
          <Typography>
            {product.description}
          </Typography>

          <Typography>
            <b>Матеріал:</b>{" "}{MATERIAL_LABELS[product.material] || product.material}
          </Typography>

          <Typography>
            <b>Стать:</b>{" "}{GENDER_LABELS[product.gender] || product.gender}
          </Typography>

          <Typography>
            <b>Категорії:</b>{" "}{product.categories?.join(", ")}
          </Typography>

          <Box>
            <Typography>
              <b>Кольори:</b>
            </Typography>

            {isAllSoldOut && (
              <Typography color="error">
                Розпродано все
              </Typography>
            )}

            <Box
              sx={{ display: "flex", gap: 1, mt: 1 }} >
              {availableColors.map(color => {
                const isSelected = selectedColor === color;

                return (
                  <Box
                    key={color}
                    onClick={() => {
                      setSelectedColor(color);
                      setSelectedSize(null);
                    }}
                    title={ COLOR_LABELS[color] }
                    sx={{
                      width: 30,
                      height: 30,
                      borderRadius: "50%",
                      backgroundColor: COLOR_HEX[color] || "#ccc",
                      cursor: "pointer",
                      border: isSelected ? "3px solid #000" : "1px solid #ddd"
                    }}
                  />
                );
              })}
            </Box>
          </Box>

          <Box>
            <Typography>
              <b>Розміри:</b>
            </Typography>

            <Box
              sx={{ display: "flex", gap: 1, mt: 1, flexWrap: "wrap" }} >
              {allSizes.map(size => {
                const available = selectedColor && isSizeAvailable(size);

                return (
                  <Button
                    key={size}
                    variant={ selectedSize === size ? "contained" : "outlined" }
                    disabled={!available}
                    onClick={() =>
                      setSelectedSize(size)
                    }
                  >
                    {size}
                  </Button>
                );
              })}
            </Box>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 2 }}>
            <Button
              variant="contained"
              onClick={handleAddToCart}
              sx={{ minWidth: 220, height: 42, px: 3, backgroundColor: "#2e7d32", "&:hover": { backgroundColor: "#1b5e20" } }} 
              >
              Додати в кошик
            </Button>

            <Typography variant="h5" sx={{ fontWeight: "bold", color: "#2e7d32", whiteSpace: "nowrap" }} >
              {getTotalPrice()} грн
            </Typography>
          </Box>

          {showPrint &&
            prints.map((p, i) => {
              const currentTypeId = getTypeId(p.type);

              return (
                <Box key={i} sx={{ borderBottom: "1px solid #ddd", pb: 2 }} >
                  <Box sx={{ display: "flex", gap: 1, mt: 1 }} >
                    <Button
                      variant={ p.type === "full" ? "contained" : "outlined" }
                      onClick={() =>
                        updatePrint(i, "type", "full")
                      }
                    >
                      Повнокольорове
                    </Button>

                    <Button
                      variant={ p.type === "simple" ? "contained" : "outlined" }
                      onClick={() => updatePrint(i, "type", "simple") }
                    >
                      Напис / силует
                    </Button>
                  </Box>

                  <Box sx={{ display: "flex", alignItems:  "center", gap: 1, mt: 1, flexWrap: "wrap" }} >
                    {PRINT_SIZES.map(
                      size => {
                        const priceKey = `${currentTypeId}_${size}`;
                        const price = printPrices[priceKey];

                        return (
                          <Button
                            key={`${i}_${size}`}
                            variant={ p.size === size ? "contained" : "outlined" }
                            onClick={() =>
                              updatePrint(i, "size", size)
                            }
                            sx={{ minWidth: 100, fontWeight: p.size === size ? 700 : 400 }}
                          >
                            {size}
                            {price !== undefined && ` (${price} грн)`}
                          </Button>
                        );
                      }
                    )}

                    <IconButton
                      size="small"
                      onClick={() =>
                        removePrint(i)
                      }
                      sx={{ ml: "auto", color: "#999" }}
                    >
                      <CloseIcon />
                    </IconButton>
                  </Box>

                  <Button component="label" sx={{ mt: 1 }}>
                    Завантажити зображення
                    <input hidden type="file" onChange={e => updatePrint(i, "image",  e.target.files[0] ) } />
                  </Button>
                  {/* <ImageGeneratorBlock/> */}
                </Box>
              );
            })}

          <Button variant="outlined" onClick={addPrint} >
            Додати друк
          </Button>
        </Box>
      </Box>
    </>
  );
};

export default ProductDetails;