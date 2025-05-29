import { useState } from "react";
import { Box, Container } from "@mui/material";
import Header from "./components/Header";
import TMBForm from "./components/TMBForm";
import MacronutrientAdjuster from "./components/components/macronutrientAdjuster";
import DietBuilder from "./components/DietBuilder";

export default function App() {
  const [calorias, setCalorias] = useState(null);
  const [dadosUsuario, setDadosUsuario] = useState({
    sexo: "masculino",
    objetivo: "manter"
  });
  const [macrosPersonalizados, setMacrosPersonalizados] = useState(null);

  const handleCalculate = (caloriasCalculadas, dadosUsuario) => {
    setCalorias(caloriasCalculadas);
    // Capturar dados do usuário do TMBForm
    setDadosUsuario({
      sexo: dadosUsuario?.sexo || "masculino",
      objetivo: dadosUsuario?.objetivo || "manter"
    });
  };

  const handleMacrosChange = (dadosMacros) => {
    setMacrosPersonalizados(dadosMacros);
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8fafc" }}>
      <Header />
      <Container maxWidth="lg" sx={{ py: 4, display: "flex", flexDirection: "column", gap: 2 }}>
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
          <DietBuilder 
            calorias={calorias}
            macrosRecomendados={macrosPersonalizados}
          />
        )}
      </Container>
    </Box>
  );
}