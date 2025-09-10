module.exports = (sequelize, DataTypes) => {
  const TikTokVideo = sequelize.define(
    'TikTokVideo',
    {
      tiktokId: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
        unique: true,
        field: 'tiktok_id',
      },
      musicId: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
        field: 'music_id',
      },
      title: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      description: {
        allowNull: true,
        type: DataTypes.TEXT,
      },
      content: {
        allowNull: true,
        type: DataTypes.STRING(500),
      },
      thumbnail: {
        allowNull: true,
        type: DataTypes.STRING(500),
      },
      tags: {
        allowNull: true,
        type: DataTypes.JSON,
      },
      topics: {
        allowNull: true,
        type: DataTypes.JSON,
      },
    },
    {
      tableName: 'tiktok_videos',
      timestamps: true,
      underscored: true,
      charset: 'utf8',
      collate: 'utf8_general_ci',
      engine: 'InnoDB',
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    }
  );
  TikTokVideo.associate = (db) => {
    TikTokVideo.belongsTo(db.TikTokMusic, {
      foreignKey: 'musicId',
      as: 'musicTikTokInfo',
    });
  };
  return TikTokVideo;
};
