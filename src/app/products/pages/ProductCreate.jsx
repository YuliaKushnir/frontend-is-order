import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from "@mui/material";

import { useNavigate, useParams } from "react-router-dom";

import { COLOR_LABELS, COLOR_HEX } from "../../../utils/mappers/colorMapper";
import { GENDER_LABELS } from "../../../utils/mappers/genderMapper";
import { addProduct, getAllCategories, getProductById, updateProduct } from "../../../services/api";

const MATERIALS = [
  "100% бавовна",
  "95% бавовна, 5% еластан"
];

const MAX_IMAGES = 6;

const ProductCreate = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const fileInputRef = useRef();

  const [categories, setCategories] = useState([]);

  const [form, setForm] = useState({
    name: "",
    price: "",
    description: "",
    gender: "",
    material: "",
    categoryIds: [],
    colors: [],
    images: []
  });

  const [imagePreviews, setImagePreviews] = useState([]);

  useEffect(() => {
    getAllCategories()
      .then(response => { setCategories(response.data || []);})
      .catch(err => { console.error("Error fetching categories:", err);});
  }, []);

  // підвантаження продукту для редагування 
  useEffect(() => {
    if (!isEdit) return;

    getProductById(id)
      .then(response => {
        const data = response.data;

        setForm({
          name: data.name || "",
          price: data.price || "",
          description: data.description || "",
          gender: data.gender || "",
          material: data.material || "",
          categoryIds: data.categoryIds || [],
          colors: data.colors || [],
          images: [],
        });

        setImagePreviews((data.imageUrls || []).map(url => ({ url, existing: true })));
      })
      .catch(err => { console.error("Error fetching product:", err); });
  }, [id, isEdit]);

  const handleChange = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
  };

  // додавання файлів
  const addFiles = (files) => {
    const newFiles = Array.from(files);

    if (imagePreviews.length + newFiles.length > MAX_IMAGES) {
      alert(`Максимум ${MAX_IMAGES} зображень`);
      return;
    }

    const newPreviews = newFiles.map(file => ({ file, url: URL.createObjectURL(file) }));
    setForm(prev => ({ ...prev, images: [...prev.images, ...newFiles] }));
    setImagePreviews(prev => [...prev, ...newPreviews]);
  };

  const handleFileChange = (e) => addFiles(e.target.files);

  const handleDrop = (e) => {
    e.preventDefault();
    addFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e) => e.preventDefault();

  // видалення зображень (і нових, і старих)
  const removeImage = (index) => {
    setImagePreviews(prev => {
      const updated = [...prev];

      if (!updated[index].existing) {
        URL.revokeObjectURL(updated[index].url);
        setForm(f => ({ ...f, images: f.images.filter((_, i) => i !== index) }));
      }

      updated.splice(index, 1);
      return updated;
    });
  };

  const toggleColor = (color) => {
    setForm(prev => {
      const exists = prev.colors.includes(color);
      return {
        ...prev,
        colors: exists
          ? prev.colors.filter(c => c !== color)
          : [...prev.colors, color]
      };
    });
  };

  const handleSubmit = async () => {
    if (!form.name || !form.price || !form.description) {
      alert("Заповніть обов’язкові поля");
      return;
    }

    if (!form.gender) {
      alert("Оберіть стать");
      return;
    }

    if (form.categoryIds.length === 0) {
      alert("Оберіть категорію");
      return;
    }

    if (form.colors.length === 0) {
      alert("Оберіть колір");
      return;
    }

    const formData = new FormData();

    formData.append("name", form.name);
    formData.append("price", form.price);
    formData.append("description", form.description);
    formData.append("gender", form.gender);
    formData.append("material", form.material || "");

    form.categoryIds.forEach(id =>
      formData.append("categoryIds", id)
    );

    form.colors.forEach(color =>
      formData.append("colors", color)
    );

    form.images.forEach(file =>
      formData.append("images", file)
    );

    try {
      if (isEdit) {
        await updateProduct(id, formData);
      } else {
        await addProduct(formData);
      }

      navigate("/products");

    } catch (err) {
      const errorText = err.response?.data || "Помилка мережі";
      alert("Помилка: " + errorText);
    }
  };

  return (
    <Box sx={{ p: 4, maxWidth: 700, mx: "auto", display: "flex", flexDirection: "column", gap: 2 }}>

      <Typography variant="h4">
        {isEdit ? "Редагувати товар" : "Створити товар"}
      </Typography>

      <TextField label="Назва" value={form.name} onChange={handleChange("name")} />

      <TextField  label="Ціна" type="number" value={form.price} onChange={handleChange("price")} />

      <TextField label="Опис" multiline rows={3} value={form.description} onChange={handleChange("description")} />

      <ToggleButtonGroup value={form.gender} exclusive onChange={(e, v) => v && setForm({ ...form, gender: v })} >
        {Object.keys(GENDER_LABELS).map(key => (
          <ToggleButton key={key} value={key}> {GENDER_LABELS[key]} </ToggleButton>
        ))}
      </ToggleButtonGroup>

      <ToggleButtonGroup value={form.material} exclusive onChange={(e, v) => v && setForm({ ...form, material: v })} >
        {MATERIALS.map(m => ( <ToggleButton key={m} value={m}>{m}</ToggleButton> ))}
      </ToggleButtonGroup>

      <FormControl fullWidth>
        <InputLabel>Категорія</InputLabel>
        <Select value={form.categoryIds[0] || ""} label="Категорія"
          onChange={(e) =>
            setForm({ ...form, categoryIds: [e.target.value] })
          }
        >
          {categories.map(cat => (
            <MenuItem key={cat.id} value={cat.id}> {cat.name} </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
        {Object.keys(COLOR_LABELS).map(color => {
          const selected = form.colors.includes(color);

          return (
            <ToggleButton
              key={color} selected={selected} onChange={() => toggleColor(color)}
              sx={{
                backgroundColor: selected
                  ? COLOR_HEX[color]
                  : "#f5f5f5",
                color: selected ? "#fff" : "#000"
              }}
            >
              {COLOR_LABELS[color]}
            </ToggleButton>
          );
        })}
      </Box>

      <Box
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => fileInputRef.current.click()}
        sx={{ border: "2px dashed #ccc", p: 3, textAlign: "center", cursor: "pointer" }}
      >
        <Typography>Додати зображення (макс {MAX_IMAGES})</Typography>
        <input ref={fileInputRef} type="file" hidden multiple onChange={handleFileChange} />
      </Box>

      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
        {imagePreviews.map((img, i) => (
          <Box key={i} sx={{ position: "relative" }}>
            <img src={img.url} width={100} height={100} style={{ objectFit: "cover" }} />
            <Button onClick={() => removeImage(i)}>✕</Button>
          </Box>
        ))}
      </Box>

      <Button variant="contained" onClick={handleSubmit}>
        {isEdit ? "Зберегти" : "Створити"}
      </Button>
    </Box>
  );
};

export default ProductCreate;