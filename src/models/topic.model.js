module.exports = (sequelize, DataTypes) => {
  const Topic = sequelize.define(
    'Topic',
    {
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
      },
      slug: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
      },
      postCount: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
        field: 'post_count',
      },
    },
    {
      tableName: 'topics',
      timestamps: true,
      paranoid: true,
      underscored: true,
      charset: 'utf8',
      collate: 'utf8_general_ci',
      engine: 'InnoDB',
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
      deletedAt: 'deletedAt',
    }
  );
  Topic.associate = (db) => {
    Topic.hasMany(db.PostTopic, {
      foreignKey: 'topicId',
      as: 'postTopics',
    });
    Topic.belongsToMany(db.Post, {
      through: db.PostTopic,
      foreignKey: 'topicId',
      as: 'posts',
    });
  };
  return Topic;
};
