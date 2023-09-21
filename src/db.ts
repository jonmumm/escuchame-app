import dotenv from "dotenv";
import { drizzle, PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { users, sessions, responses } from "./schema";

dotenv.config();

// your actual PostgreSQL connection string
const connectionString = process.env.DATABASE_URL;

// for query purposes
const queryClient = postgres(connectionString);
const db: PostgresJsDatabase = drizzle(queryClient);

// now you can use db to perform queries
// e.g., await db.select().from(users)...
export default db;
