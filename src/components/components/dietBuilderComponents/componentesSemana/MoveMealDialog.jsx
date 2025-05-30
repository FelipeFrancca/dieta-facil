import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  Chip
} from '@mui/material';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';

const diasSemana = [
  { key: 'SEG', label: 'Segunda-feira', color: '#e3f2fd' },
  { key: 'TER', label: 'Terça-feira', color: '#f3e5f5' },
  { key: 'QUA', label: 'Quarta-feira', color: '#e8f5e8' },
  { key: 'QUI', label: 'Quinta-feira', color: '#fff3e0' },
  { key: 'SEX', label: 'Sexta-feira', color: '#fce4ec' },
  { key: 'SAB', label: 'Sábado', color: '#e0f2f1' },
  { key: 'DOM', label: 'Domingo', color: '#f9fbe7' }
];

export const MoveMealDialog = ({
  open,
  onClose,
  refeicao,
  diaOrigem,
  onMoveMeal,
  refeicoesPorDia = {}
}) => {
  const [diaDestino, setDiaDestino] = useState('');

  const handleMove = () => {
    if (diaDestino && onMoveMeal) {
      onMoveMeal(diaOrigem, diaDestino, refeicao.id);
      setDiaDestino('');
      onClose();
    }
  };

  const handleClose = () => {
    setDiaDestino('');
    onClose();
  };

  const getDiaLabel = (diaKey) => {
    return diasSemana.find(d => d.key === diaKey)?.label || diaKey;
  };

  const getRefeicaoCount = (dia) => {
    return refeicoesPorDia[dia]?.length || 0;
  };

  // Filtrar dias disponíveis (excluir o dia atual)
  const diasDisponiveis = diasSemana.filter(dia => dia.key !== diaOrigem);

  if (!refeicao) return null;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SwapHorizIcon color="primary" />
          Mover Refeição
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
            Refeição a ser movida:
          </Typography>
          <Box sx={{ 
            p: 2, 
            border: '1px solid #e0e0e0', 
            borderRadius: 1,
            backgroundColor: '#f9f9f9'
          }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
              {refeicao.nome}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip 
                label={`${Math.round(refeicao.macros?.calorias || 0)} kcal`}
                color="primary" 
                size="small" 
              />
              <Chip 
                label={`${Math.round(refeicao.macros?.proteina || 0)}g prot`}
                variant="outlined" 
                size="small" 
              />
              <Chip 
                label={`${Math.round(refeicao.macros?.carbo || 0)}g carb`}
                variant="outlined" 
                size="small" 
              />
              <Chip 
                label={`${Math.round(refeicao.macros?.gordura || 0)}g gord`}
                variant="outlined" 
                size="small" 
              />
            </Box>
          </Box>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            <strong>De:</strong> {getDiaLabel(diaOrigem)}
          </Typography>
        </Box>

        <FormControl fullWidth>
          <InputLabel>Mover para</InputLabel>
          <Select
            value={diaDestino}
            onChange={(e) => setDiaDestino(e.target.value)}
            label="Mover para"
          >
            {diasDisponiveis.map((dia) => (
              <MenuItem key={dia.key} value={dia.key}>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  width: '100%'
                }}>
                  <span>{dia.label}</span>
                  <Chip 
                    label={`${getRefeicaoCount(dia.key)} refeições`}
                    size="small"
                    variant="outlined"
                  />
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {diaDestino && (
          <Box sx={{ mt: 2, p: 2, backgroundColor: '#f0f7ff', borderRadius: 1 }}>
            <Typography variant="body2" color="primary">
              💡 A refeição será movida para {getDiaLabel(diaDestino)} e 
              removida de {getDiaLabel(diaOrigem)}.
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>
          Cancelar
        </Button>
        <Button 
          onClick={handleMove} 
          variant="contained"
          disabled={!diaDestino}
          startIcon={<SwapHorizIcon />}
        >
          Mover Refeição
        </Button>
      </DialogActions>
    </Dialog>
  );
};