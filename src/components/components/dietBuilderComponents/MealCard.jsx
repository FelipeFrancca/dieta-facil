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
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ScheduleIcon from "@mui/icons-material/Schedule";
import DeleteIcon from "@mui/icons-material/Delete";

export const MealCard = ({ refeicao, onDelete }) => {
  return (
    <Accordion sx={{ mb: 2 }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
          <ScheduleIcon sx={{ mr: 2, color: "#667eea" }} />
          <Typography variant="h6" sx={{ fontWeight: "bold", flex: 1 }}>
            {refeicao.nome}
          </Typography>
          <Chip
            label={`${Math.round(refeicao.macros.calorias)} kcal`}
            color="primary"
            size="small"
          />
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={3}>
            <Typography variant="body2" color="textSecondary">
              Proteínas
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: "bold" }}>
              {Math.round(refeicao.macros.proteina)}g
            </Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography variant="body2" color="textSecondary">
              Carboidratos
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: "bold" }}>
              {Math.round(refeicao.macros.carbo)}g
            </Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography variant="body2" color="textSecondary">
              Gorduras
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: "bold" }}>
              {Math.round(refeicao.macros.gordura)}g
            </Typography>
          </Grid>
          <Grid item xs={3}>
            <IconButton color="error" onClick={() => onDelete(refeicao.id)}>
              <DeleteIcon />
            </IconButton>
          </Grid>
        </Grid>
        <Divider sx={{ mb: 2 }} />
        <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1 }}>
          Alimentos:
        </Typography>
        {refeicao.alimentos.map((alimento) => (
          <Typography key={alimento.id} variant="body2" sx={{ ml: 2 }}>
            • {alimento.nome} - {alimento.quantidade}g
          </Typography>
        ))}
      </AccordionDetails>
    </Accordion>
  );
};