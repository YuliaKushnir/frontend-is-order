import React, {
  useEffect,
  useState
} from "react";

import {
  Paper,
  Typography,
  Select,
  MenuItem,
  TextField
} from "@mui/material";

import {
  ORDER_STATUS_LABELS,
  PRIORITY_LABELS
} from "../../../utils/mappers/OrderLabels";

import {
  getUsersByRole
} from "../../../services/api";

export default function OrderLeftPanelEdit({
  order,
  onPatch
}) {

  const [managers, setManagers] =
    useState([]);

  const [executors, setExecutors] =
    useState([]);

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

  const renderName = (user) => {

    const first =
      user.firstName || "";

    const last =
      user.lastName || "";

    const full =
      `${last} ${first}`.trim();

    return full || user.email;
  };

  return (
    <Paper sx={{ p: 2 }}>

      <Typography>
        Статус
      </Typography>

      <Select
        fullWidth
        size="small"
        value={order.status || ""}
        onChange={(e) =>
          onPatch(
            "status",
            e.target.value
          )
        }
      >
        {Object.entries(
          ORDER_STATUS_LABELS
        ).map(([k, v]) => (
          <MenuItem
            key={k}
            value={k}
          >
            {v}
          </MenuItem>
        ))}
      </Select>

      <Typography mt={2}>
        Пріоритет
      </Typography>

      <Typography fontSize={13}>
        {
          PRIORITY_LABELS[
            order.priority
          ]
        }
      </Typography>

      <Typography mt={2}>
        Дедлайн
      </Typography>

      <TextField
        fullWidth
        size="small"
        type="datetime-local"
        value={
          order.deadline?.slice(
            0,
            16
          ) || ""
        }
        onChange={(e) =>
          onPatch(
            "deadline",
            e.target.value
          )
        }
      />

      <Typography mt={2}>
        Дата виконання
      </Typography>

      <TextField
        fullWidth
        size="small"
        type="datetime-local"
        value={
          order.executionDate?.slice(
            0,
            16
          ) || ""
        }
        onChange={(e) =>
          onPatch(
            "executionDate",
            e.target.value
          )
        }
      />

      <Typography mt={2}>
        Менеджер
      </Typography>

      <Select
        fullWidth
        size="small"
        value={order.managerId || ""}
        onChange={(e) =>
          onPatch(
            "managerId",
            e.target.value
          )
        }
      >
        {managers.map(manager => (
          <MenuItem
            key={manager.id}
            value={manager.keycloakId}
          >
            {renderName(manager)}
          </MenuItem>
        ))}
      </Select>

      <Typography mt={2}>
        Виконавець
      </Typography>

      <Select
        fullWidth
        size="small"
        value={order.workerId || ""}
        onChange={(e) =>
          onPatch(
            "workerId",
            e.target.value
          )
        }
      >
        {executors.map(executor => (
          <MenuItem
            key={executor.id}
            value={executor.keycloakId}
          >
            {renderName(executor)}
          </MenuItem>
        ))}
      </Select>

      <Typography mt={2}>
        Коментар клієнта
      </Typography>

      <TextField
        fullWidth
        size="small"
        multiline
        rows={2}
        disabled
        value={
          order.userNote || ""
        }
      />

      <Typography mt={2}>
        Внутрішній коментар
      </Typography>

      <TextField
        fullWidth
        size="small"
        multiline
        rows={2}
        value={
          order.internalNote || ""
        }
        onChange={(e) =>
          onPatch(
            "internalNote",
            e.target.value
          )
        }
      />

    </Paper>
  );
}