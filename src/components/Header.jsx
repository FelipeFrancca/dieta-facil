import { Box, Typography } from "@mui/material";

export default function Header() {
  return (
    <Box
      sx={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        p: 4,
        textAlign: "center",
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        maxWidth: "100%",
        borderRadius: "10px"
      }}
    >
      <Typography variant="h3" color="white" sx={{ fontWeight: "bold", mb: 1 }}>
        🥗 Dieta fácil
      </Typography>
      <Typography variant="h6" color="rgba(255,255,255,0.9)">
        Calculadora de TMB & Construtor de Dietas Inteligente
      </Typography>
    </Box>
  );
}
