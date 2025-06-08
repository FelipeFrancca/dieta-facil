// hooks/useFoodSearch.js
import { useState, useEffect } from "react";
import { buscarAlimentos, buscarPorCategoria } from "../../alimentosDatabase";

export const useFoodSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [localResults, setLocalResults] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(false);

  // Função para extrair informações de unidade dos dados da API
  const extrairInfoUnidades = (produto) => {
    const unidades = [];
    
    // Padrões para detectar unidades em diferentes idiomas
    const unitPatterns = [
      // Português
      { pattern: /(\d+)\s*unidades?/i, type: 'unidade' },
      { pattern: /(\d+)\s*ovos?/i, type: 'ovo' },
      { pattern: /(\d+)\s*pães?/i, type: 'pao' },
      { pattern: /(\d+)\s*fatias?/i, type: 'fatia' },
      { pattern: /(\d+)\s*biscoitos?/i, type: 'biscoito' },
      { pattern: /(\d+)\s*cookies?/i, type: 'biscoito' },
      
      // Inglês
      { pattern: /(\d+)\s*units?/i, type: 'unidade' },
      { pattern: /(\d+)\s*eggs?/i, type: 'ovo' },
      { pattern: /(\d+)\s*pieces?/i, type: 'unidade' },
      { pattern: /(\d+)\s*slices?/i, type: 'fatia' },
      { pattern: /(\d+)\s*pc(s)?/i, type: 'unidade' },
      { pattern: /(\d+)\s*biscuits?/i, type: 'biscoito' },
      
      // Francês
      { pattern: /(\d+)\s*unités?/i, type: 'unidade' },
      { pattern: /(\d+)\s*œufs?/i, type: 'ovo' },
      { pattern: /(\d+)\s*tranches?/i, type: 'fatia' },
      
      // Espanhol
      { pattern: /(\d+)\s*unidades?/i, type: 'unidade' },
      { pattern: /(\d+)\s*huevos?/i, type: 'ovo' },
      { pattern: /(\d+)\s*rebanadas?/i, type: 'fatia' },
    ];

    // Campos onde procurar informações de unidade
    const fieldsToCheck = [
      produto.product_name,
      produto.quantity,
      produto.serving_size,
      produto.packaging,
      produto.brands,
      produto.categories,
      produto._keywords?.join(' ')
    ].filter(Boolean);

    // Buscar padrões em todos os campos
    fieldsToCheck.forEach((field) => {
      if (typeof field === 'string') {
        unitPatterns.forEach(({ pattern, type }) => {
          const match = field.match(pattern);
          if (match) {
            const count = parseInt(match[1]);
            if (!isNaN(count) && count > 0) {
              // Calcular peso por unidade baseado em serving_quantity ou estimativas
              let pesoPorUnidade = null;
              
              // Tentar usar serving_quantity da API
              if (produto.nutriments?.serving_quantity) {
                pesoPorUnidade = produto.nutriments.serving_quantity;
              } else {
                // Estimativas baseadas no tipo de alimento
                pesoPorUnidade = estimarPesoPorUnidade(type, produto.product_name);
              }

              // Evitar duplicatas
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

    // Se não encontrou unidades específicas, tentar detectar pelo nome do produto
    if (unidades.length === 0) {
      const unidadeDetectada = detectarUnidadePorNome(produto.product_name);
      if (unidadeDetectada) {
        unidades.push(unidadeDetectada);
      }
    }

    return unidades.length > 0 ? unidades : null;
  };

  // Função para estimar peso por unidade baseado no tipo
  const estimarPesoPorUnidade = (tipo, nomeProduto) => {
    const estimativas = {
      'ovo': 50,      // ovo médio
      'pao': 25,      // fatia de pão
      'fatia': 20,    // fatia genérica
      'biscoito': 8,  // biscoito médio
      'unidade': 30   // unidade genérica
    };

    // Ajustes baseados no nome do produto
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
      
      // Ajustes específicos por tipo de alimento
      if (tipo === 'pao') {
        if (nome.includes('integral') || nome.includes('whole')) return 30;
        if (nome.includes('forma') || nome.includes('sandwich')) return 25;
        if (nome.includes('francês') || nome.includes('baguette')) return 50;
      }
      
      if (tipo === 'ovo') {
        if (nome.includes('codorna') || nome.includes('quail')) return 12;
        if (nome.includes('pato') || nome.includes('duck')) return 70;
      }
    }

    return estimativas[tipo] || 30;
  };

  // Função para detectar unidade baseada no nome do produto
  const detectarUnidadePorNome = (nomeProduto) => {
    if (!nomeProduto) return null;
    
    const nome = nomeProduto.toLowerCase();
    
    // Mapeamento de palavras-chave para tipos de unidade
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

  // Função para formatar descrição da unidade
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
            fonte: 'api' // Identificar origem do alimento
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

  useEffect(() => {
    const buscar = async () => {
      if (searchTerm.length > 2) {
        // 1. Buscar local imediatamente
        const locais = buscarAlimentos(searchTerm);
        setLocalResults(locais);
        setLoading(true);

        // 2. Buscar na API em paralelo
        try {
          const api = await buscarAlimentosAPI(searchTerm);
          setSearchResults(api);
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

    const timeoutId = setTimeout(buscar, 300); // Debounce de 300ms
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const buscarPorCategoriaHandler = (categoria) => {
    setSelectedCategory(categoria);
    setSearchResults(buscarPorCategoria(categoria));
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