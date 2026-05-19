import React, { useEffect, useState } from "react";

import {
  Box,
  Typography,
  Paper,
  Chip
} from "@mui/material";

import { useNavigate, useParams } from "react-router-dom";
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "../../../utils/mappers/OrderLabels";
import { getUserOrders, getUserById } from "../../../services/api";

import Toast from "../../../shared/components/UIComponents/Toast";

export default function UserOrdersPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);
  const [orders, setOrders] = useState([]);
  const [user, setUser] = useState(null);

  const fetchOrders = async () => {
    try {
      const response = await getUserOrders(userId);
      const data = response.data;

      setOrders(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setOrders([]);
      setToast({ type: "error", message: "Не вдалося завантажити замовлення" });
    }
  };

  const fetchUser = async () => {
    try {
      const response = await getUserById(userId);
      setUser(response.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchUser();
  }, [userId]);

  const formatDate = (value) => {
    if (!value) return "-";

    return new Date(value)
      .toLocaleString("uk-UA", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
      });
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: "auto" }}>
      {toast && (
        <Toast message={toast.message}
          type={toast.type}
          onClose={() =>
            setToast(null)
          }
        />
      )}

      <Typography variant="h5" fontWeight="bold" mb={3} >
        Замовлення користувача { user ? `${user.lastName || ""} ${user.firstName || ""}`.trim() : "" }
      </Typography>

      <Box sx={{ display: "grid", gridTemplateColumns: "80px 120px 170px 170px 140px", gap: 1, px: 2, py: 1, color: "#666", fontSize: 12, fontWeight: 700 }}>
        <Box>ID</Box>
        <Box>Сума</Box>
        <Box>Дата</Box>
        <Box>Дедлайн</Box>
        <Box>Статус</Box>
      </Box>

      {orders.length === 0 ? (
        <Typography color="gray" mt={2} >
          У користувача немає замовлень
        </Typography>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }} >
          {orders.map(order => (
            <Paper
              key={order.id}
              sx={{ p: 1.5, cursor: "pointer" }}
              onClick={() =>
                navigate(`/orders/${order.id}`)
              }
            >
              <Box
                sx={{ display: "grid", gridTemplateColumns: "80px 120px 170px 170px 140px", gap: 1, alignItems: "center" }} >
                <Typography fontSize={12} fontWeight={700} >
                  #{order.id}
                </Typography>

                <Typography fontSize={12}>
                  {order.totalPrice || 0} грн
                </Typography>

                <Typography fontSize={12}>
                  {formatDate(order.createdAt)}
                </Typography>

                <Typography fontSize={12}>
                  {formatDate(order.deadline)}
                </Typography>

                <Chip
                  size="small"
                  label={ ORDER_STATUS_LABELS[order.status] || order.status }
                  color={ORDER_STATUS_COLORS[order.status] || "default" }
                />
              </Box>
            </Paper>
          ))}
        </Box>
      )}
    </Box>
  );
}