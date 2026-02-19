
// @ts-ignore
if (typeof global.DOMMatrix === "undefined") {
    // @ts-ignore
    global.DOMMatrix = class DOMMatrix {
        constructor() { }
        toString() { return "[object DOMMatrix]"; }
    };
}

try {
    const pdf = require("pdf-parse");
    console.log("Type of pdf.PDFParse:", typeof pdf.PDFParse);
    // Try to call it if it's a function
    if (typeof pdf.default === 'function') {
        console.log("pdf.default is the function");
    }
} catch (e) {
    console.error(e);
}
