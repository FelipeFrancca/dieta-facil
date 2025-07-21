import { useState, useEffect, useCallback } from "react";
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
  Grid,
  Divider,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import RestoreIcon from "@mui/icons-material/Restore";
import CloseIcon from "@mui/icons-material/Close";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
import Swal from "sweetalert2";

import { FoodSearchCategories } from "./components/dietBuilderComponents/FoodSearchCategories";
import { CurrentMealFoods } from "./components/dietBuilderComponents/CurrentMealFoods";
import { DietBuilderHeader } from "./components/dietBuilderComponents/DietBuilderHeader";
import { MultiSelectFoodCard } from "./components/dietBuilderComponents/MultiSelectFoodCard";
import { WeekDaySelector } from "./components/dietBuilderComponents/WeekDaySelector";
import { MealTypeManager } from "./components/dietBuilderComponents/MealTypeManager";
import { WeeklySummary } from "./components/dietBuilderComponents/WeeklySummary";
import ShoppingListPreview from "./components/dietBuilderComponents/ShoppingListPreview";

import { useFoodSearch } from "./components/dietBuilderComponents/hooks/useFoodSearch";
import { useWeeklyDietManagement } from "./components/dietBuilderComponents/hooks/useWeeklyDietManagement";
import {
  calcularNutrientes,
  gerarUnidadesDisponiveis,
} from "./components/dietBuilderComponents/utils/nutrientCalculator";

import { categorias } from "./components/alimentosDatabase";
import PDFGenerator from "./components/PDFGenerator";

import {
  salvarDietaLocal,
  carregarDietaLocal,
  existeDietaSalva,
  getInfoDietaSalva,
  limparDietaLocal,
} from "./components/dietBuilderComponents/utils/localStorageUtils";

