// components/CurrentMealFoods.jsx
import React from "react";
import { Card, Box, Typography, IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  calcularNutrientes,
  gerarUnidadesDisponiveis,
} from "./utils/nutrientCalculator";

export const CurrentMealFoods = ({ alimentos, onRemoveFood }) => {
  if (alimentos.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <Typography variant="body2" color="textSecondary">
          Nenhum alimento adicionado. Clique em "Buscar Alimento" para
          adicionar.
        </Typography>
      </Box>
    );
  }

  const calcularNutrientesAlimento = (alimento) => {
    const unidadesDisponiveis = gerarUnidadesDisponiveis(alimento);
    return calcularNutrientes(
      alimento,
      alimento.quantidade,
      alimento.unidade || "gramas",
      unidadesDisponiveis
    );
  };

  const formatarQuantidadeAlimento = (alimento) => {
    if (!alimento.unidade || alimento.unidade === "gramas") {
      return `${alimento.quantidade}g`;
    }

    // Buscar descrição da unidade
    const unidadesDisponiveis = gerarUnidadesDisponiveis(alimento);
    const unidadeSelecionada = unidadesDisponiveis.find(
      (u) => u.tipo === alimento.unidade
    );

    return unidadeSelecionada
      ? `${alimento.quantidade} ${unidadeSelecionada.label.toLowerCase()}`
      : `${alimento.quantidade} ${alimento.unidade}`;
  };

  return (
    <>
      {alimentos.map((alimento) => {
        const nutrientes = calcularNutrientesAlimento(alimento);
        const unidadeFormatada = formatarQuantidadeAlimento(alimento);

        return (
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
                  {formatarQuantidadeAlimento(alimento)} - {nutrientes.calorias}{" "}
                  kcal
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  P: {nutrientes.proteina}g | C: {nutrientes.carbo}g | G:{" "}
                  {nutrientes.gordura}g
                </Typography>
              </Box>
              <IconButton
                color="error"
                onClick={() => onRemoveFood(alimento.id)}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          </Card>
        );
      })}
    </>
  );
};
