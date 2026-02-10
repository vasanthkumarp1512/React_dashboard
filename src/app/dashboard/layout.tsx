import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { LayoutDashboard, Users, LogOut, Shield, Sparkles } from "lucide-react";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession(authOptions);
    const isAdmin = session?.user?.role === "admin";

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <div className="w-64 bg-white border-r border-gray-100 flex flex-col">
                <div className="p-6">
                    <h2 className="text-xl font-bold text-indigo-600 flex items-center gap-2">
                        <Shield className="w-6 h-6" />
                        Dashboard
                    </h2>
                </div>
                <nav className="flex-1 px-4 space-y-2">
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                        <LayoutDashboard className="w-5 h-5" />
                        Personal
                    </Link>
                    <Link
                        href="/dashboard/ai-tools"
                        className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                        <Sparkles className="w-5 h-5" />
                        AI Study Notes
                    </Link>
                    {isAdmin && (
                        <Link
                            href="/admin"
                            className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                            <Users className="w-5 h-5" />
                            User Admin
                        </Link>
                    )}
                </nav>
                <div className="p-4 border-t border-gray-100">
                    <div className="bg-gray-50 p-4 rounded-lg mb-4">
                        <p className="text-sm font-semibold text-gray-900 truncate">{session?.user?.name}</p>
                        <p className="text-xs text-gray-500 truncate capitalize">{session?.user?.role}</p>
                    </div>
                    <Link
                        href="/api/auth/signout"
                        className="flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors w-full"
                    >
                        <LogOut className="w-5 h-5" />
                        Sign Out
                    </Link>
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}
