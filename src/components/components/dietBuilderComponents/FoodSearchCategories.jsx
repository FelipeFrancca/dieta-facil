// components/FoodSearchCategories.jsx
import React from 'react';
import { Box, Typography, Chip, Alert } from "@mui/material";
import CategoryIcon from "@mui/icons-material/Category";

export const FoodSearchCategories = ({ 
  categorias, 
  selectedCategory, 
  onCategorySelect 
}) => (
  <Box sx={{ mb: 3 }}>
    <Typography
      variant="subtitle2"
      sx={{ mb: 2, display: "flex", alignItems: "center" }}
    >
      <CategoryIcon sx={{ mr: 1 }} />
      Buscar por categoria:
    </Typography>
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
      {Object.keys(categorias).map((categoria) => (
        <Chip
          key={categoria}
          label={categoria.charAt(0).toUpperCase() + categoria.slice(1)}
          onClick={() => onCategorySelect(categoria)}
          color={selectedCategory === categoria ? "primary" : "default"}
          variant={selectedCategory === categoria ? "filled" : "outlined"}
          size="small"
        />
      ))}
    </Box>
    {selectedCategory && (
      <Alert severity="info" sx={{ mt: 2 }}>
        Mostrando alimentos da categoria: <strong>{selectedCategory}</strong>
      </Alert>
    )}
  </Box>
);