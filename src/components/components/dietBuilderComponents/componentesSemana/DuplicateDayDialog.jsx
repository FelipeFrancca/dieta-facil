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
  Chip,
  Alert,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import WarningIcon from '@mui/icons-material/Warning';

const diasSemana = [
  { key: 'SEG', label: 'Segunda-feira', color: '#e3f2fd' },
  { key: 'TER', label: 'Terça-feira', color: '#f3e5f5' },
  { key: 'QUA', label: 'Quarta-feira', color: '#e8f5e8' },
  { key: 'QUI', label: 'Quinta-feira', color: '#fff3e0' },
  { key: 'SEX', label: 'Sexta-feira', color: '#fce4ec' },
  { key: 'SAB', label: 'Sábado', color: '#e0f2f1' },
  { key: 'DOM', label: 'Domingo', color: '#f9fbe7' }
];

export const DuplicateDayDialog = ({
  open,
  onClose,
  diaOrigem,
  onDuplicateDay,
  refeicoesPorDia = {}
}) => {
  const [diaDestino, setDiaDestino] = useState('');
  const [substituirExistentes, setSubstituirExistentes] = useState(false);

  const handleDuplicate = () => {
    if (diaDestino && onDuplicateDay) {
      onDuplicateDay(diaOrigem, diaDestino, substituirExistentes);
      setDiaDestino('');
      setSubstituirExistentes(false);
      onClose();
    }
  };

  const handleClose = () => {
    setDiaDestino('');
    setSubstituirExistentes(false);
    onClose();
  };

  const getDiaLabel = (diaKey) => {
    return diasSemana.find(d => d.key === diaKey)?.label || diaKey;
  };

  const getRefeicaoCount = (dia) => {
    return refeicoesPorDia[dia]?.length || 0;
  };

  const calcularMacrosDia = (dia) => {
    const refeicoes = refeicoesPorDia[dia] || [];
    return refeicoes.reduce(
      (acc, refeicao) => ({
        calorias: acc.calorias + (refeicao.macros?.calorias || 0),
        proteina: acc.proteina + (refeicao.macros?.proteina || 0),
        carbo: acc.carbo + (refeicao.macros?.carbo || 0),
        gordura: acc.gordura + (refeicao.macros?.gordura || 0)
      }),
      { calorias: 0, proteina: 0, carbo: 0, gordura: 0 }
    );
  };

  // Filtrar dias disponíveis (excluir o dia atual)
  const diasDisponiveis = diasSemana.filter(dia => dia.key !== diaOrigem);
  const refeicoesOrigem = refeicoesPorDia[diaOrigem] || [];
  const macrosOrigem = calcularMacrosDia(diaOrigem);
  const temRefeicoesDestino = diaDestino && getRefeicaoCount(diaDestino) > 0;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ContentCopyIcon color="primary" />
          Duplicar Dia
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
            Origem: {getDiaLabel(diaOrigem)}
          </Typography>
          
          <Box sx={{ 
            p: 2, 
            border: '1px solid #e0e0e0', 
            borderRadius: 1,
            backgroundColor: '#f9f9f9'
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                {getRefeicaoCount(diaOrigem)} refeições
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip 
                  label={`${Math.round(macrosOrigem.calorias)} kcal`}
                  color="primary" 
                  size="small" 
                />
                <Chip 
                  label={`${Math.round(macrosOrigem.proteina)}g prot`}
                  variant="outlined" 
                  size="small" 
                />
                <Chip 
                  label={`${Math.round(macrosOrigem.carbo)}g carb`}
                  variant="outlined" 
                  size="small" 
                />
                <Chip 
                  label={`${Math.round(macrosOrigem.gordura)}g gord`}
                  variant="outlined" 
                  size="small" 
                />
              </Box>
            </Box>
            
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Refeições:
            </Typography>
            {refeicoesOrigem.map((refeicao, index) => (
              <Typography key={refeicao.id} variant="body2" sx={{ ml: 2 }}>
                {index + 1}. {refeicao.nome} ({Math.round(refeicao.macros?.calorias || 0)} kcal)
              </Typography>
            ))}
          </Box>
        </Box>

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Duplicar para</InputLabel>
          <Select
            value={diaDestino}
            onChange={(e) => setDiaDestino(e.target.value)}
            label="Duplicar para"
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
                    color={getRefeicaoCount(dia.key) > 0 ? "warning" : "default"}
                  />
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {temRefeicoesDestino && (
          <>
            <Alert 
              severity="warning" 
              icon={<WarningIcon />}
              sx={{ mb: 2 }}
            >
              O dia {getDiaLabel(diaDestino)} já possui {getRefeicaoCount(diaDestino)} refeições.
            </Alert>
            
            <FormControlLabel
              control={
                <Checkbox
                  checked={substituirExistentes}
                  onChange={(e) => setSubstituirExistentes(e.target.checked)}
                />
              }
              label="Substituir refeições existentes"
              sx={{ mb: 2 }}
            />
            
            {!substituirExistentes && (
              <Typography variant="body2" color="text.secondary" sx={{ ml: 4, mb: 2 }}>
                As refeições serão adicionadas às existentes
              </Typography>
            )}
          </>
        )}

        {diaDestino && (
          <Box sx={{ mt: 2, p: 2, backgroundColor: '#f0f7ff', borderRadius: 1 }}>
            <Typography variant="body2" color="primary">
              💡 {refeicoesOrigem.length} refeições serão {substituirExistentes ? 'copiadas substituindo' : 'adicionadas a'} {getDiaLabel(diaDestino)}.
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>
          Cancelar
        </Button>
        <Button 
          onClick={handleDuplicate} 
          variant="contained"
          disabled={!diaDestino}
          startIcon={<ContentCopyIcon />}
        >
          Duplicar Dia
        </Button>
      </DialogActions>
    </Dialog>
  );
};