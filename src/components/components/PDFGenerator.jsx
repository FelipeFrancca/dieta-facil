import { jsPDF } from "jspdf";

const cores = [
  [76, 175, 80], // Verde
  [33, 150, 243], // Azul
  [156, 39, 176], // Roxo
  [255, 87, 34], // Laranja
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
    const listaCompras = {};

    refeicoes.forEach((refeicao) => {
      refeicao.alimentos.forEach((alimento) => {
        const nomeAlimento = alimento.nome;
        const quantidade = alimento.quantidade;

        if (listaCompras[nomeAlimento]) {
          listaCompras[nomeAlimento] += quantidade;
        } else {
          listaCompras[nomeAlimento] = quantidade;
        }
      });
    });

    return Object.entries(listaCompras)
      .map(([nome, quantidade]) => ({ nome, quantidade }))
      .sort((a, b) => a.nome.localeCompare(b.nome));
  };

  const adicionarPaginaListaCompras = (doc) => {
    doc.addPage();
    let y = 20;

    doc.setFillColor(76, 175, 80);
    doc.rect(0, 0, 210, 30, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.text("LISTA DE COMPRAS", 15, 20);
    y = 50;

    adicionarCopyright(doc);

    const listaCompras = calcularListaCompras();

    doc.setTextColor(50, 50, 50);
    doc.setFontSize(12);
    doc.text("Quantidades necessárias para todo o plano alimentar:", 15, y);
    y += 20;

    doc.setFillColor(240, 240, 240);
    doc.rect(15, y - 5, 180, 10, "F");
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(11);
    doc.text("Alimento", 20, y + 2);
    doc.text("Quantidade Total", 150, y + 2);
    y += 15;

    doc.setFontSize(10);
    listaCompras.forEach((item, index) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
        adicionarCopyright(doc);

        doc.setFillColor(240, 240, 240);
        doc.rect(15, y - 5, 180, 10, "F");
        doc.setTextColor(50, 50, 50);
        doc.setFontSize(11);
        doc.text("Alimento", 20, y + 2);
        doc.text("Quantidade Total", 150, y + 2);
        y += 15;
        doc.setFontSize(10);
      }

      if (index % 2 === 0) {
        doc.setFillColor(250, 250, 250);
        doc.rect(15, y - 3, 180, 8, "F");
      }

      doc.setTextColor(50, 50, 50);
      doc.text(item.nome, 20, y + 2);
      doc.text(`${item.quantidade}g`, 150, y + 2);
      y += 8;
    });

    y += 10;
    if (y > 260) {
      doc.addPage();
      y = 20;
      adicionarCopyright(doc);
    }

    doc.setFillColor(102, 126, 234);
    doc.rect(15, y, 180, 15, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.text(`Total de itens diferentes: ${listaCompras.length}`, 20, y + 10);

    const pesoTotal = listaCompras.reduce(
      (total, item) => total + item.quantidade,
      0
    );
    doc.text(
      `Peso total aproximado: ${(pesoTotal / 1000).toFixed(1)}kg`,
      120,
      y + 10
    );
  };

  const gerarPDFEstilizado = () => {
    try {
      const doc = new jsPDF();
      let y = 20;

      doc.setFillColor(102, 126, 234);
      doc.rect(0, 0, 210, 30, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.text("PLANO ALIMENTAR", 15, 20);
      y = 40;

      adicionarCopyright(doc);

      refeicoes.forEach((refeicao, index) => {
        const espacoNecessario = 30 + refeicao.alimentos.length * 6;
        if (y + espacoNecessario > 270) {
          doc.addPage();
          y = 20;

          adicionarCopyright(doc);
        }

        const cor = cores[index % cores.length];

        doc.setFillColor(...cor);
        doc.rect(10, y, 190, 10, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(13);
        doc.text(`${refeicao.nome}`, 15, y + 7);
        y += 14;

        doc.setTextColor(50, 50, 50);
        doc.setFontSize(11);
        refeicao.alimentos.forEach((alimento) => {
          const kcal = Math.round(
            (alimento.calorias * alimento.quantidade) / 100
          );
          doc.text(`${alimento.nome} - ${alimento.quantidade}g`, 20, y);
          doc.text(`${kcal} kcal`, 160, y);
          y += 6;
        });

        y += 8;
      });

      adicionarPaginaListaCompras(doc);

      doc.save("plano-alimentar-personalizado.pdf");

      if (onGenerate) onGenerate();
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      alert("Erro ao gerar PDF. Tente novamente.");
    }
  };

  return { gerarPDFEstilizado };
};

export default PDFGenerator;
