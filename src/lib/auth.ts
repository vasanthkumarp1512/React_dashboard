import { db } from "@/db";
import { users } from "@/db/schema";
import { compare } from "bcryptjs";
import { eq } from "drizzle-orm";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/auth/signin",
    },
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                console.log("Authorize attempt for:", credentials?.email);
                if (!credentials?.email || !credentials?.password) {
                    console.log("Missing credentials");
                    return null;
                }

                try {
                    console.log("Querying database for user...");
                    const user = await db.query.users.findFirst({
                        where: eq(users.email, credentials.email),
                    });

                    if (!user) {
                        console.log("User not found in DB");
                        return null;
                    }

                    console.log("User found, status:", user.status);

                    if (user.status === "pending" && user.role !== "admin") {
                        console.log("User status is pending");
                        throw new Error("Your account is pending approval.");
                    }

                    if (user.status === "rejected") {
                        console.log("User status is rejected");
                        throw new Error("Your account has been rejected.");
                    }

                    console.log("Comparing passwords...");
                    const isPasswordValid = await compare(credentials.password, user.password);

                    if (!isPasswordValid) {
                        console.log("Invalid password");
                        return null;
                    }

                    console.log("Login successful for:", user.email);
                    return {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        role: user.role,
                        status: user.status,
                    };
                } catch (err: any) {
                    console.error("Authorize error:", err.message);
                    throw err;
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                return {
                    ...token,
                    id: user.id,
                    role: user.role,
                    status: user.status,
                };
            }
            return token;
        },
        async session({ session, token }) {
            return {
                ...session,
                user: {
                    ...session.user,
                    id: token.id,
                    role: token.role,
                    status: token.status,
                },
            };
        },
    },
};
