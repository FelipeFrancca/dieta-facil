import { useState } from "react";
import { Box, Container, ToggleButton, ToggleButtonGroup, Paper, Typography } from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import TodayIcon from "@mui/icons-material/Today";
import Header from "./components/Header";
import TMBForm from "./components/TMBForm";
import MacronutrientAdjuster from "./components/components/macronutrientAdjuster";
import MacroSummary from "./components/components/macroSummary";
import DietBuilder from "./components/DietBuilder";
import WeeklyDietBuilder from "./components/WeeklyDietBuilder";
import Copyright from "./components/copyright/Copyright";

export default function App() {
  const [calorias, setCalorias] = useState(null);
  const [dadosUsuario, setDadosUsuario] = useState({
    sexo: "masculino",
    objetivo: "manter",
  });
  const [macrosPersonalizados, setMacrosPersonalizados] = useState(null);
  const [modoPlanejamento, setModoPlanejamento] = useState("semanal"); // "diario" ou "semanal"

  const handleCalculate = (caloriasCalculadas, dadosUsuario) => {
    setCalorias(caloriasCalculadas);
    setDadosUsuario({
      sexo: dadosUsuario?.sexo || "masculino",
      objetivo: dadosUsuario?.objetivo || "manter",
    });
  };

  const handleMacrosChange = (dadosMacros) => {
    setMacrosPersonalizados(dadosMacros);
  };

  const handleModoChange = (event, novoModo) => {
    if (novoModo !== null) {
      setModoPlanejamento(novoModo);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8fafc" }}>
      <Header />
      <Container
        maxWidth="lg"
        sx={{ py: 4, display: "flex", flexDirection: "column", gap: 2 }}
      >
        <TMBForm onCalculate={handleCalculate} calorias={calorias} />

        {calorias && (
          <MacronutrientAdjuster
            calorias={calorias}
            sexo={dadosUsuario.sexo}
            objetivo={dadosUsuario.objetivo}
            onMacrosChange={handleMacrosChange}
          />
        )}

        {calorias && (
          <>
            {/* Seletor de modo de planejamento */}
            <Paper sx={{ p: 2, borderRadius: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", flexWrap: "wrap", gap: 2 }}>
                <Typography variant="h6" fontWeight="bold" color="primary">
                  Modo de Planejamento:
                </Typography>
                <ToggleButtonGroup
                  value={modoPlanejamento}
                  exclusive
                  onChange={handleModoChange}
                  size="large"
                  sx={{
                    "& .MuiToggleButton-root": {
                      borderRadius: 2,
                      px: 3,
                      py: 1,
                      fontWeight: "bold",
                      "&.Mui-selected": {
                        backgroundColor: "primary.main",
                        color: "white",
                        "&:hover": {
                          backgroundColor: "primary.dark",
                        }
                      }
                    }
                  }}
                >
                  <ToggleButton value="diario">
                    <TodayIcon sx={{ mr: 1 }} />
                    Planejamento Diário
                  </ToggleButton>
                  <ToggleButton value="semanal">
                    <CalendarMonthIcon sx={{ mr: 1 }} />
                    Planejamento Semanal
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>
              
              <Typography 
                variant="body2" 
                color="text.secondary" 
                textAlign="center" 
                sx={{ mt: 1 }}
              >
                {modoPlanejamento === "semanal" 
                  ? "🗓️ Organize suas refeições por dia da semana com múltiplas alternativas"
                  : "📅 Planejamento simples focado em um dia"
                }
              </Typography>
            </Paper>

            {/* Renderizar o componente apropriado */}
            {modoPlanejamento === "semanal" ? (
              <WeeklyDietBuilder
                calorias={calorias}
                metaMacros={macrosPersonalizados}
              />
            ) : (
              <DietBuilder
                calorias={calorias}
                metaMacros={macrosPersonalizados}
              />
            )}
          </>
        )}
        
        <Copyright />
      </Container>
    </Box>
  );
}
