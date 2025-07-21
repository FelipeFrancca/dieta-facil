/**
 * Utilitários para conversão de alimentos e lista de compras
 */

import { converterParaGramas } from './nutrientCalculator';

/**
 * Mapeamento de preparos e seus fatores de conversão aproximados
 * (quanto de alimento cru é necessário para obter X gramas do alimento preparado)
 */
export const FATORES_CONVERSAO_PREPARO = {
  // Carnes (perdem peso ao cozinhar devido à perda de água)
  'frango_cozido': 1.25,
  'carne_cozida': 1.30,
  'peixe_cozido': 1.20,
  'frango_grelhado': 1.25,
  'carne_grelhada': 1.30,
  'peixe_grelhado': 1.20,
  'frango_assado': 1.25,
  'carne_assada': 1.30,
  'peixe_assado': 1.20,
  
  // Vegetais (alguns perdem, outros mantêm peso)
  'brocolis_cozido': 1.00,
  'cenoura_cozida': 1.00,
  'batata_cozida': 1.00,
  'arroz_cozido': 2.50, // Arroz absorve muita água
  'macarrao_cozido': 2.00,
  'feijao_cozido': 2.00,
  
  // Preparos padrão
  'cozido': 1.15,
  'cozida': 1.15,
  'grelhado': 1.20,
  'grelhada': 1.20,
  'assado': 1.20,
  'assada': 1.20,
  'refogado': 1.10,
  'refogada': 1.10,
  'frito': 1.10,
  'frita': 1.10,
  'cru': 1.00,
  'crua': 1.00,
  'natural': 1.00
};

/**
 * Normaliza o nome do alimento e identifica o preparo
 */
