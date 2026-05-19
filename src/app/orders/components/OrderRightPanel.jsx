import {
  Box,
  Button,
  Typography,
  TextField,
  Alert,
  IconButton,
  Autocomplete
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";

import AddIcon from "@mui/icons-material/Add";

import OrderItemsEditor from "./OrderItemsEditor";

import {
  useState,
  useMemo,
  useEffect
} from "react";

import {
  getUserById,
  getAllUsers
} from "../../../services/api";

export default function OrderRightPanel({ order, setOrder }) {

  const [user, setUser] = useState(null);
  const [editUser, setEditUser] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    if (!order?.userId) return;
    loadUser();
  }, [order?.userId]);

  const loadUser = async () => {
    try {
      const response = await getUserById(order.userId);
      setUser(response.data);
      setSelectedUser(response.data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await getAllUsers();
      setUsers(response.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  // Терміновість - пріоритет
  const urgencyWarning = useMemo(() => {
    if (!order?.deadline) return false;

    const today = new Date();
    const deadline = new Date(order.deadline);
    const diffDays = Math.ceil((deadline - new Date(today.setHours(0, 0, 0, 0))) / (1000 * 60 * 60 * 24));

    return diffDays <= 1;
  }, [order?.deadline]);

  // Додавання позиції
  const addItem = () => {
    const newItem = {
      id: Date.now(),
      type: "TEXTILE",
      productId: null,
      productName: "",
      textileColor: "",
      size: "",
      quantity: 1,
      basePrice: 0,
      prints: [],
      comment: "",
    };

    setOrder(prev => ({
      ...prev,
      items: [...(prev.items || []), newItem]
    }));
  };

  // Оновлення позицій
  const updateItem = (id, updated) => {
    setOrder(prev => ({
      ...prev,
      items: (prev.items || []).map(i => i.id === id ? updated : i)
    }));
  };

  // видалення позицій
  const removeItem = (id) => {
    setOrder(prev => ({
      ...prev,
      items: (prev.items || []).filter(i => i.id !== id)
    }));
  };

  // Загальна вартість
  const total = useMemo(() => {
    return (order.items || []).reduce(
      (sum, item) => {

        const textile =
          (item.basePrice || 0) *
          (item.quantity || 1);

        const prints =
          (item.prints || []).reduce(
            (pSum, p) => {
              return (pSum + (p.price || 0) * (p.quantity || 1) );
            },
            0
          );

        return sum + textile + prints;

      }, 0
    );

  }, [order.items]);

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }} >
        {!editUser ? (
          <>
            <Typography fontWeight="bold" fontSize={16} >
              Клієнт: { user ? `${ user.lastName || "" } ${ user.firstName || "" }`.trim() : "Завантаження..." }
            </Typography>

            <IconButton size="small" onClick={async () => {
                await loadUsers();
                setEditUser(true);
              }}
            >
              <EditIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </>
        ) : (
          <Autocomplete
            size="small"
            sx={{ width: 350 }}
            options={users}
            value={selectedUser}
            filterOptions={(options, state) => {
              const value = state.inputValue.toLowerCase();

              return options
                .filter(option => {

                  const fullName =
                    `${option.lastName || ""} ${option.firstName || ""}`
                      .toLowerCase();

                  return fullName.includes(value);
                })
                .slice(0, 3);
            }}
            getOptionLabel={(option) => `${option.lastName || ""} ${option.firstName || ""}`.trim() }
            onChange={(_, value) => {
              setSelectedUser(value);
              setUser(value);

              setOrder(prev => ({
                ...prev,
                userId: value?.keycloakId || null
              }));

              setEditUser(false);
            }}
            renderInput={(params) => (
              <TextField {...params} label="Оберіть клієнта" />
            )}
          />
        )}
      </Box>

      {urgencyWarning && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          Увага! Терміновість виконання друку оплачується додатково
        </Alert>
      )}

      {/* Позиції */}
      <Box mt={2}>
        {(order.items || []).map(item => (
          <OrderItemsEditor
            key={item.id}
            item={item}
            onChange={(updated) =>
              updateItem(item.id, updated)
            }
            onDelete={() =>
              removeItem(item.id)
            }
          />
        ))}
      </Box>

      {/* Загальна вартість */}
      <Typography mt={3} fontWeight="bold">
        Загалом: {total} грн
      </Typography>

      <Box mt={2}>
        <Button startIcon={<AddIcon />} onClick={addItem} variant="contained">
          Додати позицію
        </Button>
      </Box>
    </Box>
  );
}