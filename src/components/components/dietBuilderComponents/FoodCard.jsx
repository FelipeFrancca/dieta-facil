// components/FoodCard.jsx
import React from 'react';
import { Card, Typography } from "@mui/material";

export const FoodCard = ({ alimento, isSelected, onClick }) => (
  <Card
    sx={{
      mb: 2,
      p: 2,
      cursor: "pointer",
      border: isSelected ? "2px solid #667eea" : "1px solid #e0e0e0",
      "&:hover": { backgroundColor: "#f5f5f5" },
    }}
    onClick={() => onClick(alimento)}
  >
    <Typography
      variant="subtitle1"
      sx={{ fontWeight: "bold", textTransform: "capitalize" }}
    >
      {alimento.nome}
    </Typography>
    <Typography variant="body2" color="textSecondary">
      {alimento.calorias} kcal | P: {alimento.proteina}g | C: {alimento.carbo}g | G: {alimento.gordura}g (por 100g)
    </Typography>
  </Card>
);