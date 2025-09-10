'use strict';
/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tiktok_musics', {
      id: {
        type: Sequelize.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      tiktok_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        unique: true,
      },
      audio: {
        type: Sequelize.STRING(500),
      },
      thumbnail: {
        type: Sequelize.STRING(500),
      },
      created_at: {
        type: Sequelize.DATE,
      },
      updated_at: {
        type: Sequelize.DATE,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('tiktok_musics');
  },
};
