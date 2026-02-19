
import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../src/db/schema";

console.log("Script started.");

const url = process.env.DATABASE_URL;
console.log("DB URL found:", url ? "Yes" : "No");

if (!url) {
    console.error("DATABASE_URL is missing in env");
    process.exit(1);
}

try {
    console.log("Connecting to DB...");
    const sql = neon(url);
    const db = drizzle(sql, { schema });

    console.log("Querying users...");
    db.select().from(schema.users).then((res) => {
        console.log("Users:", res);
    }).catch((err) => {
        console.error("Query failed:", err);
    });

} catch (e) {
    console.error("Setup failed:", e);
}
