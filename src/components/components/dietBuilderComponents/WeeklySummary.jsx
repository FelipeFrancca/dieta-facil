import { useState } from "react";
import {
  Paper,
  Typography,
  Grid,
  Box,
  LinearProgress,
  Chip,
  Divider,
  Card,
  CardContent,
  ToggleButton,
  ToggleButtonGroup,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import {
  Assessment as AssessmentIcon,
  ExpandMore as ExpandMoreIcon,
  CalendarToday as CalendarTodayIcon,
  Timeline as TimelineIcon,
  Insights as InsightsIcon,
} from "@mui/icons-material";

export const WeeklySummary = ({
  dietaSemanal,
  diasDaSemana,
  calcularTotalDia,
  calcularTotalSemana,
  obterEstatisticas,
  calorias,
  metaMacros = null,
  titulo = "📊 Resumo Nutricional Semanal",
  compacto = false,
}) => {
  const [visualizacao, setVisualizacao] = useState("resumo");
  const [expandedDay, setExpandedDay] = useState(null);

  const estatisticas = obterEstatisticas();
  const totalSemana = calcularTotalSemana();

  // Calcular médias e metas semanais
  const metasSemanais = {
    calorias: calorias ? calorias * 7 : null,
    proteina: metaMacros?.proteina ? metaMacros.proteina * 7 : null,
    carbo: metaMacros?.carbo ? metaMacros.carbo * 7 : null,
    gordura: metaMacros?.gordura ? metaMacros.gordura * 7 : null,
  };

  const formatarValor = (valor) => {
    if (valor === 0) return 0;
    return valor >= 10 ? Math.round(valor) : Math.round(valor * 10) / 10;
  };

  const calcularPercentualMeta = (valor, meta) => {
    return meta && meta > 0 ? Math.round((valor / meta) * 100) : 0;
  };

  const calcularPercentualMacro = (valorGramas, tipoMacro, totalCalorias) => {
    if (totalCalorias <= 0) return 0;
    const caloriasPorGrama = tipoMacro === "gordura" ? 9 : 4;
    const caloriasDoMacro = valorGramas * caloriasPorGrama;
    return Math.round((caloriasDoMacro / totalCalorias) * 100);
  };

  const obterCorProgresso = (percentual) => {
    if (percentual >= 100) return "success";
    if (percentual >= 80) return "warning";
    return "primary";
  };

  const macroDataSemanal = [
    {
      nome: "Calorias",
      valor: formatarValor(totalSemana.calorias),
      media: formatarValor(estatisticas.mediaDiaria.calorias),
      unidade: "kcal",
      meta: metasSemanais.calorias,
      metaDiaria: calorias,
      percentualMeta: calcularPercentualMeta(totalSemana.calorias, metasSemanais.calorias),
      cor: "#667eea",
      icon: "🔥",
    },
    {
      nome: "Proteínas",
      valor: formatarValor(totalSemana.proteina),
      media: formatarValor(estatisticas.mediaDiaria.proteina),
      unidade: "g",
      meta: metasSemanais.proteina,
      metaDiaria: metaMacros?.proteina,
      percentualMeta: calcularPercentualMeta(totalSemana.proteina, metasSemanais.proteina),
      percentualTotal: calcularPercentualMacro(totalSemana.proteina, "proteina", totalSemana.calorias),
      cor: "#e53e3e",
      icon: "💪",
    },
    {
      nome: "Carboidratos",
      valor: formatarValor(totalSemana.carbo),
      media: formatarValor(estatisticas.mediaDiaria.carbo),
      unidade: "g",
      meta: metasSemanais.carbo,
      metaDiaria: metaMacros?.carbo,
      percentualMeta: calcularPercentualMeta(totalSemana.carbo, metasSemanais.carbo),
      percentualTotal: calcularPercentualMacro(totalSemana.carbo, "carbo", totalSemana.calorias),
      cor: "#3182ce",
      icon: "🌾",
    },
    {
      nome: "Gorduras",
      valor: formatarValor(totalSemana.gordura),
      media: formatarValor(estatisticas.mediaDiaria.gordura),
      unidade: "g",
      meta: metasSemanais.gordura,
      metaDiaria: metaMacros?.gordura,
      percentualMeta: calcularPercentualMeta(totalSemana.gordura, metasSemanais.gordura),
      percentualTotal: calcularPercentualMacro(totalSemana.gordura, "gordura", totalSemana.calorias),
      cor: "#38a169",
      icon: "🥑",
    },
  ];

  const handleDayExpand = (diaId) => (event, isExpanded) => {
    setExpandedDay(isExpanded ? diaId : null);
  };

  // Verificar se há dados para exibir
  const temDados = totalSemana.calorias > 0 || estatisticas.diasComRefeicoes > 0;

  if (!temDados && !compacto) {
    return (
      <Paper
        elevation={3}
        sx={{
          p: 3,
          borderRadius: 2,
          textAlign: "center",
          background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
          color: "white",
        }}
      >
        <AssessmentIcon sx={{ fontSize: 48, mb: 2, opacity: 0.7 }} />
        <Typography variant="h6" gutterBottom>
          {titulo}
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.9 }}>
          Adicione refeições para ver o resumo nutricional da semana
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={3} sx={{ borderRadius: 2, overflow: "hidden" }}>
      {/* Cabeçalho */}
      <Box
        sx={{
          p: 3,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <AssessmentIcon sx={{ mr: 1 }} />
          <Typography variant="h6" fontWeight="bold">
            {titulo}
          </Typography>
        </Box>

        {/* Estatísticas rápidas */}
        <Grid container spacing={2}>
          <Grid item xs={6} sm={3}>
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h4" fontWeight="bold">
                {estatisticas.diasComRefeicoes}
              </Typography>
              <Typography variant="caption">
                Dias planejados
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h4" fontWeight="bold">
                {estatisticas.totalAlternativas}
              </Typography>
              <Typography variant="caption">
                Alternativas totais
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h4" fontWeight="bold">
                {Math.round(totalSemana.calorias)}
              </Typography>
              <Typography variant="caption">
                Kcal na semana
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h4" fontWeight="bold">
                {Math.round(estatisticas.mediaDiaria.calorias)}
              </Typography>
              <Typography variant="caption">
                Kcal/dia médio
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Controles de visualização */}
      <Box sx={{ p: 2, borderBottom: "1px solid", borderColor: "divider" }}>
        <ToggleButtonGroup
          value={visualizacao}
          exclusive
          onChange={(e, newView) => newView && setVisualizacao(newView)}
          size="small"
          fullWidth={compacto}
        >
          <ToggleButton value="resumo">
            <InsightsIcon sx={{ mr: 1, fontSize: "small" }} />
            Resumo
          </ToggleButton>
          <ToggleButton value="detalhes">
            <TimelineIcon sx={{ mr: 1, fontSize: "small" }} />
            Detalhes por Dia
          </ToggleButton>
          <ToggleButton value="tabela">
            <CalendarTodayIcon sx={{ mr: 1, fontSize: "small" }} />
            Tabela Comparativa
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Conteúdo baseado na visualização */}
      <Box sx={{ p: 3 }}>
        {visualizacao === "resumo" && (
          <Grid container spacing={3}>
            {macroDataSemanal.map((macro) => (
              <Grid item xs={12} sm={6} md={3} key={macro.nome}>
                <Card variant="outlined" sx={{ height: "100%" }}>
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <Typography sx={{ fontSize: "1.5rem", mr: 1 }}>
                        {macro.icon}
                      </Typography>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {macro.nome}
                      </Typography>
                    </Box>

                    <Typography variant="h5" fontWeight="bold" color={macro.cor}>
                      {macro.valor} {macro.unidade}
                    </Typography>

                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Média: {macro.media} {macro.unidade}/dia
                    </Typography>

                    {macro.meta && (
                      <>
                        <Box sx={{ mt: 2, mb: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={Math.min(macro.percentualMeta, 100)}
                            color={obterCorProgresso(macro.percentualMeta)}
                            sx={{ height: 8, borderRadius: 4 }}
                          />
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {macro.percentualMeta}% da meta semanal
                        </Typography>
                        <br />
                        <Typography variant="caption" color="text.secondary">
                          Meta: {formatarValor(macro.meta)} {macro.unidade}/semana
                        </Typography>
                      </>
                    )}

                    {macro.percentualTotal !== undefined && (
                      <Chip
                        label={`${macro.percentualTotal}% do total`}
                        size="small"
                        sx={{
                          mt: 1,
                          backgroundColor: `${macro.cor}20`,
                          color: macro.cor,
                        }}
                      />
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {visualizacao === "detalhes" && (
          <Box>
            {diasDaSemana.map((dia) => {
              const totalDia = calcularTotalDia(dia.id);
              const temRefeicoes = dietaSemanal[dia.id] && Object.keys(dietaSemanal[dia.id]).length > 0;

              return (
                <Accordion
                  key={dia.id}
                  expanded={expandedDay === dia.id}
                  onChange={handleDayExpand(dia.id)}
                  sx={{ mb: 1 }}
                  disabled={!temRefeicoes}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
                      <Typography variant="subtitle1" fontWeight="bold" sx={{ flexGrow: 1 }}>
                        {dia.nome}
                      </Typography>
                      {temRefeicoes ? (
                        <Box sx={{ display: "flex", gap: 1 }}>
                          <Chip label={`${Math.round(totalDia.calorias)} kcal`} size="small" />
                          <Chip label={`${Math.round(totalDia.proteina)}g prot`} size="small" variant="outlined" />
                        </Box>
                      ) : (
                        <Chip label="Sem refeições" size="small" color="default" />
                      )}
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    {temRefeicoes && (
                      <Grid container spacing={2}>
                        <Grid item xs={3}>
                          <Typography variant="body2" color="text.secondary">Calorias</Typography>
                          <Typography variant="h6">{Math.round(totalDia.calorias)} kcal</Typography>
                        </Grid>
                        <Grid item xs={3}>
                          <Typography variant="body2" color="text.secondary">Proteínas</Typography>
                          <Typography variant="h6">{Math.round(totalDia.proteina)}g</Typography>
                        </Grid>
                        <Grid item xs={3}>
                          <Typography variant="body2" color="text.secondary">Carboidratos</Typography>
                          <Typography variant="h6">{Math.round(totalDia.carbo)}g</Typography>
                        </Grid>
                        <Grid item xs={3}>
                          <Typography variant="body2" color="text.secondary">Gorduras</Typography>
                          <Typography variant="h6">{Math.round(totalDia.gordura)}g</Typography>
                        </Grid>
                      </Grid>
                    )}
                  </AccordionDetails>
                </Accordion>
              );
            })}
          </Box>
        )}

        {visualizacao === "tabela" && (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell><strong>Dia</strong></TableCell>
                  <TableCell align="center"><strong>Calorias</strong></TableCell>
                  <TableCell align="center"><strong>Proteínas</strong></TableCell>
                  <TableCell align="center"><strong>Carboidratos</strong></TableCell>
                  <TableCell align="center"><strong>Gorduras</strong></TableCell>
                  <TableCell align="center"><strong>Refeições</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {diasDaSemana.map((dia) => {
                  const totalDia = calcularTotalDia(dia.id);
                  const numRefeicoes = dietaSemanal[dia.id] ? Object.keys(dietaSemanal[dia.id]).length : 0;
                  
                  return (
                    <TableRow key={dia.id}>
                      <TableCell>{dia.abrev}</TableCell>
                      <TableCell align="center">
                        {totalDia.calorias > 0 ? `${Math.round(totalDia.calorias)} kcal` : "-"}
                      </TableCell>
                      <TableCell align="center">
                        {totalDia.proteina > 0 ? `${Math.round(totalDia.proteina)}g` : "-"}
                      </TableCell>
                      <TableCell align="center">
                        {totalDia.carbo > 0 ? `${Math.round(totalDia.carbo)}g` : "-"}
                      </TableCell>
                      <TableCell align="center">
                        {totalDia.gordura > 0 ? `${Math.round(totalDia.gordura)}g` : "-"}
                      </TableCell>
                      <TableCell align="center">
                        {numRefeicoes > 0 ? numRefeicoes : "-"}
                      </TableCell>
                    </TableRow>
                  );
                })}
                <TableRow sx={{ backgroundColor: "grey.100" }}>
                  <TableCell><strong>Total</strong></TableCell>
                  <TableCell align="center"><strong>{Math.round(totalSemana.calorias)} kcal</strong></TableCell>
                  <TableCell align="center"><strong>{Math.round(totalSemana.proteina)}g</strong></TableCell>
                  <TableCell align="center"><strong>{Math.round(totalSemana.carbo)}g</strong></TableCell>
                  <TableCell align="center"><strong>{Math.round(totalSemana.gordura)}g</strong></TableCell>
                  <TableCell align="center"><strong>{estatisticas.totalAlternativas}</strong></TableCell>
                </TableRow>
                <TableRow sx={{ backgroundColor: "primary.light", color: "white" }}>
                  <TableCell><strong>Média/dia</strong></TableCell>
                  <TableCell align="center">
                    <strong>{Math.round(estatisticas.mediaDiaria.calorias)} kcal</strong>
                  </TableCell>
                  <TableCell align="center">
                    <strong>{Math.round(estatisticas.mediaDiaria.proteina)}g</strong>
                  </TableCell>
                  <TableCell align="center">
                    <strong>{Math.round(estatisticas.mediaDiaria.carbo)}g</strong>
                  </TableCell>
                  <TableCell align="center">
                    <strong>{Math.round(estatisticas.mediaDiaria.gordura)}g</strong>
                  </TableCell>
                  <TableCell align="center">
                    <strong>{Math.round(estatisticas.totalAlternativas / 7)} /dia</strong>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </Paper>
  );
};
