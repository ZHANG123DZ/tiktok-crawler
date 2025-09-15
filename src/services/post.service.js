const { Op } = require('sequelize');
const incrementField = require('../helper/incrementField');
const {
  Post,
  Topic,
  PostTopic,
  PostTag,
  Tag,
  User,
  Music,
} = require('../models');

class PostsService {
  async create(data) {
    //author
    const author = data.author;
    const user = await User.findOne({ where: { username: author.unique_id } });

    data.authorId = user.id;
    data.authorName = user.name;
    data.authorUserName = user.username;
    data.authorAvatar = user.avatar;
    //Music
    const music = await Music.findOne({ where: { slug: data?.musicId } });
    data.musicId = music?.id || null;
    const post = await Post.create(data);
    //Tag
    const tags = await Tag.findAll({
      where: { name: data.tags },
      attributes: ['id'],
    });

    const tagIds = tags.map((tag) => tag.id);
    await Promise.all(
      tagIds.map((id) => PostTag.create({ postId: post.id, tagId: id }))
    );

    //Topic
    const topics = await Topic.findAll({
      where: { name: data.topics },
      attributes: ['id'],
    });

    const topicIds = topics.map((topic) => topic.id);
    await Promise.all(
      topicIds.map((id) => PostTopic.create({ postId: post.id, topicId: id }))
    );

    //Tăng các postCount
    await incrementField(User, 'post_count', +1, { id: user.id });
    if (post && post.musicId) {
      await incrementField(Music, 'video_count', +1, { id: post.musicId });
    }
    await incrementField(Tag, 'post_count', +1, {
      id: { [Op.in]: tagIds },
    });
    await incrementField(Topic, 'post_count', +1, {
      id: { [Op.in]: topicIds },
    });
    return post;
  }
  async checkExits(slug) {
    const exits = await Post.findOne({ where: { slug } });
    if (exits) return true;
    return false;
  }
}

module.exports = new PostsService();
