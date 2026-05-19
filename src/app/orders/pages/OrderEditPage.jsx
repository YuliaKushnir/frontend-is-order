import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import {
  Box,
  Grid,
  Button,
  CircularProgress,
} from "@mui/material";

import SaveIcon from "@mui/icons-material/Save";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import OrderLeftPanelEdit from "../components/OrderLeftPanelEdit";
import OrderRightPanel from "../components/OrderRightPanel";
import { getOrderById, updateOrder } from "../../../services/api";

export default function OrderEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [order, setOrder] = useState({
    userId: "",
    status: "NEW",
    deadline: "",
    executionDate: "",
    managerId: "",
    workerId: "",
    userNote: "",
    internalNote: "",
    items: []
  });

  useEffect(() => {
    loadOrder();
  }, [id]);

  const normalizeDate = (value) => {
    if (!value) return "";
    return value.slice(0, 16);
  };

  const loadOrder = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getOrderById(id);
      const data = response.data;

      setOrder({
        userId: data.userId || "",
        status: data.status || "NEW",

        deadline: normalizeDate(data.deadline),
        executionDate: normalizeDate(data.executionDate),

        managerId: data.managerId ?? "",
        workerId: data.workerId ?? "",

        userNote: data.userNote || "",
        internalNote: data.internalNote || "",

        items: (data.items || []).map(item => ({
          id: item.id,

          productId: item.productId || null,
          productName: item.productName || "",

          basePrice: item.basePrice || 0,

          textileColor: item.textileColor || "",

          size: item.size || "",
          quantity: item.quantity || 1,

          manualTotal: item.manualTotal || "",
          finalPrice: item.finalPrice || 0,
          comment: item.comment || "",

          previewFiles: (item.previewUrls || []).map(url => ({ url, existing: true })),

          prints: (
            item.prints || []
          ).map(p => ({
            id: p.id,

            typeId: p.typeId || "",
            typeName: p.typeName || "",

            size: p.size || "",
            placement: p.placement || "",

            quantity: p.quantity || 1,
            price: p.price || 0,
            manualTotal: p.manualTotal || "",

            colorCount: p.colorCount || 0,
            colors: p.colors || [],

            files: (p.fileUrls || []).map(url => ({ url, existing: true })),

            availablePrices: []
          }))
        }))
      });
    } catch (e) {
      console.error(e);

      setError(
        e?.response?.data?.message ||
        "Не вдалося завантажити замовлення"
      );
    } finally {
      setLoading(false);
    }
  };

  // Збереження замовлення
  const save = async () => {
    try {
      setSaving(true);
      setError("");

      const form = new FormData();

      // Замовлення - метадані
      form.append("userId", order.userId || "");
      form.append("status", order.status || "NEW");
      form.append("deadline", order.deadline || "");
      form.append("executionDate", order.executionDate || "");
      form.append("managerId", order.managerId || "");
      form.append("workerId", order.workerId || "");
      form.append("userNote", order.userNote || "");
      form.append("internalNote", order.internalNote || "");

      // Замовлення - позиції
      (order.items || []).forEach(
        (item, i) => {
          form.append(`items[${i}].id`, item.id || "");
          form.append(`items[${i}].productId`, item.productId || "");
          form.append(`items[${i}].productName`, item.productName || "");
          form.append(`items[${i}].basePrice`, item.basePrice || 0);
          form.append(`items[${i}].textileColor`, item.textileColor || "");
          form.append(`items[${i}].size`, item.size || "");
          form.append(`items[${i}].quantity`, item.quantity || 1);
          form.append(`items[${i}].manualTotal`, item.manualTotal || "");
          form.append(`items[${i}].finalPrice`, item.finalPrice || 0);
          form.append(`items[${i}].comment`, item.comment || "");

          // Прев'ю
          (
            item.previewFiles || []
          ).forEach(file => {

            if (file.existing) {
              form.append(`items[${i}].previewUrls`, file.url);
            } else if (file.file) {
              form.append(`items[${i}].previewFiles`, file.file);
            }
          });

          // Послуги друку до позиції
          (
            item.prints || []
          ).forEach((p, j) => {
            form.append(`items[${i}].prints[${j}].id`, p.id || "");
            form.append(`items[${i}].prints[${j}].typeId`, p.typeId || "");
            form.append(`items[${i}].prints[${j}].typeName`, p.typeName || "");
            form.append(`items[${i}].prints[${j}].size`, p.size || "");
            form.append(`items[${i}].prints[${j}].placement`, p.placement || "");
            form.append(`items[${i}].prints[${j}].quantity`, p.quantity || 1);
            form.append(`items[${i}].prints[${j}].price`, p.price || 0);
            form.append(`items[${i}].prints[${j}].manualTotal`, p.manualTotal || "");
            form.append(`items[${i}].prints[${j}].colorCount`, p.colorCount || 0);

            (
              p.colors || []
            ).forEach(color => {
              form.append(`items[${i}].prints[${j}].colors`, color);
            });

            (
              p.files || []
            ).forEach(file => {
              if (file.existing) {
                form.append(`items[${i}].prints[${j}].fileUrls`, file.url);
              } else if (file.file) {
                form.append(`items[${i}].prints[${j}].filesForPrint`, file.file);
              }
            });
          });
        }
      );

      await updateOrder(id, form);
      navigate(`/orders/${id}`);
    } catch (e) {
      console.error(e);
      setError(
        e?.response?.data?.message ||
        "Помилка збереження змін"
      );
    } finally {
      setSaving(false);
    }
  };

  // UI
  if (loading) {
    return (
      <Box sx={{ p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
     <Box sx={{ p: 3, width: "100%", mx: "auto" }} >
      <Grid container spacing={3} >
        <Grid item xs={12} md={3}>
          <OrderLeftPanelEdit
            order={order}
            onPatch={(field, value) => setOrder(prev => ({ ...prev, [field]: value })) }
          />
        </Grid>

        <Grid item xs={12} md={9} >
          <OrderRightPanel order={order} setOrder={setOrder} />
          <Box display="flex" gap={10} sx={{ mt: "30px" }}>
            <Button startIcon={ <ArrowBackIcon /> } onClick={() => navigate(`/orders/${id}` )}>
              Назад
            </Button>

            <Button
              variant="contained"
              onClick={save}
              disabled={saving} >
              {saving ? "Збереження..." : "Зберегти"}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}