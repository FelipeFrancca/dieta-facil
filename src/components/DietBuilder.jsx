import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  Grid,
  Chip,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Paper,
  Alert,
  Skeleton,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import GetAppIcon from "@mui/icons-material/GetApp";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SearchIcon from "@mui/icons-material/Search";
import ScheduleIcon from "@mui/icons-material/Schedule";
import CategoryIcon from "@mui/icons-material/Category";

import {
  buscarAlimentos,
  categorias,
  buscarPorCategoria,
} from "./components/alimentosDatabase";

import PDFGenerator from "./components/PDFGenerator";
import MacroSummary from "./components/macroSummary"; // Importando o novo componente

export default function DietBuilder({ calorias, metaMacros = null }) {
  const [refeicoes, setRefeicoes] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openFoodSearch, setOpenFoodSearch] = useState(false);
  const [currentMeal, setCurrentMeal] = useState({ nome: "", alimentos: [] });
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [localResults, setLocalResults] = useState([]);
  const [selectedFood, setSelectedFood] = useState(null);
  const [foodQuantity, setFoodQuantity] = useState(100);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [loading, setLoading] = useState(false);

  const buscarAlimentosAPI = async (termo) => {
    const response = await fetch(
      `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${termo}&search_simple=1&action=process&json=1`
    );
    const data = await response.json();
    return data.products.map((produto) => ({
      nome: produto.product_name || "Desconhecido",
      calorias: produto.nutriments["energy-kcal_100g"] || 0,
      proteina: produto.nutriments.proteins_100g || 0,
      carbo: produto.nutriments.carbohydrates_100g || 0,
      gordura: produto.nutriments.fat_100g || 0,
    }));
  };

  useEffect(() => {
    const buscar = async () => {
      if (searchTerm.length > 2) {
        // 1. Buscar local imediatamente
        const locais = buscarAlimentos(searchTerm);
        setLocalResults(locais);
        setLoading(true);

        // 2. Buscar na API em paralelo
        try {
          const api = await buscarAlimentosAPI(searchTerm);
          // 3. Combinar locais + api, sem duplicatas (por nome)
          const nomesLocais = new Set(locais.map((a) => a.nome.toLowerCase()));
          const apiFiltrada = api.filter(
            (a) => !nomesLocais.has(a.nome.toLowerCase())
          );
          setSearchResults([...locais, ...apiFiltrada]);
        } catch (error) {
          console.error("Erro na API:", error);
          setSearchResults(locais); // fallback só com locais
        } finally {
          setLoading(false);
        }
      } else {
        setLocalResults([]);
        setSearchResults([]);
      }
    };
    buscar();
  }, [searchTerm]);

  const calcularMacrosRefeicao = (alimentos) => {
    return alimentos.reduce(
      (acc, item) => ({
        calorias: acc.calorias + (item.calorias * item.quantidade) / 100,
        proteina: acc.proteina + (item.proteina * item.quantidade) / 100,
        carbo: acc.carbo + (item.carbo * item.quantidade) / 100,
        gordura: acc.gordura + (item.gordura * item.quantidade) / 100,
      }),
      { calorias: 0, proteina: 0, carbo: 0, gordura: 0 }
    );
  };

  const adicionarAlimento = () => {
    if (!selectedFood) return;

    const novoAlimento = {
      ...selectedFood,
      quantidade: foodQuantity,
      id: Date.now(),
    };

    setCurrentMeal({
      ...currentMeal,
      alimentos: [...currentMeal.alimentos, novoAlimento],
    });

    setSelectedFood(null);
    setFoodQuantity(100);
    setOpenFoodSearch(false);
  };

  const salvarRefeicao = () => {
    if (!currentMeal.nome || currentMeal.alimentos.length === 0) {
      alert("Adicione um nome e pelo menos um alimento à refeição.");
      return;
    }

    const macros = calcularMacrosRefeicao(currentMeal.alimentos);
    const novaRefeicao = {
      ...currentMeal,
      macros,
      id: Date.now(),
    };

    setRefeicoes([...refeicoes, novaRefeicao]);
    setCurrentMeal({ nome: "", alimentos: [] });
    setOpenDialog(false);
  };

  const calcularTotalDia = () => {
    return refeicoes.reduce(
      (acc, refeicao) => ({
        calorias: acc.calorias + refeicao.macros.calorias,
        proteina: acc.proteina + refeicao.macros.proteina,
        carbo: acc.carbo + refeicao.macros.carbo,
        gordura: acc.gordura + refeicao.macros.gordura,
      }),
      { calorias: 0, proteina: 0, carbo: 0, gordura: 0 }
    );
  };

  const handleGerarPDF = () => {
    if (refeicoes.length === 0) {
      alert("Adicione pelo menos uma refeição antes de gerar o PDF.");
      return;
    }

    setPdfGenerating(true);
    const totalDia = calcularTotalDia();

    const pdfGenerator = PDFGenerator({
      refeicoes,
      totalDia,
      calorias,
      onGenerate: () => {
        setPdfGenerating(false);
      },
    });

    pdfGenerator.gerarPDFEstilizado();
  };

  const buscarPorCategoriaHandler = (categoria) => {
    setSelectedCategory(categoria);
    setSearchResults(buscarPorCategoria(categoria));
    setSearchTerm("");
  };

  const limparBusca = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setSearchResults([]);
  };

  const totalDia = calcularTotalDia();

  return (
    <Card
      sx={{ boxShadow: "0 8px 32px rgba(0,0,0,0.1)", borderRadius: "10px" }}
    >
      <CardContent sx={{ p: 4 }}>
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
            <Typography variant="h5" sx={{ fontWeight: "bold", mr: 2, minWidth: 0 }}>
              Agora vamos construir sua dieta!
            </Typography>
            {calorias && (
              <Chip
                label={`Meta: ${calorias} kcal`}
                color="primary"
                sx={{ flexShrink: 0 }}
              />
            )}
          </Box>
          <Box sx={{ display: "flex", gap: 2, flexShrink: 0 }}>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => setOpenDialog(true)}
            >
              Nova Refeição
            </Button>
            {refeicoes.length > 0 && (
              <Button
                variant="contained"
                startIcon={<GetAppIcon />}
                onClick={handleGerarPDF}
                disabled={pdfGenerating}
                sx={{
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                }}
              >
                {pdfGenerating ? "Gerando PDF..." : "Gerar PDF"}
              </Button>
            )}
          </Box>
        </Box>

        {/* Resumo Nutricional usando o novo componente */}
        {refeicoes.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <MacroSummary
              totalDia={totalDia}
              calorias={calorias}
              metaMacros={metaMacros}
              mostrarProgresso={true}
              gradiente="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
            />
          </Box>
        )}

        {/* Lista de Refeições */}
        {refeicoes.map((refeicao, index) => (
          <Accordion key={refeicao.id} sx={{ mb: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box
                sx={{ display: "flex", alignItems: "center", width: "100%" }}
              >
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
                  <IconButton
                    color="error"
                    onClick={() =>
                      setRefeicoes(
                        refeicoes.filter((r) => r.id !== refeicao.id)
                      )
                    }
                  >
                    <DeleteIcon />
                  </IconButton>
                </Grid>
              </Grid>
              <Divider sx={{ mb: 2 }} />
              <Typography
                variant="subtitle2"
                color="textSecondary"
                sx={{ mb: 1 }}
              >
                Alimentos:
              </Typography>
              {refeicao.alimentos.map((alimento) => (
                <Typography key={alimento.id} variant="body2" sx={{ ml: 2 }}>
                  • {alimento.nome} - {alimento.quantidade}g
                </Typography>
              ))}
            </AccordionDetails>
          </Accordion>
        ))}

        {refeicoes.length === 0 && (
          <Box sx={{ textAlign: "center", py: 6 }}>
            <RestaurantIcon sx={{ fontSize: 64, color: "#ccc", mb: 2 }} />
            <Typography variant="h6" color="textSecondary">
              Nenhuma refeição adicionada
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Clique em "Nova Refeição" para começar
            </Typography>
          </Box>
        )}

        {/* Dialog Nova Refeição */}
        <Dialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Typography variant="h6">Nova Refeição</Typography>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <TextField
                label="Nome da Refeição"
                value={currentMeal.nome}
                onChange={(e) =>
                  setCurrentMeal({ ...currentMeal, nome: e.target.value })
                }
                fullWidth
                sx={{ mb: 3 }}
                placeholder="Ex: Café da manhã, Almoço, Jantar..."
              />

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography variant="h6">Alimentos</Typography>
                <Button
                  variant="outlined"
                  startIcon={<SearchIcon />}
                  onClick={() => setOpenFoodSearch(true)}
                >
                  Buscar Alimento
                </Button>
              </Box>

              {currentMeal.alimentos.map((alimento, index) => (
                <Card key={alimento.id} sx={{ mb: 2, p: 2 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Box>
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: "bold", textTransform: "capitalize" }}
                      >
                        {alimento.nome}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {alimento.quantidade}g -{" "}
                        {Math.round(
                          (alimento.calorias * alimento.quantidade) / 100
                        )}{" "}
                        kcal
                      </Typography>
                    </Box>
                    <IconButton
                      color="error"
                      onClick={() =>
                        setCurrentMeal({
                          ...currentMeal,
                          alimentos: currentMeal.alimentos.filter(
                            (a) => a.id !== alimento.id
                          ),
                        })
                      }
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Card>
              ))}

              {currentMeal.alimentos.length === 0 && (
                <Box sx={{ textAlign: "center", py: 4 }}>
                  <Typography variant="body2" color="textSecondary">
                    Nenhum alimento adicionado. Clique em "Buscar Alimento" para
                    adicionar.
                  </Typography>
                </Box>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
            <Button variant="contained" onClick={salvarRefeicao}>
              Salvar Refeição
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog Busca de Alimentos */}
        <Dialog
          open={openFoodSearch}
          onClose={() => setOpenFoodSearch(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Typography variant="h6">Buscar Alimento</Typography>
              <Button onClick={limparBusca} size="small">
                Limpar
              </Button>
            </Box>
          </DialogTitle>
          <DialogContent>
            <TextField
              label="Digite o nome do alimento"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              fullWidth
              sx={{ mt: 2, mb: 3 }}
              placeholder="Ex: frango, arroz, brócolis..."
            />

            {/* Categorias */}
            <Box sx={{ mb: 3 }}>
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
                    label={
                      categoria.charAt(0).toUpperCase() + categoria.slice(1)
                    }
                    onClick={() => buscarPorCategoriaHandler(categoria)}
                    color={
                      selectedCategory === categoria ? "primary" : "default"
                    }
                    variant={
                      selectedCategory === categoria ? "filled" : "outlined"
                    }
                    size="small"
                  />
                ))}
              </Box>
            </Box>

            {selectedCategory && (
              <Alert severity="info" sx={{ mb: 2 }}>
                Mostrando alimentos da categoria:{" "}
                <strong>{selectedCategory}</strong>
              </Alert>
            )}

            {localResults.map((alimento, index) => (
              <Card
                key={`local-${index}`}
                sx={{
                  mb: 2,
                  p: 2,
                  cursor: "pointer",
                  border:
                    selectedFood?.nome === alimento.nome
                      ? "2px solid #667eea"
                      : "1px solid #e0e0e0",
                  "&:hover": { backgroundColor: "#f5f5f5" },
                }}
                onClick={() => setSelectedFood(alimento)}
              >
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: "bold", textTransform: "capitalize" }}
                >
                  {alimento.nome}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {alimento.calorias} kcal | P: {alimento.proteina}g | C:{" "}
                  {alimento.carbo}g | G: {alimento.gordura}g (por 100g)
                </Typography>
              </Card>
            ))}

            {loading &&
              Array.from({ length: 4 }).map((_, index) => (
                <Card key={`skeleton-${index}`} sx={{ mb: 2, p: 2 }}>
                  <Skeleton variant="text" width="60%" height={24} />
                  <Skeleton variant="text" width="80%" height={20} />
                </Card>
              ))}

            {!loading &&
              searchResults
                .filter(
                  (a) =>
                    !localResults.find(
                      (l) => l.nome.toLowerCase() === a.nome.toLowerCase()
                    )
                )
                .map((alimento, index) => (
                  <Card
                    key={`api-${index}`}
                    sx={{
                      mb: 2,
                      p: 2,
                      cursor: "pointer",
                      border:
                        selectedFood?.nome === alimento.nome
                          ? "2px solid #667eea"
                          : "1px solid #e0e0e0",
                      "&:hover": { backgroundColor: "#f5f5f5" },
                }}
                onClick={() => setSelectedFood(alimento)}
              >
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: "bold", textTransform: "capitalize" }}
                >
                  {alimento.nome}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {alimento.calorias} kcal | P: {alimento.proteina}g | C:{" "}
                  {alimento.carbo}g | G: {alimento.gordura}g (por 100g)
                </Typography>
              </Card>
            ))}

            {loading &&
              Array.from({ length: 4 }).map((_, index) => (
                <Card key={`skeleton-${index}`} sx={{ mb: 2, p: 2 }}>
                  <Skeleton variant="text" width="60%" height={24} />
                  <Skeleton variant="text" width="80%" height={20} />
                </Card>
              ))}

            {!loading &&
              searchResults
                .filter(
                  (a) =>
                    !localResults.find(
                      (l) => l.nome.toLowerCase() === a.nome.toLowerCase()
                    )
                )
                .map((alimento, index) => (
                  <Card
                    key={`api-${index}`}
                    sx={{
                      mb: 2,
                      p: 2,
                      cursor: "pointer",
                      border:
                        selectedFood?.nome === alimento.nome
                          ? "2px solid #667eea"
                          : "1px solid #e0e0e0",
                      "&:hover": { backgroundColor: "#f5f5f5" },
                    }}
                    onClick={() => setSelectedFood(alimento)}
                  >
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: "bold", textTransform: "capitalize" }}
                    >
                      {alimento.nome}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {alimento.calorias} kcal | P: {alimento.proteina}g | C:{" "}
                      {alimento.carbo}g | G: {alimento.gordura}g (por 100g)
                    </Typography>
                  </Card>
                ))}

            {selectedFood && (
              <Box sx={{ mt: 3, p: 2, bgcolor: "#f5f5f5", borderRadius: 1 }}>
                <Typography variant="subtitle1" sx={{ mb: 2 }}>
                  Quantidade de {selectedFood.nome}:
                </Typography>
                <TextField
                  label="Quantidade (gramas)"
                  type="number"
                  value={foodQuantity}
                  onChange={(e) => setFoodQuantity(Number(e.target.value))}
                  fullWidth
                  sx={{ mb: 2 }}
                  inputProps={{ min: 1 }}
                />
                <Typography variant="body2" color="textSecondary">
                  Valores nutricionais para {foodQuantity}g:
                </Typography>
                <Typography variant="body2">
                  Calorias:{" "}
                  {Math.round((selectedFood.calorias * foodQuantity) / 100)}{" "}
                  kcal | Proteínas:{" "}
                  {Math.round((selectedFood.proteina * foodQuantity) / 100)}g |
                  Carboidratos:{" "}
                  {Math.round((selectedFood.carbo * foodQuantity) / 100)}g |
                  Gorduras:{" "}
                  {Math.round((selectedFood.gordura * foodQuantity) / 100)}g
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenFoodSearch(false)}>Cancelar</Button>
            <Button
              variant="contained"
              onClick={adicionarAlimento}
              disabled={!selectedFood}
            >
              Adicionar
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
}
