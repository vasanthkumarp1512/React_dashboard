import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { documents } from "@/db/schema";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
// @ts-ignore
if (typeof global.DOMMatrix === "undefined") {
    // @ts-ignore
    global.DOMMatrix = class DOMMatrix {
        constructor() { }
        toString() { return "[object DOMMatrix]"; }
    };
}

// Lazy load pdf-parse inside handler to ensure polyfill applies

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        let content = "";

        if (file.type === "application/pdf") {
            // @ts-ignore
            const pdf = require("pdf-parse/lib/pdf-parse.js");
            const buffer = Buffer.from(await file.arrayBuffer());
            const data = await pdf(buffer);

            console.log("PDF parsed text length:", data.text ? data.text.length : 0);
            content = data.text || "";
        } else if (file.type === "text/plain") {
            content = await file.text() || "";
        } else {
            return NextResponse.json({ error: "Unsupported file type. Upload PDF or Text." }, { status: 400 });
        }

        // Sanitize content to remove null bytes often found in PDF text which Postgres dislikes
        content = content.replace(/\x00/g, "");

        const [doc] = await db.insert(documents).values({
            userId: session.user.id,
            filename: file.name,
            content: content,
        }).returning();

        return NextResponse.json({ document: doc }, { status: 201 });
    } catch (error: any) {
        console.error("Upload error details:", {
            message: error.message,
            code: error.code,
            detail: error.detail,
            hint: error.hint,
            position: error.position,
            where: error.where,
            schema: error.schema,
            table: error.table,
            column: error.column,
            dataType: error.dataType,
            constraint: error.constraint
        });
        if (error.code === "23503") {
            return NextResponse.json({ error: "User session invalid. Please sign out and sign in again." }, { status: 401 });
        }
        return NextResponse.json({ error: error.message || "Failed to process document" }, { status: 500 });
    }
}
