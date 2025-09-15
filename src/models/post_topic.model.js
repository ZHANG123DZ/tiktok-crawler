module.exports = (sequelize, DataTypes) => {
  const PostTopic = sequelize.define(
    'PostTopic',
    {
      postId: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        references: {
          model: 'posts',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        field: 'post_id',
      },
      topicId: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        references: {
          model: 'topics',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        field: 'topic_id',
      },
    },
    {
      tableName: 'post_topics',
      timestamps: true,
      underscored: true,
      charset: 'utf8',
      collate: 'utf8_general_ci',
      engine: 'InnoDB',
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    }
  );
  PostTopic.associate = (db) => {
    PostTopic.belongsTo(db.Post, {
      foreignKey: 'postId',
      as: 'post',
    });
    PostTopic.belongsTo(db.Topic, {
      foreignKey: 'topicId',
      as: 'topic',
    });
  };
  PostTopic.associate = (db) => {
    PostTopic.belongsTo(db.Post, {
      foreignKey: 'post_id',
      as: 'post',
    });
    PostTopic.belongsTo(db.Topic, {
      foreignKey: 'topic_id',
      as: 'topic',
    });
  };
  return PostTopic;
};
