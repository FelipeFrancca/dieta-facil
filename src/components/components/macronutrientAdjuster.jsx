import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Slider,
  TextField,
  Button,
  Alert,
  Paper,
  Tooltip,
  IconButton,
  Stack,
  Collapse,
  Divider,
} from "@mui/material";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from "recharts";
import RestoreIcon from "@mui/icons-material/Restore";
import InfoIcon from "@mui/icons-material/Info";
import TuneIcon from "@mui/icons-material/Tune";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DragHandleIcon from "@mui/icons-material/DragHandle";
import PieChartIcon from "@mui/icons-material/PieChart";
import SettingsIcon from "@mui/icons-material/Settings";
import SummaryIcon from "@mui/icons-material/Assignment";

export default function MacronutrientAdjuster({
  calorias = 2000,
  sexo = "masculino",
  objetivo = "manter",
  onMacrosChange,
}) {
  const [macros, setMacros] = useState({
    proteina: 0,
    carboidrato: 0,
    gordura: 0,
  });

  const [percentuais, setPercentuais] = useState({
    proteina: 0,
    carboidrato: 0,
    gordura: 0,
  });

  // Estados para controlar collapse das seções
  const [collapsed, setCollapsed] = useState({
    chart: false,
    controls: false,
    summary: false,
    main: false, // Para colapsar o componente inteiro
  });

  // Valores padrão baseados em sexo e objetivo (mais refinados)
  const getDefaultMacros = () => {
    const defaults = {
      masculino: {
        perder: { proteina: 35, carboidrato: 35, gordura: 30 },
        manter: { proteina: 25, carboidrato: 45, gordura: 30 },
        ganhar: { proteina: 20, carboidrato: 55, gordura: 25 },
      },
      feminino: {
        perder: { proteina: 40, carboidrato: 30, gordura: 30 },
        manter: { proteina: 25, carboidrato: 45, gordura: 30 },
        ganhar: { proteina: 20, carboidrato: 55, gordura: 25 },
      },
    };
    return defaults[sexo]?.[objetivo] || defaults.masculino.manter;
  };

  // Inicializar com valores padrão
  useEffect(() => {
    if (calorias) {
      const defaultPercentuais = getDefaultMacros();
      setPercentuais(defaultPercentuais);
      calcularMacros(defaultPercentuais);
    }
  }, [calorias, sexo, objetivo]);

  const calcularMacros = (novosPercentuais) => {
    if (!calorias) return;

    const novosMacros = {
      proteina: Math.round((calorias * novosPercentuais.proteina) / 100 / 4),
      carboidrato: Math.round(
        (calorias * novosPercentuais.carboidrato) / 100 / 4
      ),
      gordura: Math.round((calorias * novosPercentuais.gordura) / 100 / 9),
    };

    setMacros(novosMacros);

    // Notificar componente pai sobre as mudanças
    if (onMacrosChange) {
      onMacrosChange({
        macros: novosMacros,
        percentuais: novosPercentuais,
        calorias,
      });
    }
  };

  const handleSliderChange = (macro, value) => {
    const novosPercentuais = { ...percentuais, [macro]: value };

    // Calcular diferença
    const somaParcial = novosPercentuais[macro];
    const outrosMacros = Object.keys(novosPercentuais).filter(
      (key) => key !== macro
    );
    const somaOutros = outrosMacros.reduce(
      (sum, key) => sum + percentuais[key],
      0
    );

    // Se a soma ultrapassar 100, ajustar proporcionalmente os outros
    if (somaParcial + somaOutros > 100) {
      const restante = 100 - somaParcial;
      const proporcao = restante / somaOutros;

      outrosMacros.forEach((key) => {
        novosPercentuais[key] = Math.max(
          5,
          Math.round(percentuais[key] * proporcao)
        );
      });
    }

    setPercentuais(novosPercentuais);
    calcularMacros(novosPercentuais);
  };

  const handleDirectInput = (macro, value) => {
    const numValue = Math.max(5, Math.min(70, parseInt(value) || 5));
    handleSliderChange(macro, numValue);
  };

  const resetarPadrao = () => {
    const defaultPercentuais = getDefaultMacros();
    setPercentuais(defaultPercentuais);
    calcularMacros(defaultPercentuais);
  };

  const validarPercentuais = () => {
    const total = Object.values(percentuais).reduce((sum, val) => sum + val, 0);
    return Math.abs(total - 100) < 1; // Tolerância de 1%
  };

  const toggleCollapse = (section) => {
    setCollapsed((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Dados para o gráfico de pizza
  const chartData = [
    {
      name: "Proteínas",
      value: percentuais.proteina,
      gramas: macros.proteina,
      color: "#e53e3e",
    },
    {
      name: "Carboidratos",
      value: percentuais.carboidrato,
      gramas: macros.carboidrato,
      color: "#3182ce",
    },
    {
      name: "Gorduras",
      value: percentuais.gordura,
      gramas: macros.gordura,
      color: "#38a169",
    },
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <Paper sx={{ p: 2, maxWidth: 200 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
            {data.name}
          </Typography>
          <Typography variant="body2">
            {data.value.toFixed(1)}% ({data.payload.gramas}g)
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {Math.round(
              data.payload.gramas * (data.name === "Gorduras" ? 9 : 4)
            )}{" "}
            kcal
          </Typography>
        </Paper>
      );
    }
    return null;
  };

  const getMacroInfo = (macro) => {
    const infos = {
      proteina: {
        desc: "Essencial para construção e reparação muscular. Recomenda-se 0,8-2,2g por kg de peso corporal.",
        beneficios: "Saciedade, manutenção muscular, termogênese",
        min: "15%",
        max: "40%",
      },
      carboidrato: {
        desc: "Principal fonte de energia para o corpo e cérebro. Importante para performance física.",
        beneficios: "Energia rápida, performance, recuperação muscular",
        min: "20%",
        max: "65%",
      },
      gordura: {
        desc: "Essencial para hormônios, absorção de vitaminas e saúde celular. Mínimo de 20% das calorias.",
        beneficios: "Hormônios, vitaminas lipossolúveis, saciedade",
        min: "20%",
        max: "35%",
      },
    };
    return infos[macro];
  };

  const getObjetivoRecomendacao = () => {
    const recomendacoes = {
      perder:
        "Para perda de peso: mais proteína para preservar massa muscular, carboidratos moderados para energia.",
      manter:
        "Para manutenção: distribuição equilibrada que seja sustentável a longo prazo.",
      ganhar:
        "Para ganho de peso: mais carboidratos para energia e suporte ao crescimento muscular.",
    };
    return recomendacoes[objetivo];
  };

  const getTotalSoma = () => {
    return Object.values(percentuais).reduce((sum, val) => sum + val, 0);
  };

  if (!calorias) {
    return (
      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="body1">
          Calcule primeiro sua TMB para ajustar os macronutrientes.
        </Typography>
      </Alert>
    );
  }

  // Componente de cabeçalho colapsável
  const CollapsibleHeader = ({
    title,
    icon,
    section,
    defaultExpanded = true,
  }) => (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        cursor: "pointer",
        p: 1,
        borderRadius: 1,
        "&:hover": { backgroundColor: "rgba(0,0,0,0.04)" },
      }}
      onClick={() => toggleCollapse(section)}
    >
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <DragHandleIcon sx={{ mr: 1, color: "text.secondary", fontSize: 18 }} />
        {icon}
        <Typography variant="h6" sx={{ fontWeight: "bold", ml: 1 }}>
          {title}
        </Typography>
      </Box>
      <IconButton size="small">
        {collapsed[section] ? <ExpandMoreIcon /> : <ExpandLessIcon />}
      </IconButton>
    </Box>
  );

  return (
    <Card
      sx={{
        boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
        borderRadius: "10px",
        border: collapsed.main ? "2px dashed #ddd" : "none",
        maxWidth: "100%",
        width: "100%"
      }}
    >
      <CardContent sx={{ p: collapsed.main ? 2 : 3 }}>
        {/* Cabeçalho Principal */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 2,
            mb: 2
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
              p: 1,
              borderRadius: 1,
              "&:hover": { backgroundColor: "rgba(0,0,0,0.04)" },
              minWidth: 0,
              flex: "1 1 auto"
            }}
            onClick={() => toggleCollapse("main")}
          >
            <DragHandleIcon sx={{ mr: 1, color: "text.secondary" }} />
            <TuneIcon sx={{ mr: 2, color: "#667eea" }} />
            <Typography variant="h5" sx={{ fontWeight: "bold", minWidth: 0 }}>
              Ajuste de Macronutrientes
            </Typography>
            <IconButton size="small" sx={{ ml: 1 }}>
              {collapsed.main ? <ExpandMoreIcon /> : <ExpandLessIcon />}
            </IconButton>
          </Box>
          <Button
            variant="outlined"
            startIcon={<RestoreIcon />}
            onClick={resetarPadrao}
            size="small"
            sx={{ flexShrink: 0 }}
          >
            Restaurar Padrão
          </Button>
        </Box>

        <Collapse in={!collapsed.main}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3, justifyContent: 'center', alignContent: 'center', alignItems:'center' }}>
            {/* Alert de Recomendação */}
            <Alert severity="info">
              <Typography variant="body2">
                <strong>Recomendação para seu objetivo:</strong>{" "}
                {getObjetivoRecomendacao()}
              </Typography>
            </Alert>

            {/* Grid Principal - Gráfico e Controles */}
            <Grid container spacing={2}>
              {/* Seção do Gráfico de Pizza */}
              <Grid item xs={12} lg={6}>
                <Paper sx={{ p: 3 }}>
                  <CollapsibleHeader
                    title="Distribuição Visual"
                    icon={<PieChartIcon sx={{ color: "#667eea" }} />}
                    section="chart"
                  />
                  <Collapse in={!collapsed.chart}>
                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ width: "100%", height: 300 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <RechartsTooltip content={<CustomTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </Box>
                    <Stack
                      direction="row"
                      spacing={2}
                      justifyContent="center"
                      sx={{ mt: 2, flexWrap: "wrap" }}
                    >
                      {chartData.map((item, index) => (
                        <Box
                          key={index}
                          sx={{ display: "flex", alignItems: "center", mb: 1 }}
                        >
                          <Box
                            sx={{
                              width: 12,
                              height: 12,
                              backgroundColor: item.color,
                              borderRadius: "50%",
                              mr: 1,
                            }}
                          />
                          <Typography variant="caption">{item.name}</Typography>
                        </Box>
                      ))}
                    </Stack>
                  </Collapse>
                </Paper>
              </Grid>

              {/* Seção de Controles de Ajuste */}
              <Grid item xs={12} lg={6}>
                <Paper sx={{ p: 3}}>
                  <CollapsibleHeader
                    title="Controles de Ajuste"
                    icon={<SettingsIcon sx={{ color: "#667eea" }} />}
                    section="controls"
                  />
                  <Collapse in={!collapsed.controls}>
                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                      {Object.keys(percentuais).map((macro) => {
                        const info = getMacroInfo(macro);
                        const cor =
                          chartData.find((item) =>
                            item.name
                              .toLowerCase()
                              .includes(
                                macro === "carboidrato" ? "carboidrato" : macro
                              )
                          )?.color || "#666";
                        const nomeDisplay =
                          macro === "carboidrato"
                            ? "Carboidratos"
                            : macro.charAt(0).toUpperCase() + macro.slice(1) + "s";

                        return (
                          <Box key={macro}>
                            <Box
                              sx={{ display: "flex", alignItems: "center", mb: 2 }}
                            >
                              <Typography
                                variant="subtitle1"
                                sx={{ fontWeight: "bold", flex: 1 }}
                              >
                                {nomeDisplay}
                              </Typography>
                              <Tooltip title={info.desc} placement="top">
                                <IconButton size="small">
                                  <InfoIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>

                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 2,
                                mb: 2,
                              }}
                            >
                              <Slider
                                value={percentuais[macro]}
                                onChange={(e, value) =>
                                  handleSliderChange(macro, value)
                                }
                                min={5}
                                max={70}
                                step={1}
                                sx={{
                                  flex: 1,
                                  "& .MuiSlider-thumb": {
                                    backgroundColor: cor,
                                  },
                                  "& .MuiSlider-track": {
                                    backgroundColor: cor,
                                  },
                                }}
                              />
                              <TextField
                                value={percentuais[macro]}
                                onChange={(e) =>
                                  handleDirectInput(macro, e.target.value)
                                }
                                size="small"
                                sx={{ width: 80 }}
                                InputProps={{
                                  endAdornment: "%",
                                }}
                              />
                            </Box>

                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                mb: 1
                              }}
                            >
                              <Typography variant="body2" color="text.secondary">
                                {macros[macro]}g por dia
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {Math.round(
                                  macros[macro] * (macro === "gordura" ? 9 : 4)
                                )}{" "}
                                kcal
                              </Typography>
                            </Box>

                            <Typography variant="caption" color="text.secondary">
                              {info.beneficios} | Faixa recomendada: {info.min} -{" "}
                              {info.max}
                            </Typography>
                          </Box>
                        );
                      })}

                      {!validarPercentuais() && (
                        <Alert severity="warning">
                          <Typography variant="body2">
                            A soma dos percentuais deve ser próxima de 100%.
                            <br />
                            <strong>Atual: {getTotalSoma().toFixed(1)}%</strong>
                          </Typography>
                        </Alert>
                      )}
                    </Box>
                  </Collapse>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
}