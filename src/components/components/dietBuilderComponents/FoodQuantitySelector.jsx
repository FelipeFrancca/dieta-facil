// components/FoodQuantitySelector.jsx
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  MenuItem, 
  Select, 
  FormControl, 
  InputLabel,
  Card,
  Divider,
  Chip,
  Alert
} from "@mui/material";
import ScaleIcon from '@mui/icons-material/Scale';
import CalculateIcon from '@mui/icons-material/Calculate';

export const FoodQuantitySelector = ({ 
  selectedFood, 
  foodQuantity, 
  onQuantityChange,
  onUnitChange
}) => {
  const [selectedUnit, setSelectedUnit] = useState('gramas');
  const [availableUnits, setAvailableUnits] = useState([]);
  const [nutrientInfo, setNutrientInfo] = useState(null);

  useEffect(() => {
    if (!selectedFood) return;
    
    // Sempre incluir gramas como opção
    const units = [{ 
      tipo: 'gramas', 
      label: 'Gramas',
      descricao: 'Medida em gramas',
      pesoPorUnidade: 1
    }];
    
    // Adicionar unidades específicas se disponíveis
    if (selectedFood.unidades && selectedFood.unidades.length > 0) {
      selectedFood.unidades.forEach((unidade, index) => {
        units.push({
          tipo: `${unidade.tipo}_${index}`,
          label: unidade.descricao || `${unidade.quantidade} ${unidade.tipo}(s)`,
          descricao: `Cada ${unidade.descricao} tem aproximadamente ${unidade.pesoPorUnidade}g`,
          pesoPorUnidade: unidade.pesoPorUnidade,
          tipoOriginal: unidade.tipo,
          quantidadeOriginal: unidade.quantidade,
          index: index
        });
      });
    }
    
    setAvailableUnits(units);
    setSelectedUnit('gramas');
    onUnitChange('gramas');
  }, [selectedFood, onUnitChange]);

  const handleUnitChange = (unit) => {
    setSelectedUnit(unit);
    onUnitChange(unit);
  };

  const calcularNutrientes = (quantity, unit) => {
    if (!selectedFood || !quantity) {
      return { calorias: 0, proteina: 0, carbo: 0, gordura: 0, gramas: 0 };
    }

    let gramas = quantity;
    
    // Se não for gramas, converter para gramas
    if (unit !== 'gramas') {
      const selectedUnitData = availableUnits.find(u => u.tipo === unit);
      if (selectedUnitData && selectedUnitData.pesoPorUnidade) {
        gramas = quantity * selectedUnitData.pesoPorUnidade;
      }
    }
    
    // Calcular nutrientes baseado em gramas
    const fator = gramas / 100;
    
    return {
      calorias: Math.round(selectedFood.calorias * fator),
      proteina: Math.round((selectedFood.proteina * fator) * 10) / 10,
      carbo: Math.round((selectedFood.carbo * fator) * 10) / 10,
      gordura: Math.round((selectedFood.gordura * fator) * 10) / 10,
      gramas: Math.round(gramas)
    };
  };

  useEffect(() => {
    if (selectedFood && foodQuantity) {
      const info = calcularNutrientes(foodQuantity, selectedUnit);
      setNutrientInfo(info);
    }
  }, [selectedFood, foodQuantity, selectedUnit]);

  if (!selectedFood) return null;

  const currentUnitData = availableUnits.find(u => u.tipo === selectedUnit);
  const isGramas = selectedUnit === 'gramas';

  return (
    <Card sx={{ mt: 3, p: 3, bgcolor: "#f8f9fa", border: "1px solid #e9ecef" }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <ScaleIcon sx={{ mr: 1, color: '#667eea' }} />
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#667eea' }}>
          Quantidade de {selectedFood.nome}
        </Typography>
      </Box>
      
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        {/* Seletor de Unidade */}
        <FormControl fullWidth>
          <InputLabel>Unidade de Medida</InputLabel>
          <Select
            value={selectedUnit}
            onChange={(e) => handleUnitChange(e.target.value)}
            label="Unidade de Medida"
          >
            {availableUnits.map((unit) => (
              <MenuItem key={unit.tipo} value={unit.tipo}>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                    {unit.label}
                  </Typography>
                  {unit.tipo !== 'gramas' && (
                    <Typography variant="caption" color="textSecondary">
                      ≈ {unit.pesoPorUnidade}g cada
                    </Typography>
                  )}
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        {/* Campo de Quantidade */}
        <TextField
          label={`Quantidade ${isGramas ? '(g)' : ''}`}
          type="number"
          value={foodQuantity}
          onChange={(e) => onQuantityChange(Number(e.target.value))}
          fullWidth
          inputProps={{ 
            min: isGramas ? 1 : 0.1, 
            step: isGramas ? 1 : 0.1,
            max: 9999 
          }}
        />
      </Box>

      {/* Informação sobre a unidade selecionada */}
      {!isGramas && currentUnitData && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            {currentUnitData.descricao}
          </Typography>
        </Alert>
      )}

      <Divider sx={{ mb: 2 }} />
      
      {/* Valores Nutricionais Calculados */}
      {nutrientInfo && (
        <Box sx={{ bgcolor: 'white', p: 2, borderRadius: 1, border: '1px solid #dee2e6' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <CalculateIcon sx={{ mr: 1, color: '#28a745' }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#28a745' }}>
              Valores Nutricionais Calculados
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            <Chip
              label={`${nutrientInfo.calorias} kcal`}
              color="primary"
              variant="filled"
              sx={{ fontWeight: 'bold' }}
            />
            <Chip
              label={`Proteínas: ${nutrientInfo.proteina}g`}
              color="success"
              variant="outlined"
            />
            <Chip
              label={`Carboidratos: ${nutrientInfo.carbo}g`}
              color="warning"
              variant="outlined"
            />
            <Chip
              label={`Gorduras: ${nutrientInfo.gordura}g`}
              color="info"
              variant="outlined"
            />
          </Box>

          {/* Conversão de unidades */}
          {!isGramas && (
            <Box sx={{ 
              mt: 2, 
              p: 1.5, 
              bgcolor: '#f8f9fa', 
              borderRadius: 1,
              border: '1px dashed #6c757d'
            }}>
              <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center' }}>
                <strong>{foodQuantity}</strong> {currentUnitData?.label.toLowerCase()} 
                {' ≈ '}
                <strong>{nutrientInfo.gramas}g</strong>
              </Typography>
            </Box>
          )}
          
          {/* Informação sobre base de cálculo */}
          <Typography variant="caption" color="textSecondary" sx={{ 
            display: 'block', 
            textAlign: 'center', 
            mt: 1,
            fontStyle: 'italic'
          }}>
            Valores calculados com base em {selectedFood.calorias} kcal por 100g
          </Typography>
        </Box>
      )}
    </Card>
  );
};