import { Box, Typography, Chip, Button } from "@mui/material";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import AddIcon from "@mui/icons-material/Add";
import GetAppIcon from "@mui/icons-material/GetApp";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";

export const DietBuilderHeader = ({
  calorias,
  refeicoes = [],
  onNewMeal,
  onGeneratePDF,
  pdfGenerating,
  semanal = false,
  totalDia,
  totalSemana,
  onGerarPDF,
  onViewShoppingList,
}) => {
  // Para modo semanal, usar props específicas
  const handleGeneratePDF = semanal ? onGerarPDF : onGeneratePDF;
  const hasContent = semanal 
    ? (totalSemana && totalSemana.calorias > 0)
    : (refeicoes && refeicoes.length > 0);

  return (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: 2,
      mb: 3,
    }}
  >
    <Box sx={{ display: "flex", alignItems: "center", flex: 1, minWidth: 0 }}>
      <RestaurantIcon sx={{ mr: 2, color: "#667eea", flexShrink: 0 }} />
      <Typography variant="h5" sx={{ fontWeight: "bold", mr: 2, minWidth: 0, textAlign: 'center' }}>
        {semanal ? "Planejamento Semanal" : "Agora vamos construir sua dieta!"}
      </Typography>
      {calorias && (
        <Chip
          label={`Meta: ${calorias} kcal`}
          color="primary"
          sx={{ flexShrink: 0 }}
        />
      )}
      {semanal && totalDia && totalDia.calorias > 0 && (
        <Chip
          label={`Hoje: ${Math.round(totalDia.calorias)} kcal`}
          color="secondary"
          sx={{ flexShrink: 0, ml: 1 }}
        />
      )}
    </Box>
    <Box sx={{ display: "flex", gap: 2, flexShrink: 0 }}>
      <Button variant="outlined" startIcon={<AddIcon />} onClick={onNewMeal}>
        Nova Refeição
      </Button>
      {hasContent && onViewShoppingList && (
        <Button
          variant="outlined"
          startIcon={<ShoppingCartIcon />}
          onClick={onViewShoppingList}
          color="success"
        >
          Lista de Compras
        </Button>
      )}
      {hasContent && (
        <Button
          variant="contained"
          startIcon={<GetAppIcon />}
          onClick={handleGeneratePDF}
          disabled={pdfGenerating}
          sx={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          }}
        >
          {pdfGenerating ? "Gerando PDF..." : "Gerar PDF"}
        </Button>
      )}
    </Box>
  </Box>
);
};
