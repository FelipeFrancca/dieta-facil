import { Card, Box, Typography, IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  calcularNutrientes,
  gerarUnidadesDisponiveis,
  converterParaGramas,
} from "./utils/nutrientCalculator";

export const CurrentMealFoods = ({ alimentos, onRemoverAlimento, onRemoveFood }) => {
  // Usar onRemoverAlimento se fornecido, caso contrário usar onRemoveFood para compatibilidade
  const removeHandler = onRemoverAlimento || onRemoveFood;
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
    const nutrientes = calcularNutrientes(
      alimento,
      alimento.quantidade,
      alimento.unidade || "gramas",
      unidadesDisponiveis
    );

    console.log("🧮 Calculando nutrientes para:", {
      nome: alimento.nome,
      quantidade: alimento.quantidade,
      unidade: alimento.unidade,
      valoresOriginais: {
        calorias: alimento.calorias,
        proteina: alimento.proteina,
        carbo: alimento.carbo,
        gordura: alimento.gordura,
      },
      unidadesDisponiveis: unidadesDisponiveis.map((u) => ({
        tipo: u.tipo,
        pesoPorUnidade: u.pesoPorUnidade,
      })),
      resultadoCalculado: nutrientes,
    });

    return nutrientes;
  };

  const formatarQuantidadeAlimento = (alimento) => {
    const unidade = alimento.unidade || "gramas";

    if (unidade === "gramas") {
      return `${alimento.quantidade}g`;
    }

    const unidadesDisponiveis = gerarUnidadesDisponiveis(alimento);
    const unidadeSelecionada = unidadesDisponiveis.find(
      (u) => u.tipo === unidade
    );

    if (unidadeSelecionada) {
      const gramas = converterParaGramas(
        alimento.quantidade,
        unidade,
        unidadesDisponiveis
      );

      return `${
        alimento.quantidade
      } ${unidadeSelecionada.label.toLowerCase()} (≈${gramas}g)`;
    }

    return `${alimento.quantidade} ${unidade}`;
  };

  return (
    <>
      {alimentos.map((alimento) => {
        const nutrientes = calcularNutrientesAlimento(alimento);
        const quantidadeFormatada = formatarQuantidadeAlimento(alimento);

        return (
          <Card
            key={alimento.id}
            sx={{
              mb: 2,
              p: 2,
              border: "1px solid #e0e0e0",
              borderRadius: 2,
              "&:hover": {
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              },
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: "bold",
                    textTransform: "capitalize",
                    color: "#2c3e50",
                    mb: 0.5,
                  }}
                >
                  {alimento.nome}
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    color: "#667eea",
                    fontWeight: "medium",
                    mb: 0.5,
                  }}
                >
                  📏 {quantidadeFormatada}
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    color: "#e74c3c",
                    fontWeight: "bold",
                    mb: 0.5,
                  }}
                >
                  🔥 {nutrientes.calorias} kcal
                </Typography>

                <Typography
                  variant="caption"
                  sx={{
                    color: "#7f8c8d",
                    display: "block",
                  }}
                >
                  🥩 P: {nutrientes.proteina}g | 🌾 C: {nutrientes.carbo}g | 🥑
                  G: {nutrientes.gordura}g
                </Typography>
              </Box>

              <IconButton
                color="error"
                onClick={() => removeHandler(alimento.id)}
                sx={{
                  backgroundColor: "#ffebee",
                  "&:hover": {
                    backgroundColor: "#ffcdd2",
                  },
                }}
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
