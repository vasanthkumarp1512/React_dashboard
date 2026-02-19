
import "dotenv/config";
import { createWorkspace, deleteWorkspace } from "@/app/actions/workspaces";
import { uploadDocument } from "@/app/actions/documents";
import { chatWorkspace } from "@/app/actions/chat";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
// Mock FormData and File if not available (Node 20 has File)
// But we need to mock getServerSession auth
// This is tricky for server actions.
// Instead, we will simulate the logic by calling internal functions if possible, 
// OR we can mock `getServerSession`? No, hard to mock in a script.

// ALTERNATIVE: Use a script that imports DB logic directly and simulates the steps WITHOUT server actions' auth check.
// BUT server actions invoke auth.
// So we cannot easily test server actions from a script unless we mock auth.
// Let's create a test user or find one.
// And mock the session for the action? 
// Actually, for verification scripts, it's better to test the underlying logic functions if strictly separated,
// or just bypass auth for the script.
// But `createWorkspace` calls `getServerSession`.

// STRATEGY: Create a modified version of the logic here in the script to verify DB interactions and embedding generation.
// This confirms "Backend Logic" works. "Server Action" wrapper is just auth.

import { embedText } from "@/lib/ai";
import { chunkText } from "@/lib/utils";
import { workspaces, documents, embeddings } from "@/db/schema";

async function main() {
    console.log("Starting verification...");

    // 1. Get a user
    const user = await db.query.users.findFirst();
    if (!user) {
        console.error("No users found. Please sign up in the app first.");
        return;
    }
    console.log(`Using user: ${user.email}`);

    // 2. Create Workspace
    console.log("Creating workspace...");
    const [ws] = await db.insert(workspaces).values({
        userId: user.id,
        name: "Verification Workspace " + Date.now(),
    }).returning();
    console.log(`Created workspace: ${ws.name} (${ws.id})`);

    // 3. Upload/Embed Document
    console.log("Simulating document upload...");
    const sampleText = "The mitochondria is the powerhouse of the cell. Photosynthesis occurs in chloroplasts. Deep learning utilizes neural networks.";
    const [doc] = await db.insert(documents).values({
        userId: user.id,
        workspaceId: ws.id,
        filename: "science_notes.txt",
        content: sampleText
    }).returning();

    console.log("Chunking and Embedding...");
    const chunks = chunkText(sampleText, 100, 20);
    for (const chunk of chunks) {
        const vector = await embedText(chunk);
        if (vector) {
            console.log(`Embedding length: ${vector.length}`);
            await db.insert(embeddings).values({
                documentId: doc.id,
                content: chunk,
                embedding: vector
            });
            console.log("Inserted embedding for chunk.");
        } else {
            console.error("Failed to generate embedding");
        }
    }

    // 4. Test Chat (RAG)
    console.log("Testing Chat RAG...");
    // We can call chatWorkspace logic here? 
    // Just re-implement the query logic to verify vector search works.
    const query = "What is the powerhouse?";
    const queryVector = await embedText(query);

    if (queryVector) {
        const { cosineDistance, sql, desc, eq } = await import("drizzle-orm");

        const similarity = sql<number>`1 - (${cosineDistance(embeddings.embedding, queryVector)})`;

        const results = await db.select({
            content: embeddings.content,
            similarity: similarity
        })
            .from(embeddings)
            .innerJoin(documents, eq(embeddings.documentId, documents.id))
            .where(eq(documents.workspaceId, ws.id))
            .orderBy(desc(similarity))
            .limit(1);

        console.log("Search Result:", results[0]);
        if (results[0] && results[0].content.includes("mitochondria")) {
            console.log("✅ RAG Verified!");
        } else {
            console.error("❌ RAG Failed or Low Similarity");
        }
    }

    // Cleanup
    console.log("cleaning up...");
    await db.delete(workspaces).where(eq(workspaces.id, ws.id));
    console.log("Done.");
    process.exit(0);
}

main();
