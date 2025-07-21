import { useState } from "react";
import {
  Box,
  Chip,
  Typography,
  Paper,
  IconButton,
  Menu,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from "@mui/material";
import {
  MoreVert as MoreVertIcon,
  ContentCopy as ContentCopyIcon,
  DeleteSweep as DeleteSweepIcon,
  CalendarToday as CalendarTodayIcon,
} from "@mui/icons-material";

export const WeekDaySelector = ({ 
  diasDaSemana, 
  diaAtivo, 
  setDiaAtivo, 
  dietaSemanal,
  calcularTotalDia,
  copiarDiaCompleto,
  onLimparDia
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [diaMenuAberto, setDiaMenuAberto] = useState(null);
  const [dialogoCopiaAberto, setDialogoCopiaAberto] = useState(false);
  const [diaParaCopiar, setDiaParaCopiar] = useState(null);

  const abrirMenu = (event, diaId) => {
    setAnchorEl(event.currentTarget);
    setDiaMenuAberto(diaId);
  };

  const fecharMenu = () => {
    setAnchorEl(null);
    setDiaMenuAberto(null);
  };

  const abrirDialogoCopia = (diaId) => {
    setDiaParaCopiar(diaId);
    setDialogoCopiaAberto(true);
    fecharMenu();
  };

  const fecharDialogoCopia = () => {
    setDialogoCopiaAberto(false);
    setDiaParaCopiar(null);
  };

  const executarCopiaDia = (diaDestino) => {
    if (diaParaCopiar && copiarDiaCompleto) {
      copiarDiaCompleto(diaParaCopiar, diaDestino);
      fecharDialogoCopia();
    }
  };

  const executarLimpezaDia = (diaId) => {
    if (onLimparDia) {
      onLimparDia(diaId);
    }
    fecharMenu();
  };

  const temRefeicoes = (diaId) => {
    return dietaSemanal[diaId] && Object.keys(dietaSemanal[diaId]).length > 0;
  };

  const obterCorDia = (diaId) => {
    if (diaId === diaAtivo) return "primary";
    if (temRefeicoes(diaId)) return "success";
    return "default";
  };

  const obterVarianteDia = (diaId) => {
    return diaId === diaAtivo ? "filled" : "outlined";
  };

  return (
    <>
      <Paper 
        elevation={2} 
        sx={{ 
          p: 2, 
          mb: 3, 
          borderRadius: 2,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white"
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <CalendarTodayIcon sx={{ mr: 1 }} />
          <Typography variant="h6" fontWeight="bold">
            Planejamento Semanal
          </Typography>
        </Box>
        
        <Box 
          sx={{ 
            display: "flex", 
            flexWrap: "wrap", 
            gap: 1,
            justifyContent: { xs: "center", sm: "flex-start" }
          }}
        >
          {diasDaSemana.map((dia) => {
            const totalDia = calcularTotalDia(dia.id);
            
            return (
              <Box key={dia.id} sx={{ position: "relative" }}>
                <Chip
                  label={
                    <Box sx={{ textAlign: "center" }}>
                      <Typography variant="caption" display="block" fontWeight="bold">
                        {dia.abrev}
                      </Typography>
                      {temRefeicoes(dia.id) && (
                        <Typography variant="caption" display="block" fontSize="0.7rem">
                          {Math.round(totalDia.calorias)} kcal
                        </Typography>
                      )}
                    </Box>
                  }
                  onClick={() => setDiaAtivo(dia.id)}
                  color={obterCorDia(dia.id)}
                  variant={obterVarianteDia(dia.id)}
                  size="medium"
                  sx={{ 
                    minWidth: { xs: 60, sm: 80 },
                    height: { xs: 45, sm: 55 },
                    fontSize: { xs: "0.7rem", sm: "0.8rem" },
                    fontWeight: dia.id === diaAtivo ? "bold" : "normal",
                    backgroundColor: dia.id === diaAtivo 
                      ? "rgba(255,255,255,0.9)" 
                      : temRefeicoes(dia.id) 
                        ? "rgba(255,255,255,0.1)" 
                        : "transparent",
                    color: dia.id === diaAtivo 
                      ? "primary.main" 
                      : "white",
                    border: temRefeicoes(dia.id) 
                      ? "2px solid rgba(255,255,255,0.3)" 
                      : "1px solid rgba(255,255,255,0.2)",
                    "&:hover": {
                      backgroundColor: dia.id === diaAtivo 
                        ? "rgba(255,255,255,1)" 
                        : "rgba(255,255,255,0.15)",
                      transform: "translateY(-2px)",
                      boxShadow: "0 4px 8px rgba(0,0,0,0.2)"
                    },
                    transition: "all 0.2s ease-in-out"
                  }}
                />
                
                {temRefeicoes(dia.id) && (
                  <IconButton
                    size="small"
                    onClick={(e) => abrirMenu(e, dia.id)}
                    sx={{ 
                      position: "absolute",
                      top: -8,
                      right: -8,
                      backgroundColor: "rgba(255,255,255,0.9)",
                      color: "primary.main",
                      width: 20,
                      height: 20,
                      "&:hover": {
                        backgroundColor: "white",
                        transform: "scale(1.1)"
                      }
                    }}
                  >
                    <MoreVertIcon sx={{ fontSize: 12 }} />
                  </IconButton>
                )}
              </Box>
            );
          })}
        </Box>

        {/* Informações do dia ativo */}
        {temRefeicoes(diaAtivo) && (
          <Box sx={{ mt: 2, p: 2, backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 1 }}>
            <Typography variant="body2" fontWeight="bold" gutterBottom>
              {diasDaSemana.find(d => d.id === diaAtivo)?.nome}
            </Typography>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              {(() => {
                const total = calcularTotalDia(diaAtivo);
                return (
                  <>
                    <Typography variant="caption">
                      🔥 {Math.round(total.calorias)} kcal
                    </Typography>
                    <Typography variant="caption">
                      💪 {Math.round(total.proteina)}g
                    </Typography>
                    <Typography variant="caption">
                      🌾 {Math.round(total.carbo)}g
                    </Typography>
                    <Typography variant="caption">
                      🥑 {Math.round(total.gordura)}g
                    </Typography>
                  </>
                );
              })()}
            </Box>
          </Box>
        )}
      </Paper>

      {/* Menu de opções do dia */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={fecharMenu}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem onClick={() => abrirDialogoCopia(diaMenuAberto)}>
          <ContentCopyIcon sx={{ mr: 1, fontSize: "small" }} />
          Copiar para outro dia
        </MenuItem>
        <MenuItem onClick={() => executarLimpezaDia(diaMenuAberto)}>
          <DeleteSweepIcon sx={{ mr: 1, fontSize: "small" }} />
          Limpar dia
        </MenuItem>
      </Menu>

      {/* Diálogo de cópia */}
      <Dialog open={dialogoCopiaAberto} onClose={fecharDialogoCopia} maxWidth="sm" fullWidth>
        <DialogTitle>
          Copiar refeições de {diasDaSemana.find(d => d.id === diaParaCopiar)?.nome}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Selecione o dia de destino para copiar todas as refeições:
          </Typography>
          <List>
            {diasDaSemana
              .filter(dia => dia.id !== diaParaCopiar)
              .map((dia) => (
                <ListItem
                  key={dia.id}
                  button
                  onClick={() => executarCopiaDia(dia.id)}
                  sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 1,
                    mb: 1,
                    "&:hover": {
                      backgroundColor: "action.hover"
                    }
                  }}
                >
                  <ListItemText
                    primary={dia.nome}
                    secondary={
                      temRefeicoes(dia.id) 
                        ? `${Math.round(calcularTotalDia(dia.id).calorias)} kcal (será substituído)`
                        : "Vazio"
                    }
                  />
                  <ListItemSecondaryAction>
                    {temRefeicoes(dia.id) && (
                      <Chip label="Tem refeições" size="small" color="warning" />
                    )}
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={fecharDialogoCopia}>Cancelar</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
