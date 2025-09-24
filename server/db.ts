import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

let pool;
if (process.env.NODE_ENV !== "development" || process.env.DATABASE_URL) {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL must be set for non-development environments. Did you forget to provision a database?",
    );
  }
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
} else {
  // In development, if no DATABASE_URL is provided, we can use a dummy client
  // or skip initialization. For Drizzle, we need a client, but it won't be used
  // if we're using in-memory storage.
  pool = new Pool({ connectionString: "postgresql://dummy:dummy@dummy/dummy" });
}


export { pool };
export const db = drizzle({ client: pool, schema });
