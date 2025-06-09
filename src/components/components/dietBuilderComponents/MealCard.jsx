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
  Card,
  CardContent,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ScheduleIcon from "@mui/icons-material/Schedule";
import DeleteIcon from "@mui/icons-material/Delete";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import EditIcon from "@mui/icons-material/Edit";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import GrainIcon from "@mui/icons-material/Grain";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import {
  calcularNutrientes,
  gerarUnidadesDisponiveis,
  converterParaGramas,
} from "./utils/nutrientCalculator";

// Função para obter emoji baseado no nome do alimento
const getFoodEmoji = (foodName) => {
  const name = foodName.toLowerCase();

  // Carnes e proteínas
  if (name.includes("frango") || name.includes("peito")) return "🐔";
  if (name.includes("carne") || name.includes("boi")) return "🥩";
  if (
    name.includes("peixe") ||
    name.includes("salmão") ||
    name.includes("atum")
  )
    return "🐟";
  if (name.includes("ovo")) return "🥚";
  if (name.includes("queijo")) return "🧀";
  if (name.includes("leite")) return "🥛";
  if (name.includes("iogurte")) return "🥛";

  // Carboidratos
  if (name.includes("arroz")) return "🍚";
  if (name.includes("batata")) return "🥔";
  if (name.includes("pão") || name.includes("pãozinho")) return "🍞";
  if (name.includes("macarrão") || name.includes("massa")) return "🍝";
  if (name.includes("aveia")) return "🌾";
  if (name.includes("banana")) return "🍌";
  if (name.includes("maçã")) return "🍎";

  // Vegetais
  if (name.includes("brócolis")) return "🥦";
  if (name.includes("cenoura")) return "🥕";
  if (name.includes("tomate")) return "🍅";
  if (name.includes("alface")) return "🥬";
  if (name.includes("cebola")) return "🧅";

  // Gorduras
  if (name.includes("azeite") || name.includes("óleo")) return "🫒";
  if (name.includes("abacate")) return "🥑";
  if (name.includes("castanha") || name.includes("amendoim")) return "🥜";

  // Frutas
  if (name.includes("laranja")) return "🍊";
  if (name.includes("uva")) return "🍇";
  if (name.includes("morango")) return "🍓";
  if (name.includes("pêra")) return "🍐";
  if (name.includes("manga")) return "🥭";

  // Default
  return "🍽️";
};

// Função para formatar a quantidade do alimento corretamente
// Atualize a função formatarQuantidadeAlimento
const formatarQuantidadeAlimento = (alimento) => {
  const unidade = alimento.unidade || "gramas";

  if (unidade === "gramas") {
    return `📏 ${alimento.quantidade}g`;
  }

  const unidadesDisponiveis = gerarUnidadesDisponiveis(alimento);
  const unidadeInfo = unidadesDisponiveis.find((u) => u.tipo === unidade);
  const gramas = converterParaGramas(
    alimento.quantidade,
    unidade,
    unidadesDisponiveis
  );

  return unidadeInfo
    ? `📏 ${
        alimento.quantidade
      } ${unidadeInfo.label.toLowerCase()} (≈${gramas}g)`
    : `📏 ${alimento.quantidade} ${unidade} (≈${gramas}g)`;
};

// FUNÇÃO CORRIGIDA - Recalcula os macros considerando as unidades corretas
const recalcularMacrosRefeicao = (alimentos) => {
  if (!alimentos || alimentos.length === 0) {
    return { calorias: 0, proteina: 0, carbo: 0, gordura: 0 };
  }

  return alimentos.reduce(
    (acc, alimento) => {
      // Gerar unidades disponíveis para cada alimento
      const unidadesDisponiveis = gerarUnidadesDisponiveis(alimento);

      // Usar a função calcularNutrientes que já considera as unidades corretamente
      const nutrientes = calcularNutrientes(
        alimento,
        alimento.quantidade,
        alimento.unidade || "gramas",
        unidadesDisponiveis
      );

      return {
        calorias: acc.calorias + nutrientes.calorias,
        proteina: acc.proteina + nutrientes.proteina,
        carbo: acc.carbo + nutrientes.carbo,
        gordura: acc.gordura + nutrientes.gordura,
      };
    },
    { calorias: 0, proteina: 0, carbo: 0, gordura: 0 }
  );
};

