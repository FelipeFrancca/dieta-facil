import { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Alert,
  Grid,
  Tooltip,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCopy as ContentCopyIcon,
  Restaurant as RestaurantIcon,
  Schedule as ScheduleIcon,
} from "@mui/icons-material";
import { 
  calcularNutrientes, 
  gerarUnidadesDisponiveis 
} from "./utils/nutrientCalculator";

export const MealTypeManager = ({
  diaAtivo,
  diasDaSemana,
  tiposRefeicao,
  dietaSemanal,
  calcularMacrosRefeicao,
  onNovaAlternativa,
  onEditarAlternativa,
  onRemoverAlternativa,
  onDuplicarAlternativa,
}) => {
  const [expandedMeal, setExpandedMeal] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [alternativaSelecionada, setAlternativaSelecionada] = useState(null);
  const [dialogoConfirmacao, setDialogoConfirmacao] = useState(false);

  const diaAtual = diasDaSemana.find(d => d.id === diaAtivo);
  const refeicoesDoDia = dietaSemanal[diaAtivo] || {};

  // Função para verificar se há alternativas com mais calorias que a principal
  const verificarAlternativasComMaisCalorias = (alternativas) => {
    if (!alternativas || alternativas.length <= 1) return [];

    const principal = alternativas[0];
    const macrosPrincipal = recalcularMacrosAlternativa(principal.alimentos);
    const caloriasPrincipal = macrosPrincipal.calorias;

    return alternativas.slice(1).filter(alt => {
      const macrosAlt = recalcularMacrosAlternativa(alt.alimentos);
      return macrosAlt.calorias > caloriasPrincipal;
    });
  };

  const abrirMenu = (event, dia, tipoRefeicao, alternativaId) => {
    setAnchorEl(event.currentTarget);
    setAlternativaSelecionada({ dia, tipoRefeicao, alternativaId });
  };

  const fecharMenu = () => {
    setAnchorEl(null);
    setAlternativaSelecionada(null);
  };

  const abrirDialogoConfirmacao = () => {
    setDialogoConfirmacao(true);
    fecharMenu();
  };

  const fecharDialogoConfirmacao = () => {
    setDialogoConfirmacao(false);
    setAlternativaSelecionada(null);
  };

  const executarRemocao = () => {
    if (alternativaSelecionada && onRemoverAlternativa) {
      onRemoverAlternativa(
        alternativaSelecionada.dia,
        alternativaSelecionada.tipoRefeicao,
        alternativaSelecionada.alternativaId
      );
    }
    fecharDialogoConfirmacao();
  };

  const executarDuplicacao = () => {
    if (alternativaSelecionada && onDuplicarAlternativa) {
      onDuplicarAlternativa(
        alternativaSelecionada.dia,
        alternativaSelecionada.tipoRefeicao,
        alternativaSelecionada.alternativaId
      );
    }
    fecharMenu();
  };

  const executarEdicao = () => {
    if (alternativaSelecionada && onEditarAlternativa) {
      onEditarAlternativa(
        alternativaSelecionada.dia,
        alternativaSelecionada.tipoRefeicao,
        alternativaSelecionada.alternativaId
      );
    }
    fecharMenu();
  };

  const handleAccordionChange = (tipoRefeicao) => (event, isExpanded) => {
    setExpandedMeal(isExpanded ? tipoRefeicao : null);
  };

  const obterCorTipoRefeicao = (tipoId) => {
    const cores = {
      cafe: "#ff7043",
      lanche1: "#66bb6a",
      almoco: "#42a5f5",
      lanche2: "#ab47bc",
      jantar: "#ef5350",
      ceia: "#5c6bc0"
    };
    return cores[tipoId] || "#757575";
  };

  const formatarMacros = (macros) => {
    return {
      calorias: Math.round(macros.calorias || 0),
      proteina: Math.round(macros.proteina || 0),
      carbo: Math.round(macros.carbo || 0),
      gordura: Math.round(macros.gordura || 0),
    };
  };

  // Função para recalcular macros corretamente com as unidades
  const recalcularMacrosAlternativa = (alimentos) => {
    if (!alimentos || alimentos.length === 0) {
      return { calorias: 0, proteina: 0, carbo: 0, gordura: 0 };
    }

    return alimentos.reduce(
      (acc, alimento) => {
        const unidadesDisponiveis = gerarUnidadesDisponiveis(alimento);
        const nutrientes = calcularNutrientes(
          alimento,
          alimento.quantidade,
          alimento.unidade || "gramas",
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

  return (
    <>
      <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
            <RestaurantIcon sx={{ mr: 1, color: "primary.main" }} />
            <Typography variant="h6" fontWeight="bold">
              Refeições - {diaAtual?.nome}
            </Typography>
          </Box>

          {tiposRefeicao.map((tipo) => {
            const alternativas = refeicoesDoDia[tipo.id] || [];
            const temAlternativas = alternativas.length > 0;
            
            return (
              <Accordion
                key={tipo.id}
                expanded={expandedMeal === tipo.id}
                onChange={handleAccordionChange(tipo.id)}
                sx={{
                  mb: 1,
                  borderRadius: 1,
                  border: "1px solid",
                  borderColor: "divider",
                  "&:before": { display: "none" },
                  boxShadow: temAlternativas ? 2 : 1,
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  sx={{
                    backgroundColor: temAlternativas 
                      ? `${obterCorTipoRefeicao(tipo.id)}15` 
                      : "grey.50",
                    borderRadius: 1,
                    "& .MuiAccordionSummary-content": {
                      alignItems: "center",
                    },
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
                    <Typography sx={{ fontSize: "1.2rem", mr: 1 }}>
                      {tipo.icon}
                    </Typography>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle1" fontWeight="600">
                        {tipo.nome}
                      </Typography>
                      {temAlternativas && (
                        <Typography variant="caption" color="text.secondary">
                          {alternativas.length} alternativa{alternativas.length !== 1 ? "s" : ""}
                        </Typography>
                      )}
                    </Box>
                    
                    {temAlternativas && (
                      <Box sx={{ display: "flex", gap: 1, mr: 2 }}>
                        {(() => {
                          const macrosPrimeira = formatarMacros(alternativas[0].macros || {});
                          return (
                            <>
                              <Chip
                                label={`${macrosPrimeira.calorias} kcal`}
                                size="small"
                                sx={{ 
                                  backgroundColor: obterCorTipoRefeicao(tipo.id),
                                  color: "white",
                                  fontSize: "0.7rem"
                                }}
                              />
                              {alternativas.length > 1 && (
                                <Chip
                                  label={`+${alternativas.length - 1}`}
                                  size="small"
                                  variant="outlined"
                                  sx={{ fontSize: "0.7rem" }}
                                />
                              )}
                            </>
                          );
                        })()}
                      </Box>
                    )}

                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<AddIcon />}
                      onClick={(e) => {
                        e.stopPropagation();
                        onNovaAlternativa(tipo.id);
                      }}
                      sx={{
                        minWidth: "auto",
                        px: 1,
                        fontSize: "0.7rem",
                        borderColor: obterCorTipoRefeicao(tipo.id),
                        color: obterCorTipoRefeicao(tipo.id),
                        "&:hover": {
                          backgroundColor: `${obterCorTipoRefeicao(tipo.id)}10`,
                          borderColor: obterCorTipoRefeicao(tipo.id),
                        }
                      }}
                    >
                      {temAlternativas ? "Nova" : "Adicionar"}
                    </Button>
                  </Box>
                </AccordionSummary>

                <AccordionDetails sx={{ p: 0 }}>
                  {!temAlternativas ? (
                    <Box sx={{ p: 3, textAlign: "center" }}>
                      <Typography variant="body2" color="text.secondary">
                        Nenhuma alternativa criada para {tipo.nome.toLowerCase()}
                      </Typography>
                    </Box>
                  ) : (
                    <Box sx={{ p: 2 }}>
                      {/* Alerta para alternativas com mais calorias */}
                      {(() => {
                        const alternativasComMaisCalorias = verificarAlternativasComMaisCalorias(alternativas);
                        
                        if (alternativasComMaisCalorias.length > 0) {
                          const principal = alternativas[0];
                          const macrosPrincipal = recalcularMacrosAlternativa(principal.alimentos);
                          
                          return (
                            <Alert 
                              severity="warning" 
                              sx={{ mb: 2, fontSize: "0.85rem" }}
                              icon="⚠️"
                            >
                              <Typography variant="caption" component="div" fontWeight="bold">
                                🔥 Atenção: {alternativasComMaisCalorias.length} alternativa{alternativasComMaisCalorias.length > 1 ? 's têm' : ' tem'} mais calorias que a principal
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Principal: {Math.round(macrosPrincipal.calorias)} kcal | 
                                Maior alternativa: {Math.round(Math.max(...alternativasComMaisCalorias.map(alt => recalcularMacrosAlternativa(alt.alimentos).calorias)))} kcal
                              </Typography>
                            </Alert>
                          );
                        }
                        return null;
                      })()}
                      
                      <Grid container spacing={2}>
                        {alternativas.map((alternativa, index) => {
                          // Recalcular macros para garantir precisão com unidades
                          const macrosRecalculados = recalcularMacrosAlternativa(alternativa.alimentos);
                          const macros = formatarMacros(macrosRecalculados);
                          
                          // Verificar se esta alternativa tem mais calorias que a principal
                          const temMaisCaloriasQuePrincipal = index > 0 && (() => {
                            const macrosPrincipal = recalcularMacrosAlternativa(alternativas[0].alimentos);
                            return macrosRecalculados.calorias > macrosPrincipal.calorias;
                          })();
                          
                          return (
                            <Grid item xs={12} sm={6} md={4} key={alternativa.id}>
                              <Card
                                variant="outlined"
                                sx={{
                                  position: "relative",
                                  borderColor: index === 0 ? obterCorTipoRefeicao(tipo.id) : 
                                              temMaisCaloriasQuePrincipal ? "#ff9800" : "divider",
                                  borderWidth: index === 0 ? 2 : temMaisCaloriasQuePrincipal ? 2 : 1,
                                  backgroundColor: temMaisCaloriasQuePrincipal ? "#fff3e0" : "white",
                                  "&:hover": {
                                    boxShadow: 2,
                                    transform: "translateY(-2px)",
                                  },
                                  transition: "all 0.2s ease-in-out"
                                }}
                              >
                                <CardContent sx={{ p: 2, pb: "16px !important" }}>
                                  <Box sx={{ display: "flex", alignItems: "flex-start", mb: 1 }}>
                                    <Box sx={{ flexGrow: 1 }}>
                                      <Typography 
                                        variant="subtitle2" 
                                        fontWeight="bold"
                                        noWrap
                                        title={alternativa.nome}
                                      >
                                        {alternativa.nome}
                                      </Typography>
                                      <Box sx={{ display: "flex", gap: 0.5, mt: 0.5, flexWrap: "wrap" }}>
                                        {index === 0 && (
                                          <Chip
                                            label="Principal"
                                            size="small"
                                            sx={{
                                              height: 16,
                                              fontSize: "0.6rem",
                                              backgroundColor: obterCorTipoRefeicao(tipo.id),
                                              color: "white",
                                            }}
                                          />
                                        )}
                                        {temMaisCaloriasQuePrincipal && (
                                          <Chip
                                            label="+ Calorias"
                                            size="small"
                                            sx={{
                                              height: 16,
                                              fontSize: "0.6rem",
                                              backgroundColor: "#ff9800",
                                              color: "white",
                                            }}
                                          />
                                        )}
                                      </Box>
                                    </Box>
                                    
                                    <IconButton
                                      size="small"
                                      onClick={(e) => abrirMenu(e, diaAtivo, tipo.id, alternativa.id)}
                                      sx={{ ml: 1 }}
                                    >
                                      <MoreVertIcon sx={{ fontSize: "1rem" }} />
                                    </IconButton>
                                  </Box>

                                  <Divider sx={{ my: 1 }} />

                                  <Box sx={{ mb: 1 }}>
                                    <Typography variant="caption" color="text.secondary" display="block">
                                      {alternativa.alimentos?.length || 0} alimento{(alternativa.alimentos?.length || 0) !== 1 ? "s" : ""}
                                    </Typography>
                                  </Box>

                                  <Grid container spacing={1}>
                                    <Grid item xs={6}>
                                      <Typography 
                                        variant="caption" 
                                        display="block" 
                                        fontWeight="bold"
                                        sx={{
                                          color: temMaisCaloriasQuePrincipal ? "#ff9800" : "inherit"
                                        }}
                                      >
                                        🔥 {macros.calorias} kcal
                                        {temMaisCaloriasQuePrincipal && " ⚠️"}
                                      </Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                      <Typography variant="caption" display="block">
                                        💪 {macros.proteina}g
                                      </Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                      <Typography variant="caption" display="block">
                                        🌾 {macros.carbo}g
                                      </Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                      <Typography variant="caption" display="block">
                                        🥑 {macros.gordura}g
                                      </Typography>
                                    </Grid>
                                  </Grid>

                                  {alternativa.alimentos && alternativa.alimentos.length > 0 && (
                                    <Box sx={{ mt: 1 }}>
                                      <Typography variant="caption" color="text.secondary" display="block">
                                        Principais alimentos:
                                      </Typography>
                                      <Typography variant="caption" display="block" noWrap title={
                                        alternativa.alimentos.map(a => a.nome).join(", ")
                                      }>
                                        {alternativa.alimentos.slice(0, 2).map(a => a.nome).join(", ")}
                                        {alternativa.alimentos.length > 2 && "..."}
                                      </Typography>
                                    </Box>
                                  )}
                                </CardContent>
                              </Card>
                            </Grid>
                          );
                        })}
                      </Grid>
                    </Box>
                  )}
                </AccordionDetails>
              </Accordion>
            );
          })}

          {Object.keys(refeicoesDoDia).length === 0 && (
            <Alert 
              severity="info" 
              sx={{ mt: 2 }}
              icon={<ScheduleIcon />}
            >
              <Typography variant="body2">
                Nenhuma refeição criada para {diaAtual?.nome}. 
                Comece adicionando uma refeição usando os botões "Adicionar" acima.
              </Typography>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Menu de opções da alternativa */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={fecharMenu}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem onClick={executarEdicao}>
          <EditIcon sx={{ mr: 1, fontSize: "small" }} />
          Editar
        </MenuItem>
        <MenuItem onClick={executarDuplicacao}>
          <ContentCopyIcon sx={{ mr: 1, fontSize: "small" }} />
          Duplicar
        </MenuItem>
        <Divider />
        <MenuItem onClick={abrirDialogoConfirmacao} sx={{ color: "error.main" }}>
          <DeleteIcon sx={{ mr: 1, fontSize: "small" }} />
          Remover
        </MenuItem>
      </Menu>

      {/* Diálogo de confirmação de remoção */}
      <Dialog open={dialogoConfirmacao} onClose={fecharDialogoConfirmacao}>
        <DialogTitle>Confirmar Remoção</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja remover esta alternativa de refeição? 
            Esta ação não pode ser desfeita.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={fecharDialogoConfirmacao}>Cancelar</Button>
          <Button onClick={executarRemocao} color="error" variant="contained">
            Remover
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
