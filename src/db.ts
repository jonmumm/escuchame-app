import dotenv from "dotenv";
import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";

dotenv.config();

// your actual PostgreSQL connection string
const connectionString = process.env.DATABASE_URL!;

// for query purposes
const queryClient = postgres(connectionString);
const db: PostgresJsDatabase = drizzle(queryClient);

console.log("initialized db");

// now you can use db to perform queries
// e.g., await db.select().from(users)...
export default db;
