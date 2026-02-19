import { config } from "dotenv";
config({ path: ".env.local" }); // Load .env.local

import { db } from "../src/db";
import { documents } from "../src/db/schema";

async function main() {
    console.log("Testing DB connection...");
    try {
        const docs = await db.select().from(documents).limit(1);
        console.log("Successfully connected. Docs found:", docs.length);
    } catch (error) {
        console.error("DB Error:", error);
    }
}

main();
