import React, {
  useEffect,
  useState
} from "react";

import {
  Paper,
  Typography,
  Box
} from "@mui/material";

import {
  ORDER_STATUS_LABELS,
  PRIORITY_LABELS
} from "../../../utils/mappers/OrderLabels";

import {
  getUsersByRole
} from "../../../services/api";

export default function OrderLeftPanelEdit({
  order
}) {

  const [managers, setManagers] =
    useState([]);

  const [executors, setExecutors] =
    useState([]);

  const [usersMap, setUsersMap] =
    useState({});

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {

      const [
        managersResponse,
        executorsResponse
      ] = await Promise.all([
        getUsersByRole("MANAGER"),
        getUsersByRole("EXECUTOR")
      ]);

      const managersData =
        managersResponse.data || [];

      const executorsData =
        executorsResponse.data || [];

      setManagers(managersData);
      setExecutors(executorsData);

      const map = {};

      [...managersData, ...executorsData]
        .forEach(user => {
          const full =
            `${user.lastName || ""} ${user.firstName || ""}`.trim();

          map[user.keycloakId] =
            full || user.email;
        });

      setUsersMap(map);

    } catch (e) {
      console.error(e);
    }
  };

  const formatDate = (value) => {
    if (!value) return "-";

    return new Date(value)
      .toLocaleString("uk-UA", {
        day: "2-digit",
        month: "long",
        hour: "2-digit",
        minute: "2-digit"
      });
  };

  const labelStyle = {
    fontSize: 16,
    fontWeight: 500
  };

  const valueStyle = {
    fontSize: 17,
    fontWeight: 700
  };

  return (
    <Paper sx={{ p: 3 }}>

      <Box mb={2}>
        <Typography sx={labelStyle}>
          Статус:
        </Typography>
        <Typography sx={valueStyle}>
          {
            ORDER_STATUS_LABELS[
              order.status
            ] || order.status
          }
        </Typography>
      </Box>

      <Box mb={2}>
        <Typography sx={labelStyle}>
          Пріоритет:
        </Typography>
        <Typography sx={valueStyle}>
          {
            PRIORITY_LABELS[
              order.priority
            ] || "-"
          }
        </Typography>
      </Box>

      <Box mb={2}>
        <Typography sx={labelStyle}>
          Дедлайн:
        </Typography>
        <Typography sx={valueStyle}>
          {
            formatDate(
              order.deadline
            )
          }
        </Typography>
      </Box>

      <Box mb={2}>
        <Typography sx={labelStyle}>
          Дата виконання:
        </Typography>
        <Typography sx={valueStyle}>
          {
            formatDate(
              order.executionDate
            )
          }
        </Typography>
      </Box>

      <Box mb={2}>
        <Typography sx={labelStyle}>
          Менеджер:
        </Typography>
        <Typography sx={valueStyle}>
          {
            usersMap[
              order.managerId
            ] || "-"
          }
        </Typography>
      </Box>

      <Box mb={2}>
        <Typography sx={labelStyle}>
          Виконавець:
        </Typography>
        <Typography sx={valueStyle}>
          {
            usersMap[
              order.workerId
            ] || "-"
          }
        </Typography>
      </Box>

      <Box mt={3}>
        <Typography sx={labelStyle}>
          Коментар клієнта:
        </Typography>

        <Typography
          sx={{
            fontSize: 15,
            color: "gray",
            mt: 1
          }}
        >
          {
            order.userNote || "-"
          }
        </Typography>
      </Box>

    </Paper>
  );
}