import { Model } from 'objection';
import TaskStatus from './TaskStatus.js';
import User from './User.js';
import Label from './Label.js';

export default class Task extends Model {
  $parseJson(json, options) {
    const data = super.$parseJson(json, options);

    return {
      ...(data.id && { id: Number(data.id) }),
      ...(data.name && { name: data.name.trim() }),
      ...(data.description && { description: data.description.trim() }),
      ...(data.statusId && { statusId: Number(data.statusId) }),
      ...(data.executorId && { executorId: Number(data.executorId) }),
      ...(data.creatorId && { creatorId: Number(data.creatorId) }),
      ...(data.labels && { labels: data.labels }),
    };
  }

  static get tableName() {
    return 'tasks';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['name', 'statusId', 'creatorId'],
      properties: {
        name: { type: 'string', minLength: 1 },
        statusId: { type: 'integer' },
        creatorId: { type: 'integer' },
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
