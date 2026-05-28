import {
  Box,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Chip,
  CircularProgress,
  TextField,
  Button
} from "@mui/material";

import Grid from "@mui/material/Grid";

import { useEffect, useState } from "react";
import { getOrderStatistics, getUsersByRole } from "../../../services/api";
import { ORDER_STATUS_LABELS } from "../../../utils/mappers/OrderLabels";
import { useNavigate } from "react-router-dom";

export default function StatisticsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [managers, setManagers] = useState([]);
  const [executors, setExecutors] = useState([]);
  const [selectedRole, setSelectedRole] = useState("MANAGER");
  const [selectedUser, setSelectedUser] = useState("ALL");
  const [statuses, setStatuses] = useState(["ALL"]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    loadStatistics();
  }, [
    selectedRole,
    selectedUser,
    statuses,
    dateFrom,
    dateTo
  ]);

  const loadUsers = async () => {
    try {
      const [managersResponse, executorsResponse ] = await Promise.all([
        getUsersByRole("MANAGER"),
        getUsersByRole("EXECUTOR")
      ]);
      setManagers(managersResponse.data || []);
      setExecutors(executorsResponse.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const loadStatistics = async () => {
    try {
      setLoading(true);
      const response = await getOrderStatistics({
          managerId:
            selectedRole === "MANAGER" &&
            selectedUser !== "ALL" ? selectedUser : null,

          workerId:
            selectedRole === "EXECUTOR" &&
            selectedUser !== "ALL" ? selectedUser : null,

          statuses: statuses.includes("ALL") ? [] : statuses,
          dateFrom: dateFrom ? `${dateFrom}T00:00:00` : null,
          dateTo: dateTo ? `${dateTo}T23:59:59` : null,
        });

      setOrders(response.data.orders || []);
      setTotal(response.data.total || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSelectedRole("MANAGER");
    setSelectedUser("ALL");
    setStatuses(["ALL"]);
    setDateFrom("");
    setDateTo("");
  };

  const renderUserName = (user) => {
    const full = `${user.lastName || ""} ${user.firstName || ""}`.trim();
    return full || user.email;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        Статистика
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>

        <Grid container spacing={2} alignItems="center" >
          <Grid size={{ xs: 12, md: 2 }}>
            <FormControl fullWidth>
              <InputLabel>
                Роль
              </InputLabel>

              <Select value={selectedRole} label="Роль" onChange={(e) => {
                  setSelectedRole(e.target.value);
                  setSelectedUser("ALL");
                }}
              >
                <MenuItem value="MANAGER">
                  Менеджер
                </MenuItem>

                <MenuItem value="EXECUTOR">
                  Виконавець
                </MenuItem>

              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>

            <FormControl fullWidth sx={{ minWidth: 260 }}>
              <InputLabel>
                Співробітник
              </InputLabel>

              <Select
                value={selectedUser}
                label="Співробітник"
                onChange={(e) => setSelectedUser(e.target.value)}
              >

                <MenuItem value="ALL">
                  Усі
                </MenuItem>

                {(selectedRole === "MANAGER" ? managers : executors).map(user => (

                  <MenuItem key={user.id} value={user.keycloakId}>
                    {renderUserName(user)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <FormControl fullWidth sx={{ minWidth: 280 }}>
              <InputLabel>
                Статуси
              </InputLabel>

              <Select multiple value={statuses} 
                onChange={(e) => {
                  const value = e.target.value;

                  if (value.includes("ALL")) {
                    setStatuses(["ALL"]);
                  } else {
                    setStatuses(value);
                  }
                }}
                input={
                  <OutlinedInput label="Статуси" />
                }
                renderValue={(selected) => (

                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }} >
                    {selected.includes("ALL") ? ( <Chip label="Усі" />
                    ) : (
                      selected.map(value => (<Chip key={value} label={ ORDER_STATUS_LABELS[value] } />))
                    )}
                  </Box>
                )}
              >

                <MenuItem value="ALL">
                  Усі
                </MenuItem>

                {Object.entries(ORDER_STATUS_LABELS).map(([key, label]) => (
                  <MenuItem key={key} value={key}>
                    {label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, md: 2 }}>
            <TextField
              fullWidth
              type="date"
              label="Від"
              InputLabelProps={{ shrink: true }}
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value )} 
            />
          </Grid>

          <Grid size={{ xs: 12, md: 2 }}>
            <TextField
              fullWidth
              type="date"
              label="До"
              InputLabelProps={{ shrink: true }}
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 12 }}>
            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <Button variant="outlined" onClick={clearFilters} >
                Очистити фільтр
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Typography fontSize={30} fontWeight="bold" mb={3}>
        Загальна сума: {total} грн
      </Typography>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }} >
          <CircularProgress />
        </Box>
      ) : (
        <Box>
          {orders.map(order => (
            <Paper
              key={order.id}
              sx={{ p: 2, mb: 2, cursor: "pointer" }}
              onClick={() => navigate(`/orders/${order.id}`)}
            >
              <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 4 }}>
                <Typography fontWeight="bold" fontSize={18}>
                  №{order.id}
                </Typography>

                <Typography>
                  { ORDER_STATUS_LABELS[order.status] }
                </Typography>

                <Typography>
                  Дата:{" "}{ order.createdAt ?.replace("T", " ") ?.slice(0, 16) }
                </Typography>

                <Typography>
                  Дедлайн:{" "}{ order.deadline ?.replace("T", " ") ?.slice(0, 16) || "-" }
                </Typography>

                <Typography fontWeight="bold">
                  Сума:{" "}{order.totalPrice} грн
                </Typography>
              </Box>
            </Paper>
          ))}

          {!orders.length && ( <Typography>Немає даних</Typography> )}
        </Box>
      )}
    </Box>
  );
}