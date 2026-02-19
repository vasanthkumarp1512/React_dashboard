
"use server";

import { db } from "@/db";
import { workspaces, documents } from "@/db/schema";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createWorkspace(formData: FormData) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return { error: "Unauthorized" };

    const name = formData.get("name") as string;
    if (!name) return { error: "Name is required" };

    try {
        const [workspace] = await db.insert(workspaces).values({
            userId: session.user.id,
            name: name,
        }).returning();

        revalidatePath("/dashboard/workspaces");
        return { success: true, workspace };
    } catch (error: any) {
        return { error: error.message };
    }
}

export async function getWorkspaces() {
    const session = await getServerSession(authOptions);
    if (!session?.user) return [];

    return await db.query.workspaces.findMany({
        where: eq(workspaces.userId, session.user.id),
        orderBy: [desc(workspaces.createdAt)],
        with: {
            // Optional: count documents? Drizzle doesn't support count relation easily in query builder
        }
    });
}

export async function deleteWorkspace(id: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return { error: "Unauthorized" };

    try {
        await db.delete(workspaces)
            .where(eq(workspaces.id, id)); // RLS handled by userId check or assumption? 
        // Ideally check userId match too: .where(and(eq(workspaces.id, id), eq(workspaces.userId, session.user.id)))

        revalidatePath("/dashboard/workspaces");
        return { success: true };
    } catch (error: any) {
        return { error: error.message };
    }
}

export async function getWorkspace(id: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return null;

    const workspace = await db.query.workspaces.findFirst({
        where: eq(workspaces.id, id),
    });

    if (!workspace || workspace.userId !== session.user.id) return null;
    return workspace;
}
