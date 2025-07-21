import { useState, useCallback } from "react";
import {
  calcularNutrientes,
  gerarUnidadesDisponiveis,
} from "../utils/nutrientCalculator";

export const useWeeklyDietManagement = () => {
  // Estrutura: { [diaSemana]: { [tipoRefeicao]: [alternativas] } }
  const [dietaSemanal, setDietaSemanal] = useState({});
  const [diaAtivo, setDiaAtivo] = useState("segunda");
  const [currentMeal, setCurrentMeal] = useState({ 
    nome: "", 
    alimentos: [],
    tipoRefeicao: "",
    alternativaId: null
  });

  const diasDaSemana = [
    { id: "segunda", nome: "Segunda-feira", abrev: "SEG" },
    { id: "terca", nome: "Terça-feira", abrev: "TER" },
    { id: "quarta", nome: "Quarta-feira", abrev: "QUA" },
    { id: "quinta", nome: "Quinta-feira", abrev: "QUI" },
    { id: "sexta", nome: "Sexta-feira", abrev: "SEX" },
    { id: "sabado", nome: "Sábado", abrev: "SAB" },
    { id: "domingo", nome: "Domingo", abrev: "DOM" },
  ];

  const tiposRefeicao = [
    { id: "cafe", nome: "Café da Manhã", icon: "☕" },
    { id: "lanche1", nome: "Lanche da Manhã", icon: "🍎" },
    { id: "almoco", nome: "Almoço", icon: "🍽️" },
    { id: "lanche2", nome: "Lanche da Tarde", icon: "🥪" },
    { id: "jantar", nome: "Jantar", icon: "🍲" },
    { id: "ceia", nome: "Ceia", icon: "🥛" },
  ];

  // Função para calcular macros de uma refeição
  const calcularMacrosRefeicao = useCallback((alimentos) => {
    if (!alimentos || alimentos.length === 0) {
      return { calorias: 0, proteina: 0, carbo: 0, gordura: 0, gramas: 0 };
    }

    const resultado = alimentos.reduce(
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

    return resultado;
  }, []);

  // Calcular total de um dia específico
  const calcularTotalDia = useCallback((dia = diaAtivo) => {
    const refeicoesDoDia = dietaSemanal[dia];
    if (!refeicoesDoDia) {
      return { calorias: 0, proteina: 0, carbo: 0, gordura: 0, gramas: 0 };
    }

    return Object.values(refeicoesDoDia).reduce((acc, alternativas) => {
      if (!alternativas || alternativas.length === 0) return acc;
      
      // Para cálculo de totais, usar apenas a primeira alternativa de cada tipo de refeição
      const primeiraAlternativa = alternativas[0];
      // SEMPRE recalcular os macros para garantir que as unidades sejam consideradas corretamente
      const macros = calcularMacrosRefeicao(primeiraAlternativa.alimentos);
      
      return {
        calorias: acc.calorias + macros.calorias,
        proteina: acc.proteina + macros.proteina,
        carbo: acc.carbo + macros.carbo,
        gordura: acc.gordura + macros.gordura,
        gramas: acc.gramas + macros.gramas,
      };
    }, { calorias: 0, proteina: 0, carbo: 0, gordura: 0, gramas: 0 });
  }, [dietaSemanal, diaAtivo, calcularMacrosRefeicao]);

  // Calcular total da semana inteira
  const calcularTotalSemana = useCallback(() => {
    return diasDaSemana.reduce((acc, dia) => {
      const totalDia = calcularTotalDia(dia.id);
      return {
        calorias: acc.calorias + totalDia.calorias,
        proteina: acc.proteina + totalDia.proteina,
        carbo: acc.carbo + totalDia.carbo,
        gordura: acc.gordura + totalDia.gordura,
        gramas: acc.gramas + totalDia.gramas,
      };
    }, { calorias: 0, proteina: 0, carbo: 0, gordura: 0, gramas: 0 });
  }, [diasDaSemana, calcularTotalDia]);

  // Adicionar nova alternativa a um tipo de refeição
  const adicionarAlternativaRefeicao = useCallback((dia, tipoRefeicao, nomeAlternativa, alimentos) => {
    if (!nomeAlternativa || !alimentos || alimentos.length === 0) return false;

    // SEMPRE recalcular os macros para garantir que as unidades sejam consideradas corretamente
    const macros = calcularMacrosRefeicao(alimentos);
    const novaAlternativa = {
      id: Date.now() + Math.random(),
      nome: nomeAlternativa,
      alimentos: alimentos,
      macros: macros, // Macros recalculados corretamente
      criadoEm: new Date().toISOString(),
    };

    setDietaSemanal(prev => ({
      ...prev,
      [dia]: {
        ...prev[dia],
        [tipoRefeicao]: [
          ...(prev[dia]?.[tipoRefeicao] || []),
          novaAlternativa
        ]
      }
    }));

    return true;
  }, [calcularMacrosRefeicao]);

  // Editar alternativa existente
  const editarAlternativaRefeicao = useCallback((dia, tipoRefeicao, alternativaId, nomeAlternativa, alimentos) => {
    if (!nomeAlternativa || !alimentos || alimentos.length === 0) return false;

    // SEMPRE recalcular os macros para garantir que as unidades sejam consideradas corretamente
    const macros = calcularMacrosRefeicao(alimentos);

    setDietaSemanal(prev => {
      const alternativasAtuais = prev[dia]?.[tipoRefeicao] || [];
      const alternativasAtualizadas = alternativasAtuais.map(alt => 
        alt.id === alternativaId 
          ? { ...alt, nome: nomeAlternativa, alimentos, macros } // Macros recalculados corretamente
          : alt
      );

      return {
        ...prev,
        [dia]: {
          ...prev[dia],
          [tipoRefeicao]: alternativasAtualizadas
        }
      };
    });

    return true;
  }, [calcularMacrosRefeicao]);

  // Remover alternativa
  const removerAlternativaRefeicao = useCallback((dia, tipoRefeicao, alternativaId) => {
    setDietaSemanal(prev => {
      const alternativasAtuais = prev[dia]?.[tipoRefeicao] || [];
      const alternativasFiltradas = alternativasAtuais.filter(alt => alt.id !== alternativaId);

      const novoDia = { ...prev[dia] };
      if (alternativasFiltradas.length === 0) {
        delete novoDia[tipoRefeicao];
      } else {
        novoDia[tipoRefeicao] = alternativasFiltradas;
      }

      return {
        ...prev,
        [dia]: Object.keys(novoDia).length > 0 ? novoDia : undefined
      };
    });
  }, []);

  // Duplicar alternativa
  const duplicarAlternativaRefeicao = useCallback((dia, tipoRefeicao, alternativaId) => {
    const alternativa = dietaSemanal[dia]?.[tipoRefeicao]?.find(alt => alt.id === alternativaId);
    if (!alternativa) return false;

    const alimentosDuplicados = alternativa.alimentos.map((alimento, index) => ({
      ...alimento,
      id: Date.now() + index + Math.random(),
    }));

    return adicionarAlternativaRefeicao(
      dia, 
      tipoRefeicao, 
      `${alternativa.nome} (Cópia)`, 
      alimentosDuplicados
    );
  }, [dietaSemanal, adicionarAlternativaRefeicao]);

  // Copiar dia inteiro para outro dia
  const copiarDiaCompleto = useCallback((diaOrigem, diaDestino) => {
    const refeicoesDiaOrigem = dietaSemanal[diaOrigem];
    if (!refeicoesDiaOrigem) return false;

    setDietaSemanal(prev => ({
      ...prev,
      [diaDestino]: JSON.parse(JSON.stringify(refeicoesDiaOrigem)) // Deep copy
    }));

    return true;
  }, [dietaSemanal]);

  // Adicionar alimento à refeição atual
  const adicionarAlimento = useCallback((selectedFood, quantity, unit = "gramas") => {
    if (!selectedFood || !quantity || quantity <= 0) return false;

    const novoAlimento = {
      id: Date.now() + Math.random(),
      nome: selectedFood.nome,
      calorias: selectedFood.calorias,
      proteina: selectedFood.proteina,
      carbo: selectedFood.carbo,
      gordura: selectedFood.gordura,
      unidades: selectedFood.unidades || [],
      quantidade: quantity,
      unidade: unit,
      ...(selectedFood.categoria && { categoria: selectedFood.categoria }),
      ...(selectedFood.grupo && { grupo: selectedFood.grupo }),
    };

    setCurrentMeal(prev => ({
      ...prev,
      alimentos: [...prev.alimentos, novoAlimento],
    }));

    return true;
  }, []);

  // Adicionar múltiplos alimentos
  const adicionarMultiplosAlimentos = useCallback((alimentosParaAdicionar) => {
    if (!alimentosParaAdicionar || alimentosParaAdicionar.length === 0) return false;

    const alimentosValidos = alimentosParaAdicionar.filter(
      (item) => item.food && item.quantity && item.quantity > 0
    );

    if (alimentosValidos.length === 0) return false;

    const novosAlimentos = alimentosValidos.map((item, index) => ({
      id: Date.now() + index + Math.random(),
      nome: item.food.nome,
      calorias: item.food.calorias,
      proteina: item.food.proteina,
      carbo: item.food.carbo,
      gordura: item.food.gordura,
      unidades: item.food.unidades || [],
      quantidade: item.quantity,
      unidade: item.unit || "gramas",
      ...(item.food.categoria && { categoria: item.food.categoria }),
      ...(item.food.grupo && { grupo: item.food.grupo }),
    }));

    setCurrentMeal(prev => ({
      ...prev,
      alimentos: [...prev.alimentos, ...novosAlimentos],
    }));

    return true;
  }, []);

  // Remover alimento da refeição atual
  const removerAlimento = useCallback((alimentoId) => {
    setCurrentMeal(prev => ({
      ...prev,
      alimentos: prev.alimentos.filter(a => a.id !== alimentoId),
    }));
  }, []);

  // Salvar refeição atual como alternativa
  const salvarRefeicaoAtual = useCallback(() => {
    if (!currentMeal.nome || currentMeal.alimentos.length === 0 || !currentMeal.tipoRefeicao) {
      return false;
    }

    const sucesso = currentMeal.alternativaId 
      ? editarAlternativaRefeicao(
          diaAtivo, 
          currentMeal.tipoRefeicao, 
          currentMeal.alternativaId, 
          currentMeal.nome, 
          currentMeal.alimentos
        )
      : adicionarAlternativaRefeicao(
          diaAtivo, 
          currentMeal.tipoRefeicao, 
          currentMeal.nome, 
          currentMeal.alimentos
        );

    if (sucesso) {
      setCurrentMeal({ nome: "", alimentos: [], tipoRefeicao: "", alternativaId: null });
    }

    return sucesso;
  }, [currentMeal, diaAtivo, editarAlternativaRefeicao, adicionarAlternativaRefeicao]);

  // Carregar alternativa para edição
  const carregarAlternativaParaEdicao = useCallback((dia, tipoRefeicao, alternativaId) => {
    const alternativa = dietaSemanal[dia]?.[tipoRefeicao]?.find(alt => alt.id === alternativaId);
    if (!alternativa) return false;

    const alimentosClonados = alternativa.alimentos.map(alimento => ({
      ...alimento,
      id: Date.now() + Math.random(),
    }));

    setCurrentMeal({
      nome: alternativa.nome,
      alimentos: alimentosClonados,
      tipoRefeicao: tipoRefeicao,
      alternativaId: alternativaId,
    });

    return true;
  }, [dietaSemanal]);

  // Função para limpar refeição atual
  const limparRefeicaoAtual = useCallback(() => {
    setCurrentMeal({ nome: "", alimentos: [], tipoRefeicao: "", alternativaId: null });
  }, []);

  // Função para corrigir macros de alternativas já salvas
  const corrigirMacrosExistentes = useCallback(() => {
    setDietaSemanal(prev => {
      const dietaCorrigida = {};
      let totalCorrigidas = 0;
      
      Object.entries(prev).forEach(([dia, refeicoesDoDia]) => {
        dietaCorrigida[dia] = {};
        
        Object.entries(refeicoesDoDia).forEach(([tipoRefeicao, alternativas]) => {
          dietaCorrigida[dia][tipoRefeicao] = alternativas.map(alternativa => {
            const macrosNovos = calcularMacrosRefeicao(alternativa.alimentos);
            totalCorrigidas++;
            
            return {
              ...alternativa,
              macros: macrosNovos
            };
          });
        });
      });
      
      return dietaCorrigida;
    });
  }, [calcularMacrosRefeicao]);

  // Obter estatísticas gerais
  const obterEstatisticas = useCallback(() => {
    const totalSemana = calcularTotalSemana();
    const diasComRefeicoes = diasDaSemana.filter(dia => 
      dietaSemanal[dia.id] && Object.keys(dietaSemanal[dia.id]).length > 0
    ).length;

    const totalAlternativas = Object.values(dietaSemanal).reduce((acc, dia) => {
      return acc + Object.values(dia || {}).reduce((accTipo, alternativas) => {
        return accTipo + (alternativas?.length || 0);
      }, 0);
    }, 0);

    return {
      totalSemana,
      diasComRefeicoes,
      totalAlternativas,
      mediaDiaria: {
        calorias: diasComRefeicoes > 0 ? Math.round(totalSemana.calorias / diasComRefeicoes) : 0,
        proteina: diasComRefeicoes > 0 ? Math.round(totalSemana.proteina / diasComRefeicoes) : 0,
        carbo: diasComRefeicoes > 0 ? Math.round(totalSemana.carbo / diasComRefeicoes) : 0,
        gordura: diasComRefeicoes > 0 ? Math.round(totalSemana.gordura / diasComRefeicoes) : 0,
      }
    };
  }, [calcularTotalSemana, diasDaSemana, dietaSemanal]);

  return {
    // Estados
    dietaSemanal,
    diaAtivo,
    currentMeal,
    diasDaSemana,
    tiposRefeicao,

    // Setters
    setDiaAtivo,
    setCurrentMeal,
    setDietaSemanal,

    // Cálculos
    calcularTotalDia,
    calcularTotalSemana,
    calcularMacrosRefeicao,

    // Gerenciamento de alternativas
    adicionarAlternativaRefeicao,
    editarAlternativaRefeicao,
    removerAlternativaRefeicao,
    duplicarAlternativaRefeicao,
    copiarDiaCompleto,

    // Gerenciamento da refeição atual
    adicionarAlimento,
    adicionarMultiplosAlimentos,
    removerAlimento,
    salvarRefeicaoAtual,
    carregarAlternativaParaEdicao,
    limparRefeicaoAtual,

    // Estatísticas
    obterEstatisticas,
    
    // Correção de dados
    corrigirMacrosExistentes,
  };
};
