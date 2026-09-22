import mysql, { type Pool, type PoolConnection } from 'mysql2/promise';
import { env } from '../../config/env.js';

let pool: Pool | undefined;

export function getDatabasePool(): Pool {
  if (!pool) {
    pool = mysql.createPool({
      host: env.MYSQL_HOST,
      port: env.MYSQL_PORT,
      database: env.MYSQL_DATABASE,
      user: env.MYSQL_USER,
      password: env.MYSQL_PASSWORD,
      waitForConnections: true,
      connectionLimit: env.MYSQL_CONNECTION_LIMIT,
      decimalNumbers: true,
      timezone: 'Z',
    });
  }
  return pool;
}

export async function withTransaction<T>(work: (connection: PoolConnection) => Promise<T>): Promise<T> {
  const connection = await getDatabasePool().getConnection();
  try {
    await connection.beginTransaction();
    const result = await work(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function closeDatabasePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = undefined;
  }
}
