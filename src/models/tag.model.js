module.exports = (sequelize, DataTypes) => {
  const Tag = sequelize.define(
    'Tag',
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
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
        field: 'post_count',
      },
    },
    {
      tableName: 'tags',
      timestamps: true,
      paranoid: true,
      underscored: true,
      charset: 'utf8',
      collate: 'utf8_general_ci',
      engine: 'InnoDB',
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    }
  );
  Tag.associate = (db) => {
    Tag.hasMany(db.PostTag, {
      foreignKey: 'tagId',
      as: 'postTags',
    });
    Tag.belongsToMany(db.Post, {
      through: db.PostTag,
      foreignKey: 'tagId',
      as: 'posts',
    });
  };
  return Tag;
};
