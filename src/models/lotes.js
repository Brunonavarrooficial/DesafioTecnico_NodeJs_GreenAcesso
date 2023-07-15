const { DataTypes } = require('sequelize');
const sequelize = require('../db/database');

const Lote = sequelize.define('Lote', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    nome: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    ativo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    criado_em: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
});

module.exports = Lote;
