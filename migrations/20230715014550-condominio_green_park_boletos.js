'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('boletos', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      nome_sacado: {
        type: Sequelize.STRING
      },
      id_lote: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'lotes',
          key: 'id'
        }
      },
      valor: {
        type: Sequelize.DECIMAL(10, 2)
      },
      linha_digitavel: {
        type: Sequelize.STRING
      },
      ativo: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      criado_em: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('boletos');
  }
};
