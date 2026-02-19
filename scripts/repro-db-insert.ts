import { db } from "../src/db";
import { documents, users } from "../src/db/schema";
import * as dotenv from "dotenv";
import { eq } from "drizzle-orm";

dotenv.config({ path: ".env.local" });

async function run() {
    console.log("Starting DB repro...");
    try {
        // 1. Get a user
        console.log("Fetching user...");
        const user = await db.query.users.findFirst();

        let userId;
        if (!user) {
            console.log("No user found, creating one...");
            const [newUser] = await db.insert(users).values({
                name: "Test User",
                email: "test@example.com",
                password: "hashedpassword",
                role: "user",
                status: "approved"
            }).returning();
            userId = newUser.id;
            console.log("Created user:", userId);
        } else {
            userId = user.id;
            console.log("Found user:", userId);
        }

        // 2. Insert document
        console.log("Inserting document...");
        try {
            const [doc] = await db.insert(documents).values({
                userId: userId,
                filename: "repro_doc.txt",
                content: "This is a test content from the repro script.",
            }).returning();
            console.log("Document inserted successfully:", doc.id);
        } catch (insertError: any) {
            console.error("Insert failed:", {
                message: insertError.message,
                code: insertError.code,
                detail: insertError.detail
            });
        }

    } catch (e: any) {
        console.error("General error during repro:", e);
    }
    process.exit(0);
}

run();
