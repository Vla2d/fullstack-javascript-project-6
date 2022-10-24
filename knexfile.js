import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

// eslint-disable-next-line no-underscore-dangle
const __dirname = dirname(fileURLToPath(import.meta.url));

export default {
  development: {
    client: 'sqlite3',
    connection: {
      filename: join(__dirname, 'src', 'database.sqlite'),
    },
    migrations: {
      directory: join(__dirname, 'src', 'migrations'),
      extension: 'cjs',
    },
  },
  test: {
    client: 'sqlite3',
    connection: {
      filename: ':memory:',
    },
    migrations: {
      directory: join(__dirname, 'src', 'migrations'),
      extension: 'cjs',
    },
  },
  production: {
    client: 'pg',
    connection: {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    },
    migrations: {
      directory: join(__dirname, 'src', 'migrations'),
      extension: 'cjs',
    },
  },
};
