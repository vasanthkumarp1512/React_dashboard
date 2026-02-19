
const pdf = require("pdf-parse");

console.log("Type of export:", typeof pdf);
console.log("Exports:", pdf);
if (typeof pdf === 'function') {
    console.log("Is it a class?", pdf.toString().startsWith("class"));
}

async function run() {
    try {
        console.log("Attempting to instantiate...");
        const instance = new pdf(Buffer.from("dummy"));
        console.log("Instance created:", instance);
    } catch (e) {
        console.log("Instantiation failed:", e.message);
    }

    try {
        console.log("Attempting to call as function...");
        const result = await pdf(Buffer.from("dummy"));
        console.log("Function call result:", result);
    } catch (e) {
        console.log("Function call failed:", e.message);
    }
}

run();
