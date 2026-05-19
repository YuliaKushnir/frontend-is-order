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

const addDays = (days) => {
  const d = new Date();

  d.setDate(d.getDate() + days);

  return d
    .toISOString()
    .slice(0, 16);
};

export default function OrderLeftPanel({
  order,
  setOrder
}) {

  const [managers, setManagers] =
    useState([]);

  const [executors, setExecutors] =
    useState([]);

  useEffect(() => {
    if (!order.deadline) {
      setOrder(prev => ({
        ...prev,
        deadline: addDays(3)
      }));
    }
  }, [
    order.deadline,
    setOrder
  ]);

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

  const update = (
    field,
    value
  ) => {
    setOrder(prev => ({
      ...prev,
      [field]: value
    }));
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
    <Paper
      sx={{
        p: 2,
        fontSize: 13
      }}
    >

      <Typography variant="subtitle2">
        Статус
      </Typography>

      <Select
        fullWidth
        size="small"
        value={order.status || ""}
        onChange={(e) =>
          update(
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

      {order.id && (
        <>
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
        </>
      )}

      <Typography mt={2}>
        Дедлайн
      </Typography>

      <TextField
        size="small"
        type="datetime-local"
        fullWidth
        inputProps={{
          min: new Date()
            .toISOString()
            .slice(0, 16)
        }}
        value={ order.deadline?.slice( 0, 16 ) || "" }
        onChange={(e) =>
          update(
            "deadline",
            e.target.value
          )
        }
      />

      <Typography mt={2}>
        Дата / час виконання
      </Typography>

      <TextField
        size="small"
        type="datetime-local"
        fullWidth
        value={
          order.executionDate?.slice(
            0,
            16
          ) || ""
        }
        onChange={(e) =>
          update(
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
          update(
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
          update(
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
        size="small"
        fullWidth
        multiline
        rows={2}
        value={
          order.userNote || ""
        }
        disabled
      />

      <Typography mt={2}>
        Внутрішній коментар
      </Typography>

      <TextField
        size="small"
        fullWidth
        multiline
        rows={2}
        value={
          order.internalNote || ""
        }
        onChange={(e) =>
          update(
            "internalNote",
            e.target.value
          )
        }
      />

    </Paper>
  );
}