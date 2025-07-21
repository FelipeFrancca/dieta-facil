// utils/dietStorage.js
export const STORAGE_KEY = 'ultima_dieta_montada';

// Função para salvar dados no localStorage com versionamento
export const salvarDietaLocal = (dados, calorias = null, metaMacros = null, versao = "semanal") => {
  try {
    const dadosParaSalvar = {
      versao: versao,
      timestamp: new Date().toISOString(),
      calorias: calorias,
      metaMacros: metaMacros,
      dados: dados,
      // Manter compatibilidade com versão antiga
      refeicoes: versao === "diaria" ? dados : [],
      dietaSemanal: versao === "semanal" ? dados : {},
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(dadosParaSalvar));
    console.log(`✅ Dieta ${versao} salva no localStorage`);
    return true;
  } catch (error) {
    console.error("❌ Erro ao salvar dieta:", error);
    return false;
  }
};

// Função para carregar dados do localStorage
export const carregarDietaLocal = () => {
  try {
    const dadosSalvos = localStorage.getItem(STORAGE_KEY);
    if (!dadosSalvos) return null;

    const dados = JSON.parse(dadosSalvos);
    console.log(`📖 Dieta carregada: versão ${dados.versao || "diaria"}`);
    return dados;
  } catch (error) {
    console.error("❌ Erro ao carregar dieta:", error);
    return null;
  }
};

// Função para verificar se existe dieta salva
export const existeDietaSalva = () => {
  try {
    const dadosSalvos = localStorage.getItem(STORAGE_KEY);
    return dadosSalvos !== null;
  } catch (error) {
    console.error("❌ Erro ao verificar dieta salva:", error);
    return false;
  }
};

// Função para obter informações da dieta salva
export const getInfoDietaSalva = () => {
  try {
    const dados = carregarDietaLocal();
    if (!dados) return null;

    const versao = dados.versao || "diaria";
    let quantidadeRefeicoes = 0;
    let ultimaAtualizacao = dados.timestamp || dados.dataUltimaEdicao;

    if (versao === "semanal" && dados.dietaSemanal) {
      // Contar alternativas na estrutura semanal
      quantidadeRefeicoes = Object.values(dados.dietaSemanal).reduce((acc, dia) => {
        return acc + Object.values(dia || {}).reduce((accTipo, alternativas) => {
          return accTipo + (alternativas?.length || 0);
        }, 0);
      }, 0);
    } else if (versao === "diaria" && dados.refeicoes) {
      // Contar refeições na estrutura diária
      quantidadeRefeicoes = dados.refeicoes.length;
    }

    return {
      versao,
      quantidadeRefeicoes,
      ultimaAtualizacao,
      temCalorias: dados.calorias !== null,
      temMetaMacros: dados.metaMacros !== null,
    };
  } catch (error) {
    console.error("❌ Erro ao obter info da dieta:", error);
    return null;
  }
};

// Função para limpar dados do localStorage
export const limparDietaLocal = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log("🗑️ Dieta removida do localStorage");
    return true;
  } catch (error) {
    console.error("❌ Erro ao limpar dieta:", error);
    return false;
  }
};

// Função para exportar dados da dieta
export const exportarDieta = (dados, versao = "semanal") => {
  try {
    const dadosExportacao = {
      versao: versao,
      exportadoEm: new Date().toISOString(),
      aplicacao: "Calculadora Dieta",
      dados: dados,
    };

    const blob = new Blob([JSON.stringify(dadosExportacao, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `dieta-${versao}-${new Date().toISOString().split('T')[0]}.json`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    
    console.log("📤 Dieta exportada com sucesso");
    return true;
  } catch (error) {
    console.error("❌ Erro ao exportar dieta:", error);
    return false;
  }
};

// Função para importar dados da dieta
export const importarDieta = (arquivo) => {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const dadosImportados = JSON.parse(event.target.result);
          
          // Validar estrutura básica
          if (!dadosImportados.versao || !dadosImportados.dados) {
            throw new Error("Arquivo de dieta inválido");
          }

          console.log(`📥 Dieta importada: versão ${dadosImportados.versao}`);
          resolve(dadosImportados);
        } catch (parseError) {
          console.error("❌ Erro ao fazer parse do arquivo:", parseError);
          reject(new Error("Arquivo JSON inválido"));
        }
      };

      reader.onerror = () => {
        console.error("❌ Erro ao ler arquivo");
        reject(new Error("Erro ao ler arquivo"));
      };

      reader.readAsText(arquivo);
    } catch (error) {
      console.error("❌ Erro ao importar dieta:", error);
      reject(error);
    }
  });
};

// Função para migrar dados da versão diária para semanal
export const migrarParaSemanal = (refeicoesAnteriores) => {
  try {
    if (!refeicoesAnteriores || !Array.isArray(refeicoesAnteriores)) {
      return {};
    }

    const dietaSemanal = {};
    
    // Migrar todas as refeições para segunda-feira como padrão
    const tiposMapeamento = {
      "café da manhã": "cafe",
      "cafe da manha": "cafe",
      "almoço": "almoco",
      "almoco": "almoco",
      "jantar": "jantar",
      "janta": "jantar",
      "lanche": "lanche1",
      "lanche da manhã": "lanche1",
      "lanche da tarde": "lanche2",
      "ceia": "ceia",
    };

    refeicoesAnteriores.forEach((refeicao, index) => {
      const nomeNormalizado = refeicao.nome.toLowerCase();
      let tipoRefeicao = "almoco"; // padrão

      // Tentar identificar o tipo de refeição pelo nome
      for (const [chave, valor] of Object.entries(tiposMapeamento)) {
        if (nomeNormalizado.includes(chave)) {
          tipoRefeicao = valor;
          break;
        }
      }

      // Adicionar à segunda-feira
      if (!dietaSemanal.segunda) {
        dietaSemanal.segunda = {};
      }
      
      if (!dietaSemanal.segunda[tipoRefeicao]) {
        dietaSemanal.segunda[tipoRefeicao] = [];
      }

      dietaSemanal.segunda[tipoRefeicao].push({
        id: Date.now() + index,
        nome: refeicao.nome,
        alimentos: refeicao.alimentos || [],
        macros: refeicao.macros || { calorias: 0, proteina: 0, carbo: 0, gordura: 0 },
        criadoEm: new Date().toISOString(),
        migrado: true,
      });
    });

    console.log("🔄 Migração para estrutura semanal concluída");
    return dietaSemanal;
  } catch (error) {
    console.error("❌ Erro na migração:", error);
    return {};
  }
};