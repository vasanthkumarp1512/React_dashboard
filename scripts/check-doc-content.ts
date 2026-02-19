
import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../src/db/schema";
import { desc } from "drizzle-orm";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL missing");

const sql = neon(url);
const db = drizzle(sql, { schema });

async function main() {
    console.log("Fetching latest document...");
    const docs = await db.select().from(schema.documents).orderBy(desc(schema.documents.createdAt)).limit(1);

    if (docs.length === 0) {
        console.log("No documents found.");
        return;
    }

    const doc = docs[0];
    console.log(`Document ID: ${doc.id}`);
    console.log(`Filename: ${doc.filename}`);
    console.log(`Content Length: ${doc.content.length}`);
    console.log(`Content Snippet (first 500 chars):`);
    console.log(doc.content.substring(0, 500));
}

main().catch(console.error);
