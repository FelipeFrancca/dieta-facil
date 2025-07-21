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
  titulo = "📊 Resumo nutricional do dia",
  mostrarProgresso = true,
  gradiente = "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  compacto = false,
  mostrarPercentuais = true,
  metaMacros = null,
  responsive = true,
}) => {
  // Garantir que os valores são números válidos
  const caloriasSafe = Math.max(0, totalDia?.calorias || 0);
  const proteinaSafe = Math.max(0, totalDia?.proteina || 0);
  const carboSafe = Math.max(0, totalDia?.carbo || 0);
  const gorduraSafe = Math.max(0, totalDia?.gordura || 0);
  const gramasSafe = Math.max(0, totalDia?.gramas || 0);

  const percentualCalorias = calorias && calorias > 0
    ? Math.round((caloriasSafe / calorias) * 100)
    : 0;

  const calcularPercentualMacro = (valorGramas, tipoMacro) => {
    if (caloriasSafe <= 0) return 0;

    const caloriasPorGrama = tipoMacro === "gordura" ? 9 : 4;
    const caloriasDoMacro = valorGramas * caloriasPorGrama;

    return Math.round((caloriasDoMacro / caloriasSafe) * 100);
  };

  const calcularPercentualMeta = (valor, meta) => {
    return meta && meta > 0 ? Math.round((valor / meta) * 100) : 0;
  };

  const formatarValor = (valor) => {
    if (valor === 0) return 0;
    return valor >= 10 ? Math.round(valor) : Math.round(valor * 10) / 10;
  };

  const obterCorProgresso = (percentual) => {
    if (percentual >= 100) return "success";
    if (percentual >= 80) return "warning";
    return "primary";
  };

  const macroData = [
    {
      nome: "Calorias",
      valor: formatarValor(caloriasSafe),
      unidade: "kcal",
      meta: calorias,
      percentualMeta: percentualCalorias,
      percentualTotal: 100,
      cor: "#667eea",
      icon: "🔥",
    },
    {
      nome: "Proteínas",
      valor: formatarValor(proteinaSafe),
      unidade: "g",
      meta: metaMacros?.proteina,
      percentualMeta: calcularPercentualMeta(
        proteinaSafe,
        metaMacros?.proteina
      ),
      percentualTotal: calcularPercentualMacro(proteinaSafe, "proteina"),
      cor: "#e53e3e",
      icon: "💪",
    },
    {
      nome: "Carboidratos",
      valor: formatarValor(carboSafe),
      unidade: "g",
      meta: metaMacros?.carbo,
      percentualMeta: calcularPercentualMeta(carboSafe, metaMacros?.carbo),
      percentualTotal: calcularPercentualMacro(carboSafe, "carbo"),
      cor: "#3182ce",
      icon: "🌾",
    },
    {
      nome: "Gorduras",
      valor: formatarValor(gorduraSafe),
      unidade: "g",
      meta: metaMacros?.gordura,
      percentualMeta: calcularPercentualMeta(
        gorduraSafe,
        metaMacros?.gordura
      ),
      percentualTotal: calcularPercentualMacro(gorduraSafe, "gordura"),
      cor: "#38a169",
      icon: "🥑",
    },
  ];

  // Verificar se há dados para exibir
  const temDados = caloriasSafe > 0 || proteinaSafe > 0 || carboSafe > 0 || gorduraSafe > 0;

  if (!temDados) {
    return (
      <Paper
        sx={{
          p: 3,
          background: "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)",
          color: "#1976d2",
          borderRadius: 3,
          boxShadow: "0 4px 16px rgba(0,0,0,0.05)",
          textAlign: "center",
        }}
      >
        <AssessmentIcon sx={{ fontSize: 48, mb: 2, opacity: 0.7 }} />
        <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
          Nenhuma refeição adicionada
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.8 }}>
          Adicione refeições para ver o resumo nutricional do dia
        </Typography>
      </Paper>
    );
  }

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
        
        {/* Mostrar peso total se disponível */}
        {gramasSafe > 0 && (
          <Box sx={{ mt: 2, textAlign: "center" }}>
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              ⚖️ Peso total: {formatarValor(gramasSafe)}g
            </Typography>
          </Box>
        )}
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

      <Grid container spacing={responsive ? { xs: 1, sm: 2, md: 3 } : 3}>
        {macroData.map((macro, index) => (
          <Grid item xs={6} sm={6} md={3} key={index}>
            <Box>
              <Box sx={{ 
                display: "flex", 
                alignItems: "center", 
                mb: 1,
                flexDirection: responsive ? { xs: "column", sm: "row" } : "row",
                textAlign: responsive ? { xs: "center", sm: "left" } : "left"
              }}>
                <Typography variant={responsive ? { xs: "h5", sm: "h4" } : "h4"} sx={{ mr: { xs: 0, sm: 1 } }}>
                  {macro.icon}
                </Typography>
                <Box sx={{ flex: 1 }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      opacity: 0.9,
                      fontSize: responsive ? { xs: "0.7rem", sm: "0.875rem" } : "0.875rem"
                    }}
                  >
                    {macro.nome}
                  </Typography>
                  <Typography 
                    variant={responsive ? { xs: "h6", sm: "h5" } : "h5"} 
                    sx={{ 
                      fontWeight: "bold",
                      fontSize: responsive ? { xs: "1rem", sm: "1.5rem" } : "1.5rem"
                    }}
                  >
                    {macro.valor}
                    <Typography
                      component="span"
                      variant="body2"
                      sx={{ 
                        ml: 0.5,
                        fontSize: responsive ? { xs: "0.7rem", sm: "0.875rem" } : "0.875rem"
                      }}
                    >
                      {macro.unidade}
                    </Typography>
                  </Typography>
                </Box>
              </Box>

              {/* Barra de progresso para metas */}
              {mostrarProgresso && macro.meta && macro.meta > 0 && (
                <Box sx={{ mb: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(macro.percentualMeta, 100)}
                    sx={{
                      height: responsive ? { xs: 4, sm: 6 } : 6,
                      borderRadius: 3,
                      bgcolor: "rgba(255,255,255,0.2)",
                      "& .MuiLinearProgress-bar": {
                        bgcolor: macro.percentualMeta > 100 
                          ? "rgba(255,193,7,0.9)" 
                          : "rgba(255,255,255,0.8)",
                        borderRadius: 3,
                      },
                    }}
                  />
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      opacity: 0.8,
                      fontSize: responsive ? { xs: "0.6rem", sm: "0.75rem" } : "0.75rem",
                      display: "block",
                      mt: 0.5
                    }}
                  >
                    {macro.percentualMeta}% da meta ({macro.meta}
                    {macro.unidade})
                    {macro.percentualMeta > 100 && " - Excedido!"}
                  </Typography>
                </Box>
              )}

              {/* Percentual dos macros */}
              {mostrarPercentuais && macro.nome !== "Calorias" && macro.percentualTotal > 0 && (
                <Typography 
                  variant="caption" 
                  sx={{ 
                    opacity: 0.8,
                    fontSize: responsive ? { xs: "0.6rem", sm: "0.75rem" } : "0.75rem"
                  }}
                >
                  {macro.percentualTotal}% do total calórico
                </Typography>
              )}

              {/* Meta das calorias quando não há barra de progresso */}
              {macro.nome === "Calorias" && calorias && !mostrarProgresso && (
                <Typography 
                  variant="caption" 
                  sx={{ 
                    opacity: 0.8,
                    fontSize: responsive ? { xs: "0.6rem", sm: "0.75rem" } : "0.75rem"
                  }}
                >
                  Meta: {calorias} kcal
                </Typography>
              )}
            </Box>
          </Grid>
        ))}
      </Grid>

      {/* Resumo adicional se houver dados suficientes */}
      {caloriasSafe > 0 && (
        <>
          <Divider sx={{ my: 2, borderColor: "rgba(255,255,255,0.2)" }} />
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <Box>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                <strong>Distribuição:</strong> P{macroData[1].percentualTotal}% |
                C{macroData[2].percentualTotal}% | G{macroData[3].percentualTotal}%
              </Typography>
              {gramasSafe > 0 && (
                <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                  <strong>Peso total:</strong> ⚖️ {formatarValor(gramasSafe)}g
                </Typography>
              )}
            </Box>
            {calorias && calorias > 0 && (
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