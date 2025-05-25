import { jsPDF } from "jspdf";

const cores = [
  [255, 193, 7],   // Amarelo
  [76, 175, 80],   // Verde
  [33, 150, 243],  // Azul
  [156, 39, 176],  // Roxo
  [255, 87, 34],   // Laranja
];

const PDFGenerator = ({ refeicoes, totalDia, calorias, onGenerate }) => {
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

      refeicoes.forEach((refeicao, index) => {
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
