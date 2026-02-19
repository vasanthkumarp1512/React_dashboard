"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { hash } from "bcryptjs";
import { eq } from "drizzle-orm";

export async function registerUser(formData: FormData) {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const role = formData.get("role") as "admin" | "user" || "user";

    if (!email || !password || !name) {
        return { error: "Missing required fields" };
    }

    let existingUser;
    try {
        const results = await db.select().from(users).where(eq(users.email, email)).limit(1);
        existingUser = results[0];
    } catch (dbErr: any) {
        console.error("Database Query Error:", dbErr);
        return { error: "Database connection failed. Please check your configuration." };
    }

    if (existingUser) {
        return { error: "Email already exists" };
    }

    const hashedPassword = await hash(password, 10);

    try {
        await db.insert(users).values({
            name,
            email,
            password: hashedPassword,
            role: role,
            status: role === "admin" ? "approved" : "pending",
        });
        return { success: true };
    } catch (err) {
        console.error("Registration error:", err);
        return { error: "Failed to register user" };
    }
}
