import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

if (!process.env.DATABASE_URL && process.env.NODE_ENV === "production") {
    // During production build or runtime, we should have the URL.
    // But during 'next build' on Vercel, we might want to let it pass if it's just static generation
    // that doesn't actually hit the DB. However, Drizzle needs it to initialize.
    // For now, let's just log a warning and only throw if we are NOT in a build step.
    console.warn("⚠️ DATABASE_URL is not set. Database operations will fail.");
}

const sql = neon(process.env.DATABASE_URL || "");
export const db = drizzle(sql, { schema });
