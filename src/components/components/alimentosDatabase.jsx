export const alimentosDatabase = {
  "arroz integral": { calorias: 123, proteina: 2.6, carbo: 23, gordura: 0.9 },
  "arroz branco": { calorias: 130, proteina: 2.7, carbo: 28, gordura: 0.3 },
  "feijão preto": { calorias: 132, proteina: 8.9, carbo: 24, gordura: 0.5 },
  "feijão carioca": { calorias: 137, proteina: 8.5, carbo: 25, gordura: 0.6 },
  "frango grelhado": { calorias: 165, proteina: 31, carbo: 0, gordura: 3.6 },
  "peito de frango": { calorias: 165, proteina: 31, carbo: 0, gordura: 3.6 },
  "carne bovina magra": { calorias: 250, proteina: 26, carbo: 0, gordura: 15 },
  "peixe tilápia": { calorias: 128, proteina: 26, carbo: 0, gordura: 2.7 },
  salmão: { calorias: 208, proteina: 22, carbo: 0, gordura: 13 },
  "ovo cozido": { calorias: 155, proteina: 13, carbo: 1.1, gordura: 11 },
  "batata doce": { calorias: 86, proteina: 1.6, carbo: 20, gordura: 0.1 },
  "batata inglesa": { calorias: 77, proteina: 2, carbo: 17, gordura: 0.1 },
  brócolis: { calorias: 34, proteina: 2.8, carbo: 7, gordura: 0.4 },
  espinafre: { calorias: 23, proteina: 2.9, carbo: 3.6, gordura: 0.4 },
  banana: { calorias: 89, proteina: 1.1, carbo: 23, gordura: 0.3 },
  maçã: { calorias: 52, proteina: 0.3, carbo: 14, gordura: 0.2 },
  abacate: { calorias: 160, proteina: 2, carbo: 9, gordura: 15 },
  "azeite de oliva": { calorias: 884, proteina: 0, carbo: 0, gordura: 100 },
  amêndoas: { calorias: 579, proteina: 21, carbo: 22, gordura: 50 },
  aveia: { calorias: 389, proteina: 17, carbo: 66, gordura: 7 },
  "pão integral": { calorias: 247, proteina: 13, carbo: 41, gordura: 4.2 },
  "leite desnatado": { calorias: 34, proteina: 3.4, carbo: 5, gordura: 0.1 },
  "iogurte grego": { calorias: 59, proteina: 10, carbo: 3.6, gordura: 0.4 },
  "queijo cottage": { calorias: 98, proteina: 11, carbo: 3.4, gordura: 4.3 },
  quinoa: { calorias: 368, proteina: 14, carbo: 64, gordura: 6 },
  lentilha: { calorias: 116, proteina: 9, carbo: 20, gordura: 0.4 },
  "grão de bico": { calorias: 164, proteina: 8.9, carbo: 27, gordura: 2.6 },
  "castanha do pará": { calorias: 656, proteina: 14, carbo: 12, gordura: 67 },
  abobrinha: { calorias: 17, proteina: 1.2, carbo: 3.1, gordura: 0.3 },
  cenoura: { calorias: 41, proteina: 0.9, carbo: 10, gordura: 0.2 },
  tomate: { calorias: 18, proteina: 0.9, carbo: 3.9, gordura: 0.2 },
  alface: { calorias: 15, proteina: 1.4, carbo: 2.9, gordura: 0.2 },
  pepino: { calorias: 16, proteina: 0.7, carbo: 4, gordura: 0.1 },
  manga: { calorias: 60, proteina: 0.8, carbo: 15, gordura: 0.4 },
  laranja: { calorias: 47, proteina: 0.9, carbo: 12, gordura: 0.1 },
  morango: { calorias: 32, proteina: 0.7, carbo: 7.7, gordura: 0.3 },
  uva: { calorias: 69, proteina: 0.7, carbo: 18, gordura: 0.2 },
  melancia: { calorias: 30, proteina: 0.6, carbo: 8, gordura: 0.2 },
  abacaxi: { calorias: 50, proteina: 0.5, carbo: 13, gordura: 0.1 },
  coco: { calorias: 354, proteina: 3.3, carbo: 15, gordura: 33 },
  chia: { calorias: 486, proteina: 17, carbo: 42, gordura: 31 },
  linhaça: { calorias: 534, proteina: 18, carbo: 29, gordura: 42 },
};

// Função para buscar alimentos
export function buscarAlimentos(termo) {
  const termoLower = termo.toLowerCase();
  return Object.keys(alimentosDatabase)
    .filter((alimento) => alimento.includes(termoLower))
    .map((alimento) => ({
      nome: alimento,
      ...alimentosDatabase[alimento],
    }));
}

// Função para obter alimento específico
export function obterAlimento(nome) {
  const nomeKey = nome.toLowerCase();
  return alimentosDatabase[nomeKey]
    ? {
        nome: nomeKey,
        ...alimentosDatabase[nomeKey],
      }
    : null;
}

// Função para obter todos os alimentos
export function obterTodosAlimentos() {
  return Object.keys(alimentosDatabase).map((alimento) => ({
    nome: alimento,
    ...alimentosDatabase[alimento],
  }));
}

// Categorias de alimentos para facilitar a busca
export const categorias = {
  cereais: ["arroz integral", "arroz branco", "aveia", "quinoa"],
  leguminosas: ["feijão preto", "feijão carioca", "lentilha", "grão de bico"],
  proteinas: [
    "frango grelhado",
    "peito de frango",
    "carne bovina magra",
    "peixe tilápia",
    "salmão",
    "ovo cozido",
  ],
  vegetais: [
    "brócolis",
    "espinafre",
    "abobrinha",
    "cenoura",
    "tomate",
    "alface",
    "pepino",
  ],
  frutas: [
    "banana",
    "maçã",
    "manga",
    "laranja",
    "morango",
    "uva",
    "melancia",
    "abacaxi",
  ],
  gorduras: [
    "abacate",
    "azeite de oliva",
    "amêndoas",
    "castanha do pará",
    "coco",
  ],
  laticínios: ["leite desnatado", "iogurte grego", "queijo cottage"],
  tuberculos: ["batata doce", "batata inglesa"],
  sementes: ["chia", "linhaça"],
  paes: ["pão integral"],
};

export function buscarPorCategoria(categoria) {
  const alimentosCategoria = categorias[categoria.toLowerCase()] || [];
  return alimentosCategoria.map((alimento) => ({
    nome: alimento,
    ...alimentosDatabase[alimento],
  }));
}
