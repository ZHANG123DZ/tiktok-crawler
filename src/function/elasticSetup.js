require('module-alias/register');
const elastic = require('../configs/elastics');
const { User, Post, Tag, Topic } = require('../models');

async function setupElasticPost(post) {
  try {
    if (!post) {
      console.log('ℹ️ No post data provided to seed');
      return;
    }

    // Check nếu index đã tồn tại
    const exists = await elastic.indices.exists({ index: 'posts' });

    if (!exists) {
      // Tạo index với cấu hình analyzer
      await elastic.indices.create({
        index: 'posts',
        body: {
          settings: {
            analysis: {
              analyzer: {
                autocomplete_index: {
                  tokenizer: 'autocomplete_tokenizer',
                  filter: ['lowercase', 'asciifolding'],
                },
                autocomplete_search: {
                  tokenizer: 'standard',
                  filter: ['lowercase', 'asciifolding'],
                },
                fulltext_search: {
                  tokenizer: 'standard',
                  filter: ['lowercase', 'asciifolding'],
                },
              },
              tokenizer: {
                autocomplete_tokenizer: {
                  type: 'edge_ngram',
                  min_gram: 1,
                  max_gram: 20,
                  token_chars: ['letter', 'digit'],
                },
              },
            },
          },
          mappings: {
            properties: {
              title: {
                type: 'text',
                fields: {
                  autocomplete: {
                    type: 'text',
                    analyzer: 'autocomplete_index',
                    search_analyzer: 'autocomplete_search',
                  },
                  fulltext: {
                    type: 'text',
                    analyzer: 'fulltext_search',
                  },
                  keyword: {
                    type: 'keyword',
                  },
                },
              },
              description: {
                type: 'text',
                analyzer: 'fulltext_search',
                search_analyzer: 'autocomplete_search',
              },
              authorName: {
                type: 'text',
                analyzer: 'autocomplete_index',
                search_analyzer: 'autocomplete_search',
              },
              authorUserName: {
                type: 'text',
                analyzer: 'autocomplete_index',
                search_analyzer: 'autocomplete_search',
              },
              metaTitle: {
                type: 'text',
                analyzer: 'fulltext_search',
                search_analyzer: 'autocomplete_search',
              },
              metaDescription: {
                type: 'text',
                analyzer: 'fulltext_search',
                search_analyzer: 'autocomplete_search',
              },
              tags: {
                type: 'text',
                analyzer: 'fulltext_search',
                search_analyzer: 'autocomplete_search',
              },
              topics: {
                type: 'text',
                analyzer: 'fulltext_search',
                search_analyzer: 'autocomplete_search',
              },
            },
          },
        },
      });

      console.log('✅ Index "posts" created with edge_ngram');
    } else {
      console.log('ℹ️ Index "posts" already exists');
    }

    // Chuẩn bị dữ liệu để seed
    const body = [
      { index: { _index: 'posts', _id: post.id.toString() } },
      {
        title: post.title || '',
        description: post.description || '',
        metaTitle: post?.metaTitle || '',
        metaDescription: post?.metaDescription || '',
        authorName: post.author?.name || '',
        authorUserName: post.author?.username || '',
        tags: post.tags?.map((t) => t.name) || [],
        topics: post.topics?.map((t) => t.name) || [],
      },
    ];

    // Seed dữ liệu vào Elasticsearch
    await elastic.bulk({ refresh: true, body });

    console.log(`✅ Seeded post ID ${post.id} to Elasticsearch successfully`);
  } catch (err) {
    console.error(
      '❌ Elastic setup failed:',
      err.meta?.body?.error || err.message || err
    );
  }
}

