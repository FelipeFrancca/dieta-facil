import React from "react";
import {
  Paper,
  Typography,
  Grid,
  Box,
  LinearProgress,
  Chip,
  Divider,
} from "@mui/material";
import { Assessment as AssessmentIcon } from "@mui/icons-material";

const MacroSummary = ({
  totalDia,
  calorias,
  titulo = "📊 Resumo Nutricional do Dia",
  mostrarProgresso = true,
  gradiente = "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  compacto = false,
  mostrarPercentuais = true,
  metaMacros = null,
}) => {
  const percentualCalorias = calorias
    ? Math.round((totalDia.calorias / calorias) * 100)
    : 0;

  const calcularPercentualMacro = (valorGramas, tipoMacro) => {
    if (totalDia.calorias <= 0) return 0;

    const caloriasPorGrama = tipoMacro === "gordura" ? 9 : 4;
    const caloriasDoMacro = valorGramas * caloriasPorGrama;

    return Math.round((caloriasDoMacro / totalDia.calorias) * 100);
  };

  const calcularPercentualMeta = (valor, meta) => {
    return meta ? Math.round((valor / meta) * 100) : 0;
  };

  const formatarValor = (valor) => Math.round(valor);

  const macroData = [
    {
      nome: "Calorias",
      valor: formatarValor(totalDia.calorias),
      unidade: "kcal",
      meta: calorias,
      percentualMeta: percentualCalorias,
      percentualTotal: 100,
      cor: "#667eea",
      icon: "🔥",
    },
    {
      nome: "Proteínas",
      valor: formatarValor(totalDia.proteina),
      unidade: "g",
      meta: metaMacros?.proteina,
      percentualMeta: calcularPercentualMeta(
        totalDia.proteina,
        metaMacros?.proteina
      ),
      percentualTotal: calcularPercentualMacro(totalDia.proteina, "proteina"),
      cor: "#e53e3e",
      icon: "💪",
    },
    {
      nome: "Carboidratos",
      valor: formatarValor(totalDia.carbo),
      unidade: "g",
      meta: metaMacros?.carbo,
      percentualMeta: calcularPercentualMeta(totalDia.carbo, metaMacros?.carbo),
      percentualTotal: calcularPercentualMacro(totalDia.carbo, "carbo"),
      cor: "#3182ce",
      icon: "🌾",
    },
    {
      nome: "Gorduras",
      valor: formatarValor(totalDia.gordura),
      unidade: "g",
      meta: metaMacros?.gordura,
      percentualMeta: calcularPercentualMeta(
        totalDia.gordura,
        metaMacros?.gordura
      ),
      percentualTotal: calcularPercentualMacro(totalDia.gordura, "gordura"),
      cor: "#38a169",
      icon: "🥑",
    },
  ];

  if (compacto) {
    return (
      <Paper
        sx={{
          p: 2,
          background: gradiente,
          color: "white",
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
          {titulo}
        </Typography>
        <Grid container spacing={1}>
          {macroData.map((macro, index) => (
            <Grid item xs={6} sm={3} key={index}>
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                  {macro.icon} {macro.nome}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                  {macro.valor}
                  {macro.unidade}
                </Typography>
                {mostrarPercentuais && macro.nome !== "Calorias" && (
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    ({macro.percentualTotal}%)
                  </Typography>
                )}
                {macro.nome === "Calorias" && calorias && (
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    ({macro.percentualMeta}% da meta)
                  </Typography>
                )}
              </Box>
            </Grid>
          ))}
        </Grid>
      </Paper>
    );
  }

  return (
    <Paper
      sx={{
        p: 3,
        background: gradiente,
        color: "white",
        borderRadius: 3,
        boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <AssessmentIcon sx={{ mr: 2, fontSize: 28 }} />
        <Typography variant="h6" sx={{ fontWeight: "bold", flex: 1 }}>
          {titulo}
        </Typography>
        {percentualCalorias > 0 && (
          <Chip
            label={`${percentualCalorias}% da meta`}
            sx={{
              bgcolor: "rgba(255,255,255,0.2)",
              color: "white",
              fontWeight: "bold",
            }}
          />
        )}
      </Box>

      <Grid container spacing={3}>
        {macroData.map((macro, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Box>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <Typography variant="h4" sx={{ mr: 1 }}>
                  {macro.icon}
                </Typography>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {macro.nome}
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                    {macro.valor}
                    <Typography
                      component="span"
                      variant="body2"
                      sx={{ ml: 0.5 }}
                    >
                      {macro.unidade}
                    </Typography>
                  </Typography>
                </Box>
              </Box>

              {/* Barra de progresso para metas */}
              {mostrarProgresso && macro.meta && (
                <Box sx={{ mb: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(macro.percentualMeta, 100)}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      bgcolor: "rgba(255,255,255,0.2)",
                      "& .MuiLinearProgress-bar": {
                        bgcolor: "rgba(255,255,255,0.8)",
                        borderRadius: 3,
                      },
                    }}
                  />
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    {macro.percentualMeta}% da meta ({macro.meta}
                    {macro.unidade})
                  </Typography>
                </Box>
              )}

              {/* Percentual dos macros */}
              {mostrarPercentuais && macro.nome !== "Calorias" && (
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  {macro.percentualTotal}% do total calórico
                </Typography>
              )}

              {/* Meta das calorias quando não há barra de progresso */}
              {macro.nome === "Calorias" && calorias && !mostrarProgresso && (
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  Meta: {calorias} kcal
                </Typography>
              )}
            </Box>
          </Grid>
        ))}
      </Grid>

      {/* Resumo adicional se houver dados suficientes */}
      {totalDia.calorias > 0 && (
        <>
          <Divider sx={{ my: 2, borderColor: "rgba(255,255,255,0.2)" }} />
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 1,
            }}
          >
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              <strong>Distribuição:</strong> P{macroData[1].percentualTotal}% |
              C{macroData[2].percentualTotal}% | G{macroData[3].percentualTotal}
              %
            </Typography>
            {calorias && (
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                <strong>
                  {percentualCalorias < 90 && "🔻 Abaixo da meta"}
                  {percentualCalorias >= 90 &&
                    percentualCalorias <= 110 &&
                    "✅ Dentro da meta"}
                  {percentualCalorias > 110 && "🔺 Acima da meta"}
                </strong>
              </Typography>
            )}
          </Box>
        </>
      )}
    </Paper>
  );
};

export default MacroSummary;
