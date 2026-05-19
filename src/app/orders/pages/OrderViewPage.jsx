import { Box, Grid } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import OrderLeftPanelEdit from "../components/OrderLeftPanelEdit";
import OrderReadonlyRightPanel from "../components/OrderReadonlyRightPanel";
import Toast from "../../../shared/components/UIComponents/Toast";

import { getOrderById, patchOrder } from "../../../services/api";
import OrderLeftPanelClient from "../components/OrderLeftPanelClient";
import { hasAnyRole } from "utils/auth/auth";
import { AuthContext } from "react-oauth2-code-pkce";

export default function OrderViewPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [toast, setToast] = useState(null);

  const { token, tokenData } = useContext(AuthContext);
  const isManager = hasAnyRole(tokenData, ["ROLE_MANAGER", "ROLE_EXECUTOR", "ROLE_ADMIN"]);
  const isClientOnly = hasAnyRole(tokenData, ["ROLE_CLIENT"]) && !isManager;

  useEffect(() => {
    load();
  }, [id]);

  const load = async () => {
    try {
      const response = await getOrderById(id);
      setOrder(response.data);
    } catch (e) {
      console.error(e);
    }
  };

  const patch = async (field, value) => {
    try {
      const response = await patchOrder(id, {
        [field]: value
      });

      setOrder(response.data);

    } catch (e) {
      console.error(e);
      setToast({ type: "error", message: "Не вдалося оновити замовлення" });
    }
  };

  if (!order) return null;

  return (
    <Box
      sx={{ p: 2, maxWidth: 1600, mx: "auto" }} >
      {toast && ( <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} /> )}

      <Grid container spacing={2} alignItems="flex-start" wrap="nowrap" >
        <Grid item sx={{ width: 260, minWidth: 260, flexShrink: 0 }} >
          {isClientOnly && <OrderLeftPanelClient order={order} />}
          {isManager && <OrderLeftPanelEdit order={order} onPatch={patch} />}
        </Grid>

        <Grid item xs sx={{ minWidth: 0, flex: 1 }} >
          <OrderReadonlyRightPanel order={order} />
        </Grid>
      </Grid>
    </Box>
  );
}