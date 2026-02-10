
import { db } from "./src/db";
import { users } from "./src/db/schema";
import { eq } from "drizzle-orm";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function approveUser() {
    try {
        const email = "himanidebnath76@gmail.com";
        const result = await db.update(users)
            .set({ status: "approved" })
            .where(eq(users.email, email))
            .returning();

        if (result.length > 0) {
            console.log("User approved successfully:", JSON.stringify(result[0], null, 2));
        } else {
            console.log("User not found or already approved");
        }
    } catch (err) {
        console.error("Error approving user:", err);
    }
    process.exit(0);
}

approveUser();
