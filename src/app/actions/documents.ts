
"use server";

import { db } from "@/db";
import { documents, embeddings } from "@/db/schema";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { embedText } from "@/lib/ai";
import { chunkText } from "@/lib/utils";
import { revalidatePath } from "next/cache";

// Polyfill for pdf-parse (Node environment)
// @ts-ignore
if (typeof global.DOMMatrix === "undefined") {
    // @ts-ignore
    global.DOMMatrix = class DOMMatrix {
        constructor() { }
        toString() { return "[object DOMMatrix]"; }
    };
}

export async function uploadDocument(formData: FormData) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return { error: "Unauthorized" };

    const file = formData.get("file") as File;
    const workspaceId = formData.get("workspaceId") as string;

    if (!file) return { error: "No file uploaded" };
    if (!workspaceId) return { error: "Workspace ID is required" };

    try {
        let content = "";

        if (file.type === "application/pdf") {
            // @ts-ignore
            const pdf = require("pdf-parse/lib/pdf-parse.js");
            const buffer = Buffer.from(await file.arrayBuffer());
            const data = await pdf(buffer);
            content = data.text || "";
        } else if (file.type === "text/plain") {
            content = await file.text() || "";
        } else {
            return { error: "Unsupported file type. Upload PDF or Text." };
        }

        // Sanitize content
        content = content.replace(/\x00/g, "");

        if (!content.trim()) return { error: "Document is empty" };

        // 1. Insert Document
        const [doc] = await db.insert(documents).values({
            userId: session.user.id,
            workspaceId: workspaceId,
            filename: file.name,
            content: content,
        }).returning();

        // 2. Process Embeddings (Background-ish, but awaiting here for simplicity)
        const chunks = chunkText(content, 1000, 200);
        console.log(`Generated ${chunks.length} chunks for ${file.name}`);

        for (const chunk of chunks) {
            const vector = await embedText(chunk);
            if (vector) {
                await db.insert(embeddings).values({
                    documentId: doc.id,
                    content: chunk,
                    embedding: vector,
                });
            }
        }

        revalidatePath(`/dashboard/workspaces/${workspaceId}`);
        return { success: true, document: doc };

    } catch (error: any) {
        console.error("Upload error:", error);
        return { error: error.message || "Failed to process document" };
    }
}
