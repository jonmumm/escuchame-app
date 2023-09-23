import dotenv from "dotenv";
import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";

console.log("HI!!!");

dotenv.config();

// your actual PostgreSQL connection string
const connectionString = process.env.DATABASE_URL!;

console.log({ connectionString });

// for query purposes
const queryClient = postgres(connectionString);
console.log({ queryClient });
const db: PostgresJsDatabase = drizzle(queryClient);
console.log({ db });

// now you can use db to perform queries
// e.g., await db.select().from(users)...
export default db;
