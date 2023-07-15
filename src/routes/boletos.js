const express = require('express');
const router = express.Router();
const boletosController = require('../controllers/boletosController');

// Rota para importar boletos a partir de um arquivo CSV
router.post('/import', boletosController.importBoletos);

// Rota para importar boletos a partir de um arquivo PDF
router.post('/import/pdf', boletosController.importBoletosFromPDF);

// Rota para listar todos os boletos
router.get('/', boletosController.getBoletos);

// Rota para filtrar boletos
router.get('/filter', boletosController.filterBoletos);

// Rota para gerar um relatório em PDF dos boletos
router.get('/report', boletosController.generateBoletosReport);

module.exports = router;
