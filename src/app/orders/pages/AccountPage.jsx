import React, { useEffect, useState} from "react";

import {
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  IconButton,
  TextField
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import { useNavigate, useParams } from "react-router-dom";
import Toast from "../../../shared/components/UIComponents/Toast";

import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "../../../utils/mappers/OrderLabels";
import { getUserOrders, getUserById, updateUserPersonalData } from "../../../services/api";

const AccountPage = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [orders, setOrders] = useState([]);
  const [toast, setToast] = useState(null);
  const [user, setUser] = useState(null);

  const [editing, setEditing] = useState({
    firstName: false,
    lastName: false,
    telephone: false,
    company: false
  });

  const [addressEditing, setAddressEditing] =
    useState(false);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    telephone: "",
    company: "",
    address: ""
  });

  const fetchOrders = async () => {
    try {
      const response = await getUserOrders(userId);
      const data = response.data;

      setOrders( Array.isArray(data) ? data : [] );
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

      setForm({
        firstName: response.data.firstName || "",
        lastName: response.data.lastName || "",
        telephone: response.data.telephone || "",
        company: response.data.company || "",
        address: response.data.address || ""
      });

    } catch (e) {
      console.error(e);

      setToast({ type: "error", message: "Не вдалося завантажити дані користувача" });
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchUser();
  }, [userId]);

  const saveData = async () => {
    try {
      const response = await updateUserPersonalData( userId, form );
      setUser(response.data);

      setEditing({
        firstName: false,
        lastName: false,
        telephone: false,
        company: false
      });

      setAddressEditing(false);
      setToast({ type: "success", message: "Дані оновлено" });
    } catch (e) {
      console.error(e);
      setToast({ type: "error", message: "Не вдалося оновити дані" });
    }
  };

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

  const renderEditableField = (field, label) => {
    return (
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }} >
        <Typography sx={{ width: 140, fontWeight: 700 }} >
          {label}
        </Typography>

        {editing[field] ? (
          <>
            <TextField
              size="small"
              fullWidth
              value={form[field]}
              onChange={(e) =>
                setForm(prev => ({
                  ...prev,
                  [field]:
                    e.target.value
                }))
              }
            />

            <Button variant="contained" onClick={saveData} >
              Зберегти
            </Button>
          </>
        ) : (
          <>
            <Typography sx={{ flex: 1 }} >
              {form[field] || "-"}
            </Typography>

            <IconButton
              onClick={() =>
                setEditing(prev => ({
                  ...prev,
                  [field]: true
                }))
              }
            >
              <EditIcon />
            </IconButton>
          </>
        )}
      </Box>
    );
  };

  const lastOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 3);

  return (
    <Box
      sx={{ p: 4, maxWidth: 1200, mx: "auto", display: "flex", flexDirection: "column", gap: 4 }} >
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() =>
            setToast(null)
          }
        />
      )}

      {/* Замовлення */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" fontWeight="bold" mb={2} >
          Усі замовлення
        </Typography>

        {lastOrders.length === 0 ? (
          <Typography color="gray">
            У вас ще немає замовлень
          </Typography>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }} >
            {lastOrders.map(order => (
              <Paper
                key={order.id}
                sx={{ p: 1.5, cursor: "pointer" }}
                onClick={() => navigate(`/orders/${order.id}`)}
              >
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "80px 140px 180px 140px",
                    gap: 1,
                    alignItems: "center"
                  }}
                >
                  <Typography fontWeight={700} >
                    #{order.id}
                  </Typography>

                  <Typography>{order.totalPrice || 0} {" "}грн</Typography>
                  <Typography>{formatDate(order.createdAt)}</Typography>

                  <Chip size="small"
                    label={ ORDER_STATUS_LABELS[order.status] || order.status }
                    color={ ORDER_STATUS_COLORS[ order.status ] || "default" }
                  />
                </Box>
              </Paper>
            ))}
          </Box>
        )}
      </Paper>

      {/* Адреса */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" fontWeight="bold" mb={2} >
          Спосіб доставки
        </Typography>

        {addressEditing ? (
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }} >
            <TextField
              fullWidth
              size="small"
              value={form.address}
              onChange={(e) =>
                setForm(prev => ({
                  ...prev,
                  address:
                    e.target.value
                }))
              }
            />

            <Button variant="contained" onClick={saveData} >
              Зберегти
            </Button>
          </Box>
        ) : (
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }} >
            <Typography sx={{ flex: 1 }} >
              {form.address || "-"}
            </Typography>

            <IconButton onClick={() => setAddressEditing(true) } >
              <EditIcon />
            </IconButton>
          </Box>
        )}
      </Paper>

      {/* Персональні дані */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" fontWeight="bold" mb={2} >
          Персональні дані
        </Typography>

        {renderEditableField( "lastName", "Прізвище" )}
        {renderEditableField( "firstName", "Імʼя" )}
        {renderEditableField( "telephone", "Телефон" )}
        {renderEditableField( "company", "Компанія" )}
      </Paper>
    </Box>
  );
};

export default AccountPage;