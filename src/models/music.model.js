'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = (sequelize, DataTypes) => {
  const Music = sequelize.define(
    'Music',
    {
      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      authorId: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        field: 'author_id',
      },
      slug: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
      },
      audio: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      thumbnail: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      videoCount: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
        defaultValue: 0,
        field: 'video_count',
      },
    },
    {
      tableName: 'musics',
      timestamps: true,
      underscored: true,
      charset: 'utf8',
      collate: 'utf8mb4_unicode_ci',
      engine: 'InnoDB',
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    }
  );
  Music.associate = (db) => {
    Music.belongsTo(db.User, {
      foreignKey: 'authorId',
      as: 'author',
    });
    Music.hasMany(db.Post, {
      foreignKey: 'musicId',
      as: 'musicPosts',
    });
  };
  return Music;
};
