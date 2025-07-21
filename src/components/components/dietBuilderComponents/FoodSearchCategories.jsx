// components/FoodSearchCategories.jsx
import React from 'react';
import { 
  Box, 
  Typography, 
  Chip, 
  Alert, 
  TextField, 
  InputAdornment, 
  IconButton,
  CircularProgress 
} from "@mui/material";
import CategoryIcon from "@mui/icons-material/Category";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";

export const FoodSearchCategories = ({ 
  searchTerm,
  setSearchTerm,
  categorias, 
  selectedCategory, 
  loading,
  onCategorySelect,
  onClearSearch
}) => (
  <Box sx={{ mb: 3 }}>
    {/* Campo de busca por texto */}
    <Box sx={{ mb: 3 }}>
      <Typography variant="subtitle2" sx={{ mb: 2, display: "flex", alignItems: "center" }}>
        <SearchIcon sx={{ mr: 1 }} />
        Buscar alimentos por nome:
      </Typography>
      <TextField
        fullWidth
        placeholder="Digite o nome do alimento (ex: frango, arroz, brócolis...)"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        variant="outlined"
        size="medium"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              {loading && <CircularProgress size={20} />}
              {(searchTerm || selectedCategory) && (
                <IconButton
                  size="small"
                  onClick={onClearSearch}
                  title="Limpar busca"
                >
                  <ClearIcon />
                </IconButton>
              )}
            </InputAdornment>
          ),
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            '&:hover fieldset': {
              borderColor: 'primary.main',
            },
          },
        }}
      />
      {searchTerm.length > 0 && searchTerm.length <= 2 && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
          Digite pelo menos 3 caracteres para buscar
        </Typography>
      )}
    </Box>

    {/* Divisor visual */}
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
      <Box sx={{ flexGrow: 1, height: 1, backgroundColor: 'divider' }} />
      <Typography variant="body2" sx={{ mx: 2, color: 'text.secondary' }}>
        OU
      </Typography>
      <Box sx={{ flexGrow: 1, height: 1, backgroundColor: 'divider' }} />
    </Box>

    {/* Busca por categoria */}
    <Typography
      variant="subtitle2"
      sx={{ mb: 2, display: "flex", alignItems: "center" }}
    >
      <CategoryIcon sx={{ mr: 1 }} />
      Buscar por categoria:
    </Typography>
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
      {Object.keys(categorias).map((categoria) => (
        <Chip
          key={categoria}
          label={categoria.charAt(0).toUpperCase() + categoria.slice(1)}
          onClick={() => onCategorySelect(categoria)}
          color={selectedCategory === categoria ? "primary" : "default"}
          variant={selectedCategory === categoria ? "filled" : "outlined"}
          size="small"
          sx={{
            '&:hover': {
              backgroundColor: selectedCategory === categoria ? 'primary.dark' : 'action.hover',
            },
          }}
        />
      ))}
    </Box>
    
    {/* Alertas informativos */}
    {selectedCategory && (
      <Alert severity="info" sx={{ mt: 2 }}>
        Mostrando alimentos da categoria: <strong>{selectedCategory}</strong>
      </Alert>
    )}
    
    {searchTerm.length > 2 && (
      <Alert severity="success" sx={{ mt: 2 }}>
        Buscando por: <strong>"{searchTerm}"</strong>
      </Alert>
    )}
  </Box>
);