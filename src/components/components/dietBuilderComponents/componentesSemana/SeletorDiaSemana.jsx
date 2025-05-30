import React from 'react';
import {
  Box,
  Chip,
  Typography,
  Button,
  Menu,
  MenuItem,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  ContentCopy as CopyIcon,
  MoreVert as MoreIcon
} from '@mui/icons-material';

const diasSemana = [
  { key: 'SEG', label: 'Segunda', color: '#e3f2fd' },
  { key: 'TER', label: 'Terça', color: '#f3e5f5' },
  { key: 'QUA', label: 'Quarta', color: '#e8f5e8' },
  { key: 'QUI', label: 'Quinta', color: '#fff3e0' },
  { key: 'SEX', label: 'Sexta', color: '#fce4ec' },
  { key: 'SAB', label: 'Sábado', color: '#e0f2f1' },
  { key: 'DOM', label: 'Domingo', color: '#f9fbe7' }
];

export function SeletorDiaSemana({ 
  selectedDay, 
  onDaySelect, 
  onDuplicateDay,
  refeicoesPorDia = {}
}) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [menuDay, setMenuDay] = React.useState(null);

  const handleMenuClick = (event, day) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setMenuDay(day);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuDay(null);
  };

  const handleDuplicateDay = () => {
    if (menuDay && onDuplicateDay) {
      onDuplicateDay(menuDay);
    }
    handleMenuClose();
  };

  const getRefeicaoCount = (day) => {
    return refeicoesPorDia[day]?.length || 0;
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        📅 Dias da Semana
      </Typography>
      
      <Box sx={{ 
        display: 'flex', 
        gap: 1, 
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        {diasSemana.map((dia) => {
          const isSelected = selectedDay === dia.key;
          const refeicaoCount = getRefeicaoCount(dia.key);
          
          return (
            <Box key={dia.key} sx={{ position: 'relative' }}>
              <Chip
                label={
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center',
                    py: 0.5,
                    minWidth: 60
                  }}>
                    <Typography variant="body2" fontWeight="600">
                      {dia.key}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {refeicaoCount} ref.
                    </Typography>
                  </Box>
                }
                onClick={() => onDaySelect(dia.key)}
                variant={isSelected ? "filled" : "outlined"}
                sx={{
                  height: 65,
                  backgroundColor: isSelected ? dia.color : 'transparent',
                  borderColor: dia.color,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: dia.color,
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                  }
                }}
              />
              
              {refeicaoCount > 0 && (
                <IconButton
                  size="small"
                  onClick={(e) => handleMenuClick(e, dia.key)}
                  sx={{
                    position: 'absolute',
                    top: -8,
                    right: -8,
                    backgroundColor: 'white',
                    boxShadow: 1,
                    width: 24,
                    height: 24,
                    '&:hover': {
                      backgroundColor: 'grey.100'
                    }
                  }}
                >
                  <MoreIcon fontSize="small" />
                </IconButton>
              )}
            </Box>
          );
        })}
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleDuplicateDay}>
          <CopyIcon fontSize="small" sx={{ mr: 1 }} />
          Duplicar Dia
        </MenuItem>
      </Menu>
    </Box>
  );
}