export default function WeeklyDietBuilder({ calorias, metaMacros = null }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [openDialog, setOpenDialog] = useState(false);
  const [openFoodSearch, setOpenFoodSearch] = useState(false);
  const [openShoppingList, setOpenShoppingList] = useState(false);
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [selectedFoods, setSelectedFoods] = useState([]);
  const [multiSelectQuantities, setMultiSelectQuantities] = useState({});
  const [multiSelectUnits, setMultiSelectUnits] = useState({}); // Novo estado para unidades
  const [isEditing, setIsEditing] = useState(false);
  const [showRestoreAlert, setShowRestoreAlert] = useState(false);
  const [dietaInfo, setDietaInfo] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

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
    dietaSemanal,
    diaAtivo,
    currentMeal,
    diasDaSemana,
    tiposRefeicao,
    setDiaAtivo,
    setCurrentMeal,
    setDietaSemanal,
    calcularTotalDia,
    calcularTotalSemana,
    calcularMacrosRefeicao,
    adicionarAlternativaRefeicao,
    editarAlternativaRefeicao,
    removerAlternativaRefeicao,
    duplicarAlternativaRefeicao,
    copiarDiaCompleto,
    adicionarAlimento,
    adicionarMultiplosAlimentos,
    removerAlimento,
    salvarRefeicaoAtual,
    carregarAlternativaParaEdicao,
    obterEstatisticas,
    corrigirMacrosExistentes,
  } = useWeeklyDietManagement();

  const totalDiaAtivo = calcularTotalDia(diaAtivo);
  const totalSemana = calcularTotalSemana();

  const calcularNutrientesRefeicaoAtual = useCallback(() => {
    if (!currentMeal.alimentos || currentMeal.alimentos.length === 0) {
      return { calorias: 0, proteina: 0, carbo: 0, gordura: 0, gramas: 0 };
    }

    return currentMeal.alimentos.reduce(
      (acc, alimento) => {
        const unidadesDisponiveis = gerarUnidadesDisponiveis(alimento);
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
  }, [currentMeal.alimentos]);

  const totalComRefeicaoAtual = useCallback(() => {
    const nutrientesRefeicaoAtual = calcularNutrientesRefeicaoAtual();

    return {
      calorias: totalDiaAtivo.calorias + nutrientesRefeicaoAtual.calorias,
      proteina: totalDiaAtivo.proteina + nutrientesRefeicaoAtual.proteina,
      carbo: totalDiaAtivo.carbo + nutrientesRefeicaoAtual.carbo,
      gordura: totalDiaAtivo.gordura + nutrientesRefeicaoAtual.gordura,
      gramas: totalDiaAtivo.gramas + nutrientesRefeicaoAtual.gramas,
    };
  }, [totalDiaAtivo, calcularNutrientesRefeicaoAtual]);

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

  const checkLimits = useCallback(() => {
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
  }, [totaisAtuais, calorias, metaMacros]);

  const getFoodKey = (food) => `${food.nome}_${food.calorias}`;

  // Função para gerar nome automático da alternativa
  const gerarNomeAlternativaAutomatico = (tipoRefeicao) => {
    const alternativasExistentes = dietaSemanal[diaAtivo]?.[tipoRefeicao] || [];
    const numeroAlternativa = alternativasExistentes.length + 1;
    
    if (numeroAlternativa === 1) {
      return "Opção Principal";
    } else {
      return `Opção ${numeroAlternativa}`;
    }
  };

  // Função para verificar se há alternativas com mais calorias que a principal
  const verificarAlternativasComMaisCalorias = (dia, tipoRefeicao) => {
    const alternativas = dietaSemanal[dia]?.[tipoRefeicao];
    if (!alternativas || alternativas.length <= 1) return [];

    const principalCalorias = alternativas[0]?.macros?.calorias || 0;
    
    // Filtra alternativas (exceto a principal) que têm mais calorias
    return alternativas.slice(1).filter(alt => 
      (alt.macros?.calorias || 0) > principalCalorias
    );
  };

  // Carregar dieta salva ao inicializar
  useEffect(() => {
    if (Object.keys(dietaSemanal).length === 0 && existeDietaSalva()) {
      const info = getInfoDietaSalva();
      if (info?.quantidadeRefeicoes > 0) {
        setDietaInfo(info);
        setShowRestoreAlert(true);
      }
    }
  }, [dietaSemanal]);

  // Corrigir macros existentes quando a dieta for carregada (apenas uma vez)
  useEffect(() => {
    if (Object.keys(dietaSemanal).length > 0) {
      // Verificar se há pelo menos uma alternativa para corrigir
      const temAlternativas = Object.values(dietaSemanal).some(dia => 
        Object.values(dia || {}).some(alternativas => alternativas && alternativas.length > 0)
      );
      
      if (temAlternativas) {
        // Aguardar um pouco para garantir que a dieta foi totalmente carregada
        const timer = setTimeout(() => {
          corrigirMacrosExistentes();
        }, 500);
        
        return () => clearTimeout(timer);
      }
    }
  }, [Object.keys(dietaSemanal).length, corrigirMacrosExistentes]); // Dependência mais específica

  // Salvar dieta automaticamente
  useEffect(() => {
    if (Object.keys(dietaSemanal).length > 0) {
      salvarDietaLocal(dietaSemanal, calorias, metaMacros);
    }
  }, [dietaSemanal, calorias, metaMacros]);

  useEffect(checkLimits, [checkLimits]);

  const handleNovaAlternativa = (tipoRefeicao) => {
    const nomeAutomatico = gerarNomeAlternativaAutomatico(tipoRefeicao);
    
    setCurrentMeal({ 
      nome: nomeAutomatico, 
      alimentos: [], 
      tipoRefeicao, 
      alternativaId: null 
    });
    setIsEditing(false);
    setOpenDialog(true);
  };

  const handleEditarAlternativa = (dia, tipoRefeicao, alternativaId) => {
    if (carregarAlternativaParaEdicao(dia, tipoRefeicao, alternativaId)) {
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
      const newUnits = { ...multiSelectUnits };
      delete newQuantities[foodKey];
      delete newUnits[foodKey];
      setMultiSelectQuantities(newQuantities);
      setMultiSelectUnits(newUnits);
    } else {
      setSelectedFoods([...selectedFoods, food]);
      setMultiSelectQuantities({ ...multiSelectQuantities, [foodKey]: 100 });
      setMultiSelectUnits({ ...multiSelectUnits, [foodKey]: "gramas" });
    }
  };

  const handleQuantityChange = (foodKey, quantity) => {
    setMultiSelectQuantities({ ...multiSelectQuantities, [foodKey]: quantity });
  };

  const handleUnitChange = (foodKey, unit) => {
    setMultiSelectUnits({ ...multiSelectUnits, [foodKey]: unit });
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

    const alimentosParaAdicionar = selectedFoods.map((food) => {
      const foodKey = getFoodKey(food);
      return {
        food,
        quantity: multiSelectQuantities[foodKey] || 100,
        unit: multiSelectUnits[foodKey] || "gramas", // Usar a unidade selecionada pelo usuário
      };
    });

    if (adicionarMultiplosAlimentos(alimentosParaAdicionar)) {
      setSelectedFoods([]);
      setMultiSelectQuantities({});
      setMultiSelectUnits({}); // Limpar também as unidades
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
    const sucesso = salvarRefeicaoAtual();

    if (sucesso) {
      setOpenDialog(false);
      setIsEditing(false);
      Swal.fire({
        title: "🍽️ Refeição Salva!",
        text: `Sua alternativa de ${tiposRefeicao.find(t => t.id === currentMeal.tipoRefeicao)?.nome.toLowerCase()} foi salva com sucesso.`,
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });
    } else {
      Swal.fire({
        title: "Erro",
        text: "Adicione um nome, tipo de refeição e pelo menos um alimento.",
        icon: "error",
      });
    }
  };

  const handleViewShoppingList = () => {
    const estatisticas = obterEstatisticas();
    if (estatisticas.totalAlternativas === 0) {
      return Swal.fire({
        title: "Nenhuma Refeição",
        text: "Adicione pelo menos uma refeição para ver a lista de compras.",
        icon: "warning",
      });
    }
    setOpenShoppingList(true);
  };

  const handleGerarPDF = () => {
    const estatisticas = obterEstatisticas();
    if (estatisticas.totalAlternativas === 0) {
      return Swal.fire({
        title: "Nenhuma Refeição",
        text: "Adicione pelo menos uma refeição antes de gerar o PDF.",
        icon: "warning",
      });
    }

    setPdfGenerating(true);
    
    // Converter estrutura semanal para formato compatível com PDF generator
    const refeicoesParaPDF = [];
    
    diasDaSemana.forEach(dia => {
      const refeicoesDoDia = dietaSemanal[dia.id];
      if (refeicoesDoDia) {
        Object.entries(refeicoesDoDia).forEach(([tipoRefeicao, alternativas]) => {
          alternativas.forEach((alternativa, index) => {
            const tipoInfo = tiposRefeicao.find(t => t.id === tipoRefeicao);
            // Recalcular os macros para garantir que estejam corretos com as unidades
            const macrosCorretos = calcularMacrosRefeicao(alternativa.alimentos);
            refeicoesParaPDF.push({
              id: `${dia.id}_${tipoRefeicao}_${alternativa.id}`,
              nome: `${dia.nome} - ${tipoInfo?.nome} ${index > 0 ? `(Alt. ${index + 1})` : ''}: ${alternativa.nome}`,
              alimentos: alternativa.alimentos,
              macros: macrosCorretos
            });
          });
        });
      }
    });

    PDFGenerator({
      refeicoes: refeicoesParaPDF,
      totalDia: totalSemana,
      calorias: calorias ? calorias * 7 : null, // Meta semanal
      onGenerate: () => {
        setPdfGenerating(false);
        Swal.fire({
          title: "📄 PDF Gerado!",
          text: "Seu plano alimentar semanal foi gerado com sucesso.",
          icon: "success",
          timer: 3000,
          showConfirmButton: false,
        });
      },
    }).gerarPDFEstilizado();
  };

  const restaurarDietaSalva = () => {
    const dietaData = carregarDietaLocal();
    if (dietaData?.dietaSemanal) {
      setDietaSemanal(dietaData.dietaSemanal);
      setShowRestoreAlert(false);
      
      // Corrigir os macros imediatamente após restaurar
      setTimeout(() => {
        corrigirMacrosExistentes();
      }, 100);
      
      const totalAlternativas = Object.values(dietaData.dietaSemanal).reduce((acc, dia) => {
        return acc + Object.values(dia || {}).reduce((accTipo, alternativas) => {
          return accTipo + (alternativas?.length || 0);
        }, 0);
      }, 0);

      Swal.fire({
        title: "🍽️ Dieta Restaurada!",
        text: `${totalAlternativas} alternativa${
          totalAlternativas !== 1 ? "s foram" : " foi"
        } restaurada${totalAlternativas !== 1 ? "s" : ""} com sucesso.`,
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
    setCurrentMeal({ nome: "", alimentos: [], tipoRefeicao: "", alternativaId: null });
  };

  const limparDia = (diaId) => {
    Swal.fire({
      title: "Confirmar Limpeza",
      text: `Tem certeza que deseja remover todas as refeições de ${diasDaSemana.find(d => d.id === diaId)?.nome}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sim, limpar",
      cancelButtonText: "Cancelar"
    }).then((result) => {
      if (result.isConfirmed) {
        setDietaSemanal(prev => {
          const nova = { ...prev };
          delete nova[diaId];
          return nova;
        });
        Swal.fire({
          title: "Dia Limpo!",
          text: "Todas as refeições foram removidas com sucesso.",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
      }
    });
  };

  const isNearCalorieLimit = calorias && totaisAtuais.calorias >= calorias * 0.9;
  const nearMacros = metaMacros
    ? ["proteina", "carbo", "gordura"].filter(
        (macro) =>
          metaMacros[macro] && totaisAtuais[macro] >= metaMacros[macro] * 0.9
      )
    : [];

  return (
    <Card sx={{ boxShadow: "0 8px 32px rgba(0,0,0,0.1)", borderRadius: "10px" }}>
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
            <AlertTitle>Dieta Salva Encontrada</AlertTitle>
            Encontramos uma dieta salva com {dietaInfo.quantidadeRefeicoes} refeições.
            Deseja restaurá-la?
          </Alert>
        )}

        {/* Alertas de limites próximos */}
        {(isNearCalorieLimit || nearMacros.length > 0) && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            <AlertTitle>⚠️ Próximo dos Limites Diários</AlertTitle>
            {isNearCalorieLimit && (
              <Typography variant="body2">
                • Calorias: {Math.round(totaisAtuais.calorias)} de {calorias} kcal
              </Typography>
            )}
            {nearMacros.map((macro) => (
              <Typography key={macro} variant="body2">
                • {macro.charAt(0).toUpperCase() + macro.slice(1)}: {Math.round(totaisAtuais[macro])} de {metaMacros[macro]}g
              </Typography>
            ))}
          </Alert>
        )}

        {/* Cabeçalho com título e ações */}
        <DietBuilderHeader 
          totalDia={totalDiaAtivo}
          totalSemana={totalSemana}
          onNewMeal={() => setOpenDialog(true)}
          onGerarPDF={handleGerarPDF}
          onViewShoppingList={handleViewShoppingList}
          pdfGenerating={pdfGenerating}
          semanal={true}
        />

        {/* Seletor de dias da semana */}
        <WeekDaySelector
          diasDaSemana={diasDaSemana}
          diaAtivo={diaAtivo}
          setDiaAtivo={setDiaAtivo}
          dietaSemanal={dietaSemanal}
          calcularTotalDia={calcularTotalDia}
          copiarDiaCompleto={copiarDiaCompleto}
          onLimparDia={limparDia}
        />

        {/* Tabs para alternar entre visualizações */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
            <Tab 
              icon={<RestaurantMenuIcon />} 
              label="Gerenciar Refeições" 
              iconPosition="start"
            />
            <Tab 
              icon={<CalendarMonthIcon />} 
              label="Resumo Semanal" 
              iconPosition="start"
            />
          </Tabs>
        </Box>

        {/* Conteúdo das tabs */}
        {activeTab === 0 && (
          <MealTypeManager
            diaAtivo={diaAtivo}
            diasDaSemana={diasDaSemana}
            tiposRefeicao={tiposRefeicao}
            dietaSemanal={dietaSemanal}
            calcularMacrosRefeicao={calcularMacrosRefeicao}
            onNovaAlternativa={handleNovaAlternativa}
            onEditarAlternativa={handleEditarAlternativa}
            onRemoverAlternativa={removerAlternativaRefeicao}
            onDuplicarAlternativa={duplicarAlternativaRefeicao}
          />
        )}

        {activeTab === 1 && (
          <WeeklySummary
            dietaSemanal={dietaSemanal}
            diasDaSemana={diasDaSemana}
            calcularTotalDia={calcularTotalDia}
            calcularTotalSemana={calcularTotalSemana}
            obterEstatisticas={obterEstatisticas}
            calorias={calorias}
            metaMacros={metaMacros}
          />
        )}

        {/* Diálogo para criar/editar refeição */}
        <Dialog 
          open={openDialog} 
          onClose={closeDialog} 
          maxWidth="lg" 
          fullWidth
          fullScreen={isMobile} // Fullscreen em mobile
          PaperProps={{
            sx: { 
              borderRadius: { xs: 0, sm: 2 },
              minHeight: { xs: "100vh", sm: "70vh" },
              maxHeight: { xs: "100vh", sm: "90vh" }
            }
          }}
        >
          <DialogTitle sx={{ pb: 1 }}>
            <Typography variant="h6" fontWeight="bold">
              {isEditing ? "✏️ Editar" : "➕ Nova"} Alternativa - {
                tiposRefeicao.find(t => t.id === currentMeal.tipoRefeicao)?.nome
              }
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {diasDaSemana.find(d => d.id === diaAtivo)?.nome}
            </Typography>
          </DialogTitle>
          
          <DialogContent sx={{ px: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                {/* Formulário da refeição */}
                <Box sx={{ mb: 3 }}>
                  <TextField
                    fullWidth
                    label="Nome da alternativa"
                    value={currentMeal.nome}
                    onChange={(e) => setCurrentMeal({ ...currentMeal, nome: e.target.value })}
                    placeholder="Ex: Pão com ovo ou Tapioca com frango"
                    sx={{ mb: 2 }}
                  />
                  
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Tipo de Refeição</InputLabel>
                    <Select
                      value={currentMeal.tipoRefeicao}
                      label="Tipo de Refeição"
                      onChange={(e) => setCurrentMeal({ ...currentMeal, tipoRefeicao: e.target.value })}
                    >
                      {tiposRefeicao.map((tipo) => (
                        <MenuItem key={tipo.id} value={tipo.id}>
                          {tipo.icon} {tipo.nome}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                {/* Busca de alimentos */}
                <Box sx={{ mb: 2 }}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<SearchIcon />}
                    onClick={() => setOpenFoodSearch(true)}
                    sx={{ mb: 2, height: 48 }}
                  >
                    Buscar e Adicionar Alimentos
                  </Button>
                </Box>

                {/* Macros da refeição atual */}
                <Box sx={{ p: 2, backgroundColor: "grey.50", borderRadius: 1 }}>
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                    📊 Resumo da Refeição
                  </Typography>
                  {(() => {
                    const macros = calcularNutrientesRefeicaoAtual();
                    return (
                      <Grid container spacing={1}>
                        <Grid item xs={6}>
                          <Typography variant="caption" display="block">
                            🔥 {Math.round(macros.calorias)} kcal
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" display="block">
                            💪 {Math.round(macros.proteina)}g
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" display="block">
                            🌾 {Math.round(macros.carbo)}g
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" display="block">
                            🥑 {Math.round(macros.gordura)}g
                          </Typography>
                        </Grid>
                      </Grid>
                    );
                  })()}
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                {/* Lista de alimentos da refeição atual */}
                <CurrentMealFoods
                  alimentos={currentMeal.alimentos}
                  onRemoverAlimento={removerAlimento}
                  compact={true}
                />
              </Grid>
            </Grid>
          </DialogContent>
          
          <DialogActions sx={{ p: 3, pt: 1 }}>
            <Button onClick={closeDialog}>Cancelar</Button>
            <Button 
              variant="contained" 
              onClick={handleSalvarRefeicao}
              disabled={!currentMeal.nome || !currentMeal.tipoRefeicao || currentMeal.alimentos.length === 0}
            >
              {isEditing ? "Salvar Alterações" : "Salvar Refeição"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Diálogo de busca de alimentos */}
        <Dialog 
          open={openFoodSearch} 
          onClose={() => setOpenFoodSearch(false)} 
          maxWidth="lg" 
          fullWidth
          fullScreen={isMobile} // Fullscreen em mobile
          PaperProps={{ sx: { borderRadius: { xs: 0, sm: 2 }, maxHeight: "90vh" } }}
        >
          <DialogTitle>
            <Typography variant="h6" fontWeight="bold">
              🔍 Buscar Alimentos
            </Typography>
          </DialogTitle>
          
          <DialogContent>
            <FoodSearchCategories
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              categorias={categorias}
              selectedCategory={selectedCategory}
              loading={loading}
              onCategorySelect={buscarPorCategoriaHandler}
              onClearSearch={limparBusca}
            />

            {(searchResults.length > 0 || localResults.length > 0) && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                  Resultados da Busca
                </Typography>
                
                <MultiSelectFoodCard
                  localResults={localResults}
                  searchResults={searchResults}
                  loading={loading}
                  selectedFoods={selectedFoods}
                  onFoodSelect={handleFoodMultiSelect}
                  multiSelectQuantities={multiSelectQuantities}
                  multiSelectUnits={multiSelectUnits}
                  onQuantityChange={handleQuantityChange}
                  onUnitChange={handleUnitChange}
                />
              </Box>
            )}

            {selectedFoods.length > 0 && (
              <Box sx={{ mt: 3, p: 2, backgroundColor: "primary.light", borderRadius: 1 }}>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom color="white">
                  {selectedFoods.length} alimento{selectedFoods.length !== 1 ? "s" : ""} selecionado{selectedFoods.length !== 1 ? "s" : ""}
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {selectedFoods.map((food, index) => (
                    <Chip
                      key={`${food.nome}_${index}`}
                      label={`${food.nome} (${multiSelectQuantities[getFoodKey(food)] || 100}g)`}
                      onDelete={() => handleFoodMultiSelect(food)}
                      size="small"
                      sx={{ backgroundColor: "white", color: "primary.main" }}
                    />
                  ))}
                </Box>
              </Box>
            )}
          </DialogContent>
          
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setOpenFoodSearch(false)}>Cancelar</Button>
            <Button 
              variant="contained" 
              onClick={handleAdicionarMultiplos}
              disabled={selectedFoods.length === 0}
              startIcon={<CheckBoxIcon />}
            >
              Adicionar Selecionados ({selectedFoods.length})
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog da Lista de Compras */}
        <Dialog 
          open={openShoppingList} 
          onClose={() => setOpenShoppingList(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: { xs: 0, sm: 2 },
              minHeight: { xs: "100vh", sm: "70vh" },
              maxHeight: { xs: "100vh", sm: "90vh" }
            }
          }}
        >
          <DialogTitle>
            <Typography variant="h6" fontWeight="bold">
              🛒 Lista de Compras Inteligente
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Calculada considerando preparos e conversões de medidas
            </Typography>
          </DialogTitle>
          
          <DialogContent sx={{ p: 0 }}>
            {(() => {
              // Converter estrutura semanal para formato da lista de compras
              const refeicoesParaLista = [];
              
              diasDaSemana.forEach(dia => {
                const refeicoesDoDia = dietaSemanal[dia.id];
                if (refeicoesDoDia) {
                  Object.entries(refeicoesDoDia).forEach(([tipoRefeicao, alternativas]) => {
                    alternativas.forEach((alternativa, index) => {
                      const tipoInfo = tiposRefeicao.find(t => t.id === tipoRefeicao);
                      refeicoesParaLista.push({
                        id: `${dia.id}_${tipoRefeicao}_${alternativa.id}`,
                        nome: `${dia.nome} - ${tipoInfo?.nome} ${index > 0 ? `(Alt. ${index + 1})` : ''}: ${alternativa.nome}`,
                        alimentos: alternativa.alimentos
                      });
                    });
                  });
                }
              });

              return (
                <ShoppingListPreview 
                  refeicoes={refeicoesParaLista}
                  onClose={() => setOpenShoppingList(false)}
                />
              );
            })()}
          </DialogContent>
          
          <DialogActions>
            <Button onClick={() => setOpenShoppingList(false)}>
              Fechar
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
}
