import { drizzle, PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import { users, sessions, responses } from './schema';

// your actual PostgreSQL connection string
const connectionString = "postgres://postgres:adminadmin@0.0.0.0:5432/db";

// for migrations
const migrationClient = postgres(connectionString, { max: 1 });
migrate(drizzle(migrationClient), users, sessions, responses);
 
// for query purposes
const queryClient = postgres(connectionString);
const db: PostgresJsDatabase = drizzle(queryClient);

// now you can use db to perform queries
// e.g., await db.select().from(users)...
export default db
