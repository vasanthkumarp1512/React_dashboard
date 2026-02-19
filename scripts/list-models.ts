
import "dotenv/config";

async function main() {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
        console.error("No API Key");
        return;
    }

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        console.log("Models:", JSON.stringify(data, null, 2));

        const fs = require("fs");
        fs.writeFileSync("models.json", JSON.stringify(data, null, 2));
        console.log("Written to models.json");
    } catch (e: any) {
        console.error("Error fetching models:", e.message);
    }
}
main();
