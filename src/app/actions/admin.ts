"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function approveUser(userId: string) {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "admin") {
        throw new Error("Unauthorized");
    }

    await db.update(users).set({ status: "approved" }).where(eq(users.id, userId));
    revalidatePath("/admin");
}

export async function rejectUser(userId: string) {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "admin") {
        throw new Error("Unauthorized");
    }

    await db.update(users).set({ status: "rejected" }).where(eq(users.id, userId));
    revalidatePath("/admin");
}
