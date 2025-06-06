// components/FoodCard.jsx
import React from 'react';
import { Card, Typography, Chip, Box, Tooltip } from "@mui/material";
import EggAltIcon from '@mui/icons-material/EggAlt';
import BakeryDiningIcon from '@mui/icons-material/BakeryDining';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import LocalDiningIcon from '@mui/icons-material/LocalDining';
import CakeIcon from '@mui/icons-material/Cake';
import ApiIcon from '@mui/icons-material/Api';
import StorageIcon from '@mui/icons-material/Storage';

export const FoodCard = ({ alimento, isSelected, onClick }) => {
  // Função para escolher o ícone baseado no tipo de unidade
  const getIconeUnidade = (tipo) => {
    const icones = {
      'ovo': <EggAltIcon />,
      'pao': <BakeryDiningIcon />,
      'biscoito': <CakeIcon />,
      'fatia': <LocalDiningIcon />,
      'unidade': <RestaurantIcon />
    };
    return icones[tipo] || <RestaurantIcon />;
  };

  // Função para determinar a cor do chip baseado no tipo
  const getCorChip = (tipo) => {
    const cores = {
      'ovo': 'warning',
      'pao': 'info',
      'biscoito': 'secondary',
      'fatia': 'primary',
      'unidade': 'default'
    };
    return cores[tipo] || 'default';
  };

  return (
    <Card
      sx={{
        mb: 2,
        p: 2,
        cursor: "pointer",
        border: isSelected ? "2px solid #667eea" : "1px solid #e0e0e0",
        backgroundColor: isSelected ? "#f3f4ff" : "#fff",
        "&:hover": { 
          backgroundColor: isSelected ? "#e8eaff" : "#f5f5f5",
          transform: "translateY(-1px)",
          boxShadow: "0 4px 8px rgba(0,0,0,0.12)"
        },
        transition: "all 0.2s ease-in-out",
      }}
      onClick={() => onClick(alimento)}
    >
      {/* Header com nome do alimento e fonte */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
        <Typography
          variant="subtitle1"
          sx={{ 
            fontWeight: "bold", 
            textTransform: "capitalize",
            flex: 1,
            color: isSelected ? "#667eea" : "inherit"
          }}
        >
          {alimento.nome}
        </Typography>
        
        {/* Indicador de fonte (API ou Local) */}
        <Tooltip title={alimento.fonte === 'api' ? 'Alimento da base internacional' : 'Alimento da base local'}>
          <Chip
            icon={alimento.fonte === 'api' ? <ApiIcon /> : <StorageIcon />}
            label={alimento.fonte === 'api' ? 'API' : 'Local'}
            size="small"
            variant="outlined"
            sx={{ 
              ml: 1,
              '& .MuiChip-icon': { fontSize: '14px' }
            }}
          />
        </Tooltip>
      </Box>

      {/* Informações nutricionais */}
      <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
        <strong>{alimento.calorias}</strong> kcal | 
        P: <strong>{alimento.proteina}</strong>g | 
        C: <strong>{alimento.carbo}</strong>g | 
        G: <strong>{alimento.gordura}</strong>g 
        <Typography component="span" variant="caption" sx={{ ml: 1, fontStyle: 'italic' }}>
          (por 100g)
        </Typography>
      </Typography>
      
      {/* Chips de unidades disponíveis */}
      {alimento.unidades && alimento.unidades.length > 0 && (
        <Box sx={{ mt: 1.5 }}>
          <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 0.5 }}>
            Unidades disponíveis:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {alimento.unidades.map((unidade, index) => (
              <Tooltip
                key={index}
                title={`${unidade.descricao} ≈ ${unidade.pesoPorUnidade}g cada`}
                arrow
              >
                <Chip
                  icon={getIconeUnidade(unidade.tipo)}
                  label={unidade.descricao}
                  size="small"
                  color={getCorChip(unidade.tipo)}
                  variant="outlined"
                  sx={{
                    fontSize: '0.75rem',
                    height: '24px',
                    '&:hover': {
                      backgroundColor: `${getCorChip(unidade.tipo) === 'default' ? '#f5f5f5' : 'rgba(25, 118, 210, 0.08)'}`,
                      transform: 'scale(1.05)'
                    },
                    transition: 'all 0.2s ease-in-out',
                    '& .MuiChip-icon': { 
                      fontSize: '14px',
                      margin: '0 4px 0 -2px'
                    }
                  }}
                />
              </Tooltip>
            ))}
          </Box>
        </Box>
      )}

      {/* Indicador visual quando selecionado */}
      {isSelected && (
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            width: 12,
            height: 12,
            borderRadius: '50%',
            backgroundColor: '#667eea',
            boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.2)'
          }}
        />
      )}
    </Card>
  );
};