// utils/nutrientCalculator.js

/**
 * Calcula os nutrientes de um alimento com base na quantidade e unidade
 * @param {Object} alimento - Objeto do alimento com dados nutricionais
 * @param {number} quantidade - Quantidade do alimento
 * @param {string} unidade - Unidade de medida ('gramas' ou outro tipo)
 * @param {Array} unidadesDisponiveis - Array com as unidades disponíveis para o alimento
 * @returns {Object} Objeto com os nutrientes calculados
 */
export const calcularNutrientes = (
  alimento,
  quantidade,
  unidade = "gramas",
  unidadesDisponiveis = []
) => {
  if (!alimento || !quantidade || quantidade <= 0) {
    return {
      calorias: 0,
      proteina: 0,
      carbo: 0,
      gordura: 0,
      gramas: 0,
    };
  }

  let gramas = quantidade;

  // Se não for gramas, converter para gramas usando as unidades disponíveis
  if (unidade !== "gramas") {
    gramas = converterParaGramas(quantidade, unidade, unidadesDisponiveis);
  }

  // Calcular nutrientes baseado em gramas (valores do alimento são por 100g)
  const fator = gramas / 100;

  return {
    calorias: Math.round(alimento.calorias * fator),
    proteina: Math.round(alimento.proteina * fator * 10) / 10,
    carbo: Math.round(alimento.carbo * fator * 10) / 10,
    gordura: Math.round(alimento.gordura * fator * 10) / 10,
    gramas: Math.round(gramas),
  };
};

/**
 * Calcula o total de nutrientes de uma lista de alimentos
 * @param {Array} alimentos - Array de alimentos com quantidade e unidade
 * @returns {Object} Objeto com o total de nutrientes
 */
export const calcularTotalNutrientes = (alimentos) => {
  return alimentos.reduce(
    (total, alimento) => {
      // Gerar unidades disponíveis para cada alimento
      const unidadesDisponiveis = gerarUnidadesDisponiveis(alimento);

      const nutrientes = calcularNutrientes(
        alimento,
        alimento.quantidade,
        alimento.unidade || "gramas",
        unidadesDisponiveis
      );

      return {
        calorias: total.calorias + nutrientes.calorias,
        proteina: total.proteina + nutrientes.proteina,
        carbo: total.carbo + nutrientes.carbo,
        gordura: total.gordura + nutrientes.gordura,
        gramas: total.gramas + nutrientes.gramas,
      };
    },
    { calorias: 0, proteina: 0, carbo: 0, gordura: 0, gramas: 0 }
  );
};

/**
 * Calcula o total de nutrientes de uma refeição
 * @param {Object} refeicao - Objeto da refeição com array de alimentos
 * @returns {Object} Objeto com o total de nutrientes da refeição
 */
export const calcularNutrientesRefeicao = (refeicao) => {
  if (!refeicao || !refeicao.alimentos || refeicao.alimentos.length === 0) {
    return { calorias: 0, proteina: 0, carbo: 0, gordura: 0, gramas: 0 };
  }

  return calcularTotalNutrientes(refeicao.alimentos);
};

/**
 * Calcula o total de nutrientes do dia inteiro
 * @param {Array} refeicoes - Array de refeições
 * @returns {Object} Objeto com o total de nutrientes do dia
 */
export const calcularNutrientesDia = (refeicoes) => {
  if (!refeicoes || refeicoes.length === 0) {
    return { calorias: 0, proteina: 0, carbo: 0, gordura: 0, gramas: 0 };
  }

  return refeicoes.reduce(
    (totalDia, refeicao) => {
      const nutrientesRefeicao = calcularNutrientesRefeicao(refeicao);

      return {
        calorias: totalDia.calorias + nutrientesRefeicao.calorias,
        proteina: totalDia.proteina + nutrientesRefeicao.proteina,
        carbo: totalDia.carbo + nutrientesRefeicao.carbo,
        gordura: totalDia.gordura + nutrientesRefeicao.gordura,
        gramas: totalDia.gramas + nutrientesRefeicao.gramas,
      };
    },
    { calorias: 0, proteina: 0, carbo: 0, gordura: 0, gramas: 0 }
  );
};

/**
 * Gera as unidades disponíveis para um alimento
 * @param {Object} alimento - Objeto do alimento
 * @returns {Array} Array com as unidades disponíveis
 */
export const gerarUnidadesDisponiveis = (alimento) => {
  if (!alimento) return [];

  // Sempre incluir gramas como opção
  const units = [
    {
      tipo: "gramas",
      label: "Gramas",
      descricao: "Medida em gramas",
      pesoPorUnidade: 1,
    },
  ];

  // Adicionar unidades específicas se disponíveis
  if (alimento.unidades && alimento.unidades.length > 0) {
    alimento.unidades.forEach((unidade, index) => {
      units.push({
        tipo: `${unidade.tipo}_${index}`,
        label: unidade.descricao || `${unidade.quantidade} ${unidade.tipo}(s)`,
        descricao: `Cada ${unidade.descricao} tem aproximadamente ${unidade.pesoPorUnidade}g`,
        pesoPorUnidade: unidade.pesoPorUnidade,
        tipoOriginal: unidade.tipo,
        quantidadeOriginal: unidade.quantidade,
        index: index,
      });
    });
  }

  return units;
};

/**
 * Converte quantidade para gramas - FUNÇÃO CORRIGIDA
 * @param {number} quantidade - Quantidade do alimento
 * @param {string} unidade - Unidade de medida
 * @param {Array} unidadesDisponiveis - Array com as unidades disponíveis
 * @returns {number} Quantidade convertida para gramas
 */
// Atualize converterParaGramas
export const converterParaGramas = (
  quantidade,
  unidade = "gramas",
  unidadesDisponiveis = []
) => {
  if (unidade === "gramas") return quantidade;

  const unidadeSelecionada = unidadesDisponiveis.find(
    (u) => u.tipo === unidade
  );

  // Se não encontrar, usa relação padrão 1:1
  return unidadeSelecionada
    ? quantidade * (unidadeSelecionada.pesoPorUnidade || 1)
    : quantidade;
};
