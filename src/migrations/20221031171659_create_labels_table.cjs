exports.up = function(knex) {
    return knex.schema.createTable('labels', (table) => {
      table.increments('id').primary();
      table.string('name');
      table.timestamps(true, true);
    })
  };
  
exports.down = function(knex) {
  return knex.schema.dropTable('labels');
};