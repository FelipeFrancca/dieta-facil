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
  Alert,
  Chip,
  AlertTitle,
  IconButton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import RestoreIcon from "@mui/icons-material/Restore";
import CloseIcon from "@mui/icons-material/Close";
import Swal from "sweetalert2";

import { MealCard } from "./components/dietBuilderComponents/MealCard";
import { EmptyMealsState } from "./components/dietBuilderComponents/EmptyMealsState";
import { FoodSearchCategories } from "./components/dietBuilderComponents/FoodSearchCategories";
import { CurrentMealFoods } from "./components/dietBuilderComponents/CurrentMealFoods";
import { DietBuilderHeader } from "./components/dietBuilderComponents/DietBuilderHeader";
import { MultiSelectFoodCard } from "./components/dietBuilderComponents/MultiSelectFoodCard";

import { useFoodSearch } from "./components/dietBuilderComponents/hooks/useFoodSearch";
import { useMealManagement } from "./components/dietBuilderComponents/hooks/useMealManagement";
import {
  calcularNutrientes,
  calcularNutrientesDia,
  gerarUnidadesDisponiveis,
} from "./components/dietBuilderComponents/utils/nutrientCalculator";

import { categorias } from "./components/alimentosDatabase";
import PDFGenerator from "./components/PDFGenerator";
import MacroSummary from "./components/macroSummary";

import {
  salvarDietaLocal,
  carregarDietaLocal,
  existeDietaSalva,
  getInfoDietaSalva,
  limparDietaLocal,
} from "./components/dietBuilderComponents/utils/localStorageUtils";

