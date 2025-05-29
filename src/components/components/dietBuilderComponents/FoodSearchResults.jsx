// components/FoodSearchResults.jsx
import React from 'react';
import { Card, Skeleton } from "@mui/material";
import { FoodCard } from './FoodCard';

export const FoodSearchResults = ({ 
  localResults, 
  searchResults, 
  loading, 
  selectedFood, 
  onFoodSelect 
}) => (
  <>
    {/* Resultados locais */}
    {localResults.map((alimento, index) => (
      <FoodCard
        key={`local-${index}`}
        alimento={alimento}
        isSelected={selectedFood?.nome === alimento.nome}
        onClick={onFoodSelect}
      />
    ))}

    {/* Skeleton loading */}
    {loading &&
      Array.from({ length: 4 }).map((_, index) => (
        <Card key={`skeleton-${index}`} sx={{ mb: 2, p: 2 }}>
          <Skeleton variant="text" width="60%" height={24} />
          <Skeleton variant="text" width="80%" height={20} />
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
          <FoodCard
            key={`api-${index}`}
            alimento={alimento}
            isSelected={selectedFood?.nome === alimento.nome}
            onClick={onFoodSelect}
          />
        ))}
  </>
);