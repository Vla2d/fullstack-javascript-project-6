
exports.up = function(knex) {
    return knex.schema.createTable('tasks_labels', (table) => {
      table.integer('task_id');
      table.integer('label_id');
  
      table.foreign('task_id').references('id').inTable('tasks');
      table.foreign('label_id').references('id').inTable('labels');
    })
  };
  
  exports.down = function(knex) {
    return knex.schema.dropTable('tasks_labels');
  };