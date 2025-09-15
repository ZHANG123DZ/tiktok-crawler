module.exports = (sequelize, DataTypes) => {
  const PostTag = sequelize.define(
    'PostTag',
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
      tagId: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        references: {
          model: 'tags',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        field: 'tag_id',
      },
    },
    {
      tableName: 'post_tags',
      timestamps: true,
      underscored: true,
      charset: 'utf8',
      collate: 'utf8_general_ci',
      engine: 'InnoDB',
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    }
  );
  PostTag.associate = (db) => {
    PostTag.belongsTo(db.Post, {
      foreignKey: 'postId',
      as: 'post',
    });
    PostTag.belongsTo(db.Tag, {
      foreignKey: 'tagId',
      as: 'tag',
    });
  };
  return PostTag;
};
