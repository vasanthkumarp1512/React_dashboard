
import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../src/db/schema";
import { eq, desc } from "drizzle-orm";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL missing");

const sql = neon(url);
const db = drizzle(sql, { schema });

const TARGET_USER_ID = "06535f51-98a0-48eb-bc9f-e388e4485031";

async function main() {
    console.log(`Checking user ${TARGET_USER_ID}...`);

    // 1. Check if user exists
    const user = await db.query.users.findFirst({
        where: eq(schema.users.id, TARGET_USER_ID)
    });
    console.log("User found:", !!user);

    // 2. Try the failing query
    console.log("Attempting to fetch documents...");
    try {
        const userDocs = await db.query.documents.findMany({
            where: eq(schema.documents.userId, TARGET_USER_ID),
            orderBy: [desc(schema.documents.createdAt)],
            columns: {
                id: true,
                filename: true,
                createdAt: true
            }
        });
        console.log("Documents fetched:", userDocs.length);
    } catch (error: any) {
        console.error("Query failed:", error);
    }
}

main().catch(console.error);
