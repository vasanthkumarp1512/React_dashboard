
import { db } from "./src/db";
import { users } from "./src/db/schema";
import { eq } from "drizzle-orm";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function listUsers() {
    try {
        const allUsers = await db.select().from(users);
        console.log("Users and Statuses:");
        allUsers.forEach(u => console.log(`${u.email} -> ${u.status}`));
    } catch (err) {
        console.error("Error listing users:", err);
    }
    process.exit(0);
}

listUsers();
