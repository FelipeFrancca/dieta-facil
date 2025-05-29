// components/FoodQuantitySelector.jsx
import React from 'react';
import { Box, Typography, TextField } from "@mui/material";

export const FoodQuantitySelector = ({ 
  selectedFood, 
  foodQuantity, 
  onQuantityChange 
}) => {
  if (!selectedFood) return null;

  return (
    <Box sx={{ mt: 3, p: 2, bgcolor: "#f5f5f5", borderRadius: 1 }}>
      <Typography variant="subtitle1" sx={{ mb: 2 }}>
        Quantidade de {selectedFood.nome}:
      </Typography>
      <TextField
        label="Quantidade (gramas)"
        type="number"
        value={foodQuantity}
        onChange={(e) => onQuantityChange(Number(e.target.value))}
        fullWidth
        sx={{ mb: 2 }}
        inputProps={{ min: 1 }}
      />
      <Typography variant="body2" color="textSecondary">
        Valores nutricionais para {foodQuantity}g:
      </Typography>
      <Typography variant="body2">
        Calorias: {Math.round((selectedFood.calorias * foodQuantity) / 100)} kcal | 
        Proteínas: {Math.round((selectedFood.proteina * foodQuantity) / 100)}g |
        Carboidratos: {Math.round((selectedFood.carbo * foodQuantity) / 100)}g |
        Gorduras: {Math.round((selectedFood.gordura * foodQuantity) / 100)}g
      </Typography>
    </Box>
  );
};