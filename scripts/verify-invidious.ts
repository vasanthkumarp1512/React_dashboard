
const VIDEO_ID = "jNQXAC9IVRw";

const INVIDIOUS_INSTANCES = [
    "https://invidious.io.lol",
    "https://invidious.jing.rocks",
    "https://vid.priv.au",
    "https://inv.tux.pizza",
    "https://invidious.nerdvpn.de",
    "https://invidious.private.coffee",
    "https://yt.artemislena.eu",
    "https://invidious.projectsegfau.lt"
];

async function main() {
    console.log("Verifying Invidious instances...");
    const working = [];

    for (const instance of INVIDIOUS_INSTANCES) {
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 3000);

            // Invidious API: /api/v1/captions/{videoId}
            const res = await fetch(`${instance}/api/v1/captions/${VIDEO_ID}`, {
                signal: controller.signal
            });
            clearTimeout(timeout);

            if (res.ok) {
                const data = await res.json();
                if (data.captions && data.captions.length > 0) {
                    console.log(`✅ ${instance}`);
                    working.push(instance);
                } else {
                    console.log(`❌ ${instance} (No captions found)`);
                }
            } else {
                console.log(`❌ ${instance} (Status ${res.status})`);
            }
        } catch (e) {
            console.log(`❌ ${instance} (Error: ${e.message})`);
        }
    }

    console.log("\nWorking instances:", JSON.stringify(working, null, 2));
}

main();
