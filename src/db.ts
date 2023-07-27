import { drizzle, PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import { users, sessions, responses } from "./schema";
import dotenv from "dotenv";

dotenv.config();

// your actual PostgreSQL connection string
const connectionString =
  process.env.DB_CONNECTION || "postgres://postgres:password@localhost:5432";

// for query purposes
const queryClient = postgres(connectionString);
const db: PostgresJsDatabase = drizzle(queryClient);

// now you can use db to perform queries
// e.g., await db.select().from(users)...
export default db;
