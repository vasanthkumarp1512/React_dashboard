
const pdf = require("pdf-parse");

async function run() {
    try {
        console.log("Testing pdf-parse v1...");
        const buffer = Buffer.from("dummy pdf content");
        const data = await pdf(buffer);
        console.log("Success. Text length:", data.text.length);
    } catch (e) {
        console.log("Error:", e.message);
    }
}

run();
