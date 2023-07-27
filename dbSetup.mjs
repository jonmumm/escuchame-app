import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

(async () => {
  // Create the connection
  const sql = postgres("postgres://postgres:password@0.0.0.0:5432/db");

  const db = drizzle(sql);

  // This will automatically run needed migrations on the database
  await migrate(db, { migrationsFolder: './drizzle' });
})().catch(err => console.error(err));
