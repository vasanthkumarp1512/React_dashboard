import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, ne } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { approveUser, rejectUser } from "@/app/actions/admin";

export default async function AdminDashboard() {
    const session = await getServerSession(authOptions);

    if (session?.user?.role !== "admin") {
        redirect("/dashboard");
    }

    const allUsers = await db.query.users.findMany({
        where: ne(users.id, session.user.id),
        orderBy: (users, { desc }) => [desc(users.createdAt)],
    });

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-6">Admin User Management</h1>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Name</th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Email</th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Role</th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {allUsers.map((user) => (
                            <tr key={user.id}>
                                <td className="px-6 py-4 text-sm font-medium text-gray-900">{user.name}</td>
                                <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                                <td className="px-6 py-4 text-sm text-gray-600 capitalize">{user.role}</td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full capitalize ${user.status === "approved" ? "bg-green-100 text-green-700" :
                                            user.status === "rejected" ? "bg-red-100 text-red-700" :
                                                "bg-yellow-100 text-yellow-700"
                                        }`}>
                                        {user.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm space-x-2">
                                    {user.status === "pending" && (
                                        <>
                                            <form action={approveUser.bind(null, user.id)} className="inline">
                                                <button className="text-indigo-600 hover:text-indigo-900 font-medium">Approve</button>
                                            </form>
                                            <form action={rejectUser.bind(null, user.id)} className="inline">
                                                <button className="text-red-600 hover:text-red-900 font-medium">Reject</button>
                                            </form>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {allUsers.length === 0 && (
                    <div className="p-8 text-center text-gray-500 italic">No other users found</div>
                )}
            </div>
        </div>
    );
}
