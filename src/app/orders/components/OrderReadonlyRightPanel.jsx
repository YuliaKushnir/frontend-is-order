import {
  Box,
  Typography,
  Paper,
  IconButton
} from "@mui/material";

import { useNavigate } from "react-router-dom";

import EditIcon from "@mui/icons-material/Edit";

import { COLOR_LABELS } from "../../../utils/mappers/colorMapper";

import { useContext, useEffect, useState } from "react";

import { getUserById } from "../../../services/api";
import { AuthContext } from "react-oauth2-code-pkce";
import { hasAnyRole } from "utils/auth/auth";

export default function OrderDetailsRightPanel({ order }) {

  const navigate = useNavigate();
  const { token, tokenData } = useContext(AuthContext);

  const [user, setUser] = useState(null);

  useEffect(() => {

    if (!order?.userId) return;

    loadUser();

  }, [order?.userId]);

  const loadUser = async () => {

    try {

      const response = await getUserById(order.userId);

      setUser(response.data);

    } catch (e) {

      console.error(e);
    }
  };

  const calcPrintTotal = (p) => {

    let multiplier = 1;

    if (p.typeName?.toLowerCase().includes("флекс")) {

      if (p.colorCount === 2) multiplier = 1.5;

      if (p.colorCount >= 3) multiplier = 2;
    }

    return (p.price || 0) * multiplier * (p.quantity || 1);
  };

  const calcTextileTotal = (item) => {

    return (item.basePrice || 0) * (item.quantity || 1);
  };

  const calcOrderTotal = () => {

    return (order.items || []).reduce((sum, item) => {

      const textile = calcTextileTotal(item);

      const prints = (item.prints || []).reduce((s, p) => {
        return s + calcPrintTotal(p);
      }, 0);

      return sum + textile + prints;

    }, 0);
  };

  return (
    <Box>

      <Typography sx={{ mb: 2, fontSize: 15, fontWeight: 500 }} >
        {
          user
            ? `${user.lastName || ""} ${user.firstName || ""}`.trim()
            : "Завантаження..."
        }
      </Typography>

      <Box
        sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }} >
        <Typography variant="h6">
          Позиції замовлення
        </Typography>

        {hasAnyRole(tokenData, ["ROLE_ADMIN", "ROLE_MANAGER"]) && (
        <IconButton
          size="small"
          onClick={() => navigate(`/orders/${order.id}/edit`) }
        >
          <EditIcon fontSize="small" />
        </IconButton>
        )}
      </Box>

      {(order.items || []).map((item, index) => (
        <Paper
          key={item.id || index}
          sx={{
            mb: 2,
            border: "1px solid #ddd",
            display: "flex",
            width: "100%",
            overflow: "hidden"
          }}
        >
          {(item.previewUrls || []).length > 0 && (
            <Box sx={{ width: 180, minWidth: 180, height: "100%", overflow: "hidden" }} >
              <a href={item.previewUrls[0]} target="_blank" rel="noreferrer" >
                <img
                  src={item.previewUrls[0]}
                  alt=""
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    cursor: "pointer"
                  }}
                />
              </a>
            </Box>
          )}

          <Box
            sx={{
              flex: 1,
              p: 2,
              backgroundColor: "#fff",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: 1 }} >
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }} >
              <Typography fontWeight="bold">
                {item.productName}
              </Typography>

              <Typography>
                {COLOR_LABELS[item.textileColor] || item.textileColor}
              </Typography>

              <Typography>
                Розмір: {item.size}
              </Typography>

              <Typography>
                К-сть: {item.quantity}
              </Typography>

              <Typography>
                Ціна/шт: {item.basePrice || 0} грн
              </Typography>

              <Typography fontWeight="bold">
                Сума: {calcTextileTotal(item)} грн
              </Typography>
            </Box>

            {(item.prints || []).map((p, pi) => (
              <Box key={p.id || pi} sx={{ display: "flex", flexWrap: "wrap", gap: 2 }} >
                <Typography>
                  {p.typeName}
                </Typography>

                <Typography>
                  Розмір: {p.size}
                </Typography>

                <Typography>
                  Розміщення: {p.placement}
                </Typography>

                <Typography>
                  К-сть: {p.quantity}
                </Typography>

                <Typography>
                  Ціна: {p.price || 0}
                </Typography>

                <Typography>
                  {p.typeName?.toLowerCase().includes("цифр")
                    ? "Повнокольоровий"
                    : `Кольори: ${(p.colors || [])
                        .map(c => COLOR_LABELS[c] || c)
                        .join(", ")}`}
                </Typography>

                <Typography fontWeight="bold">
                  Сума: {calcPrintTotal(p)} грн
                </Typography>
              </Box>
            ))}

            {item.comment && (
              <Typography mt={1} fontSize={13} color="text.secondary" >
                Коментар: {item.comment}
              </Typography>
            )}
          </Box>

          <Box sx={{ minWidth: 260, p: 1.5, display: "flex", alignItems: "center", gap: 1, overflowX: "auto" }} >
            {(item.prints || []).flatMap((p) =>
              (p.fileUrls || p.files || []).map((url, i) => {

                const fileUrl = url.url || url;

                return (
                  <a key={i} href={fileUrl} target="_blank" rel="noreferrer" >
                    <img src={fileUrl} alt="" width={70} height={70}
                      style={{ objectFit: "cover", borderRadius: 6, border: "1px solid #ddd" }}
                    />
                  </a>
                );
              })
            )}
          </Box>
        </Paper>
      ))}

      <Typography mt={3} fontWeight="bold" fontSize={18} >
        Загалом: {calcOrderTotal()} грн
      </Typography>

      {/* <Typography mt={1} fontSize={16}>
        Спосіб доставки: {user?.address || "-"}
      </Typography> */}

      <Typography sx={{ mb: 2, fontSize: 15, fontWeight: 500 }} >
        Спосіб доставки: { user ? `${user.address || ""}` : "-" }
      </Typography>

    </Box>
  );
}