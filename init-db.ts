import "dotenv/config";
import { neon } from "@neondatabase/serverless";

async function initializeDb() {
    const url = process.env.DATABASE_URL;
    if (!url) {
        console.error("DATABASE_URL is not set in .env.local");
        process.exit(1);
    }

    const sql = neon(url);

    console.log("Starting database initialization...");

    try {
        // We run these separately and catch errors because the types might already exist
        try {
            console.log("Creating 'role' enum...");
            await sql`CREATE TYPE "role" AS ENUM ('admin', 'user')`;
        } catch (e: any) {
            console.log("Note: 'role' enum might already exist:", e.message);
        }

        try {
            console.log("Creating 'status' enum...");
            await sql`CREATE TYPE "status" AS ENUM ('pending', 'approved', 'rejected')`;
        } catch (e: any) {
            console.log("Note: 'status' enum might already exist:", e.message);
        }

        console.log("Creating 'users' table...");
        await sql`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "name" text NOT NULL,
        "email" text NOT NULL UNIQUE,
        "password" text NOT NULL,
        "role" "role" NOT NULL DEFAULT 'user',
        "status" "status" NOT NULL DEFAULT 'pending',
        "created_at" timestamp with time zone NOT NULL DEFAULT now(),
        "updated_at" timestamp with time zone NOT NULL DEFAULT now()
      )
    `;
        console.log("Database initialized successfully!");
    } catch (error: any) {
        console.error("Initialization failed:", error.message);
        process.exit(1);
    }
}

initializeDb();
