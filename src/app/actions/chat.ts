
"use server";

import { db } from "@/db";
import { documents, embeddings, qanda, workspaces } from "@/db/schema";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { embedText, generateContent } from "@/lib/ai";
import { deepSearch } from "@/lib/firecrawl";
import { cosineDistance, desc, eq, and, sql } from "drizzle-orm";

export async function chatWorkspace(workspaceId: string, message: string, useDeepSearch: boolean = false) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return { error: "Unauthorized" };

    try {
        // 1. Check workspace access
        const workspace = await db.query.workspaces.findFirst({
            where: and(eq(workspaces.id, workspaceId), eq(workspaces.userId, session.user.id))
        });
        if (!workspace) return { error: "Workspace not found" };

        // 2. Embed Query
        let queryVector: number[] | null = null;
        try {
            queryVector = await embedText(message);
        } catch (embedError) {
            console.error("Embedding request failed:", embedError);
            // Proceed without vector search if embedding fails? No, RAG is core.
            // But deep search might still work.
        }

        let similarChunks: any[] = [];

        if (queryVector) {
            // 3. Search Vector DB
            // Join embeddings with documents to filter by workspaceId
            try {
                const similarity = sql<number>`1 - (${cosineDistance(embeddings.embedding, queryVector)})`;

                similarChunks = await db.select({
                    content: embeddings.content,
                    filename: documents.filename,
                    similarity: similarity
                })
                    .from(embeddings)
                    .innerJoin(documents, eq(embeddings.documentId, documents.id))
                    .where(eq(documents.workspaceId, workspaceId))
                    .orderBy(desc(similarity))
                    .limit(5);

                console.log(`Found ${similarChunks.length} relevant chunks`);
            } catch (dbError) {
                console.error("Vector search failed:", dbError);
            }
        }

        // 4. Deep Search (Optional)
        let webResultsStr = "";
        let webSources: any[] = [];

        if (useDeepSearch) {
            console.log("Deep Search enabled, querying Firecrawl...");
            const results = await deepSearch(message); // returns array of { title, url, description, content? }
            if (results && results.length > 0) {
                webSources = results;
                webResultsStr = results.map((r: any) => `[WEB: ${r.title}] (${r.url})\n${r.description || ""}\n${r.content?.substring(0, 500) || ""}`).join("\n\n");
            }
        }

        // 5. Construct Prompt
        const docContext = similarChunks.map(c => `[DOC: ${c.filename}] ${c.content}`).join("\n\n");

        const prompt = `
        You are an AI research assistant for a user's workspace.
        
        User Question: ${message}

        Existing Knowledge (Documents):
        ${docContext || "No relevant documents found."}

        ${useDeepSearch ? "External Knowledge (Web Search):" : ""}
        ${webResultsStr}

        Instructions:
        - synthesize data from both Documents and Web Search (if available).
        - Explicitly cite sources (e.g., "According to [filename]..." or "Web search indicates...").
        - If the answer is not found, say so.
        - Format neatly in Markdown.
        `;

        // 6. Generate Answer
        const response = await generateContent(prompt);

        let answerText = "";
        if ('error' in response) {
            answerText = "I encountered an error generating the response. Please try again.";
        } else {
            answerText = response.text;
        }

        // 7. Save to History
        // Use documentId: null since this is a workspace-wide chat
        // We added workspaceId to schema, so use it
        await db.insert(qanda).values({
            userId: session.user.id,
            workspaceId: workspaceId,
            question: message,
            answer: answerText,
        });

        return {
            success: true,
            answer: answerText,
            sources: [
                ...similarChunks.map(c => ({ type: 'document', title: c.filename })),
                ...webSources.map(s => ({ type: 'web', title: s.title, url: s.url }))
            ]
        };

    } catch (error: any) {
        console.error("Chat error:", error);
        return { error: error.message || "Failed to generate answer" };
    }
}
