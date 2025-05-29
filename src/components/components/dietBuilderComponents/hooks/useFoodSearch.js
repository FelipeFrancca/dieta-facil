// hooks/useFoodSearch.js
import { useState, useEffect } from 'react';
import { buscarAlimentos, buscarPorCategoria } from '../../alimentosDatabase';

export const useFoodSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [localResults, setLocalResults] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(false);

  const buscarAlimentosAPI = async (termo) => {
    const response = await fetch(
      `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${termo}&search_simple=1&action=process&json=1`
    );
    const data = await response.json();
    return data.products.map((produto) => ({
      nome: produto.product_name || "Desconhecido",
      calorias: produto.nutriments["energy-kcal_100g"] || 0,
      proteina: produto.nutriments.proteins_100g || 0,
      carbo: produto.nutriments.carbohydrates_100g || 0,
      gordura: produto.nutriments.fat_100g || 0,
    }));
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
          // 3. Combinar locais + api, sem duplicatas (por nome)
          const nomesLocais = new Set(locais.map((a) => a.nome.toLowerCase()));
          const apiFiltrada = api.filter(
            (a) => !nomesLocais.has(a.nome.toLowerCase())
          );
          setSearchResults([...locais, ...apiFiltrada]);
        } catch (error) {
          console.error("Erro na API:", error);
          setSearchResults(locais); // fallback só com locais
        } finally {
          setLoading(false);
        }
      } else {
        setLocalResults([]);
        setSearchResults([]);
      }
    };
    buscar();
  }, [searchTerm]);

  const buscarPorCategoriaHandler = (categoria) => {
    setSelectedCategory(categoria);
    setSearchResults(buscarPorCategoria(categoria));
    setSearchTerm("");
  };

  const limparBusca = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setSearchResults([]);
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