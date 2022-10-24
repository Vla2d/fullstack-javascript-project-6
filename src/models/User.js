import crypto from 'crypto';
import objectionUnique from 'objection-unique';
import { Model } from 'objection';

const unique = objectionUnique({
  fields: ['email'],
});

export default class User extends unique(Model) {
  static get tableName() {
    return 'users';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['firstName', 'lastName', 'email', 'password'],
      properties: {
        firstName: { type: 'string', minLength: 1 },
        lastName: { type: 'string', minLength: 1 },
        email: { type: 'string', minLength: 1 },
        password: { type: 'string', minLength: 3 },
      },
    };
  }

  set password(value) {
    this.passwordDigest = crypto.createHash('sha256').update(value).digest('hex');
  }

  verifyPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex') === this.passwordDigest;
  }
}
