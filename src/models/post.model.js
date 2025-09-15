module.exports = (sequelize, DataTypes) => {
  const Post = sequelize.define(
    'Post',
    {
      title: {
        type: DataTypes.STRING(191),
        allowNull: true,
        defaultValue: '',
      },
      slug: {
        type: DataTypes.STRING(191),
        allowNull: true,
        unique: true,
      },
      thumbnail: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      type: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      musicId: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        references: {
          model: 'musics',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        field: 'music_id',
      },
      authorId: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        field: 'author_id',
      },
      authorName: {
        type: DataTypes.STRING(191),
        allowNull: true,
        field: 'author_name',
      },
      authorUserName: {
        type: DataTypes.STRING(191),
        allowNull: true,
        field: 'author_username',
      },
      authorAvatar: {
        type: DataTypes.STRING(191),
        allowNull: true,
        field: 'author_avatar',
      },
      metaTitle: {
        field: 'meta_title',
        type: DataTypes.STRING(191),
        allowNull: true,
        defaultValue: '',
      },
      metaDescription: {
        field: 'meta_description',
        type: DataTypes.STRING(191),
        allowNull: false,
        defaultValue: '',
      },
      status: {
        type: DataTypes.STRING(50),
        defaultValue: 'draft',
        allowNull: true,
      },
      viewCount: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
        defaultValue: 0,
        field: 'view_count',
      },
      likeCount: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
        defaultValue: 0,
        field: 'like_count',
      },
      commentCount: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
        defaultValue: 0,
        field: 'comment_count',
      },
      bookMarkCount: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
        defaultValue: 0,
        field: 'book_mark_count',
      },
      shareCount: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
        defaultValue: 0,
        field: 'share_count',
      },
      reportCount: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
        defaultValue: 0,
        field: 'report_count',
      },
      diggCount: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
        defaultValue: 0,
        field: 'digg_count',
      },
      language: {
        type: DataTypes.STRING(191),
        allowNull: true,
      },
      visibility: {
        type: DataTypes.ENUM('public', 'private', 'unlisted'),
        allowNull: false,
        defaultValue: 'public',
      },
      moderationStatus: {
        type: DataTypes.ENUM('approved', 'pending', 'rejected'),
        allowNull: false,
        defaultValue: 'approved',
        field: 'moderation_status',
      },
      isPinned: {
        type: DataTypes.TINYINT(1).UNSIGNED,
        allowNull: false,
        defaultValue: 0,
        field: 'is_pinned',
      },
      isFeatured: {
        type: DataTypes.TINYINT(1).UNSIGNED,
        allowNull: false,
        defaultValue: 0,
        field: 'is_featured',
      },
      visibilityUpdatedAt: {
        type: DataTypes.DATE(6),
        allowNull: true,
        field: 'visibility_updated_at',
      },
      publishedAt: {
        type: DataTypes.DATE(6),
        allowNull: true,
        field: 'published_at',
      },
    },
    {
      tableName: 'posts',
      timestamps: true,
      paranoid: true,
      underscored: true,
      charset: 'utf8',
      collate: 'utf8mb4_unicode_ci',
      engine: 'InnoDB',
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
      deletedAt: 'deletedAt',
    }
  );
  Post.associate = (db) => {
    Post.belongsTo(db.User, {
      foreignKey: 'authorId',
      as: 'author',
    });
    Post.belongsTo(db.Music, {
      foreignKey: 'musicId',
      as: 'music',
    });
    Post.belongsToMany(db.Topic, {
      through: db.PostTopic,
      foreignKey: 'postId',
      as: 'topics',
    });
    Post.hasMany(db.PostTopic, {
      foreignKey: 'postId',
      as: 'postTopics',
    });
    Post.belongsToMany(db.Tag, {
      through: db.PostTag,
      foreignKey: 'postId',
      as: 'tags',
    });
    Post.hasMany(db.PostTag, {
      foreignKey: 'postId',
      as: 'postTags',
    });
  };
  return Post;
};
