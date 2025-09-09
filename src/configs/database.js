const fs = require('fs');

module.exports = {
  development: {
    username: 'root',
    database: 'tiktok_dev',
    host: '127.0.0.1',
    port: 3306,
    dialect: 'mysql',
    logging: false,
    dialectOptions: {
      // bigNumberStrings: true,
      decimalNumbers: true,
    },
  },
  test: {
    username: process.env.CI_DB_USERNAME,
    password: process.env.CI_DB_PASSWORD,
    database: process.env.CI_DB_NAME,
    host: '127.0.0.1',
    port: 3306,
    dialect: 'mysql',
    logging: false,
    dialectOptions: {
      // bigNumberStrings: true,
      decimalNumbers: true,
    },
  },
  production: {
    username: process.env.PROD_DB_USERNAME,
    password: process.env.PROD_DB_PASSWORD,
    database: process.env.PROD_DB_NAME,
    host: process.env.PROD_DB_HOSTNAME,
    port: process.env.PROD_DB_PORT,
    dialect: 'mysql',
    logging: false,
    dialectOptions: {
      // bigNumberStrings: true,
      decimalNumbers: true,
      // ssl: {
      //   ca: fs.readFileSync(__dirname + "/mysql-ca-main.crt"),
      // },
    },
  },
};
