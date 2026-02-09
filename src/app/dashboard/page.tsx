import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);

    return (
        <div className="p-8">
            <div className="max-w-4xl">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Welcome back, {session?.user?.name}!
                </h1>
                <p className="text-gray-600 mb-8">
                    You are currently logged in as a <span className="font-semibold capitalize text-indigo-600">{session?.user?.role}</span>.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-semibold mb-2">Account Status</h3>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                            <span className="text-sm text-gray-600 capitalize">{session?.user?.status}</span>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-semibold mb-2">Registration Date</h3>
                        <p className="text-sm text-gray-600">February 9, 2026</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
