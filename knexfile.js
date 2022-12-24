import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

// eslint-disable-next-line no-underscore-dangle
const __dirname = dirname(fileURLToPath(import.meta.url));
const migrations = {
  directory: join(__dirname, 'src', 'migrations'),
  extension: 'cjs',
};

export default {
  development: {
    client: 'sqlite3',
    connection: {
      filename: join(__dirname, 'db', 'database.sqlite'),
    },
    useNullAsDefault: true,
    migrations,
    pool: {
      afterCreate: (conn, done) => {
        conn.run('PRAGMA foreign_keys = ON', done);
      },
    },
  },
  test: {
    client: 'sqlite3',
    connection: {
      filename: ':memory:',
    },
    migrations,
  },
  production: {
    client: 'pg',
    connection: {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    },
    migrations,
  },
};
