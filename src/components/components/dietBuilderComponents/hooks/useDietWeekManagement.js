import { useState } from "react";

export const useDietWeekManagement = () => {
  const [refeicoesPorDia, setRefeicoesPorDia] = useState({
    SEG: [],
    TER: [],
    QUA: [],
    QUI: [],
    SEX: [],
    SAB: [],
    DOM: []
  });
  
  const [diaAtivo, setDiaAtivo] = useState('SEG');

  // Adicionar refeição ao dia específico
  const adicionarRefeicaoAoDia = (dia, refeicao) => {
    setRefeicoesPorDia(prev => ({
      ...prev,
      [dia]: [...prev[dia], { ...refeicao, id: Date.now() }]
    }));
  };

  // Remover refeição de um dia específico
  const removerRefeicaoDoDia = (dia, refeicaoId) => {
    setRefeicoesPorDia(prev => ({
      ...prev,
      [dia]: prev[dia].filter(r => r.id !== refeicaoId)
    }));
  };

  // Duplicar refeição dentro do mesmo dia
  const duplicarRefeicaoNoDia = (dia, refeicaoId) => {
    const refeicaoOriginal = refeicoesPorDia[dia].find(r => r.id === refeicaoId);
    if (!refeicaoOriginal) return false;

    const alimentosDuplicados = refeicaoOriginal.alimentos.map((alimento, index) => ({
      ...alimento,
      id: Date.now() + index
    }));

    const refeicaoDuplicada = {
      ...refeicaoOriginal,
      id: Date.now(),
      nome: `${refeicaoOriginal.nome} (Cópia)`,
      alimentos: alimentosDuplicados
    };

    setRefeicoesPorDia(prev => ({
      ...prev,
      [dia]: [...prev[dia], refeicaoDuplicada]
    }));

    return true;
  };

  // Mover refeição para cima dentro do mesmo dia
  const moverRefeicaoParaCima = (dia, refeicaoId) => {
    const refeicoes = refeicoesPorDia[dia];
    const index = refeicoes.findIndex(r => r.id === refeicaoId);
    
    if (index > 0) {
      const novasRefeicoes = [...refeicoes];
      [novasRefeicoes[index - 1], novasRefeicoes[index]] = 
      [novasRefeicoes[index], novasRefeicoes[index - 1]];
      
      setRefeicoesPorDia(prev => ({
        ...prev,
        [dia]: novasRefeicoes
      }));
    }
  };

  // Mover refeição para baixo dentro do mesmo dia
  const moverRefeicaoParaBaixo = (dia, refeicaoId) => {
    const refeicoes = refeicoesPorDia[dia];
    const index = refeicoes.findIndex(r => r.id === refeicaoId);
    
    if (index < refeicoes.length - 1) {
      const novasRefeicoes = [...refeicoes];
      [novasRefeicoes[index], novasRefeicoes[index + 1]] = 
      [novasRefeicoes[index + 1], novasRefeicoes[index]];
      
      setRefeicoesPorDia(prev => ({
        ...prev,
        [dia]: novasRefeicoes
      }));
    }
  };

  // Duplicar dia completo
  const duplicarDia = (diaOrigem, diaDestino = null, substituirExistentes = false) => {
    const refeicoesOrigem = refeicoesPorDia[diaOrigem];
    if (!refeicoesOrigem || refeicoesOrigem.length === 0) return false;

    // Se não especificou destino, pergunta ao usuário ou usa próximo dia
    const diasSemana = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB', 'DOM'];
    const indiceDiaOrigem = diasSemana.indexOf(diaOrigem);
    const diaParaDuplicar = diaDestino || diasSemana[(indiceDiaOrigem + 1) % 7];

    const refeicoesDuplicadas = refeicoesOrigem.map((refeicao, refeicaoIndex) => {
      const alimentosDuplicados = refeicao.alimentos.map((alimento, alimentoIndex) => ({
        ...alimento,
        id: Date.now() + refeicaoIndex * 1000 + alimentoIndex
      }));

      return {
        ...refeicao,
        id: Date.now() + refeicaoIndex * 1000,
        alimentos: alimentosDuplicados
      };
    });

    setRefeicoesPorDia(prev => ({
      ...prev,
      [diaParaDuplicar]: substituirExistentes 
        ? refeicoesDuplicadas 
        : [...prev[diaParaDuplicar], ...refeicoesDuplicadas]
    }));

    return diaParaDuplicar;
  };

  // Mover refeição entre dias
  const moverRefeicaoEntreDias = (diaOrigem, diaDestino, refeicaoId) => {
    const refeicao = refeicoesPorDia[diaOrigem].find(r => r.id === refeicaoId);
    if (!refeicao) return false;

    // Remove do dia origem
    setRefeicoesPorDia(prev => ({
      ...prev,
      [diaOrigem]: prev[diaOrigem].filter(r => r.id !== refeicaoId),
      [diaDestino]: [...prev[diaDestino], refeicao]
    }));

    return true;
  };

  // Atualizar refeição existente
  const atualizarRefeicaoNoDia = (dia, refeicaoAtualizada) => {
    setRefeicoesPorDia(prev => ({
      ...prev,
      [dia]: prev[dia].map(r => 
        r.id === refeicaoAtualizada.id ? refeicaoAtualizada : r
      )
    }));
  };

  // Calcular macros do dia
  const calcularMacrosDia = (dia) => {
    const refeicoes = refeicoesPorDia[dia] || [];
    return refeicoes.reduce(
      (acc, refeicao) => ({
        calorias: acc.calorias + (refeicao.macros?.calorias || 0),
        proteina: acc.proteina + (refeicao.macros?.proteina || 0),
        carbo: acc.carbo + (refeicao.macros?.carbo || 0),
        gordura: acc.gordura + (refeicao.macros?.gordura || 0)
      }),
      { calorias: 0, proteina: 0, carbo: 0, gordura: 0 }
    );
  };

  // Calcular macros da semana toda
  const calcularMacrosSemana = () => {
    const diasSemana = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB', 'DOM'];
    return diasSemana.reduce(
      (acc, dia) => {
        const macrosDia = calcularMacrosDia(dia);
        return {
          calorias: acc.calorias + macrosDia.calorias,
          proteina: acc.proteina + macrosDia.proteina,
          carbo: acc.carbo + macrosDia.carbo,
          gordura: acc.gordura + macrosDia.gordura
        };
      },
      { calorias: 0, proteina: 0, carbo: 0, gordura: 0 }
    );
  };

  // Obter estatísticas da semana
  const obterEstatisticasSemana = () => {
    const diasSemana = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB', 'DOM'];
    const totalRefeicoes = diasSemana.reduce((acc, dia) => 
      acc + (refeicoesPorDia[dia]?.length || 0), 0);
    
    const diasComRefeicoes = diasSemana.filter(dia => 
      refeicoesPorDia[dia]?.length > 0).length;

    return {
      totalRefeicoes,
      diasComRefeicoes,
      macrosSemana: calcularMacrosSemana()
    };
  };

  // Limpar dia específico
  const limparDia = (dia) => {
    setRefeicoesPorDia(prev => ({
      ...prev,
      [dia]: []
    }));
  };

  // Limpar semana toda
  const limparSemana = () => {
    setRefeicoesPorDia({
      SEG: [],
      TER: [],
      QUA: [],
      QUI: [],
      SEX: [],
      SAB: [],
      DOM: []
    });
  };

  return {
    // Estados
    refeicoesPorDia,
    diaAtivo,
    setDiaAtivo,
    
    // Operações com refeições
    adicionarRefeicaoAoDia,
    removerRefeicaoDoDia,
    duplicarRefeicaoNoDia,
    atualizarRefeicaoNoDia,
    
    // Movimentação de refeições
    moverRefeicaoParaCima,
    moverRefeicaoParaBaixo,
    moverRefeicaoEntreDias,
    
    // Operações com dias
    duplicarDia,
    limparDia,
    limparSemana,
    
    // Cálculos e estatísticas
    calcularMacrosDia,
    calcularMacrosSemana,
    obterEstatisticasSemana,
    
    // Getters utilitários
    getRefeicoesDia: (dia) => refeicoesPorDia[dia] || [],
    getTotalRefeicoesDia: (dia) => refeicoesPorDia[dia]?.length || 0
  };
};