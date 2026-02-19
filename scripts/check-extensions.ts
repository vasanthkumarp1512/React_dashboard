
import "dotenv/config";
import { db } from "@/db";
import { sql } from "drizzle-orm";

async function main() {
    console.log("Checking installed extensions...");
    try {
        const result = await db.execute(sql`SELECT * FROM pg_extension;`);
        console.log("Extensions:", result.rows.map((r: any) => r.extname));

        // Check current user
        const userRes = await db.execute(sql`SELECT current_user;`);
        console.log("Current User:", userRes.rows[0]);

    } catch (e: any) {
        console.error("❌ Failed to query extensions:", e.message);
    }
    process.exit(0);
}

main();
