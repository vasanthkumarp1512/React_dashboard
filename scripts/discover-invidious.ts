
const fetch = require('node-fetch'); // Assuming node environment for script
const https = require('https');

const VIDEO_ID = "jNQXAC9IVRw"; // Me at the zoo

async function main() {
    console.log("Fetching Invidious instances list...");

    try {
        const listResp = await fetch("https://api.invidious.io/instances.json?sort_by=health");
        const json = await listResp.json();

        // Filter for valid instances with CORS and API enabled
        const instances = json.filter(i =>
            i[1].type === "https" &&
            i[1].cors === true &&
            i[1].api === true
        ).map(i => i[0]);

        console.log(`Found ${instances.length} potential instances. Testing Top 20...`);

        const working = [];

        // Test top 20
        for (const instance of instances.slice(0, 20)) {
            // Ensure no trailing slash
            const url = instance.replace(/\/$/, "");
            try {
                const controller = new AbortController();
                const timeout = setTimeout(() => controller.abort(), 5000);

                const start = Date.now();
                const res = await fetch(`${url}/api/v1/captions/${VIDEO_ID}`, {
                    signal: controller.signal
                });
                clearTimeout(timeout);

                if (res.ok) {
                    const data = await res.json();
                    if (data.captions && data.captions.length > 0) {
                        const time = Date.now() - start;
                        console.log(`✅ ${url} (${time}ms)`);
                        working.push(url);
                        // We only need 3-5 good ones
                        if (working.length >= 5) break;
                    }
                }
            } catch (e) {
                // specific error handling if needed
            }
        }

        console.log("\nWORKING INSTANCES:", JSON.stringify(working, null, 2));

    } catch (e) {
        console.error("Failed to fetch instance list:", e);
    }
}

main();
