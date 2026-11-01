import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';

// Lazy singleton pool instance
let poolInstance: Pool | null = null;

/**
 * Returns the PostgreSQL connection pool singleton.
 * Validates that DATABASE_URL is explicitly set via environment variables.
 * Fails safely if missing without exposing credentials or falling back to hardcoded strings.
 */
export function getPool(): Pool {
  if (!poolInstance) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString || connectionString.trim() === '') {
      throw new Error(
        'Database connection failed: DATABASE_URL environment variable is required but not set. Please configure DATABASE_URL in your environment or .env.local file.'
      );
    }

    poolInstance = new Pool({
      connectionString,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

    poolInstance.on('error', (err) => {
      console.error('Unexpected error on idle PostgreSQL client pool', err);
    });
  }

  return poolInstance;
}

/**
 * Executes a parameterized SQL query using the connection pool.
 * Logs query execution duration in development mode.
 */
export async function query<R extends QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<R>> {
  const start = Date.now();
  try {
    const pool = getPool();
    const res = await pool.query<R>(text, params);
    const duration = Date.now() - start;

    if (process.env.NODE_ENV !== 'production') {
      console.log('Executed database query', {
        text: text.slice(0, 100).trim(),
        durationMs: duration,
        rowsCount: res.rowCount,
      });
    }

    return res;
  } catch (error) {
    console.error('Database query error:', {
      text: text.slice(0, 100).trim(),
      error: error instanceof Error ? error.message : error,
    });
    throw error;
  }
}

/**
 * Checks out a client from the pool for explicit multi-statement transactions (BEGIN, SAVEPOINT, COMMIT).
 * Ensure client.release() is invoked in a finally block.
 */
export async function getClient(): Promise<PoolClient> {
  const pool = getPool();
  const client = await pool.connect();
  return client;
}

export default getPool;
