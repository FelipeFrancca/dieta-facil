import { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  Card,
  CardContent,
  Grid,
  Alert,
  CircularProgress,
  Tooltip,
  IconButton,
} from "@mui/material";
import CalculatorIcon from "@mui/icons-material/Calculate";
import InfoIcon from "@mui/icons-material/Info";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import EqualizerIcon from "@mui/icons-material/Equalizer";

import Swal from "sweetalert2";

export default function TMBForm({ onCalculate, calorias }) {
  const [values, setValues] = useState({
    idade: "",
    peso: "",
    altura: "",
    sexo: "masculino",
    atividade: 1.2,
    objetivo: "manter",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validateField = (name, value) => {
    const newErrors = { ...errors };

    switch (name) {
      case "idade":
        const idade = parseInt(value);
        if (!value || isNaN(idade)) {
          newErrors.idade = "Idade é obrigatória";
        } else if (idade < 10 || idade > 120) {
          newErrors.idade = "Idade deve estar entre 10 e 120 anos";
        } else {
          delete newErrors.idade;
        }
        break;

      case "peso":
        const peso = parseFloat(value);
        if (!value || isNaN(peso)) {
          newErrors.peso = "Peso é obrigatório";
        } else if (peso < 20 || peso > 300) {
          newErrors.peso = "Peso deve estar entre 20 e 300 kg";
        } else {
          delete newErrors.peso;
        }
        break;

      case "altura":
        const altura = parseFloat(value);
        if (!value || isNaN(altura)) {
          newErrors.altura = "Altura é obrigatória";
        } else if (altura < 100 || altura > 250) {
          newErrors.altura = "Altura deve estar entre 100 e 250 cm";
        } else {
          delete newErrors.altura;
        }
        break;

      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues({ ...values, [name]: value });

    if (name !== "sexo" && name !== "atividade" && name !== "objetivo") {
      validateField(name, value);
    }
  };

  const validateAllFields = () => {
    const { idade, peso, altura } = values;
    let isValid = true;

    isValid = validateField("idade", idade) && isValid;
    isValid = validateField("peso", peso) && isValid;
    isValid = validateField("altura", altura) && isValid;

    return isValid;
  };

  const getObjetivoInfo = (objetivo) => {
    const objetivos = {
      perder: {
        nome: "Perder Peso",
        descricao: "Déficit calórico de 500 calorias",
        ajuste: -500,
        icon: "🔥",
        color: "#e53e3e",
      },
      manter: {
        nome: "Manter Peso",
        descricao: "Calorias de manutenção",
        ajuste: 0,
        icon: "⚖️",
        color: "#3182ce",
      },
      ganhar: {
        nome: "Ganhar Peso",
        descricao: "Superávit calórico de 500 calorias",
        ajuste: 500,
        icon: "💪",
        color: "#38a169",
      },
    };
    return objetivos[objetivo];
  };

  const calcularTMB = async () => {
    if (!validateAllFields()) {
      await Swal.fire({
        title: "Campos inválidos!",
        text: "Por favor, corrija os erros nos campos destacados.",
        icon: "error",
        confirmButtonText: "Entendi",
        confirmButtonColor: "#667eea",
        customClass: {
          popup: "swal-popup-modern",
        },
      });
      return;
    }

    setLoading(true);
    const { idade, peso, altura, sexo, atividade, objetivo } = values;
    const p = parseFloat(peso),
      a = parseFloat(altura),
      i = parseInt(idade),
      act = parseFloat(atividade);

    let tmb =
      sexo === "masculino"
        ? 10 * p + 6.25 * a - 5 * i + 5
        : 10 * p + 6.25 * a - 5 * i - 161;

    const caloriasManter = Math.round(tmb * act);
    const objetivoInfo = getObjetivoInfo(objetivo);
    const caloriasFinais = caloriasManter + objetivoInfo.ajuste;

    setTimeout(async () => {
      setLoading(false);

      await Swal.fire({
        title: "Cálculo realizado com sucesso!",
        html: `
        <div style="text-align: center; padding: 20px;">
          <div style="font-size: 2rem; margin-bottom: 10px;">${
            objetivoInfo.icon
          }</div>
          <p style="font-size: 1.2rem; margin-bottom: 15px;">
            <strong>Objetivo:</strong> ${objetivoInfo.nome}
          </p>
          <div style="font-size: 2.5rem; font-weight: bold; color: ${
            objetivoInfo.color
          }; margin-bottom: 15px;">
            ${caloriasFinais} calorias/dia
          </div>
          <div style="background: linear-gradient(135deg, #f7fafc 0%, #e2e8f0 100%); padding: 15px; border-radius: 10px; margin-top: 20px;">
            <p style="font-size: 0.9rem; color: #4a5568; margin: 0;">
              <strong>TMB (Taxa Metabólica Basal):</strong> ${Math.round(
                tmb
              )} cal/dia<br>
              <strong>Calorias de manutenção:</strong> ${caloriasManter} cal/dia<br>
              <strong>Ajuste para objetivo:</strong> ${
                objetivoInfo.ajuste > 0 ? "+" : ""
              }${objetivoInfo.ajuste} cal/dia<br>
              <strong>Nível de atividade:</strong> ${act}x
            </p>
          </div>
        </div>
      `,
        icon: "success",
        confirmButtonText: "Ótimo!",
        confirmButtonColor: "#667eea",
        customClass: {
          popup: "swal-popup-modern",
        },
      });

      onCalculate &&
        onCalculate(caloriasFinais, {
          sexo,
          objetivo,
          idade: i,
          peso: p,
          altura: a,
          atividade: act,
          tmb: Math.round(tmb),
          caloriasManter,
        });
    }, 1000);
  };

  const showInfoTooltip = (field) => {
    const tooltips = {
      idade: "Digite sua idade em anos completos (entre 10 e 120 anos)",
      peso: "Digite seu peso atual em quilogramas (entre 20 e 300 kg)",
      altura: "Digite sua altura em centímetros (entre 100 e 250 cm)",
      atividade: "Escolha o nível que melhor descreve sua rotina de exercícios",
      objetivo:
        "Escolha seu objetivo: perder peso (-500 cal), manter peso (0 cal) ou ganhar peso (+500 cal)",
    };

    return tooltips[field] || "";
  };

  return (
    <Box>
      <Card
        sx={{
          width: "100%",
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
          borderRadius: "10px",
        }}
      >
        <CardContent sx={{ p: { xs: 3, md: 5 } }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
            <CalculatorIcon sx={{ mr: 2, color: "#667eea", fontSize: 32 }} />
            <Typography
              variant="h4"
              sx={{
                fontWeight: "bold",
                fontSize: { xs: "1.5rem", md: "2rem" },
                color: "#2d3748",
              }}
            >
              Vamos calcular sua taxa metabólica basal
            </Typography>
          </Box>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ position: "relative" }}>
                <TextField
                  label="Idade (anos)"
                  name="idade"
                  value={values.idade}
                  onChange={handleChange}
                  fullWidth
                  type="number"
                  variant="outlined"
                  error={!!errors.idade}
                  helperText={errors.idade}
                  inputProps={{ min: 10, max: 120 }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  }}
                />
                <Tooltip title={showInfoTooltip("idade")} placement="top">
                  <IconButton
                    size="small"
                    sx={{
                      position: "absolute",
                      right: 8,
                      top: 8,
                      color: "#667eea",
                    }}
                  >
                    <InfoIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ position: "relative" }}>
                <TextField
                  label="Peso (kg)"
                  name="peso"
                  value={values.peso}
                  onChange={handleChange}
                  fullWidth
                  type="number"
                  variant="outlined"
                  error={!!errors.peso}
                  helperText={errors.peso}
                  inputProps={{ min: 20, max: 300, step: 0.1 }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  }}
                />
                <Tooltip title={showInfoTooltip("peso")} placement="top">
                  <IconButton
                    size="small"
                    sx={{
                      position: "absolute",
                      right: 8,
                      top: 8,
                      color: "#667eea",
                    }}
                  >
                    <InfoIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ position: "relative" }}>
                <TextField
                  label="Altura (cm)"
                  name="altura"
                  value={values.altura}
                  onChange={handleChange}
                  fullWidth
                  type="number"
                  variant="outlined"
                  error={!!errors.altura}
                  helperText={errors.altura}
                  inputProps={{ min: 100, max: 250 }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  }}
                />
                <Tooltip title={showInfoTooltip("altura")} placement="top">
                  <IconButton
                    size="small"
                    sx={{
                      position: "absolute",
                      right: 8,
                      top: 8,
                      color: "#667eea",
                    }}
                  >
                    <InfoIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                select
                label="Sexo"
                name="sexo"
                value={values.sexo}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              >
                <MenuItem value="masculino">Masculino</MenuItem>
                <MenuItem value="feminino">Feminino</MenuItem>
              </TextField>
            </Grid>

            <Grid size={12}>
              <Box sx={{ position: "relative" }}>
                <TextField
                  select
                  label="Nível de Atividade"
                  name="atividade"
                  value={values.atividade}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  }}
                >
                  <MenuItem value={1.2}>
                    <Box>
                      <Typography variant="body1">Sedentário</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Pouco ou nenhum exercício
                      </Typography>
                    </Box>
                  </MenuItem>
                  <MenuItem value={1.375}>
                    <Box>
                      <Typography variant="body1">Levemente ativo</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Exercício leve 1-3 dias/semana
                      </Typography>
                    </Box>
                  </MenuItem>
                  <MenuItem value={1.55}>
                    <Box>
                      <Typography variant="body1">
                        Moderadamente ativo
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Exercício moderado 3-5 dias/semana
                      </Typography>
                    </Box>
                  </MenuItem>
                  <MenuItem value={1.725}>
                    <Box>
                      <Typography variant="body1">Muito ativo</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Exercício pesado 6-7 dias/semana
                      </Typography>
                    </Box>
                  </MenuItem>
                  <MenuItem value={1.9}>
                    <Box>
                      <Typography variant="body1">
                        Extremamente ativo
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Exercício muito pesado, trabalho físico
                      </Typography>
                    </Box>
                  </MenuItem>
                </TextField>
                <Tooltip title={showInfoTooltip("atividade")} placement="top">
                  <IconButton
                    size="small"
                    sx={{
                      position: "absolute",
                      right: 8,
                      top: 8,
                      color: "#667eea",
                    }}
                  >
                    <InfoIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Grid>

            {/* Novo campo: Objetivo */}
            <Grid size={12}>
              <Box sx={{ position: "relative" }}>
                <TextField
                  select
                  label="Qual é o seu objetivo?"
                  name="objetivo"
                  value={values.objetivo}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  }}
                >
                  <MenuItem value="perder">
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <TrendingDownIcon sx={{ mr: 1, color: "#e53e3e" }} />
                      <Box>
                        <Typography variant="body1">Perder Peso</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Déficit de 500 calorias por dia
                        </Typography>
                      </Box>
                    </Box>
                  </MenuItem>
                  <MenuItem value="manter">
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <EqualizerIcon sx={{ mr: 1, color: "#3182ce" }} />
                      <Box>
                        <Typography variant="body1">Manter Peso</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Calorias de manutenção
                        </Typography>
                      </Box>
                    </Box>
                  </MenuItem>
                  <MenuItem value="ganhar">
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <TrendingUpIcon sx={{ mr: 1, color: "#38a169" }} />
                      <Box>
                        <Typography variant="body1">Ganhar Peso</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Superávit de 500 calorias por dia
                        </Typography>
                      </Box>
                    </Box>
                  </MenuItem>
                </TextField>
                <Tooltip title={showInfoTooltip("objetivo")} placement="top">
                  <IconButton
                    size="small"
                    sx={{
                      position: "absolute",
                      right: 8,
                      top: 8,
                      color: "#667eea",
                    }}
                  >
                    <InfoIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
            <Button
              variant="contained"
              onClick={calcularTMB}
              size="large"
              disabled={loading}
              sx={{
                px: 6,
                py: 2,
                borderRadius: 3,
                fontSize: "1.1rem",
                fontWeight: "bold",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                boxShadow: "0 8px 25px rgba(102, 126, 234, 0.4)",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)",
                  boxShadow: "0 12px 35px rgba(102, 126, 234, 0.6)",
                  transform: "translateY(-2px)",
                },
                "&:disabled": {
                  background:
                    "linear-gradient(135deg, #a0aec0 0%, #718096 100%)",
                  boxShadow: "none",
                },
                transition: "all 0.3s ease",
              }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Calcular TMB"
              )}
            </Button>
          </Box>

          {calorias && (
            <Box sx={{ mt: 4 }}>
              <Alert
                severity="success"
                sx={{
                  textAlign: "center",
                  fontSize: "1.1rem",
                  borderRadius: 3,
                  py: 2,
                  "& .MuiAlert-message": {
                    width: "100%",
                  },
                }}
              >
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: "bold",
                    color: "#2f855a",
                  }}
                >
                  Seu gasto calórico diário:{" "}
                  <strong>{calorias} calorias</strong>
                </Typography>
                <Typography variant="body2" sx={{ mt: 1, color: "#4a5568" }}>
                  Objetivo: {getObjetivoInfo(values.objetivo).nome}
                </Typography>
              </Alert>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
