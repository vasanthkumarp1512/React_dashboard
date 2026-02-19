
import { getWorkspace } from "@/app/actions/workspaces";
import { db } from "@/db";
import { documents } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Bot, FileText, ArrowLeft, Trash2 } from "lucide-react";
import Link from "next/link";
import WorkspaceChat from "@/components/workspaces/WorkspaceChat";
import DocumentUploader from "@/components/workspaces/DocumentUploader";

export default async function WorkspaceDetailPage({ params }: { params: Promise<{ id: string }> }) {
    // Await params as per Next.js 15+ convention (though this project uses 16.1.6, pattern persists locally sometimes, but usually props are not promises. Wait, Next 15 params ARE promises. This project seems to be using standard pattern).
    // Actually, check package.json: "next": "16.1.6". Next 15 made params a promise.
    const { id } = await params;

    const workspace = await getWorkspace(id);
    if (!workspace) return notFound();

    const docs = await db.select().from(documents)
        .where(eq(documents.workspaceId, id))
        .orderBy(desc(documents.createdAt));

    return (
        <div className="flex h-full flex-col md:flex-row h-screen overflow-hidden">
            {/* Left Panel: Documents */}
            <div className="w-full md:w-1/3 border-r bg-gray-50 dark:bg-zinc-950 p-4 flex flex-col h-full overflow-hidden">
                <div className="mb-6">
                    <Link href="/dashboard/workspaces" className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1 mb-4">
                        <ArrowLeft className="w-4 h-4" /> Back to Workspaces
                    </Link>
                    <h1 className="text-2xl font-bold truncate">{workspace.name}</h1>
                    <p className="text-xs text-gray-400 mt-1">Created {new Date(workspace.createdAt).toLocaleDateString()}</p>
                </div>

                <div className="mb-6">
                    <DocumentUploader workspaceId={id} />
                </div>

                <div className="flex-1 overflow-y-auto">
                    <h3 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wider">
                        Documents ({docs.length})
                    </h3>
                    <div className="space-y-2">
                        {docs.length === 0 ? (
                            <p className="text-sm text-gray-400 italic">No documents uploaded yet.</p>
                        ) : (
                            docs.map(doc => (
                                <div key={doc.id} className="bg-white dark:bg-zinc-900 p-3 rounded-lg border border-gray-200 dark:border-zinc-800 shadow-sm flex items-start gap-3 group">
                                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-blue-600">
                                        <FileText className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium truncate">{doc.filename}</div>
                                        <div className="text-xs text-gray-400">
                                            {new Date(doc.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                    {/* Delete button (functionality to be added later) */}
                                    <button className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Right Panel: Chat */}
            <div className="flex-1 p-4 md:p-6 bg-white dark:bg-zinc-900 flex flex-col h-full overflow-hidden">
                <div className="flex-1 overflow-hidden flex flex-col">
                    <WorkspaceChat workspaceId={id} />
                </div>
            </div>
        </div>
    );
}
