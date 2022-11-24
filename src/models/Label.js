import objectionUnique from 'objection-unique';
import { Model } from 'objection';

const unique = objectionUnique({
  fields: ['name'],
});

export default class Label extends unique(Model) {
  static get tableName() {
    return 'labels';
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
