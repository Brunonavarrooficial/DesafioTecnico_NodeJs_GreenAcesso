const PDFDocument = require('pdfkit');
const fs = require('fs');

function generatePDF(boletos, pdfPath) {
    const doc = new PDFDocument();

    doc.pipe(fs.createWriteStream(pdfPath));

    let pageCount = 0;

    boletos.forEach((boleto, index) => {
        if (index > 0) {
            doc.addPage();
            pageCount++;
        }

        doc.fontSize(18).text(`Boleto de ${boleto.nome_sacado}`, { align: 'center' });
    });

    doc.end();

    return pageCount + 1;
}

module.exports = {
    generatePDF,
};

