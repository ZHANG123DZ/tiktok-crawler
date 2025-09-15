const { Sequelize, sequelize } = require('../models');

async function incrementField(model, field, value, where) {
  const table = model.getTableName();
  const queryGenerator = sequelize.getQueryInterface().queryGenerator;

  const whereClause = queryGenerator.getWhereConditions(where);

  const sql = `UPDATE ${table} SET ${field} = ${field} + (${value}) WHERE ${whereClause}`;

  return sequelize.query(sql, { type: Sequelize.QueryTypes.UPDATE });
}

module.exports = incrementField;
