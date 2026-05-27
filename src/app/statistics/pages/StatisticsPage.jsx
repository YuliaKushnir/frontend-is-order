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
  Button,
  CircularProgress
} from "@mui/material";

import Grid from "@mui/material/Grid";

import {
  DatePicker
} from "@mui/x-date-pickers/DatePicker";

import {
  LocalizationProvider
} from "@mui/x-date-pickers/LocalizationProvider";

import {
  AdapterDayjs
} from "@mui/x-date-pickers/AdapterDayjs";

import dayjs from "dayjs";

import {
  useEffect,
  useState
} from "react";

import {
  getOrderStatistics,
  getUsersByRole
} from "../../../services/api";

import {
  ORDER_STATUS_LABELS
} from "../../../utils/mappers/OrderLabels";

import { useNavigate } from "react-router-dom";

export default function StatisticsPage() {

  const navigate = useNavigate();

  const [loading, setLoading] =
    useState(false);

  const [orders, setOrders] =
    useState([]);

  const [total, setTotal] =
    useState(0);

  const [managers, setManagers] =
    useState([]);

  const [executors, setExecutors] =
    useState([]);

  const [selectedRole, setSelectedRole] =
    useState("MANAGER");

  const [selectedUser, setSelectedUser] =
    useState("");

  const [statuses, setStatuses] =
    useState([]);

  const [dateFrom, setDateFrom] =
    useState(dayjs().startOf("month"));

  const [dateTo, setDateTo] =
    useState(dayjs());

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

      const [
        managersResponse,
        executorsResponse
      ] = await Promise.all([
        getUsersByRole("MANAGER"),
        getUsersByRole("EXECUTOR")
      ]);

      setManagers(
        managersResponse.data || []
      );

      setExecutors(
        executorsResponse.data || []
      );

    } catch (e) {

      console.error(e);
    }
  };

  const loadStatistics = async () => {

    try {

      setLoading(true);

      const response =
        await getOrderStatistics({

          managerId:
            selectedRole === "MANAGER"
              ? selectedUser
              : null,

          workerId:
            selectedRole === "EXECUTOR"
              ? selectedUser
              : null,

          statuses,

          dateFrom:
            dateFrom
              ? dayjs(dateFrom)
                  .startOf("day")
                  .toISOString()
              : null,

          dateTo:
            dateTo
              ? dayjs(dateTo)
                  .endOf("day")
                  .toISOString()
              : null
        });

      setOrders(
        response.data.orders || []
      );

      setTotal(
        response.data.total || 0
      );

    } catch (e) {

      console.error(e);

    } finally {

      setLoading(false);
    }
  };

  const renderUserName = (user) => {

    const full =
      `${user.lastName || ""} ${user.firstName || ""}`.trim();

    return full || user.email;
  };

  return (
    <Box sx={{ p: 3 }}>

      <Typography
        variant="h4"
        fontWeight="bold"
        mb={3}
      >
        Статистика
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>

        <Grid
          container
          spacing={2}
        >

          <Grid size={{ xs: 12, md: 2 }}>

            <FormControl fullWidth>

              <InputLabel>
                Роль
              </InputLabel>

              <Select
                value={selectedRole}
                label="Роль"
                onChange={(e) => {

                  setSelectedRole(
                    e.target.value
                  );

                  setSelectedUser("");
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

            <FormControl fullWidth>

              <InputLabel>
                Співробітник
              </InputLabel>

              <Select
                value={selectedUser}
                label="Співробітник"
                onChange={(e) =>
                  setSelectedUser(
                    e.target.value
                  )
                }
              >

                {(selectedRole === "MANAGER"
                  ? managers
                  : executors
                ).map(user => (

                  <MenuItem
                    key={user.id}
                    value={user.keycloakId}
                  >
                    {renderUserName(user)}
                  </MenuItem>

                ))}

              </Select>

            </FormControl>

          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>

            <FormControl fullWidth>

              <InputLabel>
                Статуси
              </InputLabel>

              <Select
                multiple
                value={statuses}
                onChange={(e) =>
                  setStatuses(
                    e.target.value
                  )
                }
                input={
                  <OutlinedInput
                    label="Статуси"
                  />
                }
                renderValue={(selected) => (
                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 0.5
                    }}
                  >
                    {selected.map(value => (
                      <Chip
                        key={value}
                        label={
                          ORDER_STATUS_LABELS[value]
                        }
                      />
                    ))}
                  </Box>
                )}
              >

                {Object.entries(
                  ORDER_STATUS_LABELS
                ).map(([key, label]) => (

                  <MenuItem
                    key={key}
                    value={key}
                  >
                    {label}
                  </MenuItem>

                ))}

              </Select>

            </FormControl>

          </Grid>

          <Grid size={{ xs: 12, md: 1.5 }}>

            <LocalizationProvider
              dateAdapter={AdapterDayjs}
            >

              <DatePicker
                label="Від"
                value={dateFrom}
                onChange={setDateFrom}
                format="DD.MM.YYYY"
              />

            </LocalizationProvider>

          </Grid>

          <Grid size={{ xs: 12, md: 1.5 }}>

            <LocalizationProvider
              dateAdapter={AdapterDayjs}
            >

              <DatePicker
                label="До"
                value={dateTo}
                onChange={setDateTo}
                format="DD.MM.YYYY"
              />

            </LocalizationProvider>

          </Grid>

        </Grid>

      </Paper>

      <Typography
        fontSize={30}
        fontWeight="bold"
        mb={3}
      >
        Загальна сума: {total} грн
      </Typography>

      {loading ? (

        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            mt: 5
          }}
        >
          <CircularProgress />
        </Box>

      ) : (

        <Box>

          {orders.map(order => (

            <Paper
              key={order.id}
              sx={{
                p: 2,
                mb: 2,
                cursor: "pointer"
              }}
              onClick={() =>
                navigate(
                  `/orders/${order.id}`
                )
              }
            >

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 2
                }}
              >

                <Typography
                  fontWeight="bold"
                  fontSize={18}
                >
                  Замовлення №{order.id}
                </Typography>

                <Typography>
                  {
                    ORDER_STATUS_LABELS[
                      order.status
                    ]
                  }
                </Typography>

              </Box>

              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 3,
                  mt: 1
                }}
              >

                <Typography>
                  Дата:
                  {" "}
                  {
                    order.createdAt
                      ?.replace("T", " ")
                      ?.slice(0, 16)
                  }
                </Typography>

                <Typography>
                  Дедлайн:
                  {" "}
                  {
                    order.deadline
                      ?.replace("T", " ")
                      ?.slice(0, 16)
                      || "-"
                  }
                </Typography>

                <Typography
                  fontWeight="bold"
                >
                  Сума:
                  {" "}
                  {order.totalPrice} грн
                </Typography>

              </Box>

            </Paper>

          ))}

          {!orders.length && (

            <Typography>
              Немає даних
            </Typography>

          )}

        </Box>

      )}

    </Box>
  );
}