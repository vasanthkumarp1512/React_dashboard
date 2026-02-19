import { DefaultSession } from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            role: "admin" | "user";
            status: "pending" | "approved" | "rejected";
        } & DefaultSession["user"];
    }

    interface User {
        id: string;
        role: "admin" | "user";
        status: "pending" | "approved" | "rejected";
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        role: "admin" | "user";
        status: "pending" | "approved" | "rejected";
    }
}
