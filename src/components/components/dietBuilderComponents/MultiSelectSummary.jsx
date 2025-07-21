// components/MultiSelectSummary.jsx
import { useState } from "react";
import {
  Box,
  Typography,
  Card,
  Grid,
  Divider,
  Chip,
} from "@mui/material";
import { FoodQuantitySelector } from "./FoodQuantitySelector";
import { 
  calcularNutrientes, 
  gerarUnidadesDisponiveis 
} from "./utils/nutrientCalculator";

export const MultiSelectSummary = ({
  selectedFoods,
  quantities,
  onQuantityChange,
}) => {
  // Calcular totais usando as funções corretas
  const calculateTotals = () => {
    return selectedFoods.reduce(
      (acc, food) => {
        const foodKey = `${food.nome}_${food.calorias}`;
        const quantity = quantities[foodKey] || 100;
        
        // Usar a função correta de cálculo que considera as unidades
        const unidadesDisponiveis = gerarUnidadesDisponiveis(food);
        const nutrientes = calcularNutrientes(
          food,
          quantity,
          food.unidade || "gramas",
          unidadesDisponiveis
        );

        return {
          calorias: acc.calorias + nutrientes.calorias,
          proteina: acc.proteina + nutrientes.proteina,
          carbo: acc.carbo + nutrientes.carbo,
          gordura: acc.gordura + nutrientes.gordura,
        };
      },
      { calorias: 0, proteina: 0, carbo: 0, gordura: 0 }
    );
  };
  const [multiSelectQuantities, setMultiSelectQuantities] = useState({});

const handleQuantityChange = (foodKey, quantity) => {
    setMultiSelectQuantities({
      ...multiSelectQuantities,
      [foodKey]: quantity,
    });
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
          
          // Usar a função correta de cálculo que considera as unidades
          const unidadesDisponiveis = gerarUnidadesDisponiveis(food);
          const nutrientes = calcularNutrientes(
            food,
            quantity,
            food.unidade || "gramas",
            unidadesDisponiveis
          );

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
                      {nutrientes.calorias} kcal | P:{" "}
                      {nutrientes.proteina}g | C:{" "}
                      {nutrientes.carbo}g | G:{" "}
                      {nutrientes.gordura}g
                    </Typography>
                  </Box>
                  <FoodQuantitySelector
                    key={`${food.nome}_${food.calorias}`}
                    selectedFood={food}
                    foodQuantity={
                      multiSelectQuantities[`${food.nome}_${food.calorias}`] ||
                      100
                    }
                    onQuantityChange={(value) =>
                      handleQuantityChange(
                        `${food.nome}_${food.calorias}`,
                        value
                      )
                    }
                    onUnitChange={() => {}} // opcional, se não quiser controlar unidade externamente
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
