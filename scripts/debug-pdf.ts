
// @ts-ignore
if (typeof Promise.withResolvers === "undefined") {
    // @ts-ignore
    if (typeof window === "undefined") {
        // @ts-ignore
        global.DOMMatrix = class DOMMatrix {
            constructor() { }
            toString() { return "[object DOMMatrix]"; }
        };
    }
}

try {
    const pdf = require("pdf-parse");
    console.log("Type of pdf:", typeof pdf);
    console.log("Is pdf a function?", typeof pdf === "function");
    console.log("Keys of pdf:", Object.keys(pdf));
    if (pdf.default) {
        console.log("Type of pdf.default:", typeof pdf.default);
    }
} catch (e) {
    console.error("Error requiring pdf-parse:", e);
}
