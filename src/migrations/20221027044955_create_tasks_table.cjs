
exports.up = function(knex) {
    return knex.schema.createTable('tasks', (table) => {
      table.increments('id').primary();
      table.string('name');
      table.string('description');
      table.integer('status_id');
      table.integer('creator_id');
      table.integer('executor_id');
      table.timestamp('created_at').defaultTo(knex.fn.now());
  
      table.foreign('status_id').references('id').inTable('task_statuses');
      table.foreign('creator_id').references('id').inTable('users');
      table.foreign('executor_id').references('id').inTable('users');
    })
  };
  
  exports.down = function(knex) {
    return knex.schema.dropTable('tasks');
  };