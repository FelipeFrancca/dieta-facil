// components/CurrentMealFoods.jsx
import React from 'react';
import { Card, Box, Typography, IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

export const CurrentMealFoods = ({ alimentos, onRemoveFood }) => {
  if (alimentos.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <Typography variant="body2" color="textSecondary">
          Nenhum alimento adicionado. Clique em "Buscar Alimento" para adicionar.
        </Typography>
      </Box>
    );
  }

  return (
    <>
      {alimentos.map((alimento) => (
        <Card key={alimento.id} sx={{ mb: 2, p: 2 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: "bold", textTransform: "capitalize" }}
              >
                {alimento.nome}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {alimento.quantidade}g - {Math.round((alimento.calorias * alimento.quantidade) / 100)} kcal
              </Typography>
            </Box>
            <IconButton color="error" onClick={() => onRemoveFood(alimento.id)}>
              <DeleteIcon />
            </IconButton>
          </Box>
        </Card>
      ))}
    </>
  );
};