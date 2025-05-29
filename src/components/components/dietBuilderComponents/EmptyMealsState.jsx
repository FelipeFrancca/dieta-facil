// components/EmptyMealsState.jsx
import React from 'react';
import { Box, Typography } from "@mui/material";
import RestaurantIcon from "@mui/icons-material/Restaurant";

export const EmptyMealsState = () => (
  <Box sx={{ textAlign: "center", py: 6 }}>
    <RestaurantIcon sx={{ fontSize: 64, color: "#ccc", mb: 2 }} />
    <Typography variant="h6" color="textSecondary">
      Nenhuma refeição adicionada
    </Typography>
    <Typography variant="body2" color="textSecondary">
      Clique em "Nova Refeição" para começar
    </Typography>
  </Box>
);