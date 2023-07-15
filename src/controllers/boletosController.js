const fs = require('fs');
const csv = require('csv-parser');
const Boleto = require('../models/boletos');
const Lote = require('../models/lotes');
const { generatePDF } = require('../utils/pdfGenerator');
const { Op } = require('sequelize');
const PDFDocument = require('pdfkit');

async function importBoletos(req, res) {
    try {
        fs.createReadStream(req.file.path)
            .pipe(csv({ separator: ';' }))
            .on('data', async (data) => {
                const { nome, unidade, valor, linha_digitavel } = data;

                let lote = await Lote.findOne({ where: { nome: unidade } });

                if (!lote) {
                    console.log(`Lote ${unidade} não encontrado. Criando novo lote...`);
                    const loteNome = unidade.padStart(4, '0');

                    let loteId;
                    switch (unidade) {
                        case '17':
                            loteId = 3;
                            break;
                        case '18':
                            loteId = 6;
                            break;
                        case '19':
                            loteId = 7;
                            break;
                        default:
                            console.log(`Lote ${unidade} não mapeado.`);
                            return;
                    }

                    lote = await Lote.create({ nome: loteNome, ativo: true, id: loteId });
                }

                await Boleto.create({
                    nome_sacado: nome,
                    id_lote: lote.id,
                    valor: parseFloat(valor),
                    linha_digitavel,
                });
            })
            .on('end', () => {
                console.log('Importação concluída.');
                fs.unlinkSync(req.file.path);
            });

        return res.status(200).json({ message: 'Importação em andamento.' });
    } catch (error) {
        console.error('Erro ao importar boletos:', error);
        return res.status(500).json({ error: 'Erro ao importar boletos.' });
    }
}

async function importBoletosFromPDF(req, res) {
    try {
        const pdfPath = req.file.path;
        const boletos = await Boleto.findAll();

        const pages = generatePDF(boletos, pdfPath);
        console.log(`PDF desmembrado em ${pages} arquivos.`);

        return res.status(200).json({ message: 'PDF desmembrado em arquivos individuais.' });
    } catch (error) {
        console.error('Erro ao importar boletos a partir do PDF:', error);
        return res.status(500).json({ error: 'Erro ao importar boletos a partir do PDF.' });
    }
}

async function getBoletos(req, res) {
    try {
        const { nome, valor_inicial, valor_final, id_lote } = req.query;
        const filters = {};

        if (nome) {
            filters.nome_sacado = nome;
        }

        if (valor_inicial && valor_final) {
            filters.valor = { [Op.between]: [valor_inicial, valor_final] };
        }

        if (id_lote) {
            filters.id_lote = id_lote;
        }

        const boletos = await Boleto.findAll({ where: filters });
        return res.status(200).json(boletos);
    } catch (error) {
        console.error('Erro ao obter boletos:', error);
        return res.status(500).json({ error: 'Erro ao obter boletos.' });
    }
}

async function filterBoletos(req, res) {
    try {
        const { nome, valor_inicial, valor_final, id_lote } = req.query;

        const whereClause = {};

        if (nome) {
            whereClause.nome_sacado = { [Op.like]: `%${nome}%` };
        }

        if (valor_inicial && valor_final) {
            whereClause.valor = { [Op.between]: [valor_inicial, valor_final] };
        } else if (valor_inicial) {
            whereClause.valor = { [Op.gte]: valor_inicial };
        } else if (valor_final) {
            whereClause.valor = { [Op.lte]: valor_final };
        }

        if (id_lote) {
            whereClause.id_lote = id_lote;
        }

        const boletos = await Boleto.findAll({ where: whereClause });

        return res.status(200).json(boletos);
    } catch (error) {
        console.error('Erro ao filtrar boletos:', error);
        return res.status(500).json({ error: 'Erro ao filtrar boletos.' });
    }
}

async function generateBoletosReport(req, res) {
    try {
        const boletos = await Boleto.findAll();

        const doc = new PDFDocument();
        const buffers = [];

        doc.font('fonts/Roboto-Regular.ttf');

        doc.fontSize(18).text('Relatório de Boletos', { align: 'center' });
        doc.moveDown();

        const tableHeaders = ['ID', 'Nome Sacado', 'ID Lote', 'Valor', 'Linha Digitável'];

        // Define a função para desenhar uma célula da tabela
        const drawCell = (text, x, y, width, height) => {
            doc.rect(x, y, width, height).stroke();
            doc.text(text, x + 5, y + 5, { width: width - 10, height: height - 10, align: 'center', valign: 'center' });
        };

        // Define as configurações da tabela
        const tableSettings = {
            x: 25,
            y: doc.y + 10,
            rowHeight: 40,
            columnWidths: [30, 180, 70, 80, 200],
            headersFill: '#dddddd',
            headersTextColor: '#000000',
            textColor: '#000000',
            fontSize: 12,
        };

        // Desenha os cabeçalhos da tabela
        let currentX = tableSettings.x;
        tableHeaders.forEach((header, index) => {
            drawCell(header, currentX, tableSettings.y, tableSettings.columnWidths[index], tableSettings.rowHeight);
            currentX += tableSettings.columnWidths[index];
        });

        // Desenha as linhas da tabela
        let currentY = tableSettings.y + tableSettings.rowHeight;
        boletos.forEach((boleto) => {
            const rowData = [
                boleto.id.toString(),
                boleto.nome_sacado,
                boleto.id_lote.toString(),
                boleto.valor.toString(),
                boleto.linha_digitavel,
            ];

            currentX = tableSettings.x;
            rowData.forEach((cell, index) => {
                drawCell(cell, currentX, currentY, tableSettings.columnWidths[index], tableSettings.rowHeight);
                currentX += tableSettings.columnWidths[index];
            });

            currentY += tableSettings.rowHeight;
        });

        doc.on('data', (buffer) => buffers.push(buffer));
        doc.on('end', () => {
            const pdfData = Buffer.concat(buffers);
            return res.status(200).contentType('application/pdf').send(pdfData);
        });

        doc.end();
    } catch (error) {
        console.error('Erro ao gerar relatório de boletos:', error);
        return res.status(500).json({ error: 'Erro ao gerar relatório de boletos.' });
    }
}

module.exports = {
    importBoletos,
    importBoletosFromPDF,
    getBoletos,
    filterBoletos,
    generateBoletosReport,
};