export const MealCard = ({
  refeicao,
  onDelete,
  onDuplicate,
  onEdit,
  onMoveUp,
  onMoveDown,
}) => {
  // Recalcular os macros para garantir que estão corretos COM as unidades
  const macrosRecalculados = recalcularMacrosRefeicao(refeicao.alimentos);

  return (
    <Card
      sx={{
        mb: 3,
        borderRadius: 3,
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        border: "1px solid rgba(255,255,255,0.1)",
        background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
        overflow: "hidden",
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
        },
      }}
    >
      <Accordion
        sx={{
          boxShadow: "none",
          background: "transparent",
          "&:before": { display: "none" },
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon sx={{ color: "#667eea" }} />}
          sx={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            borderRadius: 0,
            "& .MuiAccordionSummary-content": {
              margin: "16px 0",
            },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
            <ScheduleIcon sx={{ mr: 2, fontSize: 28 }} />
            <Typography
              variant="h6"
              sx={{ fontWeight: "600", flex: 1, fontSize: "1.1rem" }}
            >
              {refeicao.nome}
            </Typography>
            <Chip
              icon={
                <LocalFireDepartmentIcon color="white" sx={{ fontSize: 16 }} />
              }
              label={`${Math.round(macrosRecalculados.calorias)} kcal`}
              sx={{
                backgroundColor: "rgba(255,255,255,0.2)",
                color: "white",
                fontWeight: "bold",
                backdropFilter: "blur(10px)",
              }}
              size="medium"
            />
          </Box>
        </AccordionSummary>

        <AccordionDetails sx={{ p: 3 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: { xs: "center", md: "space-between" },
              gap: 2,
              flexWrap: "wrap",
            }}
          >
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={4}>
                <Box
                  sx={{
                    background:
                      "linear-gradient(135deg, #f12a2a 0%, #c72b23 100%)",
                    borderRadius: 2,
                    p: 2,
                    textAlign: "center",
                    color: "white",
                  }}
                >
                  <FitnessCenterIcon sx={{ fontSize: 24, mb: 1 }} />
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.5 }}>
                    Proteínas
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                    {Math.round(macrosRecalculados.proteina)}g
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Box
                  sx={{
                    background:
                      "linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)",
                    borderRadius: 2,
                    p: 2,
                    textAlign: "center",
                    color: "white",
                  }}
                >
                  <GrainIcon sx={{ fontSize: 24, mb: 1 }} />
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.5 }}>
                    Carboidratos
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                    {Math.round(macrosRecalculados.carbo)}g
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Box
                  sx={{
                    background:
                      "linear-gradient(135deg, #cc47ba 0%, #860d76 100%)",
                    borderRadius: 2,
                    p: 2,
                    textAlign: "center",
                    color: "white",
                  }}
                >
                  <WaterDropIcon sx={{ fontSize: 24, mb: 1 }} />
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.5 }}>
                    Gorduras
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                    {Math.round(macrosRecalculados.gordura)}g
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            {/* Action Buttons */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                gap: 1,
                mb: 3,
                flexWrap: "wrap",
              }}
            >
              <IconButton
                onClick={() => onEdit(refeicao.id)}
                sx={{
                  backgroundColor: "#667eea",
                  color: "white",
                  "&:hover": { backgroundColor: "#5a6fd8" },
                  borderRadius: 2,
                  display: "flex",
                  flexDirection: "column",
                  gap: 1,
                }}
              >
                <EditIcon />
                <Typography>Editar</Typography>
              </IconButton>
              <IconButton
                onClick={() => onDuplicate(refeicao.id)}
                sx={{
                  backgroundColor: "#4ecdc4",
                  color: "white",
                  "&:hover": { backgroundColor: "#44a08d" },
                  borderRadius: 2,
                  display: "flex",
                  flexDirection: "column",
                  gap: 1,
                }}
              >
                <ContentCopyIcon />
                <Typography>Duplicar</Typography>
              </IconButton>
              <IconButton
                onClick={() => onDelete(refeicao.id)}
                sx={{
                  backgroundColor: "#ff6b6b",
                  color: "white",
                  "&:hover": { backgroundColor: "#ee5a52" },
                  borderRadius: 2,
                  display: "flex",
                  flexDirection: "column",
                  gap: 1,
                }}
              >
                <DeleteIcon />
                <Typography>Deletar</Typography>
              </IconButton>
              <IconButton
                onClick={() => onMoveUp(refeicao.id)}
                sx={{
                  backgroundColor: "#95a5a6",
                  color: "white",
                  "&:hover": { backgroundColor: "#7f8c8d" },
                  borderRadius: 2,
                  display: "flex",
                  flexDirection: "column",
                  gap: 1,
                }}
              >
                <ArrowUpwardIcon />
                <Typography>Subir</Typography>
              </IconButton>
              <IconButton
                onClick={() => onMoveDown(refeicao.id)}
                sx={{
                  backgroundColor: "#95a5a6",
                  color: "white",
                  "&:hover": { backgroundColor: "#7f8c8d" },
                  borderRadius: 2,
                  display: "flex",
                  flexDirection: "column",
                  gap: 1,
                }}
              >
                <ArrowDownwardIcon />
                <Typography>Descer</Typography>
              </IconButton>
            </Box>
          </Box>

          <Divider
            sx={{
              mb: 3,
              background:
                "linear-gradient(90deg, transparent, #667eea, transparent)",
              height: 2,
              border: "none",
            }}
          />

          {/* Foods List */}
          <Box>
            <Typography
              variant="h6"
              sx={{
                mb: 2,
                color: "#2c3e50",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              🍽️ Alimentos Selecionados
            </Typography>

            <Grid container spacing={2}>
              {refeicao.alimentos.map((alimento) => (
                <Grid item xs={12} sm={6} md={4} key={alimento.id}>
                  <Box
                    sx={{
                      background:
                        "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
                      borderRadius: 2,
                      p: 2,
                      border: "1px solid #dee2e6",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        transform: "scale(1.02)",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      },
                    }}
                  >
                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight: 500,
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        color: "#2c3e50",
                      }}
                    >
                      <span style={{ fontSize: "1.2em" }}>
                        {getFoodEmoji(alimento.nome)}
                      </span>
                      {alimento.nome}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#6c757d",
                        fontWeight: 500,
                        mt: 0.5,
                      }}
                    >
                      {formatarQuantidadeAlimento(alimento)}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        </AccordionDetails>
      </Accordion>
    </Card>
  );
};
