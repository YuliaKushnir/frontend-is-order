// src/components/UI/TopModal.js
import React, { useEffect } from "react";
import { Box, Typography, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const TopModal = ({ open, onClose, message }) => {
  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <Box
      sx={{
        position: "fixed",
        top: 20,
        left: "50%",
        transform: "translateX(-50%)",
        background: "#fff",
        padding: 2,
        borderRadius: 2,
        boxShadow: 3,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        gap: 2
      }}
    >
      <Typography>{message}</Typography>
      <IconButton size="small" onClick={onClose}>
        <CloseIcon />
      </IconButton>
    </Box>
  );
};

export default TopModal;