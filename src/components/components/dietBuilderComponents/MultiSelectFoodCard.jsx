// components/MultiSelectFoodCard.jsx
import React from 'react';
import { Card, Typography, Checkbox, Box, Skeleton } from "@mui/material";

export const MultiSelectFoodCard = ({ 
  localResults, 
  searchResults, 
  loading, 
  selectedFoods, 
  onFoodSelect 
}) => {
  const isSelected = (food) => {
    return selectedFoods.find(f => `${f.nome}_${f.calorias}` === `${food.nome}_${food.calorias}`);
  };

  const FoodCardContent = ({ alimento }) => (
    <Card
      sx={{
        mb: 2,
        p: 2,
        cursor: "pointer",
        border: isSelected(alimento) ? "2px solid #667eea" : "1px solid #e0e0e0",
        backgroundColor: isSelected(alimento) ? "#f3f4ff" : "#fff",
        "&:hover": { backgroundColor: isSelected(alimento) ? "#e8eaff" : "#f5f5f5" },
        transition: "all 0.2s ease-in-out",
      }}
      onClick={() => onFoodSelect(alimento)}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
        <Checkbox
          checked={!!isSelected(alimento)}
          color="primary"
          sx={{ mt: -1, mr: 2 }}
        />
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="subtitle1"
            sx={{ 
              fontWeight: "bold", 
              textTransform: "capitalize",
              color: isSelected(alimento) ? "#667eea" : "inherit"
            }}
          >
            {alimento.nome}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {alimento.calorias} kcal | P: {alimento.proteina}g | C: {alimento.carbo}g | G: {alimento.gordura}g (por 100g)
          </Typography>
        </Box>
      </Box>
    </Card>
  );

  return (
    <>
      {/* Resultados locais */}
      {localResults.map((alimento, index) => (
        <FoodCardContent key={`local-${index}`} alimento={alimento} />
      ))}

      {/* Skeleton loading */}
      {loading &&
        Array.from({ length: 4 }).map((_, index) => (
          <Card key={`skeleton-${index}`} sx={{ mb: 2, p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
              <Checkbox disabled sx={{ mt: -1, mr: 2 }} />
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width="60%" height={24} />
                <Skeleton variant="text" width="80%" height={20} />
              </Box>
            </Box>
          </Card>
        ))}

      {/* Resultados da API (filtrados para evitar duplicatas) */}
      {!loading &&
        searchResults
          .filter(
            (a) =>
              !localResults.find(
                (l) => l.nome.toLowerCase() === a.nome.toLowerCase()
              )
          )
          .map((alimento, index) => (
            <FoodCardContent key={`api-${index}`} alimento={alimento} />
          ))}
    </>
  );
};