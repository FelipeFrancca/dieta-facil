import React, { useState, useEffect } from "react";
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
  FormControlLabel,
  Switch,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import Swal from "sweetalert2";

import { MealCard } from "./components/dietBuilderComponents/MealCard";
import { EmptyMealsState } from "./components/dietBuilderComponents/EmptyMealsState";
import { FoodSearchCategories } from "./components/dietBuilderComponents/FoodSearchCategories";
import { FoodSearchResults } from "./components/dietBuilderComponents/FoodSearchResults";
import { FoodQuantitySelector } from "./components/dietBuilderComponents/FoodQuantitySelector";
import { CurrentMealFoods } from "./components/dietBuilderComponents/CurrentMealFoods";
import { DietBuilderHeader } from "./components/dietBuilderComponents/DietBuilderHeader";
import { MultiSelectFoodCard } from "./components/dietBuilderComponents/MultiSelectFoodCard";
import { MultiSelectSummary } from "./components/dietBuilderComponents/MultiSelectSummary";

import { useFoodSearch } from "./components/dietBuilderComponents/hooks/useFoodSearch";
import { useMealManagement } from "./components/dietBuilderComponents/hooks/useMealManagement";

import { categorias } from "./components/alimentosDatabase";
import PDFGenerator from "./components/PDFGenerator";
import MacroSummary from "./components/macroSummary";

