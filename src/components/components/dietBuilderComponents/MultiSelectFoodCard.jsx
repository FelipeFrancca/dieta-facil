// components/MultiSelectFoodCard.jsx
import React from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { FoodCard } from './FoodCard';
import { FoodQuantitySelector } from './FoodQuantitySelector';

export const MultiSelectFoodCard = ({
  localResults,
  searchResults,
  loading,
  selectedFoods,
  onFoodSelect,
  multiSelectQuantities,
  onQuantityChange
}) => {
  const getFoodKey = (food) => `${food.nome}_${food.calorias}`;
  
  const isSelected = (food) => {
    const foodKey = getFoodKey(food);
    return selectedFoods.find(f => getFoodKey(f) === foodKey);
  };

  const renderFoodWithQuantity = (food, index) => {
    const foodKey = getFoodKey(food);
    const selected = isSelected(food);
    
    return (
      <Box key={`${foodKey}_${index}`} sx={{ mb: 2 }}>
        <FoodCard
          alimento={food}
          isSelected={!!selected}
          onClick={onFoodSelect}
        />
        
        {/* Renderizar o seletor de quantidade apenas se o alimento estiver selecionado */}
        {selected && (
          <Box sx={{ mt: 1, ml: 2 }}>
            <FoodQuantitySelector
              selectedFood={food}
              foodQuantity={multiSelectQuantities[foodKey] || 100}
              onQuantityChange={(value) => onQuantityChange(foodKey, value)}
              onUnitChange={() => {}}
            />
          </Box>
        )}
      </Box>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Combinar resultados locais e da API, removendo duplicatas
  const allResults = [...localResults];
  searchResults.forEach(apiFood => {
    const exists = localResults.some(localFood => 
      localFood.nome.toLowerCase() === apiFood.nome.toLowerCase()
    );
    if (!exists) {
      allResults.push(apiFood);
    }
  });

  if (allResults.length === 0) {
    return (
      <Typography variant="body2" color="textSecondary" sx={{ textAlign: "center", py: 2 }}>
        Nenhum alimento encontrado. Tente uma busca diferente.
      </Typography>
    );
  }

  return (
    <Box>
      <Typography variant="subtitle2" sx={{ mb: 2, color: '#666' }}>
        {allResults.length} alimento{allResults.length !== 1 ? 's' : ''} encontrado{allResults.length !== 1 ? 's' : ''}
      </Typography>
      
      {allResults.map((food, index) => renderFoodWithQuantity(food, index))}
    </Box>
  );
};