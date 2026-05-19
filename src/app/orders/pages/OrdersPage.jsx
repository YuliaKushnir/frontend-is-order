import React, { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Box,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Button,
  Chip,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Toast from "../../../shared/components/UIComponents/Toast";

import {ORDER_STATUS_LABELS, ORDER_STATUS_COLORS} from "../../../utils/mappers/OrderLabels";

import { deleteOrder, getAllOrders, getUserById } from "../../../services/api";
import { hasAnyRole } from "utils/auth/auth";
import { AuthContext } from "react-oauth2-code-pkce";

const STATUSES = [
  "NEW",
  "CONFIRMED",
  "PAYED",
  "IN_PROGRESS",
  "PRINTING",
  "COMPLETED",
  "CANCELLED"
];

export default function OrdersPage() {
  const { token, tokenData } = useContext(AuthContext);
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [idSearch, setIdSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [managerFilter, setManagerFilter] = useState("");
  const [workerFilter, setWorkerFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [createdFrom, setCreatedFrom] = useState("");
  const [createdTo, setCreatedTo] = useState("");
  const [deadlineDate, setDeadlineDate] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [toast, setToast] = useState(null);
  const [usersMap, setUsersMap] = useState({});

  const fetchUser = async (userId) => {
    if (!userId) return;

    if (usersMap[userId]) return;

    try {
      const response = await getUserById(userId);
      const user = response.data;

      setUsersMap(prev => ({
        ...prev,
        [userId]:
          `${user.lastName || ""} ${user.firstName || ""}`.trim()
      }));
    } catch (e) {

      console.error(e);

      setUsersMap(prev => ({
        ...prev,
        [userId]: "-"
      }));
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();

      if (statusFilter) {
        params.append("status", statusFilter);
      }

      if (createdFrom) {
        params.append("dateFrom", `${createdFrom}T00:00:00`);
      }

      if (createdTo) {
        params.append("dateTo", `${createdTo}T23:59:59`);
      }

      if (deadlineDate) {
        params.append("deadlineDate", deadlineDate);
      }

      const response = await getAllOrders(params);
      const data = response.data;

      const validOrders = Array.isArray(data) ? data.filter(Boolean) : [];

      setOrders(validOrders);

      const uniqueIds = [
        ...new Set(
          validOrders.flatMap(order => [
            order.userId,
            order.managerId,
            order.workerId
          ]).filter(Boolean)
        )
      ];

      await Promise.all(
        uniqueIds.map(fetchUser)
      );

    } catch (e) {
      console.error(e);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [
    statusFilter,
    createdFrom,
    createdTo,
    deadlineDate
  ]);

  const filteredOrders =
    useMemo(() => {

      return orders.filter(order => {
        const userName = (usersMap[order.userId] || "").toLowerCase();
        const managerName = (usersMap[order.managerId] || "").toLowerCase();
        const workerName = (usersMap[order.workerId] || "").toLowerCase();
        const matchesId = String(order.id || "").includes(idSearch);

        const matchesUser = !userSearch || userName.includes(userSearch.toLowerCase());
        const matchesManager = !managerFilter || managerName.includes(managerFilter.toLowerCase());
        const matchesWorker = !workerFilter || workerName.includes(workerFilter.toLowerCase());

        return (matchesId && matchesUser && matchesManager && matchesWorker);
      });
    }, [
      orders,
      usersMap,
      idSearch,
      userSearch,
      managerFilter,
      workerFilter
    ]);

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

  const handleDeleteOrder = async () => {
    try {
      await deleteOrder(deleteId);

      setOrders(prev =>
        prev.filter(o => o.id !== deleteId)
      );

      setToast({ type: "success", message: "Замовлення успішно видалено" });
      setDeleteId(null);
    } catch (e) {
      console.error(e);
      setToast({ type: "error", message: e?.response?.data?.message || "Помилка видалення замовлення" });
    }
  };

  return (
    <Box
      sx={{p: 3, maxWidth: 1600, mx: "auto"}} >

      {toast && (
        <Toast 
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null) }/>
      )}

      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }} >
        <Typography variant="h5" fontWeight="bold" >
          Замовлення
        </Typography>

        <Button
          variant="contained"
          size="small"
          onClick={() =>
            navigate("/orders/new")
          } >
          Створити
        </Button>
      </Box>

      <Paper sx={{ p: 1.5, mb: 2 }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "90px 180px 140px 180px 180px 150px 150px 150px",
            gap: 0.8
          }}
        >
          <TextField
            size="small"
            label="ID"
            value={idSearch}
            onChange={(e) =>
              setIdSearch(
                e.target.value
              )
            }
          />

          <TextField
            size="small"
            label="Клієнт"
            value={userSearch}
            onChange={(e) =>
              setUserSearch(
                e.target.value
              )
            }
          />

          <FormControl size="small">
            <InputLabel>
              Статус
            </InputLabel>

            <Select
              value={statusFilter}
              label="Статус"
              onChange={(e) =>
                setStatusFilter(
                  e.target.value
                )
              }
            >
              <MenuItem value="">
                Всі
              </MenuItem>

              {STATUSES.map(status => (
                <MenuItem key={status} value={status} >
                  { ORDER_STATUS_LABELS[status] }
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            size="small"
            label="Менеджер"
            value={managerFilter}
            onChange={(e) =>
              setManagerFilter(
                e.target.value
              )
            }
          />

          <TextField
            size="small"
            label="Виконавець"
            value={workerFilter}
            onChange={(e) =>
              setWorkerFilter(
                e.target.value
              )
            }
          />

          <TextField
            size="small"
            type="date"
            label="Створено з"
            InputLabelProps={{
              shrink: true
            }}
            value={createdFrom}
            onChange={(e) => setCreatedFrom(e.target.value)}
          />

          <TextField
            size="small"
            type="date"
            label="Створено до"
            InputLabelProps={{
              shrink: true
            }}
            value={createdTo}
            onChange={(e) => setCreatedTo(e.target.value)}
          />

          <TextField
            size="small"
            type="date"
            label="Дедлайн"
            InputLabelProps={{
              shrink: true
            }}
            value={deadlineDate}
            onChange={(e) => setDeadlineDate(e.target.value)}
          />
        </Box>
      </Paper>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "70px 160px 100px 160px 160px 150px 150px 110px 70px",
          gap: 0.8,
          px: 1.5,
          py: 1,
          color: "#666",
          fontSize: 12,
          fontWeight: 700
        }}
      >

        <Box>ID</Box>
        <Box>Користувач</Box>
        <Box>Сума</Box>
        <Box>Менеджер</Box>
        <Box>Виконавець</Box>
        <Box>Дата</Box>
        <Box>Дедлайн</Box>
        <Box>Статус</Box>
        <Box></Box>
      </Box>

      {loading ? (
        <CircularProgress />
      ) : (
        <Box
          sx={{ display: "flex", flexDirection: "column", gap: 0.8 }}>

          {filteredOrders.map(order => (

            <Paper key={order.id} sx={{ p: 1.2 }}>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "70px 160px 100px 160px 160px 150px 150px 110px 70px",
                  gap: 0.8,
                  alignItems: "center"
                }}
              >

                <Typography
                  fontSize={12}
                  fontWeight={700}
                  sx={{ cursor: "pointer" }}
                  onClick={() =>
                    navigate(`/orders/${order.id}` )
                  }
                >
                  #{order.id}
                </Typography>

                <Typography
                  fontSize={12}
                  color="primary"
                  sx={{ cursor: "pointer" }}
                  onClick={() =>
                    navigate(`/users/${order.userId}/orders`)
                  }
                >
                  {usersMap[order.userId] || "-" }
                </Typography>

                <Typography fontSize={12}>
                  { order.totalPrice || 0 } грн
                </Typography>

                <Typography fontSize={12} >
                  { usersMap[order.managerId] || "-" }
                </Typography>

                <Typography fontSize={12} >
                  { usersMap[order.workerId] || "-" }
                </Typography>

                <Typography fontSize={12} >
                  { formatDate(order.createdAt) }
                </Typography>

                <Typography fontSize={12} >
                  { formatDate(order.deadline) }
                </Typography>

                <Chip
                  size="small"
                  label={ ORDER_STATUS_LABELS[order.status] || order.status }
                  color={ ORDER_STATUS_COLORS[order.status] || "default" }
                />

                <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                {hasAnyRole(tokenData, ["ROLE_ADMIN", "ROLE_MANAGER"]) && (
                  <IconButton
                    size="small"
                    onClick={() =>
                      navigate(`/orders/${order.id}/edit`)
                    }
                  >
                    <EditIcon fontSize="small"/>
                  </IconButton>
                )}

                {hasAnyRole(tokenData, ["ROLE_ADMIN", "ROLE_MANAGER"]) && (
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => setDeleteId(order.id)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                  )}
                </Box>
              </Box>
            </Paper>
          ))}
        </Box>
      )}

      <Dialog open={Boolean(deleteId)} onClose={() => setDeleteId(null)}>
        <DialogTitle>
          Видалити замовлення?
        </DialogTitle>

        <DialogContent>
          <DialogContentText>
            Замовлення №{deleteId}{" "}буде видалено без можливості відновлення.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>
            Скасувати
          </Button>

          <Button color="error" variant="contained" onClick={ handleDeleteOrder }>
            Видалити
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}