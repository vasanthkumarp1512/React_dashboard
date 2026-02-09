import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

let dbInstance: any;

export const db = new Proxy({} as any, {
    get(target, prop) {
        if (!dbInstance) {
            const url = process.env.DATABASE_URL;
            if (!url && process.env.NODE_ENV === "production") {
                console.warn("⚠️ DATABASE_URL is missing. Database operations will fail.");
            }
            const sql = neon(url || "postgresql://placeholder:password@localhost:5432/db");
            dbInstance = drizzle(sql, { schema });
        }
        return dbInstance[prop];
    }
});
