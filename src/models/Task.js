import { Model } from 'objection';
import TaskStatus from './TaskStatus.js';
import User from './User.js';
import Label from './Label.js';

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
        statusId: { type: 'integer', minimum: 1 },
        creatorId: { type: 'integer', minimum: 1 },
      },
    };
  }

  static modifiers = {
    filterByStatus(queryBuilder, status) {
      queryBuilder.where('statusId', '=', status);
    },

    filterByExecutor(queryBuilder, executor) {
      queryBuilder.where('executorId', '=', executor);
    },

    filterByLabel(queryBuilder, label) {
      queryBuilder.where('labels.id', '=', label);
    },

    filterByCreator(queryBuilder, creatorId) {
      queryBuilder.where('creatorId', '=', creatorId);
    },
  };

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

      labels: {
        relation: Model.ManyToManyRelation,
        modelClass: Label,
        join: {
          from: 'tasks.id',
          through: {
            from: 'tasks_labels.taskId',
            to: 'tasks_labels.labelId',
          },
          to: 'labels.id',
        },
      },
    };
  }
}
