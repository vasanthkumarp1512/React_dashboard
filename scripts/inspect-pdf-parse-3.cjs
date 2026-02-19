
const pdf = require("pdf-parse");
const PDFParse = pdf.PDFParse;

console.log("Type of PDFParse:", typeof PDFParse);
console.log("Is class?", PDFParse.toString().startsWith("class"));

async function test() {
    try {
        console.log("Try as function...");
        const res = await PDFParse(Buffer.from("dummy"));
        console.log("Function success:", res);
    } catch (e) {
        console.log("Function failed:", e.message);
    }

    try {
        console.log("Try as class...");
        const instance = new PDFParse(Buffer.from("dummy"));
        console.log("Class success:", instance);
        if (instance && typeof instance.then === 'function') {
            const res = await instance;
            console.log("Class promise resolved:", res);
        }
    } catch (e) {
        console.log("Class failed:", e.message);
    }
}
test();
