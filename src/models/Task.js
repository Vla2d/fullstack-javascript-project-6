import { Model } from 'objection';
import TaskStatus from './TaskStatus.js';
import User from './User.js';

export default class Task extends Model {
  static get tableName() {
    return 'tasks';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['name', 'statusId', 'creatorId'],
      properties: {
        name: { type: 'string', minLength: 1 },
        statusId: { type: 'string', minLength: 1 },
        creatorId: { type: 'string', minLength: 1 },
      },
    };
  }

  static get relationMappings() {
    return {
      taskStatus: {
        relation: Model.HasManyRelation,
        modelClass: TaskStatus,
        join: {
          from: 'tasks.statusId',
          to: 'task_statuses.id',
        },
      },
      creator: {
        relation: Model.HasManyRelation,
        modelClass: User,
        join: {
          from: 'tasks.creatorId',
          to: 'users.id',
        },
      },

      executor: {
        relation: Model.HasManyRelation,
        modelClass: User,
        join: {
          from: 'tasks.executorId',
          to: 'users.id',
        },
      },
    };
  }
}