export default function DietBuilder({ calorias, metaMacros = null }) {
  const [openDialog, setOpenDialog] = useState(false);
  const [openFoodSearch, setOpenFoodSearch] = useState(false);
  const [pdfGenerating, setPdfGenerating] = useState(false);

  const [selectedFood, setSelectedFood] = useState(null);
  const [foodQuantity, setFoodQuantity] = useState(100);

  const [multiSelectMode, setMultiSelectMode] = useState(true);
  const [selectedFoods, setSelectedFoods] = useState([]);
  const [multiSelectQuantities, setMultiSelectQuantities] = useState({});

  const [showCalorieAlert, setShowCalorieAlert] = useState(false);
  const [showMacroAlerts, setShowMacroAlerts] = useState({});

  const [isEditing, setIsEditing] = useState(false);

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
    calcularTotalDia,
    adicionarAlimento,
    adicionarMultiplosAlimentos,
    removerAlimento,
    salvarRefeicao,
    salvarRefeicaoEditada,
    editarRefeicaoExistente,
    removerRefeicao,
    duplicarRefeicao,
    moverRefeicaoParaCima,
    moverRefeicaoParaBaixo
  } = useMealManagement();

  const totalDia = calcularTotalDia();
  const totalComRefeicaoAtual = {
    calorias:
      totalDia.calorias +
      currentMeal.alimentos.reduce(
        (acc, a) => acc + (a.calorias * a.quantidade) / 100,
        0
      ),
    proteina:
      totalDia.proteina +
      currentMeal.alimentos.reduce(
        (acc, a) => acc + (a.proteina * a.quantidade) / 100,
        0
      ),
    carbo:
      totalDia.carbo +
      currentMeal.alimentos.reduce(
        (acc, a) => acc + (a.carbo * a.quantidade) / 100,
        0
      ),
    gordura:
      totalDia.gordura +
      currentMeal.alimentos.reduce(
        (acc, a) => acc + (a.gordura * a.quantidade) / 100,
        0
      ),
  };

  useEffect(() => {
    if (calorias && totalComRefeicaoAtual.calorias >= calorias * 0.9) {
      setShowCalorieAlert(true);
      if (totalComRefeicaoAtual.calorias >= calorias) {
        Swal.fire({
          title: "🚨 Limite de Calorias Atingido!",
          text: `Você atingiu ${Math.round(
            totalComRefeicaoAtual.calorias
          )} kcal de ${calorias} kcal diárias.`,
          icon: "warning",
          confirmButtonText: "Entendi",
          confirmButtonColor: "#f44336",
        });
      }
    } else {
      setShowCalorieAlert(false);
    }

    if (metaMacros) {
      const newMacroAlerts = {};

      if (
        metaMacros.proteina &&
        totalComRefeicaoAtual.proteina >= metaMacros.proteina * 0.9
      ) {
        newMacroAlerts.proteina = true;
        if (totalComRefeicaoAtual.proteina >= metaMacros.proteina) {
          Swal.fire({
            title: "🥩 Limite de Proteínas Atingido!",
            text: `Você atingiu ${Math.round(
              totalComRefeicaoAtual.proteina
            )}g de ${metaMacros.proteina}g de proteínas.`,
            icon: "info",
            confirmButtonText: "Entendi",
            confirmButtonColor: "#2196f3",
          });
        }
      }

      if (
        metaMacros.carbo &&
        totalComRefeicaoAtual.carbo >= metaMacros.carbo * 0.9
      ) {
        newMacroAlerts.carbo = true;
        if (totalComRefeicaoAtual.carbo >= metaMacros.carbo) {
          Swal.fire({
            title: "🍞 Limite de Carboidratos Atingido!",
            text: `Você atingiu ${Math.round(
              totalComRefeicaoAtual.carbo
            )}g de ${metaMacros.carbo}g de carboidratos.`,
            icon: "info",
            confirmButtonText: "Entendi",
            confirmButtonColor: "#ff9800",
          });
        }
      }

      if (
        metaMacros.gordura &&
        totalComRefeicaoAtual.gordura >= metaMacros.gordura * 0.9
      ) {
        newMacroAlerts.gordura = true;
        if (totalComRefeicaoAtual.gordura >= metaMacros.gordura) {
          Swal.fire({
            title: "🥑 Limite de Gorduras Atingido!",
            text: `Você atingiu ${Math.round(
              totalComRefeicaoAtual.gordura
            )}g de ${metaMacros.gordura}g de gorduras.`,
            icon: "info",
            confirmButtonText: "Entendi",
            confirmButtonColor: "#4caf50",
          });
        }
      }

      setShowMacroAlerts(newMacroAlerts);
    }
  }, [totalComRefeicaoAtual, calorias, metaMacros]);

  const handleEditarRefeicao = (id) => {
    console.log("Tentando editar refeição:", id); // 👈 teste

    const sucesso = editarRefeicaoExistente(id);
    if (sucesso) {
      setIsEditing(true);
      setOpenDialog(true);
      setTimeout(() => setOpenDialog(true), 50);
    }
  };

  const handleToggleMultiSelect = () => {
    setMultiSelectMode(!multiSelectMode);
    setSelectedFoods([]);
    setMultiSelectQuantities({});
  };

  const handleFoodMultiSelect = (food) => {
    const foodKey = `${food.nome}_${food.calorias}`;
    const isSelected = selectedFoods.find(
      (f) => `${f.nome}_${f.calorias}` === foodKey
    );

    if (isSelected) {
      setSelectedFoods(
        selectedFoods.filter((f) => `${f.nome}_${f.calorias}` !== foodKey)
      );
      const newQuantities = { ...multiSelectQuantities };
      delete newQuantities[foodKey];
      setMultiSelectQuantities(newQuantities);
    } else {
      setSelectedFoods([...selectedFoods, food]);
      setMultiSelectQuantities({
        ...multiSelectQuantities,
        [foodKey]: 100,
      });
    }
  };

  const handleQuantityChange = (foodKey, quantity) => {
    setMultiSelectQuantities({
      ...multiSelectQuantities,
      [foodKey]: quantity,
    });
  };

  const handleAdicionarMultiplos = () => {
    if (selectedFoods.length === 0) {
      Swal.fire({
        title: "Nenhum Alimento Selecionado",
        text: "Selecione pelo menos um alimento antes de adicionar.",
        icon: "warning",
        confirmButtonText: "Entendi",
      });
      return;
    }

    const alimentosInvalidos = selectedFoods.filter((food) => {
      const foodKey = `${food.nome}_${food.calorias}`;
      const quantity = multiSelectQuantities[foodKey];
      return !quantity || quantity <= 0;
    });

    if (alimentosInvalidos.length > 0) {
      Swal.fire({
        title: "Quantidades Inválidas",
        text: `Verifique as quantidades dos seguintes alimentos: ${alimentosInvalidos
          .map((f) => f.nome)
          .join(", ")}`,
        icon: "error",
        confirmButtonText: "Corrigir",
      });
      return;
    }

    const alimentosParaAdicionar = selectedFoods.map((food) => ({
      food,
      quantity: multiSelectQuantities[`${food.nome}_${food.calorias}`] || 100,
    }));

    const sucesso = adicionarMultiplosAlimentos(alimentosParaAdicionar);

    if (sucesso) {
      setSelectedFoods([]);
      setMultiSelectQuantities({});
      setMultiSelectMode(false);
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
    } else {
      Swal.fire({
        title: "Erro ao Adicionar",
        text: "Ocorreu um erro ao adicionar os alimentos. Tente novamente.",
        icon: "error",
        confirmButtonText: "Entendi",
      });
    }
  };

  const handleAdicionarAlimento = () => {
    const sucesso = adicionarAlimento(selectedFood, foodQuantity);
    if (sucesso) {
      setSelectedFood(null);
      setFoodQuantity(100);
      setOpenFoodSearch(false);
    }
  };

  const handleSalvarRefeicao = () => {
    const sucesso = isEditing ? salvarRefeicaoEditada() : salvarRefeicao();

    if (sucesso) {
      setOpenDialog(false);
      setIsEditing(false); // ← limpa o modo de edição
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
        confirmButtonText: "Entendi",
      });
    }
  };

  const handleGerarPDF = () => {
    if (refeicoes.length === 0) {
      Swal.fire({
        title: "Nenhuma Refeição",
        text: "Adicione pelo menos uma refeição antes de gerar o PDF.",
        icon: "warning",
        confirmButtonText: "Entendi",
      });
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
        Swal.fire({
          title: "📄 PDF Gerado!",
          text: "Seu plano alimentar foi gerado com sucesso.",
          icon: "success",
          timer: 3000,
          showConfirmButton: false,
        });
      },
    });

    pdfGenerator.gerarPDFEstilizado();
  };

  return (
    <Card
      sx={{ boxShadow: "0 8px 32px rgba(0,0,0,0.1)", borderRadius: "10px" }}
    >
      <CardContent sx={{ p: 4 }}>
        {/* Alertas de Limites */}
        {showCalorieAlert && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            ⚠️ Você está próximo do limite diário de calorias! Atual:{" "}
            {Math.round(totalComRefeicaoAtual.calorias)} / {calorias} kcal
          </Alert>
        )}

        {Object.keys(showMacroAlerts).length > 0 && (
          <Alert severity="info" sx={{ mb: 2 }}>
            📊 Atenção aos macronutrientes:{" "}
            {showMacroAlerts.proteina && (
              <Chip
                label="Proteínas próximo do limite"
                size="small"
                sx={{ mr: 1 }}
              />
            )}
            {showMacroAlerts.carbo && (
              <Chip
                label="Carboidratos próximo do limite"
                size="small"
                sx={{ mr: 1 }}
              />
            )}
            {showMacroAlerts.gordura && (
              <Chip label="Gorduras próximo do limite" size="small" />
            )}
          </Alert>
        )}

        {/* Cabeçalho */}
        <DietBuilderHeader
          calorias={calorias}
          refeicoes={refeicoes}
          onNewMeal={() => setOpenDialog(true)}
          onGeneratePDF={handleGerarPDF}
          pdfGenerating={pdfGenerating}
        />

        {/* Resumo Nutricional */}
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
                error={showCalorieAlert}
                helperText={
                  showCalorieAlert
                    ? "⚠️ Atenção ao limite de calorias diárias!"
                    : ""
                }
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

              <CurrentMealFoods
                alimentos={currentMeal.alimentos}
                onRemoveFood={removerAlimento}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                setOpenDialog(false);
                setIsEditing(false); // ← limpa o modo edição
                setCurrentMeal({ nome: "", alimentos: [] }); // ← limpa a refeição
              }}
            >
              Cancelar
            </Button>

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
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={multiSelectMode}
                      onChange={handleToggleMultiSelect}
                      icon={<CheckBoxIcon />}
                      checkedIcon={<CheckBoxIcon />}
                    />
                  }
                  label="Seleção Múltipla"
                />
                <Button onClick={limparBusca} size="small">
                  Limpar
                </Button>
              </Box>
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

            {multiSelectMode ? (
              <>
                <MultiSelectFoodCard
                  localResults={localResults}
                  searchResults={searchResults}
                  loading={loading}
                  selectedFoods={selectedFoods}
                  onFoodSelect={handleFoodMultiSelect}
                />

                {selectedFoods.length > 0 && (
                  <MultiSelectSummary
                    selectedFoods={selectedFoods}
                    quantities={multiSelectQuantities}
                    onQuantityChange={handleQuantityChange}
                  />
                )}
              </>
            ) : (
              <>
                <FoodSearchResults
                  localResults={localResults}
                  searchResults={searchResults}
                  loading={loading}
                  selectedFood={selectedFood}
                  onFoodSelect={setSelectedFood}
                />

                <FoodQuantitySelector
                  selectedFood={selectedFood}
                  foodQuantity={foodQuantity}
                  onQuantityChange={setFoodQuantity}
                />
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenFoodSearch(false)}>Cancelar</Button>
            {multiSelectMode ? (
              <Button
                variant="contained"
                onClick={handleAdicionarMultiplos}
                disabled={selectedFoods.length === 0}
                startIcon={<CheckBoxIcon />}
              >
                Adicionar {selectedFoods.length} Alimento
                {selectedFoods.length !== 1 ? "s" : ""}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleAdicionarAlimento}
                disabled={!selectedFood}
              >
                Adicionar
              </Button>
            )}
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
}
