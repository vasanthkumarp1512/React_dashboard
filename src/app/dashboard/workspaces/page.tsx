
import { getWorkspaces, createWorkspace } from "@/app/actions/workspaces";
import { redirect } from "next/navigation";
import Link from "next/link";
import { PlusCircle, Folder, ArrowRight, Trash2 } from "lucide-react";

export default async function WorkspacesPage() {
    const workspaces = await getWorkspaces();

    async function create(formData: FormData) {
        "use server";
        const res = await createWorkspace(formData);
        if (res.error) {
            // Handle error (would need client component for toast, but skipping for MVP)
            console.error(res.error);
        }
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
                        My Workspaces
                    </h1>
                    <p className="text-gray-500 mt-2">Manage your research projects and document collections</p>
                </div>

                <form action={create} className="flex gap-2">
                    <input
                        name="name"
                        placeholder="New Workspace Name..."
                        className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        required
                    />
                    <button
                        type="submit"
                        className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                        <PlusCircle size={20} />
                        Create
                    </button>
                </form>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {workspaces.map((ws: any) => (
                    <div key={ws.id} className="group relative bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg text-purple-600 dark:text-purple-400">
                                <Folder size={24} />
                            </div>
                            <div className="text-sm text-gray-500">
                                {new Date(ws.createdAt).toLocaleDateString()}
                            </div>
                        </div>

                        <h3 className="text-xl font-semibold mb-2 group-hover:text-purple-600 transition-colors">
                            {ws.name}
                        </h3>

                        <p className="text-gray-500 text-sm mb-6 line-clamp-2">
                            Workspace for organizing documents and AI research.
                        </p>

                        <Link
                            href={`/dashboard/workspaces/${ws.id}`}
                            className="inline-flex items-center gap-2 text-sm font-medium text-purple-600 hover:text-purple-700 hover:gap-3 transition-all"
                        >
                            Open Workspace <ArrowRight size={16} />
                        </Link>
                    </div>
                ))}

                {workspaces.length === 0 && (
                    <div className="col-span-full text-center py-12 bg-gray-50 dark:bg-zinc-900/50 rounded-xl border border-dashed border-gray-300">
                        <Folder className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">No workspaces yet</h3>
                        <p className="text-gray-500 mt-1">Create your first workspace to get started</p>
                    </div>
                )}
            </div>
        </div>
    );
}
