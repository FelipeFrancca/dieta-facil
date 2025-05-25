import { useState } from "react";
import { Box, Container } from "@mui/material";
import Header from "./components/Header";
import TMBForm from "./components/TMBForm";
import DietBuilder from "./components/DietBuilder";

export default function App() {
  const [calorias, setCalorias] = useState(null);

  const handleCalculate = (caloriasCalculadas) => {
    setCalorias(caloriasCalculadas);
  };

  return (
    <Box
      sx={{
        width: "100vw",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 2,
        pt: 2,
        pb: 2,
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
      }}
    >
      <Container maxWidth="lg">
        <Header />
      </Container>

      <Container
        maxWidth="lg"
        sx={{ display: "flex", gap: 2, flexDirection: "column" }}
      >
        <TMBForm onCalculate={handleCalculate} calorias={calorias} />

        {calorias && <DietBuilder calorias={calorias} />}
      </Container>
    </Box>
  );
}
