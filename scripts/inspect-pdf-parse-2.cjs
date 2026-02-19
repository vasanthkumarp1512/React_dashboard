
const pdf = require("pdf-parse");

console.log("Keys:", Object.keys(pdf));
if (pdf.default) {
    console.log("Default export type:", typeof pdf.default);
}
