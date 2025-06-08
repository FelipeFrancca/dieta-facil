// components/MultiSelectSummary.jsx
import React from "react";
import {
  Box,
  Typography,
  TextField,
  Card,
  Grid,
  Divider,
  Chip,
} from "@mui/material";

export const MultiSelectSummary = ({
  selectedFoods,
  quantities,
  onQuantityChange,
}) => {
  // Calcular totais
  const calculateTotals = () => {
    return selectedFoods.reduce(
      (acc, food) => {
        const foodKey = `${food.nome}_${food.calorias}`;
        const quantity = quantities[foodKey] || 100;
        const factor = quantity / 100;

        return {
          calorias: acc.calorias + food.calorias * factor,
          proteina: acc.proteina + food.proteina * factor,
          carbo: acc.carbo + food.carbo * factor,
          gordura: acc.gordura + food.gordura * factor,
        };
      },
      { calorias: 0, proteina: 0, carbo: 0, gordura: 0 }
    );
  };

  const totals = calculateTotals();

  return (
    <Card sx={{ mt: 3, p: 3, bgcolor: "#f8f9ff", border: "2px solid #667eea" }}>
      <Typography
        variant="h6"
        sx={{ mb: 2, color: "#667eea", fontWeight: "bold" }}
      >
        📋 Alimentos Selecionados ({selectedFoods.length})
      </Typography>

      <Grid container spacing={2}>
        {selectedFoods.map((food) => {
          const foodKey = `${food.nome}_${food.calorias}`;
          const quantity = quantities[foodKey] || 100;
          const factor = quantity / 100;

          return (
            <Grid item xs={12} key={foodKey}>
              <Box
                sx={{
                  p: 2,
                  bgcolor: "white",
                  borderRadius: 1,
                  border: "1px solid #e0e0e0",
                  mb: 1,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    mb: 2,
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: "bold", textTransform: "capitalize" }}
                    >
                      {food.nome}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {Math.round(food.calorias * factor)} kcal | P:{" "}
                      {Math.round(food.proteina * factor)}g | C:{" "}
                      {Math.round(food.carbo * factor)}g | G:{" "}
                      {Math.round(food.gordura * factor)}g
                    </Typography>
                  </Box>
                  <TextField
                    label="Quantidade (g)"
                    type="number"
                    value={quantity}
                    onChange={(e) =>
                      onQuantityChange(foodKey, Number(e.target.value))
                    }
                    size="small"
                    sx={{ width: 120 }}
                    inputProps={{ min: 1, max: 9999 }}
                  />
                </Box>
              </Box>
            </Grid>
          );
        })}
      </Grid>

      <Divider sx={{ my: 2 }} />

      <Box sx={{ bgcolor: "white", p: 2, borderRadius: 1 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 2 }}>
          📊 Total dos Alimentos Selecionados:
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          <Chip
            label={`${Math.round(totals.calorias)} kcal`}
            color="primary"
            variant="filled"
          />
          <Chip
            label={`P: ${Math.round(totals.proteina)}g`}
            color="success"
            variant="outlined"
          />
          <Chip
            label={`C: ${Math.round(totals.carbo)}g`}
            color="warning"
            variant="outlined"
          />
          <Chip
            label={`G: ${Math.round(totals.gordura)}g`}
            color="info"
            variant="outlined"
          />
        </Box>
      </Box>
    </Card>
  );
};
