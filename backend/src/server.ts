import { app } from './app.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { closeDatabasePool } from './config/database.js';

const server = app.listen(env.PORT, () => logger.info({ port: env.PORT }, 'BEATERRA OS API listening'));
const shutdown = async () => { server.close(); await closeDatabasePool(); process.exit(0); };
process.once('SIGINT', shutdown);
process.once('SIGTERM', shutdown);
