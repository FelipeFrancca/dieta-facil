import React from 'react';
import { 
  Box, 
  Typography, 
  Chip, 
  Tooltip, 
  Divider 
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import { converterParaGramas } from './utils/nutrientCalculator';

/**
 * Componente para exibir informações sobre unidades e conversões
 */
export const UnitsDisplay = ({ alimento, quantidade, unidade, unidadesDisponiveis }) => {
  if (!alimento || !quantidade) return null;

  const gramaTotais = converterParaGramas(quantidade, unidade || "gramas", unidadesDisponiveis);
  const unidadeExibicao = unidade && unidade !== "gramas" 
    ? unidade.replace(/_/g, ' ')
    : "gramas";

  // Identificar se é um preparo específico
  const identificarPreparo = (nome) => {
    const preparos = ['cozido', 'cozida', 'grelhado', 'grelhada', 'assado', 'assada', 'refogado', 'refogada', 'frito', 'frita', 'no vapor', 'cru', 'crua'];
    return preparos.find(preparo => nome.toLowerCase().includes(preparo)) || 'natural';
  };

  const preparo = identificarPreparo(alimento.nome);

  return (
    <Box sx={{ 
      bgcolor: 'grey.50', 
      p: 1.5, 
      borderRadius: 1, 
      border: '1px solid', 
      borderColor: 'grey.200',
      mb: 1 
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <InfoIcon sx={{ fontSize: 16, color: 'primary.main', mr: 0.5 }} />
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          Informações da Porção
        </Typography>
      </Box>
      
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
        <Chip 
          label={`${quantidade} ${unidadeExibicao}`} 
          size="small" 
          color="primary" 
          variant="outlined"
        />
        
        {unidade !== "gramas" && (
          <Chip 
            label={`≈ ${gramaTotais}g`} 
            size="small" 
            color="secondary" 
            variant="outlined"
          />
        )}
        
        {preparo !== 'natural' && (
          <Chip 
            label={preparo} 
            size="small" 
            sx={{ 
              bgcolor: 'orange.50', 
              color: 'orange.800',
              border: '1px solid',
              borderColor: 'orange.200'
            }}
          />
        )}
      </Box>

      {unidade !== "gramas" && unidadesDisponiveis.length > 0 && (
        <Box>
          <Divider sx={{ my: 1 }} />
          <Typography variant="caption" color="text.secondary">
            💡 Para compras: considere a forma crua/natural do alimento
          </Typography>
        </Box>
      )}
    </Box>
  );
};

/**
 * Componente para exibir resumo das conversões na lista de compras
 */
export const ShoppingListInfo = ({ listaCompras }) => {
  if (!listaCompras || listaCompras.length === 0) return null;

  const totalPeso = listaCompras.reduce((acc, item) => acc + item.quantidadeGramas, 0);
  const itemsComPreparo = listaCompras.filter(item => 
    item.preparos.some(preparo => preparo !== 'cru')
  ).length;

  return (
    <Box sx={{ 
      bgcolor: 'info.50', 
      p: 2, 
      borderRadius: 1, 
      border: '1px solid', 
      borderColor: 'info.200',
      mb: 2 
    }}>
      <Typography variant="h6" sx={{ color: 'info.dark', mb: 1 }}>
        📋 Resumo da Lista de Compras
      </Typography>
      
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
        <Chip 
          label={`${listaCompras.length} itens diferentes`} 
          size="small" 
          color="info"
        />
        <Chip 
          label={`≈ ${(totalPeso / 1000).toFixed(1)}kg total`} 
          size="small" 
          color="success"
        />
        {itemsComPreparo > 0 && (
          <Chip 
            label={`${itemsComPreparo} com preparo específico`} 
            size="small" 
            color="warning"
          />
        )}
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        ⚠️ <strong>Importante:</strong> As quantidades são calculadas considerando a forma que você consumirá. 
        Para alimentos cozidos/preparados, compre na forma crua e considere as perdas no preparo.
      </Typography>
    </Box>
  );
};

export default { UnitsDisplay, ShoppingListInfo };
