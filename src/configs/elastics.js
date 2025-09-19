const { Client } = require('@elastic/elasticsearch');
const elastic = new Client({ node: 'http://localhost:9200' });

module.exports = elastic;
