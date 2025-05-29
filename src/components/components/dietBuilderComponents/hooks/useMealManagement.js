// hooks/useMealManagement.js
import { useState } from 'react';

export const useMealManagement = () => {
  const [refeicoes, setRefeicoes] = useState([]);
  const [currentMeal, setCurrentMeal] = useState({ nome: "", alimentos: [] });

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

  const adicionarAlimento = (selectedFood, quantity) => {
    if (!selectedFood) return false;

    const novoAlimento = {
      ...selectedFood,
      quantidade: quantity,
      id: Date.now(),
    };

    setCurrentMeal({
      ...currentMeal,
      alimentos: [...currentMeal.alimentos, novoAlimento],
    });

    return true;
  };

  // Nova função para adicionar múltiplos alimentos
  const adicionarMultiplosAlimentos = (alimentosParaAdicionar) => {
    if (!alimentosParaAdicionar || alimentosParaAdicionar.length === 0) {
      return false;
    }

    // Validar se todos os itens têm food e quantity válidos
    const alimentosValidos = alimentosParaAdicionar.filter(
      item => item.food && item.quantity && item.quantity > 0
    );

    if (alimentosValidos.length === 0) {
      return false;
    }

    // Criar os novos alimentos com IDs únicos
    const novosAlimentos = alimentosValidos.map((item, index) => ({
      ...item.food,
      quantidade: item.quantity,
      id: Date.now() + index, // Garantir IDs únicos
    }));

    // Adicionar todos os alimentos à refeição atual
    setCurrentMeal({
      ...currentMeal,
      alimentos: [...currentMeal.alimentos, ...novosAlimentos],
    });

    return true;
  };

  const removerAlimento = (alimentoId) => {
    setCurrentMeal({
      ...currentMeal,
      alimentos: currentMeal.alimentos.filter((a) => a.id !== alimentoId),
    });
  };

  const removerMultiplosAlimentos = (alimentoIds) => {
    if (!alimentoIds || alimentoIds.length === 0) return false;

    setCurrentMeal({
      ...currentMeal,
      alimentos: currentMeal.alimentos.filter((a) => !alimentoIds.includes(a.id)),
    });

    return true;
  };

  const salvarRefeicao = () => {
    if (!currentMeal.nome || currentMeal.alimentos.length === 0) {
      return false;
    }

    const macros = calcularMacrosRefeicao(currentMeal.alimentos);
    const novaRefeicao = {
      ...currentMeal,
      macros,
      id: Date.now(),
    };

    setRefeicoes([...refeicoes, novaRefeicao]);
    setCurrentMeal({ nome: "", alimentos: [] });
    return true;
  };

  const removerRefeicao = (refeicaoId) => {
    setRefeicoes(refeicoes.filter((r) => r.id !== refeicaoId));
  };

  // Função utilitária para obter estatísticas da refeição atual
  const obterEstatisticasRefeicaoAtual = () => {
    const macros = calcularMacrosRefeicao(currentMeal.alimentos);
    return {
      totalAlimentos: currentMeal.alimentos.length,
      macros,
      temAlimentos: currentMeal.alimentos.length > 0,
      temNome: currentMeal.nome.trim().length > 0,
    };
  };

  // Função para duplicar uma refeição existente
  const duplicarRefeicao = (refeicaoId) => {
    const refeicaoOriginal = refeicoes.find(r => r.id === refeicaoId);
    if (!refeicaoOriginal) return false;

    // Criar novos IDs para todos os alimentos
    const alimentosDuplicados = refeicaoOriginal.alimentos.map((alimento, index) => ({
      ...alimento,
      id: Date.now() + index,
    }));

    const novaRefeicao = {
      ...refeicaoOriginal,
      id: Date.now(),
      nome: `${refeicaoOriginal.nome} (Cópia)`,
      alimentos: alimentosDuplicados,
    };

    setRefeicoes([...refeicoes, novaRefeicao]);
    return true;
  };

  return {
    refeicoes,
    currentMeal,
    setCurrentMeal,
    calcularTotalDia,
    adicionarAlimento,
    adicionarMultiplosAlimentos, // Nova função exportada
    removerAlimento,
    removerMultiplosAlimentos, // Nova função para remover múltiplos
    salvarRefeicao,
    removerRefeicao,
    duplicarRefeicao, // Nova função para duplicar refeições
    obterEstatisticasRefeicaoAtual, // Nova função utilitária
  };
};