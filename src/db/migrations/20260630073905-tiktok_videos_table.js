'use strict';
/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tiktok_videos', {
      id: {
        type: Sequelize.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      tiktok_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        unique: true,
      },
      music_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        references: {
          model: 'tiktok_musics',
          key: 'tiktok_id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      title: {
        type: Sequelize.STRING(500),
      },
      description: {
        type: Sequelize.TEXT,
      },
      content: {
        type: Sequelize.STRING(500),
      },
      thumbnail: {
        type: Sequelize.STRING(500),
      },
      tags: {
        type: Sequelize.JSON,
      },
      topics: {
        type: Sequelize.JSON,
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
    await queryInterface.dropTable('tiktok_videos');
  },
};
