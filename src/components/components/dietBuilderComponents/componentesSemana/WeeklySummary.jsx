import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

const diasSemana = [
  { key: 'SEG', label: 'Segunda', color: '#e3f2fd' },
  { key: 'TER', label: 'Terça', color: '#f3e5f5' },
  { key: 'QUA', label: 'Quarta', color: '#e8f5e8' },
  { key: 'QUI', label: 'Quinta', color: '#fff3e0' },
  { key: 'SEX', label: 'Sexta', color: '#fce4ec' },
  { key: 'SAB', label: 'Sábado', color: '#e0f2f1' },
  { key: 'DOM', label: 'Domingo', color: '#f9fbe7' }
];

export const WeeklySummary = ({ 
  refeicoesPorDia, 
  calcularMacrosDia,
  metaCalorias = null 
}) => {
  const calcularMacrosSemana = () => {
    return diasSemana.reduce(
      (acc, dia) => {
        const macrosDia = calcularMacrosDia(dia.key);
        return {
          calorias: acc.calorias + macrosDia.calorias,
          proteina: acc.proteina + macrosDia.proteina,
          carbo: acc.carbo + macrosDia.carbo,
          gordura: acc.gordura + macrosDia.gordura
        };
      },
      { calorias: 0, proteina: 0, carbo: 0, gordura: 0 }
    );
  };

  const obterEstatisticas = () => {
    const totalRefeicoes = diasSemana.reduce((acc, dia) => 
      acc + (refeicoesPorDia[dia.key]?.length || 0), 0);
    
    const diasComRefeicoes = diasSemana.filter(dia => 
      refeicoesPorDia[dia.key]?.length > 0).length;

    return { totalRefeicoes, diasComRefeicoes };
  };

  const macrosSemana = calcularMacrosSemana();
  const { totalRefeicoes, diasComRefeicoes } = obterEstatisticas();
  const mediaCaloriasDia = diasComRefeicoes > 0 ? macrosSemana.calorias / diasComRefeicoes : 0;

  const getProgressColor = (atual, meta) => {
    if (!meta) return 'primary';
    const porcentagem = (atual / meta) * 100;
    if (porcentagem < 80) return 'warning';
    if (porcentagem > 120) return 'error';
    return 'success';
  };

  return (
    <Accordion sx={{ mb: 3 }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <TrendingUpIcon color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Resumo Semanal
          </Typography>
          <Chip 
            label={`${totalRefeicoes} refeições`}
            color="primary"
            size="small"
          />
          <Chip 
            label={`${diasComRefeicoes}/7 dias`}
            variant="outlined"
            size="small"
          />
        </Box>
      </AccordionSummary>
      
      <AccordionDetails>
        {/* Estatísticas gerais */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={3}>
            <Card sx={{ textAlign: 'center', backgroundColor: '#f8f9ff' }}>
              <CardContent>
                <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
                  {Math.round(macrosSemana.calorias)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Calorias/Semana
                </Typography>
                {metaCalorias && (
                  <Typography variant="caption" color="text.secondary">
                    Meta: {metaCalorias * 7} kcal
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Card sx={{ textAlign: 'center', backgroundColor: '#fff8f0' }}>
              <CardContent>
                <Typography variant="h4" color="orange" sx={{ fontWeight: 'bold' }}>
                  {Math.round(macrosSemana.proteina)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Proteínas (g)
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Card sx={{ textAlign: 'center', backgroundColor: '#f0fff4' }}>
              <CardContent>
                <Typography variant="h4" color="green" sx={{ fontWeight: 'bold' }}>
                  {Math.round(macrosSemana.carbo)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Carboidratos (g)
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Card sx={{ textAlign: 'center', backgroundColor: '#fffbf0' }}>
              <CardContent>
                <Typography variant="h4" color="goldenrod" sx={{ fontWeight: 'bold' }}>
                  {Math.round(macrosSemana.gordura)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Gorduras (g)
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Média diária */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            📊 Média Diária
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                    Calorias por Dia
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="h5" color="primary">
                      {Math.round(mediaCaloriasDia)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      kcal/dia
                    </Typography>
                  </Box>
                  {metaCalorias && (
                    <Box sx={{ mt: 2 }}>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min((mediaCaloriasDia / metaCalorias) * 100, 100)}
                        color={getProgressColor(mediaCaloriasDia, metaCalorias)}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        {Math.round((mediaCaloriasDia / metaCalorias) * 100)}% da meta diária
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                    Distribuição Semanal
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip 
                      label={`${Math.round((macrosSemana.proteina / macrosSemana.calorias * 4) * 100)}% Prot`}
                      color="warning"
                      size="small"
                    />
                    <Chip 
                      label={`${Math.round((macrosSemana.carbo / macrosSemana.calorias * 4) * 100)}% Carb`}
                      color="success"
                      size="small"
                    />
                    <Chip 
                      label={`${Math.round((macrosSemana.gordura / macrosSemana.calorias * 9) * 100)}% Gord`}
                      color="info"
                      size="small"
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* Detalhes por dia */}
        <Box>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            📅 Detalhes por Dia
          </Typography>
          <Grid container spacing={2}>
            {diasSemana.map((dia) => {
              const macrosDia = calcularMacrosDia(dia.key);
              const totalRefeicoesDia = refeicoesPorDia[dia.key]?.length || 0;
              const temRefeicoes = totalRefeicoesDia > 0;
              
              return (
                <Grid item xs={12} sm={6} md={4} lg={3} key={dia.key}>
                  <Card 
                    sx={{ 
                      backgroundColor: temRefeicoes ? dia.color : '#f5f5f5',
                      opacity: temRefeicoes ? 1 : 0.6
                    }}
                  >
                    <CardContent sx={{ pb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {dia.label}
                        </Typography>
                        <Chip 
                          label={`${totalRefeicoesDia} ref`}
                          size="small"
                          variant={temRefeicoes ? "filled" : "outlined"}
                        />
                      </Box>
                      
                      {temRefeicoes ? (
                        <>
                          <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                            {Math.round(macrosDia.calorias)} kcal
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 0.5, mt: 1, flexWrap: 'wrap' }}>
                            <Chip label={`${Math.round(macrosDia.proteina)}g P`} size="small" variant="outlined" />
                            <Chip label={`${Math.round(macrosDia.carbo)}g C`} size="small" variant="outlined" />
                            <Chip label={`${Math.round(macrosDia.gordura)}g G`} size="small" variant="outlined" />
                          </Box>
                        </>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Nenhuma refeição
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};