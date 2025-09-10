module.exports = (sequelize, DataTypes) => {
  const TikTokMusic = sequelize.define(
    'TikTokMusic',
    {
      tiktokId: {
        type: DataTypes.BIGINT.UNSIGNED,
        unique: true,
        allowNull: false,
        field: 'tiktok_id',
      },
      audio: {
        type: DataTypes.STRING(500),
        allowNull: false,
      },
      thumbnail: {
        type: DataTypes.STRING(500),
        allowNull: false,
      },
    },
    {
      tableName: 'tiktok_musics',
      timestamps: true,
      underscored: true,
      charset: 'utf8',
      collate: 'utf8_general_ci',
      engine: 'InnoDB',
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    }
  );
  TikTokMusic.associate = (db) => {
    TikTokMusic.hasMany(db.TikTokVideo, {
      foreignKey: 'tiktokId',
      as: 'musicTikTokVideos',
    });
  };
  return TikTokMusic;
};
