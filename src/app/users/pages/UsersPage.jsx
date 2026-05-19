import React, {
  useEffect,
  useMemo,
  useState
} from "react";

import {
  Box,
  Typography,
  TextField,
  Paper,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Button
} from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

import { useNavigate } from "react-router-dom";
import { getAllUsers, deleteUser, updateUserRole } from "../../../services/api";

const ROLES = [
  "CLIENT",
  "MANAGER",
  "EXECUTOR",
  "ADMIN"
];

const UsersPage = () => {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [editingRoleUserId, setEditingRoleUserId] = useState(null);
  const [roleValue, setRoleValue] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);

    try {
      const response = await getAllUsers();

      setUsers(
        response.data || []
      );

    } catch (e) {
      console.error("Error fetching users:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e, keycloakId) => {
    e.stopPropagation();
    const confirmed = window.confirm("Видалити користувача?");

    if (!confirmed) return;

    try {
      await deleteUser(keycloakId);

      setUsers(prev => prev.filter(user => user.keycloakId !== keycloakId ));
    } catch (e) {
      console.error(e);
    }
  };

  const startEditRole = (e, user) => {
    e.stopPropagation();
    setEditingRoleUserId(user.keycloakId);
    setRoleValue(user.role || "");
  };

  const saveRole = async (e, keycloakId) => {
    e.stopPropagation();

    if (!ROLES.includes(roleValue)) {
      alert("Невірна роль");
      return;
    }

    try {
      await updateUserRole(keycloakId, roleValue);

      setUsers(prev =>
        prev.map(user => user.keycloakId === keycloakId ? { ...user, role: roleValue } : user)
      );

      setEditingRoleUserId(null);
    } catch (e) {
      console.error(e);
    }
  };

  const filteredUsers =
    useMemo(() => {
      const value = search.toLowerCase();

      return users.filter(user => {
        const fullName = `${ user.firstName || "" } ${ user.lastName || "" }`.toLowerCase();
        const matchesSearch = fullName.includes(value) || user.email?.toLowerCase().includes(value);
        const matchesRole = !roleFilter || user.role === roleFilter;

        return (matchesSearch && matchesRole);
      });
    }, [
      users,
      search,
      roleFilter
    ]);

  const renderValue = value => {
    if (value === null || value === undefined || value === "") {
      return "-";
    }

    return value;
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1500, mx: "auto", p: 4 }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }} >
        Користувачі
      </Typography>

      <Box sx={{ display: "flex", gap: 2, mb: 3, alignItems: "center" }} >
        <TextField
          fullWidth
          size="small"
          placeholder="Пошук по імені або email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        <FormControl size="small" sx={{ minWidth: 220 }} >
          <InputLabel>
            Роль
          </InputLabel>

          <Select
            value={roleFilter}
            label="Роль"
            onChange={e => setRoleFilter(e.target.value)}
          >
            <MenuItem value="">
              Усі
            </MenuItem>

            {ROLES.map(role => (
              <MenuItem key={role} value={role} >
                {role}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Paper elevation={2} sx={{ overflowX: "auto", borderRadius: 3 }}>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "70px 150px 150px 240px 160px 160px 220px 100px",
            gap: 1,
            p: 1.5,
            fontWeight: 700,
            fontSize: 13,
            borderBottom: "2px solid #ddd",
            backgroundColor: "#f5f5f5",
            minWidth: 1400
          }}
        >
          <Box>№</Box>
          <Box>LastName</Box>
          <Box>FirstName</Box>
          <Box>email</Box>
          <Box>telephone</Box>
          <Box>company</Box>
          <Box>Role</Box>
          <Box>Actions</Box>
        </Box>

        {filteredUsers.map(
          (user, index) => (
            <Box
              key={user.id}
              onClick={() =>
                navigate(`/account/${user.keycloakId}`)
              }
              sx={{
                display: "grid",
                gridTemplateColumns: "70px 150px 150px 240px 160px 160px 220px 100px",
                gap: 1,
                p: 1.5,
                borderBottom: "1px solid #eee",
                alignItems: "center",
                minWidth: 1400,
                cursor: "pointer",
                transition: "0.2s",
                fontSize: 13,
                "&:hover": { backgroundColor: "#fafafa" }
              }}
            >
              <Box>
                {index + 1}
              </Box>

              <Box>
                {renderValue(user.lastName )}
              </Box>

              <Box>
                {renderValue(user.firstName)}
              </Box>

              <Box>
                {renderValue(user.email)}
              </Box>

              <Box>
                {renderValue(user.telephone)}
              </Box>

              <Box>
                {renderValue(user.company)}
              </Box>

              <Box
                onClick={e => e.stopPropagation()}>

                {editingRoleUserId === user.keycloakId ? (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <TextField
                      size="small"
                      value={ roleValue }
                      onChange={e =>
                        setRoleValue(e.target.value.toUpperCase())
                      }
                      sx={{ width: 120 }}
                    />

                    <Button
                      size="small"
                      variant="contained"
                      onClick={e => saveRole(e, user.keycloakId)}
                    >
                      OK
                    </Button>
                  </Box>
                ) : (
                  <Box
                    sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography sx={{ fontSize: 13 }} >
                      {renderValue(user.role)}
                    </Typography>

                    <IconButton
                      size="small"
                      onClick={e => startEditRole(e, user)}>
                      <EditIcon sx={{ fontSize: 16 }}/>
                    </IconButton>
                  </Box>
                )}
              </Box>

              <Box onClick={e => e.stopPropagation() }>
                <Tooltip title="Видалити">
                  <IconButton size="small" onClick={e => handleDelete(e, user.keycloakId)} >
                    <DeleteIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          )
        )}

        {!filteredUsers.length && (
          <Box sx={{ p: 4, textAlign: "center", color: "#777", fontSize: 14 }} >
            Користувачів не знайдено
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default UsersPage;