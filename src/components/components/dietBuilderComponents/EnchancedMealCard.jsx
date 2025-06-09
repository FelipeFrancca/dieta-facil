import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  IconButton,
  Divider,
  Typography,
  Chip,
  Box,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Card,
  CardContent,
  Avatar,
  Stack,
  LinearProgress,
  Tooltip,
  Badge
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ScheduleIcon from "@mui/icons-material/Schedule";
import DeleteIcon from "@mui/icons-material/Delete";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import EditIcon from "@mui/icons-material/Edit";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import { useState } from "react";

export const EnhancedMealCard = ({
  refeicao,
  onDelete,
  onDuplicate,
  onEdit,
  onMoveUp,
  onMoveDown,
  onMoveBetweenDays,
  showMoveOptions = true
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleMenuClick = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAction = (action) => {
    handleMenuClose();
    action();
  };

  // Função para obter emoji e cor baseado no tipo de alimento
  const getFoodData = (nome) => {
    const foodName = nome.toLowerCase();
    
    // Proteínas
    if (foodName.includes('frango') || foodName.includes('galinha')) {
      return { emoji: '🐔', color: ['#FF6B6B', '#FF8E53'], category: 'Proteína' };
    }
    if (foodName.includes('carne') || foodName.includes('boi') || foodName.includes('beef')) {
      return { emoji: '🥩', color: ['#FF4757', '#FF3742'], category: 'Proteína' };
    }
    if (foodName.includes('peixe') || foodName.includes('salmão') || foodName.includes('tilápia')) {
      return { emoji: '🐟', color: ['#3742fa', '#2f3542'], category: 'Proteína' };
    }
    if (foodName.includes('ovo')) {
      return { emoji: '🥚', color: ['#ffa502', '#ff6348'], category: 'Proteína' };
    }
    if (foodName.includes('queijo')) {
      return { emoji: '🧀', color: ['#f1c40f', '#f39c12'], category: 'Proteína' };
    }
    if (foodName.includes('leite') || foodName.includes('iogurte')) {
      return { emoji: '🥛', color: ['#ecf0f1', '#bdc3c7'], category: 'Proteína' };
    }
    if (foodName.includes('whey') || foodName.includes('proteína')) {
      return { emoji: '💪', color: ['#e74c3c', '#c0392b'], category: 'Proteína' };
    }

    // Carboidratos
    if (foodName.includes('arroz')) {
      return { emoji: '🍚', color: ['#74b9ff', '#0984e3'], category: 'Carboidrato' };
    }
    if (foodName.includes('batata') || foodName.includes('batata doce')) {
      return { emoji: '🍠', color: ['#fd79a8', '#e84393'], category: 'Carboidrato' };
    }
    if (foodName.includes('pão') || foodName.includes('pães')) {
      return { emoji: '🍞', color: ['#fdcb6e', '#e17055'], category: 'Carboidrato' };
    }
    if (foodName.includes('massa') || foodName.includes('macarrão') || foodName.includes('espaguete')) {
      return { emoji: '🍝', color: ['#fab1a0', '#e17055'], category: 'Carboidrato' };
    }
    if (foodName.includes('aveia')) {
      return { emoji: '🥣', color: ['#a29bfe', '#6c5ce7'], category: 'Carboidrato' };
    }
    if (foodName.includes('banana')) {
      return { emoji: '🍌', color: ['#fdcb6e', '#f39c12'], category: 'Carboidrato' };
    }
    if (foodName.includes('maçã')) {
      return { emoji: '🍎', color: ['#e17055', '#d63031'], category: 'Carboidrato' };
    }

    // Gorduras
    if (foodName.includes('azeite') || foodName.includes('óleo')) {
      return { emoji: '🫒', color: ['#00b894', '#00a085'], category: 'Gordura' };
    }
    if (foodName.includes('castanha') || foodName.includes('amêndoa') || foodName.includes('nozes')) {
      return { emoji: '🥜', color: ['#fdcb6e', '#e17055'], category: 'Gordura' };
    }
    if (foodName.includes('abacate')) {
      return { emoji: '🥑', color: ['#00b894', '#00a085'], category: 'Gordura' };
    }
    if (foodName.includes('manteiga')) {
      return { emoji: '🧈', color: ['#fdcb6e', '#f39c12'], category: 'Gordura' };
    }

    // Vegetais e Verduras
    if (foodName.includes('brócolis')) {
      return { emoji: '🥦', color: ['#00b894', '#00a085'], category: 'Vegetal' };
    }
    if (foodName.includes('alface')) {
      return { emoji: '🥬', color: ['#55a3ff', '#2e86de'], category: 'Vegetal' };
    }
    if (foodName.includes('tomate')) {
      return { emoji: '🍅', color: ['#ff6b6b', '#ee5a52'], category: 'Vegetal' };
    }
    if (foodName.includes('cenoura')) {
      return { emoji: '🥕', color: ['#ff7675', '#d63031'], category: 'Vegetal' };
    }
    if (foodName.includes('cebola')) {
      return { emoji: '🧅', color: ['#a29bfe', '#6c5ce7'], category: 'Vegetal' };
    }
    if (foodName.includes('pepino')) {
      return { emoji: '🥒', color: ['#00b894', '#00a085'], category: 'Vegetal' };
    }

    // Outros
    if (foodName.includes('água')) {
      return { emoji: '💧', color: ['#74b9ff', '#0984e3'], category: 'Hidratação' };
    }
    if (foodName.includes('café')) {
      return { emoji: '☕', color: ['#6c5ce7', '#5f3dc4'], category: 'Bebida' };
    }

    // Padrão
    return { emoji: '🍽️', color: ['#a29bfe', '#6c5ce7'], category: 'Alimento' };
  };

  // Calcular calorias aproximadas por alimento
  const getApproxCalories = (alimento) => {
    const caloriesPer100g = {
      'frango': 165, 'galinha': 165,
      'carne': 250, 'boi': 250,
      'peixe': 120, 'salmão': 208, 'tilápia': 96,
      'ovo': 155,
      'queijo': 300,
      'leite': 60, 'iogurte': 80,
      'arroz': 130,
      'batata': 77, 'batata doce': 86,
      'pão': 265,
      'massa': 131, 'macarrão': 131,
      'aveia': 389,
      'banana': 89,
      'maçã': 52,
      'azeite': 884, 'óleo': 884,
      'castanha': 656, 'amêndoa': 579,
      'abacate': 160,
      'brócolis': 34,
      'alface': 15,
      'tomate': 18,
      'cenoura': 41
    };
    
    const foodName = alimento.nome.toLowerCase();
    let calories = 100;
    
    for (const [key, value] of Object.entries(caloriesPer100g)) {
      if (foodName.includes(key)) {
        calories = value;
        break;
      }
    }
    
    return Math.round((calories * alimento.quantidade) / 100);
  };

  // Função para obter ícone do horário da refeição
  const getMealIcon = (nome) => {
    const mealName = nome.toLowerCase();
    if (mealName.includes('café') || mealName.includes('manhã')) return '🌅';
    if (mealName.includes('almoço') || mealName.includes('meio-dia')) return '☀️';
    if (mealName.includes('lanche') || mealName.includes('tarde')) return '🌤️';
    if (mealName.includes('jantar') || mealName.includes('noite')) return '🌙';
    if (mealName.includes('ceia')) return '🌃';
    return '🍽️';
  };

  return (
    <Card 
      sx={{ 
        mb: 3, 
        borderRadius: 4,
        overflow: 'hidden',
        background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
        boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
        border: '1px solid rgba(255,255,255,0.2)',
        backdropFilter: 'blur(10px)',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)'
        }
      }}
    >
      {/* Header da refeição */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          p: 3,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            right: 0,
            width: '100px',
            height: '100px',
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
            borderRadius: '50%',
            transform: 'translate(30px, -30px)'
          }
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", flex: 1 }}>
            <Box
              sx={{
                fontSize: '2rem',
                mr: 2,
                p: 1,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(10px)'
              }}
            >
              {getMealIcon(refeicao.nome)}
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: "700", mb: 0.5 }}>
                {refeicao.nome}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {refeicao.alimentos.length} alimentos • {refeicao.alimentos.reduce((sum, alimento) => sum + alimento.quantidade, 0)}g total
              </Typography>
            </Box>
          </Box>
          <Chip
            label={`${Math.round(refeicao.macros.calorias)} kcal`}
            sx={{ 
              backgroundColor: 'rgba(255,255,255,0.25)', 
              color: 'white',
              fontWeight: 'bold',
              fontSize: '1rem',
              height: 40,
              backdropFilter: 'blur(10px)'
            }}
          />
        </Box>
      </Box>

      <Box sx={{ p: 3 }}>
        {/* Macros com visual glassmorphism */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={4}>
            <Card sx={{ 
              textAlign: 'center', 
              background: 'linear-gradient(135deg, rgba(255, 107, 107, 0.8), rgba(255, 142, 83, 0.8))',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 107, 107, 0.3)',
              borderRadius: 3,
              color: 'white',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: '-50%',
                left: '-50%',
                width: '200%',
                height: '200%',
                background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 50%)',
                animation: 'shimmer 3s infinite'
              }
            }}>
              <CardContent sx={{ py: 2 }}>
                <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                  💪 Proteínas
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: "800" }}>
                  {Math.round(refeicao.macros.proteina)}g
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={4}>
            <Card sx={{ 
              textAlign: 'center', 
              background: 'linear-gradient(135deg, rgba(78, 205, 196, 0.8), rgba(110, 229, 219, 0.8))',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(78, 205, 196, 0.3)',
              borderRadius: 3,
              color: 'white',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <CardContent sx={{ py: 2 }}>
                <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                  ⚡ Carboidratos
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: "800" }}>
                  {Math.round(refeicao.macros.carbo)}g
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={4}>
            <Card sx={{ 
              textAlign: 'center', 
              background: 'linear-gradient(135deg, rgba(255, 230, 109, 0.8), rgba(255, 248, 158, 0.8))',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 230, 109, 0.3)',
              borderRadius: 3,
              color: '#333'
            }}>
              <CardContent sx={{ py: 2 }}>
                <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>
                  🥑 Gorduras
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: "800" }}>
                  {Math.round(refeicao.macros.gordura)}g
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Ações com visual moderno */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Stack direction="row" spacing={1}>
            <Tooltip title="Editar refeição" arrow>
              <IconButton 
                onClick={() => onEdit(refeicao.id)}
                sx={{ 
                  background: 'linear-gradient(45deg, #9c27b0, #e91e63)',
                  color: 'white',
                  '&:hover': { transform: 'scale(1.1)' },
                  transition: 'all 0.2s'
                }}
              >
                <EditIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Duplicar refeição" arrow>
              <IconButton 
                onClick={() => onDuplicate(refeicao.id)}
                sx={{ 
                  background: 'linear-gradient(45deg, #2196f3, #21cbf3)',
                  color: 'white',
                  '&:hover': { transform: 'scale(1.1)' },
                  transition: 'all 0.2s'
                }}
              >
                <ContentCopyIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Excluir refeição" arrow>
              <IconButton 
                onClick={() => onDelete(refeicao.id)}
                sx={{ 
                  background: 'linear-gradient(45deg, #f44336, #e57373)',
                  color: 'white',
                  '&:hover': { transform: 'scale(1.1)' },
                  transition: 'all 0.2s'
                }}
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Stack>

          <Stack direction="row" spacing={1}>
            <Tooltip title="Mover para cima" arrow>
              <IconButton 
                onClick={() => onMoveUp(refeicao.id)}
                sx={{ 
                  background: 'linear-gradient(45deg, #4caf50, #66bb6a)',
                  color: 'white',
                  '&:hover': { transform: 'translateY(-2px)' },
                  transition: 'all 0.2s'
                }}
              >
                <ArrowUpwardIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Mover para baixo" arrow>
              <IconButton 
                onClick={() => onMoveDown(refeicao.id)}
                sx={{ 
                  background: 'linear-gradient(45deg, #ff9800, #ffb74d)',
                  color: 'white',
                  '&:hover': { transform: 'translateY(2px)' },
                  transition: 'all 0.2s'
                }}
              >
                <ArrowDownwardIcon />
              </IconButton>
            </Tooltip>
            {showMoveOptions && (
              <Tooltip title="Mais opções" arrow>
                <IconButton 
                  onClick={handleMenuClick}
                  sx={{ 
                    background: 'linear-gradient(45deg, #607d8b, #90a4ae)',
                    color: 'white',
                    '&:hover': { transform: 'scale(1.1)' },
                    transition: 'all 0.2s'
                  }}
                >
                  <MoreVertIcon />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        </Box>

        <Divider sx={{ mb: 4, opacity: 0.1 }} />
        
        {/* Seção de alimentos super moderna */}
        <Typography 
          variant="h5" 
          sx={{ 
            mb: 3, 
            fontWeight: '800',
            background: 'linear-gradient(45deg, #667eea, #764ba2)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textAlign: 'center'
          }}
        >
          🍽️ Composição da Refeição
        </Typography>
        
        <Grid container spacing={3}>
          {refeicao.alimentos.map((alimento, index) => {
            const foodData = getFoodData(alimento.nome);
            const calories = getApproxCalories(alimento);
            
            return (
              <Grid item xs={12} sm={6} lg={4} key={alimento.id}>
                <Card 
                  sx={{ 
                    height: '100%',
                    background: `linear-gradient(135deg, ${foodData.color[0]}20, ${foodData.color[1]}30)`,
                    border: `2px solid ${foodData.color[0]}40`,
                    borderRadius: 4,
                    position: 'relative',
                    overflow: 'hidden',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      transform: 'translateY(-8px) scale(1.02)',
                      boxShadow: `0 20px 40px ${foodData.color[0]}30`,
                      border: `2px solid ${foodData.color[0]}80`
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      width: '60px',
                      height: '60px',
                      background: `radial-gradient(circle, ${foodData.color[0]}20 0%, transparent 70%)`,
                      borderRadius: '50%',
                      transform: 'translate(20px, -20px)'
                    }
                  }}
                >
                  <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Box
                        sx={{
                          fontSize: '2.5rem',
                          mr: 2,
                          p: 1,
                          borderRadius: '50%',
                          background: `linear-gradient(135deg, ${foodData.color[0]}, ${foodData.color[1]})`,
                          boxShadow: `0 8px 16px ${foodData.color[0]}40`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 56,
                          height: 56
                        }}
                      >
                        {foodData.emoji}
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            fontWeight: '700',
                            fontSize: '1.1rem',
                            mb: 0.5,
                            color: 'text.primary'
                          }}
                        >
                          {alimento.nome}
                        </Typography>
                        <Chip 
                          label={foodData.category}
                          size="small"
                          sx={{ 
                            background: `linear-gradient(45deg, ${foodData.color[0]}, ${foodData.color[1]})`,
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '0.7rem'
                          }}
                        />
                      </Box>
                    </Box>
                    
                    <Stack spacing={2}>
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        p: 2,
                        borderRadius: 2,
                        background: 'rgba(255,255,255,0.7)',
                        backdropFilter: 'blur(10px)'
                      }}>
                        <Typography variant="body2" sx={{ fontWeight: '600', color: 'text.secondary' }}>
                          ⚖️ Quantidade:
                        </Typography>
                        <Badge 
                          badgeContent="g" 
                          color="primary"
                          sx={{
                            '& .MuiBadge-badge': {
                              background: `linear-gradient(45deg, ${foodData.color[0]}, ${foodData.color[1]})`,
                              color: 'white'
                            }
                          }}
                        >
                          <Typography variant="h6" sx={{ fontWeight: 'bold', mr: 1 }}>
                            {alimento.quantidade}
                          </Typography>
                        </Badge>
                      </Box>
                      
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        p: 2,
                        borderRadius: 2,
                        background: 'rgba(255,255,255,0.7)',
                        backdropFilter: 'blur(10px)'
                      }}>
                        <Typography variant="body2" sx={{ fontWeight: '600', color: 'text.secondary' }}>
                          🔥 Calorias:
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: foodData.color[0] }}>
                          ~{calories} kcal
                        </Typography>
                      </Box>
                      
                      {/* Barra de progresso moderna */}
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="caption" sx={{ fontWeight: '600', color: 'text.secondary', mb: 1, display: 'block' }}>
                          📊 Porção relativa
                        </Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={Math.min((alimento.quantidade / 200) * 100, 100)}
                          sx={{ 
                            height: 8,
                            borderRadius: 4,
                            background: 'rgba(0,0,0,0.1)',
                            '& .MuiLinearProgress-bar': {
                              background: `linear-gradient(90deg, ${foodData.color[0]}, ${foodData.color[1]})`,
                              borderRadius: 4,
                              boxShadow: `0 2px 4px ${foodData.color[0]}40`
                            }
                          }}
                        />
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {/* Resumo moderno da refeição */}
        <Box sx={{ 
          mt: 4, 
          p: 3, 
          background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))',
          borderRadius: 4,
          border: '1px solid rgba(102, 126, 234, 0.2)',
          backdropFilter: 'blur(10px)'
        }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: '700', color: 'text.primary' }}>
            📈 Resumo Nutricional
          </Typography>
          <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
            <Chip 
              icon={<Box sx={{ fontSize: '1.2rem' }}>🍽️</Box>}
              label={`${refeicao.alimentos.length} alimentos`}
              variant="outlined"
              sx={{ 
                fontWeight: 'bold',
                background: 'rgba(255,255,255,0.8)',
                backdropFilter: 'blur(10px)'
              }}
            />
            <Chip 
              icon={<Box sx={{ fontSize: '1.2rem' }}>⚖️</Box>}
              label={`${refeicao.alimentos.reduce((sum, alimento) => sum + alimento.quantidade, 0)}g total`}
              variant="outlined"
              sx={{ 
                fontWeight: 'bold',
                background: 'rgba(255,255,255,0.8)',
                backdropFilter: 'blur(10px)'
              }}
            />
            <Chip 
              icon={<Box sx={{ fontSize: '1.2rem' }}>🔥</Box>}
              label={`~${refeicao.alimentos.reduce((sum, alimento) => sum + getApproxCalories(alimento), 0)} kcal`}
              variant="outlined"
              sx={{ 
                fontWeight: 'bold',
                background: 'rgba(255,255,255,0.8)',
                backdropFilter: 'blur(10px)'
              }}
            />
          </Stack>
        </Box>

        {/* Menu de opções */}
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleMenuClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          PaperProps={{
            sx: {
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: 2
            }
          }}
        >
          <MenuItem onClick={() => handleAction(() => onMoveBetweenDays(refeicao))}>
            <ListItemIcon>
              <SwapHorizIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Mover para outro dia</ListItemText>
          </MenuItem>
        </Menu>
      </Box>
    </Card>
  );
};