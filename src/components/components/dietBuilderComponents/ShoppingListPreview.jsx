import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Chip,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import InfoIcon from '@mui/icons-material/Info';
import ShareIcon from '@mui/icons-material/Share';
import { gerarListaComprasInteligente, gerarDicasCompra } from './utils/shoppingListUtils';

const ShoppingListPreview = ({ refeicoes, onClose }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [expandedItem, setExpandedItem] = useState(false);

  if (!refeicoes || refeicoes.length === 0) {
    return (
      <Alert severity="info" sx={{ m: 2 }}>
        Adicione refeições ao seu plano para ver a lista de compras.
      </Alert>
    );
  }

  const listaCompras = gerarListaComprasInteligente(refeicoes);
  const dicas = gerarDicasCompra(listaCompras);
  const pesoTotal = listaCompras.reduce((acc, item) => acc + item.quantidadeGramas, 0);
  const itensComConversao = listaCompras.filter(item => item.temConversoes);

  const handleExpandItem = (itemNome) => {
    setExpandedItem(expandedItem === itemNome ? false : itemNome);
  };

  const gerarTextoCompartilhamento = () => {
    let texto = "🛒 LISTA DE COMPRAS - DIETA PERSONALIZADA\\n\\n";
    
    listaCompras.forEach((item, index) => {
      texto += `${index + 1}. ${item.nome} - ${item.quantidadeExibicao}`;
      if (item.temConversoes) {
        texto += " (ajustado)";
      }
      texto += "\\n";
    });
    
    texto += `\\n📊 RESUMO:\\n`;
    texto += `• ${listaCompras.length} itens diferentes\\n`;
    texto += `• Peso total: ${(pesoTotal / 1000).toFixed(1)}kg\\n`;
    if (itensComConversao.length > 0) {
      texto += `• ${itensComConversao.length} itens com ajuste para preparo\\n`;
    }
    
    if (dicas.length > 0) {
      texto += "\\n💡 DICAS:\\n";
      dicas.forEach(dica => {
        texto += `• ${dica.replace(/🍖|🛒|⚖️/g, '')}\\n`;
      });
    }
    
    return texto;
  };

  const compartilharLista = () => {
    const texto = gerarTextoCompartilhamento();
    
    if (navigator.share) {
      navigator.share({
        title: 'Lista de Compras - Dieta Personalizada',
        text: texto
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(texto).then(() => {
        alert('Lista copiada para a área de transferência!');
      }).catch(() => {
        setOpenDialog(true);
      });
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: 2 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <ShoppingCartIcon sx={{ color: 'primary.main', mr: 1 }} />
          <Typography variant="h5" component="h2" sx={{ flexGrow: 1 }}>
            Lista de Compras Inteligente
          </Typography>
          <Tooltip title="Compartilhar lista">
            <IconButton onClick={compartilharLista} color="primary">
              <ShareIcon />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Resumo */}
        <Box sx={{ 
          bgcolor: 'primary.50', 
          p: 2, 
          borderRadius: 1, 
          mb: 2,
          border: '1px solid',
          borderColor: 'primary.200'
        }}>
          <Typography variant="h6" sx={{ color: 'primary.main', mb: 1 }}>
            📊 Resumo
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            <Chip 
              label={`${listaCompras.length} itens`} 
              color="primary" 
              size="small" 
            />
            <Chip 
              label={`${(pesoTotal / 1000).toFixed(1)}kg total`} 
              color="secondary" 
              size="small" 
            />
            {itensComConversao.length > 0 && (
              <Chip 
                label={`${itensComConversao.length} com ajuste`} 
                color="warning" 
                size="small" 
              />
            )}
          </Box>
        </Box>

        {/* Dicas */}
        {dicas.length > 0 && (
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>💡 Dicas de Compra:</Typography>
            {dicas.map((dica, index) => (
              <Typography key={index} variant="body2" sx={{ mb: 0.5 }}>
                • {dica.replace(/🍖|🛒|⚖️/g, '')}
              </Typography>
            ))}
          </Alert>
        )}

        {/* Lista de Itens */}
        <Typography variant="h6" sx={{ mb: 2, color: 'text.primary' }}>
          🛍️ Itens para Comprar
        </Typography>
        
        <List>
          {listaCompras.map((item, index) => (
            <React.Fragment key={item.nome}>
              <ListItem 
                sx={{ 
                  bgcolor: index % 2 === 0 ? 'grey.50' : 'transparent',
                  borderRadius: 1,
                  mb: 0.5
                }}
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {item.nome}
                      </Typography>
                      {item.temConversoes && (
                        <Tooltip title="Quantidade ajustada considerando perdas no preparo">
                          <Chip 
                            label="ajustado" 
                            size="small" 
                            color="warning" 
                            variant="outlined"
                          />
                        </Tooltip>
                      )}
                    </Box>
                  }
                  secondary={
                    <Box sx={{ mt: 0.5 }}>
                      <Typography variant="h6" color="primary" sx={{ display: 'inline', mr: 2 }}>
                        {item.quantidadeExibicao}
                      </Typography>
                      {item.preparos.filter(p => p !== 'natural' && p !== 'cru').length > 0 && (
                        <Typography variant="body2" color="text.secondary" sx={{ display: 'inline' }}>
                          Preparos: {item.preparos.filter(p => p !== 'natural' && p !== 'cru').join(', ')}
                        </Typography>
                      )}
                    </Box>
                  }
                />
                
                {item.detalhes.length > 1 && (
                  <IconButton 
                    onClick={() => handleExpandItem(item.nome)}
                    color="primary"
                    size="small"
                  >
                    <InfoIcon />
                  </IconButton>
                )}
              </ListItem>

              {/* Detalhes expandidos */}
              {expandedItem === item.nome && item.detalhes.length > 1 && (
                <Box sx={{ ml: 4, mb: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, color: 'primary.main' }}>
                    Detalhes do uso:
                  </Typography>
                  {item.detalhes.map((detalhe, detIndex) => (
                    <Typography key={detIndex} variant="body2" sx={{ mb: 0.5 }}>
                      • {detalhe.refeicao}: {detalhe.quantidadeConsumida}g 
                      {detalhe.preparo !== 'natural' && ` (${detalhe.preparo})`}
                      {detalhe.quantidadeCompra !== detalhe.quantidadeConsumida && 
                        ` → comprar: ${Math.ceil(detalhe.quantidadeCompra)}g`
                      }
                    </Typography>
                  ))}
                </Box>
              )}

              {index < listaCompras.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>

        {/* Rodapé */}
        <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Typography variant="body2" color="text.secondary" align="center">
            ⚠️ As quantidades são calculadas considerando perdas no preparo e diferentes formas de medida.
            Sempre compre um pouco a mais para garantir.
          </Typography>
        </Box>
      </Paper>

      {/* Dialog para compartilhamento manual */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Lista de Compras</DialogTitle>
        <DialogContent>
          <Typography variant="body2" component="pre" sx={{ 
            whiteSpace: 'pre-wrap', 
            fontFamily: 'monospace',
            fontSize: '0.875rem',
            bgcolor: 'grey.100',
            p: 2,
            borderRadius: 1,
            maxHeight: 400,
            overflow: 'auto'
          }}>
            {gerarTextoCompartilhamento()}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Fechar</Button>
          <Button 
            onClick={() => {
              navigator.clipboard.writeText(gerarTextoCompartilhamento());
              setOpenDialog(false);
              alert('Lista copiada!');
            }}
            variant="contained"
          >
            Copiar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ShoppingListPreview;
