const { DataTypes } = require('sequelize');
const sequelize = require('../db/database');
const Lote = require('./lotes');

const Boleto = sequelize.define('Boleto', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    nome_sacado: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    valor: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    linha_digitavel: {
        type: DataTypes.STRING(255),
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

Boleto.belongsTo(Lote, { foreignKey: 'id_lote' });

module.exports = Boleto;