async function setupElasticUser(user) {
  try {
    if (!user) {
      console.log('ℹ️ No user data provided to seed');
      return;
    }

    const indexName = 'users';

    // Kiểm tra index đã tồn tại chưa
    const exists = await elastic.indices.exists({ index: indexName });

    if (!exists) {
      await elastic.indices.create({
        index: indexName,
        body: {
          settings: {
            analysis: {
              analyzer: {
                autocomplete_index: {
                  tokenizer: 'autocomplete_tokenizer',
                  filter: ['lowercase', 'asciifolding'],
                },
                autocomplete_search: {
                  tokenizer: 'standard',
                  filter: ['lowercase', 'asciifolding'],
                },
                fulltext_search: {
                  tokenizer: 'standard',
                  filter: ['lowercase', 'asciifolding'],
                },
              },
              tokenizer: {
                autocomplete_tokenizer: {
                  type: 'edge_ngram',
                  min_gram: 1,
                  max_gram: 20,
                  token_chars: ['letter', 'digit'],
                },
              },
            },
          },
          mappings: {
            properties: {
              name: {
                type: 'text',
                fields: {
                  autocomplete: {
                    type: 'text',
                    analyzer: 'autocomplete_index',
                    search_analyzer: 'autocomplete_search',
                  },
                  fulltext: {
                    type: 'text',
                    analyzer: 'fulltext_search',
                  },
                  keyword: {
                    type: 'keyword',
                  },
                },
              },
              username: {
                type: 'text',
                fields: {
                  autocomplete: {
                    type: 'text',
                    analyzer: 'autocomplete_index',
                    search_analyzer: 'autocomplete_search',
                  },
                  fulltext: {
                    type: 'text',
                    analyzer: 'fulltext_search',
                  },
                  keyword: {
                    type: 'keyword',
                  },
                },
              },
              bio: {
                type: 'text',
                analyzer: 'fulltext_search',
                search_analyzer: 'autocomplete_search',
              },
            },
          },
        },
      });

      console.log(`✅ Index "${indexName}" created with analyzers`);
    } else {
      console.log(`ℹ️ Index "${indexName}" already exists`);
    }

    // Tạo document Elasticsearch từ user
    const elasticUser = {
      name: user.name || '',
      username: user.username || '',
      bio: user.bio || '',
    };

    // Index vào Elasticsearch
    await elastic.index({
      index: indexName,
      id: user.id.toString(),
      document: elasticUser,
      refresh: true,
    });

    console.log(`✅ Seeded user ID ${user.id} to Elasticsearch`);
  } catch (err) {
    console.error(
      '❌ Elasticsearch user setup failed:',
      err.meta?.body?.error || err.message || err
    );
  }
}

async function setupSuggestion() {
  const indexName = 'suggestions';

  // 1. Tạo lại index nếu chưa có
  const exists = await elastic.indices.exists({ index: indexName });
  if (!exists) {
    await elastic.indices.create({
      index: indexName,
      body: {
        settings: {
          analysis: {
            analyzer: {
              autocomplete_index: {
                tokenizer: 'autocomplete_tokenizer',
                filter: ['lowercase', 'asciifolding'],
              },
              autocomplete_search: {
                tokenizer: 'standard',
                filter: ['lowercase', 'asciifolding'],
              },
            },
            tokenizer: {
              autocomplete_tokenizer: {
                type: 'edge_ngram',
                min_gram: 1,
                max_gram: 20,
                token_chars: ['letter'],
              },
            },
          },
        },
        mappings: {
          properties: {
            term: {
              type: 'text',
              analyzer: 'autocomplete_index',
              search_analyzer: 'autocomplete_search',
            },
            type: { type: 'keyword' },
          },
        },
      },
    });
    console.log('✅ Created "suggestions" index');
  }

  // 2. Lấy dữ liệu từ các nguồn
  const users = await User.findAll({ attributes: ['name', 'username', 'bio'] });
  const posts = await Post.findAll({
    attributes: ['title', 'description', 'metaTitle', 'metaDescription'],
  });
  const tags = await Tag.findAll({ attributes: ['name'] });
  const topics = await Topic.findAll({ attributes: ['name'] });

  const keywords = new Set();

  // Từ Users
  for (const user of users) {
    if (user.username) keywords.add(user.username);
    if (user.name) keywords.add(user.name);
    if (user.bio) user.bio.split(' ').forEach((word) => keywords.add(word));
  }

  // Từ Posts
  for (const post of posts) {
    if (post.title) post.title.split(' ').forEach((word) => keywords.add(word));
    if (post.description)
      post.description.split(' ').forEach((word) => keywords.add(word));
    if (post.metaTitle)
      post.metaTitle.split(' ').forEach((word) => keywords.add(word));
    if (post.metaDescription)
      post.metaDescription.split(' ').forEach((word) => keywords.add(word));
  }

  // Từ Tags và Topics
  tags.forEach((tag) => keywords.add(tag.name));
  topics.forEach((topic) => keywords.add(topic.name));

  // 3. Chuẩn hóa keyword và lọc rác
  const keywordArray = [...keywords]
    .map((k) => k.trim().toLowerCase())
    .filter((k) => k && k.length >= 2 && k.length <= 50);

  // 4. Seed vào Elasticsearch
  const body = keywordArray.flatMap((keyword) => [
    { index: { _index: indexName } },
    { term: keyword, type: 'word' },
  ]);

  if (body.length > 0) {
    await elastic.bulk({ refresh: true, body });
    console.log(`✅ Seeded ${keywordArray.length} suggestions`);
  } else {
    console.log('⚠️ No suggestions to index');
  }
}

module.exports = { setupElasticPost, setupElasticUser, setupSuggestion };
