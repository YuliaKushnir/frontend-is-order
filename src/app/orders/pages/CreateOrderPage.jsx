import { Box, Grid, Button } from "@mui/material";
import OrderRightPanel from "../components/OrderRightPanel";
import OrderLeftPanel from "../components/OrderLeftPanel";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Toast from "../../../shared/components/UIComponents/Toast";
import { createOrder } from "../../../services/api";

const emptyOrder = {
  userId: null,
  status: "NEW",
  priority: "",
  totalPrice: 0,
  deadline: null,
  executionDate: null,
  userNote: "",
  internalNote: "",
  managerId: null,
  workerId: null,
  items: []
};

export default function CreateOrderPage() {
  const [order, setOrder] = useState(emptyOrder);
  const [toast, setToast] = useState(null);
  
  const navigate = useNavigate();

  const append = (fd, key, value) => {
    if (value !== null && value !== undefined && value !== "") {
      fd.append(key, value);
    }
  };

  const calcPrintTotal = (p) => {
    let multiplier = 1;

    if (p.typeName?.toLowerCase().includes("флекс")) {
      if (p.colorCount === 2) multiplier = 1.5;
      if (p.colorCount >= 3) multiplier = 2;
    }

    return Number(p.price || 0) * multiplier * Number(p.quantity || 1);
  };

  const calcItemTotal = (item) => {
    const textile = Number(item.basePrice || 0) * Number(item.quantity || 1);

    const prints = (item.prints || []).reduce((sum, p) => {
      return sum + calcPrintTotal(p);
    }, 0);

    return textile + prints;
  };

  const createOrderHandler = async () => {
    if (!order.userId) {
      setToast({ message: "Оберіть користувача", type: "warning" });
      return;
    }

    const formData = new FormData();

    const totalPrice = (order.items || []).reduce((sum, item) => {
      return sum + calcItemTotal(item);
    }, 0);

    const append = (key, value) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    };

    append("userId", order.userId);
    append("status", order.status);
    append("deadline", order.deadline);
    append("executionDate", order.executionDate);
    append("managerId", order.managerId);
    append("workerId", order.workerId);
    append("userNote", order.userNote);
    append("internalNote", order.internalNote);
    append("totalPrice", totalPrice);

    (order.items || []).forEach((item, i) => {
      const finalPrice = calcItemTotal(item);

      append(`items[${i}].productId`, item.productId);
      append(`items[${i}].productName`, item.productName);
      append(`items[${i}].basePrice`, item.basePrice);
      append(`items[${i}].textileColor`, item.textileColor);
      append(`items[${i}].size`, item.size);
      append(`items[${i}].quantity`, item.quantity);
      append(`items[${i}].manualTotal`, item.manualTotal || 0);
      append(`items[${i}].finalPrice`, finalPrice);
      append(`items[${i}].comment`, item.comment || "");

      (item.previewFiles || []).forEach((fileObj) => {
        formData.append(
          `items[${i}].previewFiles`,
          fileObj.file
        );
      });

      (item.prints || []).forEach((p, j) => {
        append(`items[${i}].prints[${j}].typeId`, p.typeId);
        append(`items[${i}].prints[${j}].typeName`, p.typeName);
        append(`items[${i}].prints[${j}].size`, p.size);
        append(`items[${i}].prints[${j}].placement`, p.placement);
        append(`items[${i}].prints[${j}].quantity`, p.quantity);
        append(`items[${i}].prints[${j}].price`, p.price || 0);
        append(`items[${i}].prints[${j}].manualTotal`, p.manualTotal || 0);
        append(`items[${i}].prints[${j}].colorCount`, p.colorCount || 0);

        (p.colors || []).forEach((c) => {
          formData.append(
            `items[${i}].prints[${j}].colors`,
            c
          );
        });

        (p.files || []).forEach((fileObj) => {
          formData.append(
            `items[${i}].prints[${j}].filesForPrint`,
            fileObj.file
          );
        });
      });
    });

    try {
      const { data } = await createOrder(formData);
      navigate(`/orders/${data.id}`);
    } catch (e) {
      console.error(e);
      alert("Помилка створення замовлення");
    }
  };

  return (
    <Box sx={{ p: 2, position: "relative" }}>
      {toast && (<Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} /> )}
      
      <Grid container spacing={2}>
        <Grid item sx={{ width: 300, flexShrink: 0 }}>
          <OrderLeftPanel order={order} setOrder={setOrder} />
        </Grid>

        <Grid item xs={9}>
          <OrderRightPanel order={order} setOrder={setOrder} />
        </Grid>
      </Grid>

      <Button
        variant="contained"
        size="large"
        sx={{ position: "fixed", bottom: 30, right: 40, zIndex: 1000 }}
        onClick={createOrderHandler}
      >
        Створити замовлення
      </Button>
    </Box>
  );
}