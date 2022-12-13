exports.up = (knex) => (
    knex.schema.createTable('statuses', (table) => {
      table.increments('id').primary();
      table.string('name').unique();
    })
  );
  
exports.down = (knex) => knex.schema.dropTable('statuses');