export default function DietBuilder({ calorias, metaMacros = null }) {
  const [openDialog, setOpenDialog] = useState(false);
  const [openFoodSearch, setOpenFoodSearch] = useState(false);
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [selectedFoods, setSelectedFoods] = useState([]);
  const [multiSelectQuantities, setMultiSelectQuantities] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [showRestoreAlert, setShowRestoreAlert] = useState(false);
  const [dietaInfo, setDietaInfo] = useState(null);

  const mealNameSuggestions = ["Café da manhã", "Almoço", "Janta", "Lanche"];

  const {
    searchTerm,
    setSearchTerm,
    searchResults,
    localResults,
    selectedCategory,
    loading,
    buscarPorCategoriaHandler,
    limparBusca,
  } = useFoodSearch();
  const {
    refeicoes,
    currentMeal,
    setCurrentMeal,
    adicionarMultiplosAlimentos,
    removerAlimento,
    salvarRefeicao,
    salvarRefeicaoEditada,
    editarRefeicaoExistente,
    removerRefeicao,
    duplicarRefeicao,
    moverRefeicaoParaCima,
    moverRefeicaoParaBaixo,
    restaurarRefeicoes,
  } = useMealManagement();

  const totalDia = calcularNutrientesDia(refeicoes);

  const calcularNutrientesRefeicaoAtual = () => {
    if (!currentMeal.alimentos || currentMeal.alimentos.length === 0) {
      return { calorias: 0, proteina: 0, carbo: 0, gordura: 0, gramas: 0 };
    }

    return currentMeal.alimentos.reduce(
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
          gramas: acc.gramas + nutrientes.gramas,
        };
      },
      { calorias: 0, proteina: 0, carbo: 0, gordura: 0, gramas: 0 }
    );
  };

  const totalComRefeicaoAtual = () => {
    const nutrientesRefeicaoAtual = calcularNutrientesRefeicaoAtual();

    return {
      calorias: totalDia.calorias + nutrientesRefeicaoAtual.calorias,
      proteina: totalDia.proteina + nutrientesRefeicaoAtual.proteina,
      carbo: totalDia.carbo + nutrientesRefeicaoAtual.carbo,
      gordura: totalDia.gordura + nutrientesRefeicaoAtual.gordura,
      gramas: totalDia.gramas + nutrientesRefeicaoAtual.gramas,
    };
  };

  const totaisAtuais = totalComRefeicaoAtual();

  const alertConfig = {
    calorias: {
      emoji: "🚨",
      title: "Limite de Calorias Atingido!",
      color: "#f44336",
    },
    proteina: {
      emoji: "🥩",
      title: "Limite de Proteínas Atingido!",
      color: "#2196f3",
    },
    carbo: {
      emoji: "🍞",
      title: "Limite de Carboidratos Atingido!",
      color: "#ff9800",
    },
    gordura: {
      emoji: "🥑",
      title: "Limite de Gorduras Atingido!",
      color: "#4caf50",
    },
  };

  const showAlert = (type, current, target) => {
    const config = alertConfig[type];
    const unit = type === "calorias" ? "kcal" : "g";
    Swal.fire({
      title: `${config.emoji} ${config.title}`,
      text: `Você atingiu ${Math.round(current)}${unit} de ${target}${unit} ${
        type === "calorias" ? "diárias" : `de ${type}`
      }.`,
      icon: type === "calorias" ? "warning" : "info",
      confirmButtonText: "Entendi",
      confirmButtonColor: config.color,
    });
  };

  const checkLimits = () => {
    if (calorias && totaisAtuais.calorias >= calorias) {
      showAlert("calorias", totaisAtuais.calorias, calorias);
    }

    if (metaMacros) {
      ["proteina", "carbo", "gordura"].forEach((macro) => {
        if (metaMacros[macro] && totaisAtuais[macro] >= metaMacros[macro]) {
          showAlert(macro, totaisAtuais[macro], metaMacros[macro]);
        }
      });
    }
  };

  const getFoodKey = (food) => `${food.nome}_${food.calorias}`;

  useEffect(() => {
    if (refeicoes.length === 0 && existeDietaSalva()) {
      const info = getInfoDietaSalva();
      if (info?.quantidadeRefeicoes > 0) {
        setDietaInfo(info);
        setShowRestoreAlert(true);
      }
    }
  }, [refeicoes.length]);

  useEffect(() => {
    if (refeicoes.length > 0) {
      salvarDietaLocal(refeicoes, calorias, metaMacros);
    }
  }, [refeicoes, calorias, metaMacros]);

  useEffect(checkLimits, [totaisAtuais, calorias, metaMacros]);

  const handleEditarRefeicao = (id) => {
    if (editarRefeicaoExistente(id)) {
      setIsEditing(true);
      setOpenDialog(true);
    }
  };

  const handleFoodMultiSelect = (food) => {
    const foodKey = getFoodKey(food);
    const isSelected = selectedFoods.find((f) => getFoodKey(f) === foodKey);

    if (isSelected) {
      setSelectedFoods(selectedFoods.filter((f) => getFoodKey(f) !== foodKey));
      const newQuantities = { ...multiSelectQuantities };
      delete newQuantities[foodKey];
      setMultiSelectQuantities(newQuantities);
    } else {
      setSelectedFoods([...selectedFoods, food]);
      setMultiSelectQuantities({ ...multiSelectQuantities, [foodKey]: 100 });
    }
  };

  const handleQuantityChange = (foodKey, quantity) => {
    setMultiSelectQuantities({ ...multiSelectQuantities, [foodKey]: quantity });
  };

  const handleAdicionarMultiplos = () => {
    if (selectedFoods.length === 0) {
      return Swal.fire({
        title: "Nenhum Alimento Selecionado",
        text: "Selecione pelo menos um alimento antes de adicionar.",
        icon: "warning",
      });
    }

    const alimentosInvalidos = selectedFoods.filter((food) => {
      const quantity = multiSelectQuantities[getFoodKey(food)];
      return !quantity || quantity <= 0;
    });

    if (alimentosInvalidos.length > 0) {
      return Swal.fire({
        title: "Quantidades Inválidas",
        text: `Verifique as quantidades dos seguintes alimentos: ${alimentosInvalidos
          .map((f) => f.nome)
          .join(", ")}`,
        icon: "error",
      });
    }

    const alimentosParaAdicionar = selectedFoods.map((food) => ({
      food,
      quantity: multiSelectQuantities[getFoodKey(food)] || 100,
      unit: food.unidade || "gramas", // Adicione esta linha
    }));

    if (adicionarMultiplosAlimentos(alimentosParaAdicionar)) {
      setSelectedFoods([]);
      setMultiSelectQuantities({});
      setOpenFoodSearch(false);
      Swal.fire({
        title: "✅ Alimentos Adicionados!",
        text: `${alimentosParaAdicionar.length} alimento${
          alimentosParaAdicionar.length !== 1 ? "s foram" : " foi"
        } adicionado${
          alimentosParaAdicionar.length !== 1 ? "s" : ""
        } à sua refeição.`,
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });
    }
  };

  const handleSalvarRefeicao = () => {
    const sucesso = isEditing ? salvarRefeicaoEditada() : salvarRefeicao();

    if (sucesso) {
      setOpenDialog(false);
      setIsEditing(false);
      Swal.fire({
        title: "🍽️ Refeição Salva!",
        text: "Sua refeição foi atualizada com sucesso.",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });
    } else {
      Swal.fire({
        title: "Erro",
        text: "Adicione um nome e pelo menos um alimento à refeição.",
        icon: "error",
      });
    }
  };

  const handleGerarPDF = () => {
    if (refeicoes.length === 0) {
      return Swal.fire({
        title: "Nenhuma Refeição",
        text: "Adicione pelo menos uma refeição antes de gerar o PDF.",
        icon: "warning",
      });
    }

    setPdfGenerating(true);
    PDFGenerator({
      refeicoes,
      totalDia,
      calorias,
      onGenerate: () => {
        setPdfGenerating(false);
        Swal.fire({
          title: "📄 PDF Gerado!",
          text: "Seu plano alimentar foi gerado com sucesso.",
          icon: "success",
          timer: 3000,
          showConfirmButton: false,
        });
      },
    }).gerarPDFEstilizado();
  };

  const restaurarDietaSalva = () => {
    const dietaData = carregarDietaLocal();
    if (dietaData?.refeicoes && restaurarRefeicoes(dietaData.refeicoes)) {
      setShowRestoreAlert(false);
      const count = dietaData.refeicoes.length;
      Swal.fire({
        title: "🍽️ Dieta Restaurada!",
        text: `${count} refeição${
          count !== 1 ? "ões foram" : " foi"
        } restaurada${count !== 1 ? "s" : ""} com sucesso.`,
        icon: "success",
        timer: 3000,
        showConfirmButton: false,
      });
    } else {
      Swal.fire({
        title: "❌ Erro ao Restaurar",
        text: "Não foi possível restaurar a dieta. Os dados podem estar corrompidos.",
        icon: "error",
      });
    }
  };

  const descartarDietaSalva = () => {
    limparDietaLocal();
    setShowRestoreAlert(false);
    setDietaInfo(null);
  };

  const closeDialog = () => {
    setOpenDialog(false);
    setIsEditing(false);
    setCurrentMeal({ nome: "", alimentos: [] });
  };

  const handleMealNameSuggestion = (suggestion) => {
    setCurrentMeal({ ...currentMeal, nome: suggestion });
  };

  const isNearCalorieLimit =
    calorias && totaisAtuais.calorias >= calorias * 0.9;
  const nearMacros = metaMacros
    ? ["proteina", "carbo", "gordura"].filter(
        (macro) =>
          metaMacros[macro] && totaisAtuais[macro] >= metaMacros[macro] * 0.9
      )
    : [];

  return (
    <Card
      sx={{ boxShadow: "0 8px 32px rgba(0,0,0,0.1)", borderRadius: "10px" }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
        {/* Alert de restauração */}
        {showRestoreAlert && dietaInfo && (
          <Alert
            severity="info"
            sx={{ mb: 3, display: "flex", alignItems: "center" }}
            action={
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  size="small"
                  startIcon={<RestoreIcon />}
                  onClick={restaurarDietaSalva}
                  variant="contained"
                >
                  Restaurar
                </Button>
                <IconButton size="small" onClick={descartarDietaSalva}>
                  <CloseIcon />
                </IconButton>
              </Box>
            }
          >
            <AlertTitle>🔄 Dieta Anterior Encontrada</AlertTitle>
            Encontramos uma dieta com {dietaInfo.quantidadeRefeicoes} refeição
            {dietaInfo.quantidadeRefeicoes !== 1 ? "ões" : ""} salva em{" "}
            {new Date(dietaInfo.dataUltimaEdicao).toLocaleDateString("pt-BR")}.
            Deseja restaurá-la?
          </Alert>
        )}
        {/* Alertas de limite */}
        {isNearCalorieLimit && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            ⚠️ Você está próximo do limite diário de calorias! Atual:{" "}
            {Math.round(totaisAtuais.calorias)} / {calorias} kcal
          </Alert>
        )}
        {nearMacros.length > 0 && (
          <Alert severity="info" sx={{ mb: 2 }}>
            📊 Atenção aos macronutrientes:{" "}
            {nearMacros.map((macro) => (
              <Chip
                key={macro}
                label={`${
                  macro.charAt(0).toUpperCase() + macro.slice(1)
                } próximo do limite`}
                size="small"
                sx={{ mr: 1 }}
              />
            ))}
          </Alert>
        )}
        <DietBuilderHeader
          calorias={calorias}
          refeicoes={refeicoes}
          onNewMeal={() => setOpenDialog(true)}
          onGeneratePDF={handleGerarPDF}
          pdfGenerating={pdfGenerating}
        />
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
        {refeicoes.length > 0 ? (
          refeicoes.map((refeicao) => (
            <MealCard
              key={refeicao.id}
              refeicao={refeicao}
              onEdit={handleEditarRefeicao}
              onDuplicate={duplicarRefeicao}
              onDelete={removerRefeicao}
              onMoveUp={moverRefeicaoParaCima}
              onMoveDown={moverRefeicaoParaBaixo}
            />
          ))
        ) : (
          <EmptyMealsState />
        )}
        {/* Dialog Nova Refeição */}
        <Dialog
          open={openDialog}
          onClose={closeDialog}
          maxWidth="md"
          fullWidth
          sx={{ px: { xs: 1, sm: 3 }, py: { xs: 2, sm: 3 } }}
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
                sx={{ mb: 2 }}
                placeholder="Ex: Café da manhã, Almoço, Jantar..."
                error={isNearCalorieLimit}
                helperText={
                  isNearCalorieLimit
                    ? "⚠️ Atenção ao limite de calorias diárias!"
                    : ""
                }
              />

              {/* Sugestões de nomes de refeição */}
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="body2"
                  sx={{ mb: 1, color: "text.secondary" }}
                >
                  Sugestões:
                </Typography>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  {mealNameSuggestions.map((suggestion) => (
                    <Chip
                      key={suggestion}
                      label={suggestion}
                      onClick={() => handleMealNameSuggestion(suggestion)}
                      variant={
                        currentMeal.nome === suggestion ? "filled" : "outlined"
                      }
                      color={
                        currentMeal.nome === suggestion ? "primary" : "default"
                      }
                      sx={{
                        cursor: "pointer",
                        "&:hover": {
                          backgroundColor:
                            currentMeal.nome === suggestion
                              ? "primary.dark"
                              : "action.hover",
                        },
                      }}
                    />
                  ))}
                </Box>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                  flexDirection: { xs: "column", sm: "row" },
                  gap: 2,
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

              <CurrentMealFoods
                alimentos={currentMeal.alimentos}
                onRemoveFood={removerAlimento}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeDialog}>Cancelar</Button>
            <Button variant="contained" onClick={handleSalvarRefeicao}>
              Salvar Refeição
            </Button>
          </DialogActions>
        </Dialog>
        {/* Dialog Busca de Alimentos */}
        <Dialog
          open={openFoodSearch}
          onClose={() => setOpenFoodSearch(false)}
          maxWidth="md"
          fullWidth
          sx={{ px: { xs: 1, sm: 3 }, py: { xs: 2, sm: 3 } }}
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

            <FoodSearchCategories
              categorias={categorias}
              selectedCategory={selectedCategory}
              onCategorySelect={buscarPorCategoriaHandler}
            />

            <MultiSelectFoodCard
              localResults={localResults}
              searchResults={searchResults}
              loading={loading}
              selectedFoods={selectedFoods}
              onFoodSelect={handleFoodMultiSelect}
              multiSelectQuantities={multiSelectQuantities}
              onQuantityChange={handleQuantityChange}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenFoodSearch(false)}>Cancelar</Button>
            <Button
              variant="contained"
              onClick={handleAdicionarMultiplos}
              disabled={selectedFoods.length === 0}
              startIcon={<CheckBoxIcon />}
            >
              Adicionar {selectedFoods.length} Alimento
              {selectedFoods.length !== 1 ? "s" : ""}
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
}
