// utils/dietStorage.js
export const STORAGE_KEY = 'ultima_dieta_montada';

// Salvar dieta no localStorage
export const salvarDietaLocal = (refeicoes, calorias, metaMacros) => {
  try {
    const dietaData = {
      refeicoes,
      calorias,
      metaMacros,
      dataUltimaEdicao: new Date().toISOString(),
      versao: '1.0'
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dietaData));
    console.log('✅ Dieta salva localmente');
    return true;
  } catch (error) {
    console.error('❌ Erro ao salvar dieta localmente:', error);
    return false;
  }
};

// Carregar dieta do localStorage
export const carregarDietaLocal = () => {
  try {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (!savedData) {
      return null;
    }

    const dietaData = JSON.parse(savedData);
    
    // Validar estrutura dos dados
    if (!dietaData.refeicoes || !Array.isArray(dietaData.refeicoes)) {
      console.warn('⚠️ Dados de dieta inválidos encontrados');
      return null;
    }

    console.log('✅ Dieta carregada do localStorage');
    return dietaData;
  } catch (error) {
    console.error('❌ Erro ao carregar dieta local:', error);
    return null;
  }
};

// Verificar se existe dieta salva
export const existeDietaSalva = () => {
  try {
    const savedData = localStorage.getItem(STORAGE_KEY);
    return savedData !== null;
  } catch (error) {
    return false;
  }
};

// Limpar dieta salva
export const limparDietaLocal = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log('🗑️ Dieta local removida');
    return true;
  } catch (error) {
    console.error('❌ Erro ao limpar dieta local:', error);
    return false;
  }
};

// Obter informações sobre a dieta salva (sem carregar os dados completos)
export const getInfoDietaSalva = () => {
  try {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (!savedData) return null;

    const dietaData = JSON.parse(savedData);
    return {
      quantidadeRefeicoes: dietaData.refeicoes?.length || 0,
      calorias: dietaData.calorias,
      dataUltimaEdicao: dietaData.dataUltimaEdicao,
      temMetaMacros: !!dietaData.metaMacros
    };
  } catch (error) {
    console.error('❌ Erro ao obter info da dieta:', error);
    return null;
  }
};