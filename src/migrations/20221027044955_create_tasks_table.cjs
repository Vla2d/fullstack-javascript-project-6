exports.up = function(knex) {
    return knex.schema.createTable('tasks', (table) => {
      table.increments('id').primary();
      table.string('name');
      table.string('description');
      table.integer('status_id').references('id').inTable('task_statuses');
      table.integer('creator_id').references('id').inTable('users');
      table.integer('executor_id').references('id').inTable('users');
      table.timestamps(true, true);
    })
  };
  
exports.down = function(knex) {
  return knex.schema.dropTable('tasks');
};