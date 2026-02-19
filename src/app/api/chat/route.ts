import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { documents, qanda } from "@/db/schema"; // Assume qanda is exported
import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // Correct path
import Groq from "groq-sdk";

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { question, documentId } = await req.json();

    if (!question || !documentId) {
        return NextResponse.json({ error: "Missing question or documentId" }, { status: 400 });
    }

    try {
        // 1. Fetch document content
        const [doc] = await db
            .select()
            .from(documents)
            .where(eq(documents.id, documentId))
            .limit(1);

        if (!doc) {
            return NextResponse.json({ error: "Document not found" }, { status: 404 });
        }

        // Verify ownership
        if (doc.userId !== session.user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // 2. Call Groq API
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are a helpful assistant. Use the following context to answer the user's question. If the answer is not in the context, say so.",
                },
                {
                    role: "user",
                    content: `Context:\n${doc.content}\n\nQuestion: ${question}`,
                },
            ],
            model: "llama-3.3-70b-versatile", // Updated to supported model
        });

        const answer = completion.choices[0]?.message?.content || "No answer generated.";

        // 3. Save Q&A to database
        await db.insert(qanda).values({
            userId: session.user.id,
            documentId: documentId,
            question: question,
            answer: answer,
        });

        return NextResponse.json({ answer }, { status: 200 });

    } catch (error) {
        console.error("Chat error:", error);
        return NextResponse.json({ error: "Failed to generate answer" }, { status: 500 });
    }
}
