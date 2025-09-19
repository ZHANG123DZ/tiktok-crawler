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
const { uploadVideo, uploadImageFromUrl } = require('../utils/uploader');
const { setupElasticPost } = require('../function/elasticSetup');

class PostsService {
  async createOrUpdate(dataPost, videoFilePath) {
    const existingPost = await Post.findOne({
      where: { slug: dataPost.tiktokId },
    });
    if (existingPost) {
      // await existingPost.update(data);
      return existingPost;
    }
    //author
    const author = dataPost.author;

    const user = await User.findOne({ where: { username: author.unique_id } });
    if (!user) {
      console.log(`❌ Không tìm thấy user: ${author.unique_id}`);
      return;
    }
    const data = {
      slug: dataPost.tiktokId,
      title: dataPost.title,
      description: dataPost.description,
      type: 'video',
      status: 'public',
      authorId: user.id,
      authorName: user.name,
      authorUserName: user.username,
      authorAvatar: user.avatar,
    };

    //Music
    const music = await Music.findOne({ where: { slug: dataPost?.music.id } });
    data.musicId = music?.id || null;

    const thumbnailUrl = await uploadImageFromUrl(dataPost.thumbnail);
    if (!thumbnailUrl) {
      console.log(`❌ Upload thumbnail thất bại: ${data.slug}`);
      return;
    }

    const uploadedVideoUrl = await uploadVideo(videoFilePath);
    if (!uploadedVideoUrl) {
      console.log(`❌ Upload video thất bại: ${data.slug}`);
      return;
    }
    data.thumbnail = thumbnailUrl;
    data.content = uploadedVideoUrl;
    data.tags = dataPost.tags || [];
    data.topics = dataPost.topics || [];
    data.viewCount = Math.floor(Math.random() * 10000);

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
    const newPost = await Post.findOne({ where: { slug: data.slug } });
    const elasticPost = {
      id: newPost.id,
      title: dataPost.title,
      description: dataPost.description,
      tags: data.tags,
      topics: data.topics,
      authorName: data.authorName,
      authorUserName: data.authorUserName,
    };
    await setupElasticPost(elasticPost);
    return post;
  }
  async checkExits(slug) {
    const exits = await Post.findOne({ where: { slug } });
    if (exits) return true;
    return false;
  }
}

module.exports = new PostsService();
