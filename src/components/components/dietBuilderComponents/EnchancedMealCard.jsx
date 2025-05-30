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
  ListItemText
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
        </Grid>

        {/* Ações básicas */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton color="secondary" size="small" onClick={() => onEdit(refeicao.id)}>
              <EditIcon />
            </IconButton>
            <IconButton color="primary" size="small" onClick={() => onDuplicate(refeicao.id)}>
              <ContentCopyIcon />
            </IconButton>
            <IconButton color="error" size="small" onClick={() => onDelete(refeicao.id)}>
              <DeleteIcon />
            </IconButton>
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton size="small" onClick={() => onMoveUp(refeicao.id)} color="inherit">
              <ArrowUpwardIcon />
            </IconButton>
            <IconButton size="small" onClick={() => onMoveDown(refeicao.id)} color="inherit">
              <ArrowDownwardIcon />
            </IconButton>
            {showMoveOptions && (
              <IconButton size="small" onClick={handleMenuClick} color="inherit">
                <MoreVertIcon />
              </IconButton>
            )}
          </Box>
        </Box>

        <Divider sx={{ mb: 2 }} />
        
        <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1 }}>
          Alimentos:
        </Typography>
        {refeicao.alimentos.map((alimento) => (
          <Typography key={alimento.id} variant="body2" sx={{ ml: 2 }}>
            • {alimento.nome} - {alimento.quantidade}g
          </Typography>
        ))}

        {/* Menu de opções avançadas */}
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
        >
          <MenuItem onClick={() => handleAction(() => onMoveBetweenDays(refeicao))}>
            <ListItemIcon>
              <SwapHorizIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Mover para outro dia</ListItemText>
          </MenuItem>
        </Menu>
      </AccordionDetails>
    </Accordion>
  );
};