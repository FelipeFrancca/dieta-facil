import { jsPDF } from "jspdf";
import { 
  calcularNutrientes, 
  gerarUnidadesDisponiveis,
  converterParaGramas
} from "./dietBuilderComponents/utils/nutrientCalculator";
import { 
  gerarListaComprasInteligente,
  gerarDicasCompra 
} from "./dietBuilderComponents/utils/shoppingListUtils";

const cores = [
  [76, 175, 80], // Verde
  [33, 150, 243], // Azul
  [156, 39, 176], // Roxo
  [255, 87, 34], // Laranja
  [255, 152, 0], // Laranja Escuro
  [103, 58, 183], // Roxo Profundo
  [0, 150, 136], // Verde Azulado
  [244, 67, 54], // Vermelho
];

const PDFGenerator = ({ refeicoes, totalDia, calorias, onGenerate }) => {
  const adicionarCopyright = (doc) => {
    const pageHeight = doc.internal.pageSize.height;
    const pageWidth = doc.internal.pageSize.width;

    doc.setTextColor(128, 128, 128);
    doc.setFontSize(8);

    const copyrightText = `Felipe França Copyright ${new Date().getFullYear()} ©`;
    const textWidth = doc.getTextWidth(copyrightText);
    const x = (pageWidth - textWidth) / 2;
    const y = pageHeight - 10;

    doc.text(copyrightText, x, y);
  };

  const calcularListaCompras = () => {
    return gerarListaComprasInteligente(refeicoes);
  };

  const adicionarPaginaListaCompras = (doc) => {
    doc.addPage();
    let y = 20;

    doc.setFillColor(76, 175, 80);
    doc.rect(0, 0, 210, 30, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.text("LISTA DE COMPRAS INTELIGENTE", 15, 20);
    y = 50;

    adicionarCopyright(doc);

    const listaCompras = calcularListaCompras();
    const dicas = gerarDicasCompra(listaCompras);

    doc.setTextColor(50, 50, 50);
    doc.setFontSize(12);
    doc.text("Quantidades calculadas considerando preparos e perdas:", 15, y);
    y += 15;
    doc.setFontSize(10);
    doc.text("* Quantidades já ajustadas para compra na forma crua/natural", 15, y);
    y += 20;

    // Cabeçalho da tabela
    doc.setFillColor(240, 240, 240);
    doc.rect(15, y - 5, 180, 10, "F");
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(11);
    doc.text("Alimento", 20, y + 2);
    doc.text("Quantidade", 110, y + 2);
    doc.text("Preparos", 150, y + 2);
    y += 15;

    doc.setFontSize(9);
    listaCompras.forEach((item, index) => {
      if (y > 250) {
        doc.addPage();
        y = 20;
        adicionarCopyright(doc);

        doc.setFillColor(240, 240, 240);
        doc.rect(15, y - 5, 180, 10, "F");
        doc.setTextColor(50, 50, 50);
        doc.setFontSize(11);
        doc.text("Alimento", 20, y + 2);
        doc.text("Quantidade", 110, y + 2);
        doc.text("Preparos", 150, y + 2);
        y += 15;
        doc.setFontSize(9);
      }

      if (index % 2 === 0) {
        doc.setFillColor(250, 250, 250);
        doc.rect(15, y - 3, 180, 15, "F");
      }

      doc.setTextColor(50, 50, 50);
      
      // Nome do alimento (truncar se muito longo)
      const nomeExibicao = item.nome.length > 28 ? item.nome.substring(0, 25) + "..." : item.nome;
      doc.text(nomeExibicao, 20, y + 2);
      
      // Quantidade com destaque para conversões
      doc.setFontSize(10);
      doc.text(item.quantidadeExibicao, 110, y + 2);
      
      // Mostrar se há conversão aplicada
      if (item.temConversoes) {
        doc.setFontSize(8);
        doc.setTextColor(200, 100, 0);
        doc.text("(ajustado)", 110, y + 8);
        doc.setTextColor(50, 50, 50);
      }
      
      // Preparos diferentes de 'natural'
      const preparosEspeciais = item.preparos.filter(p => p !== 'natural' && p !== 'cru');
      if (preparosEspeciais.length > 0) {
        doc.setFontSize(8);
        const preparosTexto = preparosEspeciais.join(", ");
        const preparosExibicao = preparosTexto.length > 25 ? preparosTexto.substring(0, 22) + "..." : preparosTexto;
        doc.text(preparosExibicao, 150, y + 2);
      }
      
      doc.setFontSize(9);
      y += 15;
    });

    y += 10;
    if (y > 230) {
      doc.addPage();
      y = 20;
      adicionarCopyright(doc);
    }

    // Resumo da lista de compras
    doc.setFillColor(102, 126, 234);
    doc.rect(15, y, 180, 30, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.text(`RESUMO`, 20, y + 10);
    doc.setFontSize(10);
    doc.text(`Itens diferentes: ${listaCompras.length}`, 20, y + 18);

    const pesoTotal = listaCompras.reduce(
      (total, item) => total + item.quantidadeGramas,
      0
    );
    doc.text(`Peso total: ${(pesoTotal / 1000).toFixed(1)}kg`, 20, y + 25);

    const itensComConversao = listaCompras.filter(item => item.temConversoes).length;
    if (itensComConversao > 0) {
      doc.text(`Itens com ajuste: ${itensComConversao}`, 120, y + 18);
    }

    // Dicas de compra
    y += 40;
    if (dicas.length > 0 && y < 240) {
      doc.setFillColor(255, 248, 220);
      doc.rect(15, y, 180, 15 + (dicas.length * 8), "F");
      doc.setTextColor(102, 51, 0);
      doc.setFontSize(11);
      doc.text("DICAS DE COMPRA", 20, y + 10);
      
      doc.setFontSize(9);
      dicas.forEach((dica, index) => {
        // Remove emojis das dicas
        const dicaLimpa = dica.replace(/🍖|🛒|⚖️|💡/g, '').trim();
        doc.text(dicaLimpa, 20, y + 18 + (index * 8));
      });
    }
  };

  const gerarPDFEstilizado = () => {
    try {
      const doc = new jsPDF();
      let y = 20;

      // Cabeçalho principal
      doc.setFillColor(102, 126, 234);
      doc.rect(0, 0, 210, 35, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.text("PLANO ALIMENTAR SEMANAL", 15, 20);
      
      // Informações do plano
      doc.setFontSize(11);
      const dataGeracao = new Date().toLocaleDateString('pt-BR');
      doc.text(`Gerado em: ${dataGeracao}`, 15, 30);
      if (calorias) {
        doc.text(`Meta calórica semanal: ${Math.round(calorias)} kcal`, 120, 30);
      }
      
      y = 50;
      adicionarCopyright(doc);

      // Agrupar refeições por dia da semana
      const refeicoesPorDia = {};
      refeicoes.forEach((refeicao) => {
        // Extrair o dia da semana do nome da refeição
        const partesNome = refeicao.nome.split(' - ');
        const diaSemana = partesNome[0];
        
        if (!refeicoesPorDia[diaSemana]) {
          refeicoesPorDia[diaSemana] = [];
        }
        refeicoesPorDia[diaSemana].push(refeicao);
      });

      // Ordenar dias da semana
      const diasOrdenados = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo'];
      const diasComRefeicoes = diasOrdenados.filter(dia => refeicoesPorDia[dia]);

      diasComRefeicoes.forEach((diaSemana, diaIndex) => {
        // Verificar se há espaço para o cabeçalho do dia
        if (y > 250) {
          doc.addPage();
          y = 20;
          adicionarCopyright(doc);
        }

        // Cabeçalho do dia
        doc.setFillColor(63, 81, 181);
        doc.rect(10, y, 190, 12, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(14);
        doc.text(`${diaSemana.toUpperCase()}`, 15, y + 8);
        y += 16;

        // Calcular total do dia considerando apenas opções principais (index 0)
        const totalDia = refeicoesPorDia[diaSemana]
          .filter((refeicao, index) => {
            // Extrair informações da refeição para identificar se é principal
            const partesNome = refeicao.nome.split(' - ')[1] || '';
            const isAlternativa = partesNome.includes('(Alt.');
            return !isAlternativa; // Incluir apenas se não for alternativa
          })
          .reduce((acc, refeicao) => {
            return {
              calorias: acc.calorias + (refeicao.macros?.calorias || 0),
              proteina: acc.proteina + (refeicao.macros?.proteina || 0),
              carbo: acc.carbo + (refeicao.macros?.carbo || 0),
              gordura: acc.gordura + (refeicao.macros?.gordura || 0)
            };
          }, { calorias: 0, proteina: 0, carbo: 0, gordura: 0 });

        // Exibir totais do dia
        doc.setTextColor(100, 100, 100);
        doc.setFontSize(10);
        doc.text(`Total do dia: ${Math.round(totalDia.calorias)} kcal | P: ${totalDia.proteina.toFixed(1)}g | C: ${totalDia.carbo.toFixed(1)}g | G: ${totalDia.gordura.toFixed(1)}g`, 15, y);
        y += 12;

        // Refeições do dia
        refeicoesPorDia[diaSemana].forEach((refeicao, refeicaoIndex) => {
          const espacoNecessario = 25 + refeicao.alimentos.length * 7;
          if (y + espacoNecessario > 270) {
            doc.addPage();
            y = 20;
            adicionarCopyright(doc);
          }

          const cor = cores[refeicaoIndex % cores.length];

          // Cabeçalho da refeição
          doc.setFillColor(...cor);
          doc.rect(15, y, 180, 10, "F");
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(12);
          
          // Extrair nome da refeição sem o dia da semana
          const nomeRefeicao = refeicao.nome.replace(`${diaSemana} - `, '');
          doc.text(nomeRefeicao, 20, y + 7);
          
          // Mostrar calorias da refeição
          if (refeicao.macros) {
            doc.text(`${Math.round(refeicao.macros.calorias)} kcal`, 160, y + 7);
          }
          y += 14;

          // Lista de alimentos
          doc.setTextColor(50, 50, 50);
          doc.setFontSize(10);
          refeicao.alimentos.forEach((alimento) => {
            // Calcular nutrientes corretos
            const unidadesDisponiveis = gerarUnidadesDisponiveis(alimento);
            const nutrientes = calcularNutrientes(
              alimento,
              alimento.quantidade,
              alimento.unidade || "gramas",
              unidadesDisponiveis
            );
            
            const unidadeExibicao = alimento.unidade && alimento.unidade !== "gramas" 
              ? alimento.unidade.replace(/_/g, ' ')
              : "g";
            
            // Nome do alimento com quantidade
            const textoAlimento = `- ${alimento.nome} - ${alimento.quantidade} ${unidadeExibicao}`;
            doc.text(textoAlimento, 20, y);
            
            // Calorias e macros resumidos
            doc.text(`${nutrientes.calorias} kcal`, 150, y);
            doc.setFontSize(8);
            doc.text(`P:${nutrientes.proteina.toFixed(1)} C:${nutrientes.carbo.toFixed(1)} G:${nutrientes.gordura.toFixed(1)}`, 170, y);
            doc.setFontSize(10);
            y += 7;
          });

          y += 8;
        });

        y += 5; // Espaço extra entre dias
      });

      // Página de resumo semanal
      if (diasComRefeicoes.length > 1) {
        doc.addPage();
        y = 20;

        doc.setFillColor(76, 175, 80);
        doc.rect(0, 0, 210, 30, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(18);
        doc.text("RESUMO SEMANAL", 15, 20);
        y = 50;

        adicionarCopyright(doc);

        // Calcular totais semanais considerando apenas opções principais
        const totalSemanal = refeicoes
          .filter((refeicao) => {
            // Extrair informações da refeição para identificar se é principal
            const partesNome = refeicao.nome.split(' - ')[1] || '';
            const isAlternativa = partesNome.includes('(Alt.');
            return !isAlternativa; // Incluir apenas se não for alternativa
          })
          .reduce((acc, refeicao) => {
            return {
              calorias: acc.calorias + (refeicao.macros?.calorias || 0),
              proteina: acc.proteina + (refeicao.macros?.proteina || 0),
              carbo: acc.carbo + (refeicao.macros?.carbo || 0),
              gordura: acc.gordura + (refeicao.macros?.gordura || 0)
            };
          }, { calorias: 0, proteina: 0, carbo: 0, gordura: 0 });

        // Estatísticas
        doc.setTextColor(50, 50, 50);
        doc.setFontSize(14);
        doc.text("ESTATISTICAS SEMANAIS", 15, y);
        y += 20;

        doc.setFontSize(12);
        doc.text(`Total de refeicoes planejadas: ${refeicoes.filter(r => !r.nome.includes('(Alt.')).length}`, 20, y);
        y += 10;
        doc.text(`Dias com refeicoes: ${diasComRefeicoes.length}`, 20, y);
        y += 15;

        // Totais nutricionais
        doc.setFillColor(240, 248, 255);
        doc.rect(15, y, 180, 50, "F");
        doc.setTextColor(25, 118, 210);
        doc.setFontSize(13);
        doc.text("TOTAIS NUTRICIONAIS DA SEMANA", 20, y + 12);
        
        doc.setTextColor(50, 50, 50);
        doc.setFontSize(11);
        doc.text(`Calorias: ${Math.round(totalSemanal.calorias)} kcal`, 20, y + 25);
        doc.text(`Proteinas: ${totalSemanal.proteina.toFixed(1)}g`, 20, y + 35);
        doc.text(`Carboidratos: ${totalSemanal.carbo.toFixed(1)}g`, 100, y + 25);
        doc.text(`Gorduras: ${totalSemanal.gordura.toFixed(1)}g`, 100, y + 35);

        // Média diária considerando apenas opções principais
        const refeicoesRegulares = refeicoes.filter(r => !r.nome.includes('(Alt.'));
        const diasComRefeicoesPrincipais = [...new Set(refeicoesRegulares.map(r => r.nome.split(' - ')[0]))].length;
        
        const mediaDiaria = {
          calorias: totalSemanal.calorias / (diasComRefeicoesPrincipais || 1),
          proteina: totalSemanal.proteina / (diasComRefeicoesPrincipais || 1),
          carbo: totalSemanal.carbo / (diasComRefeicoesPrincipais || 1),
          gordura: totalSemanal.gordura / (diasComRefeicoesPrincipais || 1)
        };

        y += 65;
        doc.setFillColor(245, 245, 245);
        doc.rect(15, y, 180, 30, "F");
        doc.setTextColor(102, 102, 102);
        doc.setFontSize(12);
        doc.text("MÉDIA DIÁRIA", 20, y + 12);
        doc.setFontSize(10);
        doc.text(`${Math.round(mediaDiaria.calorias)} kcal/dia | P: ${mediaDiaria.proteina.toFixed(1)}g | C: ${mediaDiaria.carbo.toFixed(1)}g | G: ${mediaDiaria.gordura.toFixed(1)}g`, 20, y + 22);
      }

      // Adicionar página da lista de compras
      adicionarPaginaListaCompras(doc);

      doc.save("plano-alimentar-semanal-completo.pdf");

      if (onGenerate) onGenerate();
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      alert("Erro ao gerar PDF. Tente novamente.");
    }
  };

  return { gerarPDFEstilizado };
};

export default PDFGenerator;