export const analisarAlimento = (nomeAlimento) => {
  const nome = nomeAlimento.toLowerCase().trim();
  
  // Identificar preparo específico
  let preparo = 'natural';
  let nomeBase = nome;
  let fatorConversao = 1.00;
  
  // Procurar por preparos específicos primeiro
  for (const [chave, fator] of Object.entries(FATORES_CONVERSAO_PREPARO)) {
    if (nome.includes(chave.replace('_', ' '))) {
      preparo = chave.replace('_', ' ');
      nomeBase = nome.replace(chave.replace('_', ' '), '').trim();
      fatorConversao = fator;
      break;
    }
  }
  
  // Se não encontrou preparo específico, procurar por preparos genéricos
  if (preparo === 'natural') {
    const preparos = ['cozido', 'cozida', 'grelhado', 'grelhada', 'assado', 'assada', 'refogado', 'refogada', 'frito', 'frita', 'no vapor'];
    for (const prep of preparos) {
      if (nome.includes(prep)) {
        preparo = prep;
        nomeBase = nome.replace(prep, '').trim();
        fatorConversao = FATORES_CONVERSAO_PREPARO[prep] || 1.15;
        break;
      }
    }
  }
  
  // Limpar palavras desnecessárias do nome base
  nomeBase = nomeBase
    .replace(/\b(de|da|do|com|sem|em)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  
  return {
    nomeOriginal: nomeAlimento,
    nomeBase: nomeBase,
    nomeCompra: nomeBase, // Nome para agrupar na lista de compras
    preparo: preparo,
    fatorConversao: fatorConversao,
    precisaConversao: fatorConversao !== 1.00
  };
};

/**
 * Calcula a quantidade necessária para compra considerando perdas no preparo
 */
export const calcularQuantidadeCompra = (alimento, quantidade, unidade, unidadesDisponiveis) => {
  const analise = analisarAlimento(alimento.nome);
  
  // Converter para gramas primeiro
  const gramasConsumidas = converterParaGramas(quantidade, unidade || "gramas", unidadesDisponiveis);
  
  // Aplicar fator de conversão para obter quantidade crua necessária
  const gramasParaComprar = gramasConsumidas * analise.fatorConversao;
  
  return {
    ...analise,
    quantidadeConsumida: gramasConsumidas,
    quantidadeCompra: gramasParaComprar,
    unidadeOriginal: unidade || "gramas",
    diferenca: gramasParaComprar - gramasConsumidas
  };
};

/**
 * Agrupa alimentos para lista de compras, considerando preparos
 */
export const gerarListaComprasInteligente = (refeicoes) => {
  const agrupamentos = {};
  
  refeicoes.forEach((refeicao) => {
    refeicao.alimentos.forEach((alimento) => {
      const calculoCompra = calcularQuantidadeCompra(
        alimento, 
        alimento.quantidade, 
        alimento.unidade,
        alimento.unidadesDisponiveis || []
      );
      
      const chaveAgrupamento = calculoCompra.nomeCompra;
      
      if (!agrupamentos[chaveAgrupamento]) {
        agrupamentos[chaveAgrupamento] = {
          nomeCompra: calculoCompra.nomeCompra,
          quantidadeTotal: 0,
          preparos: new Set(),
          unidadesOriginais: new Set(),
          detalhes: []
        };
      }
      
      agrupamentos[chaveAgrupamento].quantidadeTotal += calculoCompra.quantidadeCompra;
      agrupamentos[chaveAgrupamento].preparos.add(calculoCompra.preparo);
      agrupamentos[chaveAgrupamento].unidadesOriginais.add(calculoCompra.unidadeOriginal);
      agrupamentos[chaveAgrupamento].detalhes.push({
        nomeOriginal: calculoCompra.nomeOriginal,
        refeicao: refeicao.nome,
        quantidadeConsumida: calculoCompra.quantidadeConsumida,
        quantidadeCompra: calculoCompra.quantidadeCompra,
        preparo: calculoCompra.preparo
      });
    });
  });
  
  return Object.values(agrupamentos).map(item => ({
    nome: item.nomeCompra,
    quantidadeGramas: Math.ceil(item.quantidadeTotal),
    quantidadeExibicao: formatarQuantidade(item.quantidadeTotal),
    preparos: Array.from(item.preparos),
    unidadesOriginais: Array.from(item.unidadesOriginais),
    detalhes: item.detalhes,
    temConversoes: item.detalhes.some(d => d.quantidadeCompra !== d.quantidadeConsumida)
  })).sort((a, b) => a.nome.localeCompare(b.nome));
};

/**
 * Formata quantidade para exibição amigável
 */
export const formatarQuantidade = (gramas) => {
  if (gramas >= 1000) {
    const kg = (gramas / 1000);
    if (kg >= 10) {
      return `${Math.ceil(kg)}kg`;
    } else {
      return `${kg.toFixed(1)}kg`;
    }
  } else if (gramas >= 100) {
    return `${Math.ceil(gramas / 10) * 10}g`;
  } else {
    return `${Math.ceil(gramas)}g`;
  }
};

/**
 * Gera dicas de compra baseadas nos alimentos da lista
 */
export const gerarDicasCompra = (listaCompras) => {
  const dicas = [];
  
  const itemsComConversao = listaCompras.filter(item => item.temConversoes);
  if (itemsComConversao.length > 0) {
    dicas.push("🍖 Alguns itens consideram perdas no preparo. Compre um pouco a mais para garantir.");
  }
  
  const pesoTotal = listaCompras.reduce((acc, item) => acc + item.quantidadeGramas, 0);
  if (pesoTotal > 5000) {
    dicas.push("🛒 Lista pesada! Considere dividir as compras em dias diferentes.");
  }
  
  const itensMuitoPequenos = listaCompras.filter(item => item.quantidadeGramas < 50);
  if (itensMuitoPequenos.length > 0) {
    dicas.push("⚖️ Alguns itens têm quantidade muito pequena. Verifique se vale a pena comprar embalagens maiores.");
  }
  
  return dicas;
};

export default {
  analisarAlimento,
  calcularQuantidadeCompra,
  gerarListaComprasInteligente,
  formatarQuantidade,
  gerarDicasCompra,
  FATORES_CONVERSAO_PREPARO
};
