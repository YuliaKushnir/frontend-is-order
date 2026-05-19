// CartPage.jsx
import React, { useContext, useState } from "react";
import { useSelector } from "react-redux";
import { CartContext } from "../../../context/CartContext";
import {
  Box,
  Typography,
  IconButton,
  Button,
  TextField
} from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import Toast from "../../../shared/components/UIComponents/Toast";

import { COLOR_LABELS, COLOR_HEX } from "../../../utils/mappers/colorMapper";
import { createOrder } from "../../../services/api";

const CartPage = () => {
  const { cart, addToCart, removeFromCart, setCart } = useContext(CartContext);

  const userId = useSelector(state => state.auth.userId);

  const [orderComment, setOrderComment] = useState("");
  const [toast, setToast] = useState(null);

  const handleIncrement = (item) => {
    addToCart(item);
  };

  const handleDecrement = (item) => {
    if (item.quantity === 1) return;

    removeFromCart(item);
    addToCart({ ...item, quantity: item.quantity - 1 });
  };

  const getTextilePrice = (item) => {
    return item.basePrice || item.originalPrice || item.productPrice || item.price;
  };

  const getPrintPrice = (item) => {
    return item.printPrice || 0;
  };

  const totalSum = cart.reduce((sum, item) => {
    const textilePrice = getTextilePrice(item);
    const printPrice = getPrintPrice(item);

    return sum + (textilePrice + printPrice) * item.quantity;
  }, 0);

  const dataURLtoFile = (dataurl, filename) => {
    const arr = dataurl.split(",");
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, { type: mime });
  };

  const handleCheckout = async () => {
    const formData = new FormData();

    formData.append("userId", userId);
    formData.append("userNote", orderComment);
    formData.append("totalPrice", totalSum);

    for (let index = 0; index < cart.length; index++) {
      const item = cart[index];

      formData.append(`items[${index}].productId`, item.id);
      formData.append(`items[${index}].productName`, item.name);
      formData.append(`items[${index}].basePrice`, getTextilePrice(item));
      formData.append(`items[${index}].textileColor`, item.selectedColor);
      formData.append(`items[${index}].size`, item.selectedSize);
      formData.append(`items[${index}].quantity`, item.quantity);
      formData.append(
        `items[${index}].finalPrice`,
        (getTextilePrice(item) + getPrintPrice(item)) * item.quantity
      );

      if (item.preview) {
        const file = dataURLtoFile(item.preview, `preview_${index}.png`);
        formData.append(`items[${index}].previewFiles`, file);
      }

      if (item.prints) {
        for (let pIndex = 0; pIndex < item.prints.length; pIndex++) {
          const p = item.prints[pIndex];

          formData.append(
            `items[${index}].prints[${pIndex}].typeId`,
            p.type === "full" ? 2 : 1
          );

          formData.append(
            `items[${index}].prints[${pIndex}].typeName`,
            p.type === "full" ? "FULL" : "SIMPLE"
          );

          formData.append(
            `items[${index}].prints[${pIndex}].size`,
            p.size
          );

          formData.append(
            `items[${index}].prints[${pIndex}].quantity`,
            item.quantity
          );

          formData.append(
            `items[${index}].prints[${pIndex}].price`,
            p.price
          );

          if (p.fileUrl) {
            const res = await fetch(p.fileUrl);
            const blob = await res.blob();

            const file = new File([blob], `print_${pIndex}.png`, {
              type: blob.type
            });

            formData.append(
              `items[${index}].prints[${pIndex}].filesForPrint`,
              file
            );
          }
        }
      }
    }

    try {
      await createOrder(formData);

      setToast({ message: "Замовлення створено", type: "success" });

      if (setCart) {
        setCart([]);
      } else {
        cart.forEach(item => removeFromCart(item));
      }

      setOrderComment("");

    } catch (e) {
      console.error("--- Error creating order:", e);
      setToast({ message: "Помилка при створенні замовлення", type: "error" });
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      {toast && (<Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} /> )}
        
      <Typography variant="h4" sx={{ mb: 3 }}>
        Кошик
      </Typography>

      {cart.map((item, i) => {
        const textilePrice = getTextilePrice(item);
        const printPrice = getPrintPrice(item);

        const textileTotal = textilePrice * item.quantity;
        const printTotal = printPrice * item.quantity;
        const total = textileTotal + printTotal;

        return (
          <Box key={i} sx={{ borderBottom: "1px solid #ddd", py: 2 }}>
            
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 2, fontSize: "1.05rem" }} >
              <Box
                component="img"
                src={item.preview || item.imageUrls?.[0]}
                alt={item.name}
                onClick={() => window.open(item.preview, "_blank")}
                sx={{ width: 80, height: 80, objectFit: "cover", borderRadius: 2, cursor: "pointer" }}
              />

              <Typography sx={{ minWidth: 150, fontSize: "1.05rem" }}>
                {item.name}
              </Typography>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 120 }}>
                <Box
                  sx={{ width: 16, height: 16, borderRadius: "50%", backgroundColor: COLOR_HEX[item.selectedColor] }} />
                <Typography sx={{ fontSize: "1.05rem" }}>
                  {COLOR_LABELS[item.selectedColor]}
                </Typography>
              </Box>

              <Typography sx={{ minWidth: 60, fontSize: "1.05rem" }}>
                {item.selectedSize}
              </Typography>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <IconButton
                  onClick={() => handleDecrement(item)}
                  disabled={item.quantity === 1}
                >
                  <RemoveIcon />
                </IconButton>

                <Typography sx={{ fontSize: "1.05rem" }}>{item.quantity}</Typography>

                <IconButton onClick={() => handleIncrement(item)}>
                  <AddIcon />
                </IconButton>
              </Box>

              <Typography sx={{ minWidth: 120, fontSize: "1.05rem" }}>
                {textilePrice} грн
              </Typography>

              <Typography sx={{ minWidth: 140, fontSize: "1.05rem" }}>
                {textileTotal} грн
              </Typography>

              <Typography sx={{ minWidth: 160, fontWeight: "bold", fontSize: "1.05rem" }}>
                Загальна: {total} грн
              </Typography>

              <IconButton
                color="error"
                onClick={() => removeFromCart(item)}
                sx={{ ml: "auto" }}
              >
                <DeleteIcon />
              </IconButton>
            </Box>

            {item.prints && item.prints.length > 0 && (
              <Box
                sx={{
                  ml: 10,
                  mt: 2,
                  display: "flex",
                  flexDirection: "column",
                  gap: 1
                }}
              >
                {item.prints.map((p, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      p: 2,
                      border: "1px dashed #ccc",
                      borderRadius: 2,
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      width: "420px"
                    }}
                  >
                    {p.fileUrl && (
                      <Box
                        component="img"
                        src={p.fileUrl}
                        onClick={() => window.open(p.fileUrl, "_blank")}
                        sx={{
                          width: 70,
                          height: 70,
                          objectFit: "contain",
                          borderRadius: 1,
                          cursor: "pointer"
                        }}
                      />
                    )}

                    <Box sx={{ display: "flex", flexDirection: "column" }}>
                      <Typography sx={{ fontSize: "1.05rem" }}>
                        {p.type === "full"
                          ? "Повнокольорове"
                          : "Напис / силует"} | {p.size}
                      </Typography>

                      <Typography sx={{ fontSize: "1.05rem" }}>
                        К-сть: {item.quantity} | {p.price} грн
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        );
      })}

      <Box sx={{ mt: 3, width: "75%", mx: "auto" }}>
        <TextField
          label="Коментар до замовлення"
          multiline
          rows={2}
          value={orderComment}
          onChange={(e) => setOrderComment(e.target.value)}
          fullWidth
        />
      </Box>

      <Box
        sx={{
          mt: 4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderTop: "2px solid #000",
          pt: 2
        }}
      >
        <Typography variant="h5">
          Загальна сума: <b>{totalSum} грн</b>
        </Typography>

        <Button
          variant="contained"
          color="success"
          onClick={handleCheckout}
        >
          Оформити замовлення
        </Button>
      </Box>
    </Box>
  );
};

export default CartPage;