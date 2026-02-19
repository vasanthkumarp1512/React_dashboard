import { config } from "dotenv";
config({ path: ".env.local" });

async function main() {
    const fs = require("fs");
    const formData = new FormData();
    // Simulate a PDF file using text content
    const blob = new Blob([fs.readFileSync("dummy.txt")], { type: "application/pdf" });
    formData.append("file", blob, "test.pdf");

    // We expect this to fail auth (401) or parsing (500)
    // But importantly, we want to see JSON response, not HTML crash.

    try {
        const res = await fetch("http://localhost:3000/api/upload", {
            method: "POST",
            body: formData as any,
        });

        console.log("Status:", res.status);
        const text = await res.text();
        console.log("Response Preview:", text.substring(0, 500));

        fs.writeFileSync("upload-response.txt", `Status: ${res.status}\n\n${text}`);
    } catch (e) {
        console.error("Fetch error:", e);
    }
}

main();
