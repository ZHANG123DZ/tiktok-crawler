'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tags', {
      id: {
        type: Sequelize.BIGINT.UNSIGNED,
        autoIncrement: true,

        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING(100),
        unique: true,
      },
      slug: {
        type: Sequelize.STRING(100),
        unique: true,
      },
      post_count: {
        type: Sequelize.INTEGER.UNSIGNED,
      },
      created_at: {
        type: Sequelize.DATE(6),
      },
      updated_at: {
        type: Sequelize.DATE(6),
        onUpdate: Sequelize.literal('CURRENT_TIMESTAMP(6)'),
      },
      deleted_at: {
        type: Sequelize.DATE(6),
      },
    });

    await queryInterface.addIndex('tags', ['slug']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('tags');
  },
};
