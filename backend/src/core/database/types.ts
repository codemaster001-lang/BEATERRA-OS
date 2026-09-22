import type { Pool, PoolConnection } from 'mysql2/promise';

export type DatabaseExecutor = Pool | PoolConnection;
