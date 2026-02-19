import { getServerSession } from "next-auth";

export const dynamic = 'force-dynamic';
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { documents } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import ChatInterface from "@/components/chat-interface";

export default async function ChatPage() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        redirect("/auth/signin");
    }

    // Verify database connection
    if (!process.env.DATABASE_URL) {
        console.error("DATABASE_URL is missing");
        return <div>Error: Database configuration missing</div>;
    }

    let userDocs = [];
    try {
        console.log("Fetching documents for user:", session.user.id);
        // Fetch user's documents
        userDocs = await db.query.documents.findMany({
            where: eq(documents.userId, session.user.id),
            orderBy: [desc(documents.createdAt)],
            columns: {
                id: true,
                filename: true,
                createdAt: true,
            },
        });
        console.log("Fetched documents:", userDocs.length);
    } catch (error: any) {
        console.error("Failed to fetch documents:", error);
        // Return empty list or show error UI, don't crash the page
        // Log detailed error for debugging
        console.error("DB Error Details:", JSON.stringify(error, null, 2));
        return (
            <div className="p-4 text-red-500">
                <h2>Failed to load documents</h2>
                <pre className="text-xs mt-2 overflow-auto">
                    {error.message || "Unknown database error"}
                </pre>
            </div>
        );
    }

    return <ChatInterface documents={userDocs} />;
}
