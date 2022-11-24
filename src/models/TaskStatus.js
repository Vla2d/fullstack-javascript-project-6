import objectionUnique from 'objection-unique';
import { Model } from 'objection';

const unique = objectionUnique({
  fields: ['name'],
});

export default class TaskStatus extends unique(Model) {
  static get tableName() {
    return 'task_statuses';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['name'],
      properties: {
        name: { type: 'string', minLength: 1 },
      },
    };
  }
}
