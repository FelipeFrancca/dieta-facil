// hooks/useFoodSearch.js
import { useState, useEffect } from "react";
import { buscarAlimentos, buscarPorCategoria } from "../../alimentosDatabase";

export const useFoodSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [localResults, setLocalResults] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(false);

  // Mapeamento de transformações culinárias
  const transformacoesCulinarias = {
    // Fatores de conversão para alimentos cozidos (baseado em dados nutricionais reais)
    cozimento: {
      // Carnes (perdem água, concentram nutrientes)
      'frango': { fator: 1.25, agua: -20 },
      'carne': { fator: 1.3, agua: -25 },
      'porco': { fator: 1.28, agua: -22 },
      'peixe': { fator: 1.2, agua: -18 },
      'camarão': { fator: 1.15, agua: -15 },
      
      // Leguminosas (absorvem água, diluem nutrientes)
      'feijão': { fator: 0.4, agua: 60 },
      'lentilha': { fator: 0.45, agua: 58 },
      'grão-de-bico': { fator: 0.42, agua: 62 },
      'ervilha': { fator: 0.48, agua: 55 },
      'soja': { fator: 0.4, agua: 60 },
      
      // Grãos e cereais (absorvem água)
      'arroz': { fator: 0.35, agua: 70 },
      'quinoa': { fator: 0.45, agua: 60 },
      'aveia': { fator: 0.2, agua: 75 },
      'trigo': { fator: 0.3, agua: 65 },
      'milho': { fator: 0.5, agua: 50 },
      
      // Vegetais (variam conforme o tipo)
      'batata': { fator: 0.9, agua: 5 },
      'batata-doce': { fator: 0.92, agua: 3 },
      'cenoura': { fator: 0.95, agua: 2 },
      'brócolis': { fator: 0.85, agua: 8 },
      'couve-flor': { fator: 0.88, agua: 6 },
      'espinafre': { fator: 0.7, agua: 15 },
      
      // Massas
      'macarrão': { fator: 0.4, agua: 65 },
      'massa': { fator: 0.4, agua: 65 },
      'espaguete': { fator: 0.4, agua: 65 },
      'penne': { fator: 0.4, agua: 65 },
      
      // Padrão para outros alimentos
      'default': { fator: 0.8, agua: 10 }
    }
  };

  // Base de dados de unidades por tipo de alimento
  const unidadesPorTipoAlimento = {
    // Proteínas
    'ovo': [
      { tipo: 'ovo', quantidade: 1, pesoPorUnidade: 50, descricao: '1 ovo médio' },
      { tipo: 'ovo', quantidade: 1, pesoPorUnidade: 40, descricao: '1 ovo pequeno' },
      { tipo: 'ovo', quantidade: 1, pesoPorUnidade: 60, descricao: '1 ovo grande' }
    ],
    'frango': [
      { tipo: 'peito', quantidade: 1, pesoPorUnidade: 150, descricao: '1 peito de frango' },
      { tipo: 'coxa', quantidade: 1, pesoPorUnidade: 120, descricao: '1 coxa de frango' },
      { tipo: 'asa', quantidade: 1, pesoPorUnidade: 50, descricao: '1 asa de frango' },
      { tipo: 'filé', quantidade: 1, pesoPorUnidade: 100, descricao: '1 filé de frango' }
    ],
    'carne': [
      { tipo: 'bife', quantidade: 1, pesoPorUnidade: 120, descricao: '1 bife médio' },
      { tipo: 'hamburguer', quantidade: 1, pesoPorUnidade: 80, descricao: '1 hambúrguer' },
      { tipo: 'fatia', quantidade: 1, pesoPorUnidade: 30, descricao: '1 fatia fina' }
    ],
    'peixe': [
      { tipo: 'filé', quantidade: 1, pesoPorUnidade: 120, descricao: '1 filé de peixe' },
      { tipo: 'posta', quantidade: 1, pesoPorUnidade: 150, descricao: '1 posta de peixe' }
    ],
    
    // Carboidratos
    'pão': [
      { tipo: 'fatia', quantidade: 1, pesoPorUnidade: 25, descricao: '1 fatia de pão de forma' },
      { tipo: 'francês', quantidade: 1, pesoPorUnidade: 50, descricao: '1 pão francês' },
      { tipo: 'integral', quantidade: 1, pesoPorUnidade: 30, descricao: '1 fatia pão integral' }
    ],
    'arroz': [
      { tipo: 'colher', quantidade: 1, pesoPorUnidade: 20, descricao: '1 colher de sopa' },
      { tipo: 'xícara', quantidade: 1, pesoPorUnidade: 120, descricao: '1 xícara de chá' },
      { tipo: 'escumadeira', quantidade: 1, pesoPorUnidade: 80, descricao: '1 escumadeira' }
    ],
    'macarrão': [
      { tipo: 'porção', quantidade: 1, pesoPorUnidade: 80, descricao: '1 porção (cru)' },
      { tipo: 'xícara', quantidade: 1, pesoPorUnidade: 100, descricao: '1 xícara (cozido)' }
    ],
    'batata': [
      { tipo: 'unidade', quantidade: 1, pesoPorUnidade: 150, descricao: '1 batata média' },
      { tipo: 'pequena', quantidade: 1, pesoPorUnidade: 80, descricao: '1 batata pequena' },
      { tipo: 'grande', quantidade: 1, pesoPorUnidade: 250, descricao: '1 batata grande' }
    ],
    
    // Leguminosas
    'feijão': [
      { tipo: 'colher', quantidade: 1, pesoPorUnidade: 15, descricao: '1 colher de sopa' },
      { tipo: 'concha', quantidade: 1, pesoPorUnidade: 60, descricao: '1 concha pequena' },
      { tipo: 'xícara', quantidade: 1, pesoPorUnidade: 120, descricao: '1 xícara de chá' }
    ],
    
    // Laticínios
    'leite': [
      { tipo: 'copo', quantidade: 1, pesoPorUnidade: 200, descricao: '1 copo (200ml)' },
      { tipo: 'xícara', quantidade: 1, pesoPorUnidade: 240, descricao: '1 xícara de chá' }
    ],
    'queijo': [
      { tipo: 'fatia', quantidade: 1, pesoPorUnidade: 20, descricao: '1 fatia fina' },
      { tipo: 'fatia-grossa', quantidade: 1, pesoPorUnidade: 40, descricao: '1 fatia grossa' }
    ],
    
    // Frutas
    'banana': [
      { tipo: 'unidade', quantidade: 1, pesoPorUnidade: 90, descricao: '1 banana média' },
      { tipo: 'pequena', quantidade: 1, pesoPorUnidade: 60, descricao: '1 banana pequena' },
      { tipo: 'grande', quantidade: 1, pesoPorUnidade: 120, descricao: '1 banana grande' }
    ],
    'maçã': [
      { tipo: 'unidade', quantidade: 1, pesoPorUnidade: 150, descricao: '1 maçã média' },
      { tipo: 'pequena', quantidade: 1, pesoPorUnidade: 100, descricao: '1 maçã pequena' }
    ],
    
    // Vegetais
    'tomate': [
      { tipo: 'unidade', quantidade: 1, pesoPorUnidade: 100, descricao: '1 tomate médio' },
      { tipo: 'pequeno', quantidade: 1, pesoPorUnidade: 60, descricao: '1 tomate pequeno' }
    ],
    'cebola': [
      { tipo: 'unidade', quantidade: 1, pesoPorUnidade: 80, descricao: '1 cebola média' }
    ],
    
    // Oleaginosas
    'amendoim': [
      { tipo: 'colher', quantidade: 1, pesoPorUnidade: 10, descricao: '1 colher de sopa' }
    ],
    
    // Genérico para outros alimentos
    'default': [
      { tipo: 'unidade', quantidade: 1, pesoPorUnidade: 100, descricao: '1 unidade média' },
      { tipo: 'colher', quantidade: 1, pesoPorUnidade: 15, descricao: '1 colher de sopa' },
      { tipo: 'xícara', quantidade: 1, pesoPorUnidade: 120, descricao: '1 xícara de chá' }
    ]
  };

  // Função para detectar o tipo base do alimento
  const detectarTipoAlimento = (nome) => {
    const nomeMinusculo = nome.toLowerCase();
    
    // Lista de palavras-chave para cada tipo
    const tiposDeteccao = {
      'ovo': ['ovo', 'egg'],
      'frango': ['frango', 'chicken', 'galinha', 'peito de frango', 'coxa de frango'],
      'carne': ['carne', 'beef', 'boi', 'vaca', 'bife', 'hamburguer'],
      'peixe': ['peixe', 'fish', 'salmão', 'tilápia', 'sardinha', 'atum'],
      'pão': ['pão', 'bread', 'pao'],
      'arroz': ['arroz', 'rice'],
      'macarrão': ['macarrão', 'massa', 'espaguete', 'penne', 'pasta'],
      'batata': ['batata', 'potato'],
      'feijão': ['feijão', 'bean', 'beans'],
      'leite': ['leite', 'milk'],
      'queijo': ['queijo', 'cheese'],
      'banana': ['banana'],
      'maçã': ['maçã', 'maca', 'apple'],
      'tomate': ['tomate', 'tomato'],
      'cebola': ['cebola', 'onion'],
      'amendoim': ['amendoim', 'peanut']
    };
    
    // Procurar correspondência
    for (const [tipo, palavras] of Object.entries(tiposDeteccao)) {
      if (palavras.some(palavra => nomeMinusculo.includes(palavra))) {
        return tipo;
      }
    }
    
    return 'default';
  };

  // Função para obter transformação culinária
  const obterTransformacaoCozimento = (nome) => {
    const nomeMinusculo = nome.toLowerCase();
    
    // Buscar correspondência direta primeiro
    for (const [tipo, transformacao] of Object.entries(transformacoesCulinarias.cozimento)) {
      if (tipo !== 'default' && nomeMinusculo.includes(tipo)) {
        return transformacao;
      }
    }
    
    // Retornar transformação padrão
    return transformacoesCulinarias.cozimento.default;
  };

  // Função para criar versão cozida do alimento
  const criarVersaoCozida = (alimento) => {
    const transformacao = obterTransformacaoCozimento(alimento.nome);
    
    return {
      ...alimento,
      nome: `${alimento.nome} (cozido)`,
      calorias: Math.round(alimento.calorias * transformacao.fator),
      proteina: Math.round((alimento.proteina * transformacao.fator) * 10) / 10,
      carbo: Math.round((alimento.carbo * transformacao.fator) * 10) / 10,
      gordura: Math.round((alimento.gordura * transformacao.fator) * 10) / 10,
      isCozido: true,
      alimentoOriginal: alimento.nome,
      observacoes: `Valores calculados considerando absorção/perda de água no cozimento`
    };
  };

  // Função para adicionar unidades aos alimentos locais
  const adicionarUnidadesAlimento = (alimento) => {
    const tipoAlimento = detectarTipoAlimento(alimento.nome);
    const unidadesDisponiveis = unidadesPorTipoAlimento[tipoAlimento] || unidadesPorTipoAlimento.default;
    
    return {
      ...alimento,
      unidades: unidadesDisponiveis.map(unidade => ({
        ...unidade,
        // Ajustar peso baseado no nome do alimento se necessário
        pesoPorUnidade: ajustarPesoPorNome(unidade.pesoPorUnidade, alimento.nome, unidade.tipo)
      }))
    };
  };

  // Função para ajustar peso baseado no nome específico do alimento
  const ajustarPesoPorNome = (pesoBase, nomeAlimento, tipoUnidade) => {
    const nome = nomeAlimento.toLowerCase();
    
    // Ajustes específicos baseados em qualificadores no nome
    let fatorAjuste = 1;
    
    if (nome.includes('grande') || nome.includes('large')) {
      fatorAjuste = 1.5;
    } else if (nome.includes('pequeno') || nome.includes('small')) {
      fatorAjuste = 0.7;
    } else if (nome.includes('jumbo') || nome.includes('extra')) {
      fatorAjuste = 2;
    } else if (nome.includes('mini') || nome.includes('baby')) {
      fatorAjuste = 0.5;
    }
    
    // Ajustes específicos por tipo de unidade
    if (tipoUnidade === 'fatia' && nome.includes('integral')) {
      fatorAjuste *= 1.2; // Pães integrais tendem a ser mais densos
    }
    
    return Math.round(pesoBase * fatorAjuste);
  };

  // Função para extrair informações de unidade dos dados da API (mantida da versão original)
  const extrairInfoUnidades = (produto) => {
    const unidades = [];
    
    const unitPatterns = [
      { pattern: /(\d+)\s*unidades?/i, type: 'unidade' },
      { pattern: /(\d+)\s*ovos?/i, type: 'ovo' },
      { pattern: /(\d+)\s*pães?/i, type: 'pao' },
      { pattern: /(\d+)\s*fatias?/i, type: 'fatia' },
      { pattern: /(\d+)\s*biscoitos?/i, type: 'biscoito' },
      { pattern: /(\d+)\s*cookies?/i, type: 'biscoito' },
      { pattern: /(\d+)\s*units?/i, type: 'unidade' },
      { pattern: /(\d+)\s*eggs?/i, type: 'ovo' },
      { pattern: /(\d+)\s*pieces?/i, type: 'unidade' },
      { pattern: /(\d+)\s*slices?/i, type: 'fatia' },
      { pattern: /(\d+)\s*pc(s)?/i, type: 'unidade' },
      { pattern: /(\d+)\s*biscuits?/i, type: 'biscoito' }
    ];

    const fieldsToCheck = [
      produto.product_name,
      produto.quantity,
      produto.serving_size,
      produto.packaging,
      produto.brands,
      produto.categories,
      produto._keywords?.join(' ')
    ].filter(Boolean);

    fieldsToCheck.forEach((field) => {
      if (typeof field === 'string') {
        unitPatterns.forEach(({ pattern, type }) => {
          const match = field.match(pattern);
          if (match) {
            const count = parseInt(match[1]);
            if (!isNaN(count) && count > 0) {
              let pesoPorUnidade = null;
              
              if (produto.nutriments?.serving_quantity) {
                pesoPorUnidade = produto.nutriments.serving_quantity;
              } else {
                pesoPorUnidade = estimarPesoPorUnidade(type, produto.product_name);
              }

              const jaExiste = unidades.some(u => 
                u.tipo === type && u.quantidade === count
              );

              if (!jaExiste && pesoPorUnidade > 0) {
                unidades.push({
                  tipo: type,
                  quantidade: count,
                  pesoPorUnidade: pesoPorUnidade,
                  descricao: formatarDescricaoUnidade(type, count)
                });
              }
            }
          }
        });
      }
    });

    if (unidades.length === 0) {
      const unidadeDetectada = detectarUnidadePorNome(produto.product_name);
      if (unidadeDetectada) {
        unidades.push(unidadeDetectada);
      }
    }

    return unidades.length > 0 ? unidades : null;
  };

  const estimarPesoPorUnidade = (tipo, nomeProduto) => {
    const estimativas = {
      'ovo': 50,
      'pao': 25,
      'fatia': 20,
      'biscoito': 8,
      'unidade': 30
    };

    if (nomeProduto) {
      const nome = nomeProduto.toLowerCase();
      
      if (nome.includes('grande') || nome.includes('large')) {
        return estimativas[tipo] * 1.5;
      }
      if (nome.includes('pequeno') || nome.includes('small')) {
        return estimativas[tipo] * 0.7;
      }
      if (nome.includes('jumbo') || nome.includes('extra')) {
        return estimativas[tipo] * 2;
      }
    }

    return estimativas[tipo] || 30;
  };

  const detectarUnidadePorNome = (nomeProduto) => {
    if (!nomeProduto) return null;
    
    const nome = nomeProduto.toLowerCase();
    const detectores = [
      { keywords: ['ovo', 'egg', 'œuf', 'huevo'], tipo: 'ovo', peso: 50 },
      { keywords: ['pão', 'pao', 'bread', 'pain', 'pan'], tipo: 'pao', peso: 25 },
      { keywords: ['biscoito', 'cookie', 'biscuit', 'galleta'], tipo: 'biscoito', peso: 8 },
      { keywords: ['fatia', 'slice', 'tranche', 'rebanada'], tipo: 'fatia', peso: 20 }
    ];

    for (const detector of detectores) {
      if (detector.keywords.some(keyword => nome.includes(keyword))) {
        return {
          tipo: detector.tipo,
          quantidade: 1,
          pesoPorUnidade: estimarPesoPorUnidade(detector.tipo, nomeProduto),
          descricao: formatarDescricaoUnidade(detector.tipo, 1)
        };
      }
    }

    return null;
  };

  const formatarDescricaoUnidade = (tipo, quantidade) => {
    const labels = {
      'ovo': quantidade > 1 ? `${quantidade} ovos` : '1 ovo',
      'pao': quantidade > 1 ? `${quantidade} pães` : '1 pão',
      'fatia': quantidade > 1 ? `${quantidade} fatias` : '1 fatia',
      'biscoito': quantidade > 1 ? `${quantidade} biscoitos` : '1 biscoito',
      'unidade': quantidade > 1 ? `${quantidade} unidades` : '1 unidade'
    };
    
    return labels[tipo] || `${quantidade} unidade(s)`;
  };

  // Função para buscar alimentos na API (mantida da versão original)
  const buscarAlimentosAPI = async (termo) => {
    try {
      const response = await fetch(
        `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${termo}&search_simple=1&action=process&json=1&page_size=20`
      );
      
      if (!response.ok) {
        throw new Error('Erro na API');
      }
      
      const data = await response.json();
      
      if (!data.products || !Array.isArray(data.products)) {
        return [];
      }

      return data.products
        .filter(produto => 
          produto.product_name && 
          produto.nutriments &&
          produto.nutriments["energy-kcal_100g"] !== undefined
        )
        .map((produto) => {
          const unidades = extrairInfoUnidades(produto);
          
          return {
            nome: produto.product_name || "Desconhecido",
            calorias: Math.round(produto.nutriments["energy-kcal_100g"] || 0),
            proteina: Math.round((produto.nutriments.proteins_100g || 0) * 10) / 10,
            carbo: Math.round((produto.nutriments.carbohydrates_100g || 0) * 10) / 10,
            gordura: Math.round((produto.nutriments.fat_100g || 0) * 10) / 10,
            unidades: unidades,
            fonte: 'api'
          };
        })
        .filter(alimento => 
          alimento.calorias > 0 && 
          alimento.nome !== "Desconhecido"
        );
    } catch (error) {
      console.error("Erro ao buscar na API:", error);
      return [];
    }
  };

  // Função principal para processar resultados locais
  const processarResultadosLocais = (alimentosBase) => {
    const alimentosProcessados = [];
    
    alimentosBase.forEach(alimento => {
      // 1. Adicionar versão original com unidades
      const alimentoComUnidades = adicionarUnidadesAlimento(alimento);
      alimentosProcessados.push(alimentoComUnidades);
      
      // 2. Adicionar versão cozida (se não for já cozido)
      if (!alimento.nome.toLowerCase().includes('cozido')) {
        const versaoCozida = criarVersaoCozida(alimentoComUnidades);
        alimentosProcessados.push(versaoCozida);
      }
    });
    
    return alimentosProcessados;
  };

  // Função principal para processar resultados da API
  const processarResultadosAPI = (alimentosAPI) => {
    const alimentosProcessados = [];
    
    alimentosAPI.forEach(alimento => {
      // 1. Adicionar versão original (já vem com unidades da API)
      alimentosProcessados.push(alimento);
      
      // 2. Adicionar versão cozida (se não for já cozido)
      if (!alimento.nome.toLowerCase().includes('cozido') && 
          !alimento.nome.toLowerCase().includes('cooked')) {
        const versaoCozida = criarVersaoCozida(alimento);
        alimentosProcessados.push(versaoCozida);
      }
    });
    
    return alimentosProcessados;
  };

  // Função de busca local aprimorada
  const buscarAlimentosComFiltro = (termo) => {
    const termoLower = termo.toLowerCase().trim();
    const palavras = termoLower.split(' ').filter(p => p.length > 0);
    
    return buscarAlimentos(termoLower).filter(alimento => {
      const nomeAlimento = alimento.nome.toLowerCase();
      
      // Busca exata tem prioridade
      if (nomeAlimento.includes(termoLower)) {
        return true;
      }
      
      // Busca por palavras individuais
      if (palavras.length > 1) {
        return palavras.every(palavra => nomeAlimento.includes(palavra));
      }
      
      // Busca por início das palavras
      const palavrasAlimento = nomeAlimento.split(' ');
      return palavrasAlimento.some(palavra => palavra.startsWith(termoLower));
    }).sort((a, b) => {
      const nomeA = a.nome.toLowerCase();
      const nomeB = b.nome.toLowerCase();
      
      // Priorizar correspondências exatas
      if (nomeA.includes(termoLower) && !nomeB.includes(termoLower)) return -1;
      if (!nomeA.includes(termoLower) && nomeB.includes(termoLower)) return 1;
      
      // Priorizar correspondências que começam com o termo
      if (nomeA.startsWith(termoLower) && !nomeB.startsWith(termoLower)) return -1;
      if (!nomeA.startsWith(termoLower) && nomeB.startsWith(termoLower)) return 1;
      
      // Ordem alfabética
      return nomeA.localeCompare(nomeB);
    });
  };

  useEffect(() => {
    const buscar = async () => {
      if (searchTerm.length > 2) {
        setLoading(true);
        
        // 1. Buscar local imediatamente com filtro aprimorado
        const locaisBase = buscarAlimentosComFiltro(searchTerm);
        const locaisProcessados = processarResultadosLocais(locaisBase);
        setLocalResults(locaisProcessados);

        // 2. Buscar na API em paralelo
        try {
          const apiBase = await buscarAlimentosAPI(searchTerm);
          const apiProcessados = processarResultadosAPI(apiBase);
          setSearchResults(apiProcessados);
        } catch (error) {
          console.error("Erro na busca da API:", error);
          setSearchResults([]);
        } finally {
          setLoading(false);
        }
      } else {
        setLocalResults([]);
        setSearchResults([]);
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(buscar, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const buscarPorCategoriaHandler = (categoria) => {
    setSelectedCategory(categoria);
    const categoriasBase = buscarPorCategoria(categoria);
    const categoriasProcessadas = processarResultadosLocais(categoriasBase);
    setSearchResults(categoriasProcessadas);
    setLocalResults([]);
    setSearchTerm("");
  };

  const limparBusca = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setSearchResults([]);
    setLocalResults([]);
  };

  return {
    searchTerm,
    setSearchTerm,
    searchResults,
    localResults,
    selectedCategory,
    loading,
    buscarPorCategoriaHandler,
    limparBusca,
  };
};