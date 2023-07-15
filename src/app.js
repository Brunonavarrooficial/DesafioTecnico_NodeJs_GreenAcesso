const express = require('express');
const multer = require('multer');
const boletosRouter = require('./routes/boletos');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuração do multer para upload de arquivos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}_${file.originalname}`);
    },
});
const upload = multer({ storage });

app.use('/boletos', upload.single('file'), boletosRouter);

module.exports = app;
