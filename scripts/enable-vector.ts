
import "dotenv/config";
import { db } from "@/db";
import { sql } from "drizzle-orm";

async function main() {
    console.log("Enabling vector extension...");
    try {
        await db.execute(sql.raw("CREATE EXTENSION IF NOT EXISTS vector;"));
        console.log("✅ Vector extension enabled.");
    } catch (e: any) {
        console.error("❌ Failed to enable vector extension:", e.message);
    }
    process.exit(0);
}

main();
