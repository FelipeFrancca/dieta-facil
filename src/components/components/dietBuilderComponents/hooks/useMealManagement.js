import { useState } from "react";
import {
  calcularNutrientes,
  gerarUnidadesDisponiveis,
} from "../utils/nutrientCalculator";

export const useMealManagement = () => {
  const [refeicoes, setRefeicoes] = useState([]);
  const [currentMeal, setCurrentMeal] = useState({ nome: "", alimentos: [] });

  // Atualize a função calcularMacrosRefeicao
  const calcularMacrosRefeicao = (alimentos) => {
    if (!alimentos || alimentos.length === 0) {
      return { calorias: 0, proteina: 0, carbo: 0, gordura: 0 };
    }

    return alimentos.reduce(
      (acc, alimento) => {
        const unidadesDisponiveis = gerarUnidadesDisponiveis(alimento);
        const nutrientes = calcularNutrientes(
          alimento,
          alimento.quantidade,
          alimento.unidade || "gramas", // Garante o uso da unidade
          unidadesDisponiveis
        );

        return {
          calorias: acc.calorias + nutrientes.calorias,
          proteina: acc.proteina + nutrientes.proteina,
          carbo: acc.carbo + nutrientes.carbo,
          gordura: acc.gordura + nutrientes.gordura,
        };
      },
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

  const restaurarRefeicoes = (refeicoesRestauradas) => {
    if (!refeicoesRestauradas || !Array.isArray(refeicoesRestauradas)) {
      console.error("❌ Dados de refeições inválidos para restauração");
      return false;
    }

    try {
      const refeicoesValidas = refeicoesRestauradas.filter((refeicao) => {
        return (
          refeicao &&
          refeicao.nome &&
          refeicao.alimentos &&
          Array.isArray(refeicao.alimentos) &&
          refeicao.macros
        );
      });

      if (refeicoesValidas.length === 0) {
        console.warn("⚠️ Nenhuma refeição válida encontrada para restaurar");
        return false;
      }

      const refeicoesComMacrosRecalculados = refeicoesValidas.map(
        (refeicao) => ({
          ...refeicao,
          macros: calcularMacrosRefeicao(refeicao.alimentos),
        })
      );

      setRefeicoes(refeicoesComMacrosRecalculados);
      console.log(
        `✅ ${refeicoesComMacrosRecalculados.length} refeições restauradas com sucesso`
      );
      return true;
    } catch (error) {
      console.error("❌ Erro ao restaurar refeições:", error);
      return false;
    }
  };

  const limparTodasRefeicoes = () => {
    setRefeicoes([]);
    setCurrentMeal({ nome: "", alimentos: [] });
  };

  const adicionarAlimento = (selectedFood, quantity, unit = "gramas") => {
    if (!selectedFood) return false;

    const novoAlimento = {
      ...selectedFood,
      quantidade: quantity,
      unidade: unit,
      id: Date.now(),
    };

    setCurrentMeal({
      ...currentMeal,
      alimentos: [...currentMeal.alimentos, novoAlimento],
    });

    return true;
  };

  const adicionarMultiplosAlimentos = (alimentosParaAdicionar) => {
    if (!alimentosParaAdicionar || alimentosParaAdicionar.length === 0) {
      return false;
    }

    const alimentosValidos = alimentosParaAdicionar.filter(
      (item) => item.food && item.quantity && item.quantity > 0
    );

    if (alimentosValidos.length === 0) {
      return false;
    }

    const novosAlimentos = alimentosValidos.map((item, index) => ({
      ...item.food,
      quantidade: item.quantity,
      unidade: item.unit || "gramas",
      id: Date.now() + index,
    }));

    setCurrentMeal({
      ...currentMeal,
      alimentos: [...currentMeal.alimentos, ...novosAlimentos],
    });

    return true;
  };

  const moverRefeicaoParaCima = (refeicaoId) => {
    const index = refeicoes.findIndex((r) => r.id === refeicaoId);
    if (index > 0) {
      const novasRefeicoes = [...refeicoes];
      const temp = novasRefeicoes[index - 1];
      novasRefeicoes[index - 1] = novasRefeicoes[index];
      novasRefeicoes[index] = temp;
      setRefeicoes(novasRefeicoes);
    }
  };

  const moverRefeicaoParaBaixo = (refeicaoId) => {
    const index = refeicoes.findIndex((r) => r.id === refeicaoId);
    if (index < refeicoes.length - 1) {
      const novasRefeicoes = [...refeicoes];
      const temp = novasRefeicoes[index + 1];
      novasRefeicoes[index + 1] = novasRefeicoes[index];
      novasRefeicoes[index] = temp;
      setRefeicoes(novasRefeicoes);
    }
  };

  const editarRefeicaoExistente = (refeicaoId) => {
    const refeicao = refeicoes.find((r) => r.id === refeicaoId);
    if (!refeicao) return false;

    const alimentosClonados = refeicao.alimentos.map((alimento) => ({
      ...alimento,
      id: Date.now() + Math.random() * 1000,
    }));

    setCurrentMeal({
      nome: refeicao.nome,
      alimentos: alimentosClonados,
      idOriginal: refeicao.id,
    });

    return true;
  };

  const salvarRefeicaoEditada = () => {
    if (!currentMeal.nome || currentMeal.alimentos.length === 0) return false;
    if (!currentMeal.idOriginal) return false;

    const macros = calcularMacrosRefeicao(currentMeal.alimentos);
    const refeicaoAtualizada = {
      id: currentMeal.idOriginal,
      nome: currentMeal.nome,
      alimentos: currentMeal.alimentos,
      macros,
    };

    const refeicoesAtualizadas = refeicoes.map((r) =>
      r.id === currentMeal.idOriginal ? refeicaoAtualizada : r
    );

    setRefeicoes(refeicoesAtualizadas);
    setCurrentMeal({ nome: "", alimentos: [] });
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
      alimentos: currentMeal.alimentos.filter(
        (a) => !alimentoIds.includes(a.id)
      ),
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

  const obterEstatisticasRefeicaoAtual = () => {
    const macros = calcularMacrosRefeicao(currentMeal.alimentos);
    return {
      totalAlimentos: currentMeal.alimentos.length,
      macros,
      temAlimentos: currentMeal.alimentos.length > 0,
      temNome: currentMeal.nome.trim().length > 0,
    };
  };

  const duplicarRefeicao = (refeicaoId) => {
    const refeicaoOriginal = refeicoes.find((r) => r.id === refeicaoId);
    if (!refeicaoOriginal) return false;

    const alimentosDuplicados = refeicaoOriginal.alimentos.map(
      (alimento, index) => ({
        ...alimento,
        id: Date.now() + index,
      })
    );

    const macros = calcularMacrosRefeicao(alimentosDuplicados);
    const novaRefeicao = {
      ...refeicaoOriginal,
      id: Date.now(),
      nome: `${refeicaoOriginal.nome} (Cópia)`,
      alimentos: alimentosDuplicados,
      macros,
    };

    setRefeicoes([...refeicoes, novaRefeicao]);
    return true;
  };

  const calcularMacrosRefeicaoAtual = () => {
    return calcularMacrosRefeicao(currentMeal.alimentos);
  };

  return {
    refeicoes,
    currentMeal,
    setCurrentMeal,

    calcularTotalDia,
    calcularMacrosRefeicaoAtual,
    adicionarAlimento,
    adicionarMultiplosAlimentos,
    editarRefeicaoExistente,
    salvarRefeicaoEditada,
    removerAlimento,
    removerMultiplosAlimentos,
    salvarRefeicao,
    removerRefeicao,
    duplicarRefeicao,
    obterEstatisticasRefeicaoAtual,
    moverRefeicaoParaCima,
    moverRefeicaoParaBaixo,

    restaurarRefeicoes,
    limparTodasRefeicoes,

    setRefeicoes,
  };
};
