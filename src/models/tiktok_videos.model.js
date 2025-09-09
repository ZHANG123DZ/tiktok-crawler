module.exports = (sequelize, DataTypes) => {
  const TikTokVideo = sequelize.define(
    'TikTokVideo',
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      tiktokId: {
        type: DataTypes.STRING(255),
        allowNull: true,
        unique: true,
        field: 'tiktok_id',
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
  return TikTokVideo;
};
