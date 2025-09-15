module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      username: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: true,
        unique: true,
      },
      phone: {
        type: DataTypes.STRING(20),
        allowNull: true,
        unique: true,
      },
      password: {
        allowNull: false,
        type: DataTypes.STRING(255),
      },
      name: {
        allowNull: true,
        type: DataTypes.STRING(191),
      },
      firstName: {
        allowNull: true,
        type: DataTypes.STRING(100),
        field: 'first_name',
      },
      lastName: {
        allowNull: true,
        type: DataTypes.STRING(100),
        field: 'last_name',
      },
      avatar: {
        allowNull: true,
        type: DataTypes.STRING(191),
      },
      bio: {
        allowNull: true,
        type: DataTypes.TEXT,
      },
      postCount: {
        defaultValue: 0,
        allowNull: true,
        type: DataTypes.BIGINT.UNSIGNED,
        // field: 'post_count',
      },
      followerCount: {
        defaultValue: 0,
        allowNull: true,
        type: DataTypes.BIGINT.UNSIGNED,
        field: 'follower_count',
      },
      followingCount: {
        defaultValue: 0,
        allowNull: true,
        type: DataTypes.BIGINT.UNSIGNED,
        field: 'following_count',
      },
      likeCount: {
        defaultValue: 0,
        allowNull: true,
        type: DataTypes.BIGINT.UNSIGNED,
        field: 'like_count',
      },
      reportCount: {
        defaultValue: 0,
        allowNull: true,
        type: DataTypes.BIGINT.UNSIGNED,
        field: 'report_count',
      },
      gender: {
        type: DataTypes.ENUM('male', 'female', 'other'),
        allowNull: true,
      },
      birthday: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      role: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      status: {
        defaultValue: 'active',
        type: DataTypes.ENUM('active', 'inactive', 'banned'),
        allowNull: true,
      },
      twoFactorEnabled: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        field: 'two_factor_enabled',
      },
      loginProvider: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: 'login_provider',
      },
      lastLoginAt: {
        type: DataTypes.DATE(6),
        allowNull: true,
        field: 'last_login_at',
      },
      emailSentAt: {
        type: DataTypes.DATE(6),
        allowNull: true,
        field: 'email_sent_at',
      },
      verifiedAt: {
        type: DataTypes.DATE(6),
        allowNull: true,
        field: 'verified_at',
      },
    },
    {
      tableName: 'users',
      underscored: true,
      paranoid: true,
      charset: 'utf8',
      collate: 'utf8mb4_unicode_ci',
      engine: 'InnoDB',
      timestamps: true,
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
      deletedAt: 'deletedAt',
    }
  );
  User.associate = (db) => {
    User.hasMany(db.Post, {
      foreignKey: 'authorId',
      as: 'posts',
    });
    User.hasMany(db.Music, {
      foreignKey: 'authorId',
      as: 'musicTracks',
    });
  };
  return User;
};
