
// @ts-ignore
if (typeof global.DOMMatrix === "undefined") {
    // @ts-ignore
    global.DOMMatrix = class DOMMatrix {
        constructor() { }
        toString() { return "[object DOMMatrix]"; }
    };
}

async function run() {
    try {
        let pdf = require("pdf-parse");

        if (typeof pdf !== "function" && pdf.PDFParse) {
            console.log("Using pdf.PDFParse");
            pdf = pdf.PDFParse;
        }

        const buffer = Buffer.from("dummy pdf content");

        try {
            console.log("Attempting constructor call: new pdf(buffer)...");
            // @ts-ignore
            const instance = new pdf(buffer);
            console.log("Constructor call success");
            console.log("Instance type:", typeof instance);

            if (instance instanceof Promise || (typeof instance.then === 'function')) {
                console.log("Instance is Thenable/Promise!");
                const result = await instance;
                console.log("Promise result keys:", Object.keys(result));
                if (result.text) console.log("Text found in resolved promise");
            } else {
                console.log("Instance is NOT a Promise");
                console.log("Instance keys:", Object.keys(instance));
                if (instance.text) console.log("Text found on instance");
            }
        } catch (e: any) {
            console.log("Constructor call error:", e.message);
        }

    } catch (e) {
        console.error("Setup error:", e);
    }
}

run();
