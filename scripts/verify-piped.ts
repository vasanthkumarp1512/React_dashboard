
export { };
const VIDEO_ID = "jNQXAC9IVRw"; // "Me at the zoo" - Guaranteed to have captions

const PIPED_INSTANCES = [
    "https://pipedapi.kavin.rocks",
    "https://api.piped.io",
    "https://piped-api.garudalinux.org",
    "https://pipedapi.drgns.space",
    "https://pipedapi.tokhmi.xyz",
    "https://piped-api.lunar.icu",
    "https://api.piped.privacy.com.de",
    "https://pipedapi.ducks.party",
    "https://api.onemandev.net",
    "https://pipedapi.r4fo.com",
    "https://pipedapi.smnz.de",
    "https://pipedapi.adminforge.de",
    "https://api.piped.projectsegfau.lt",
    "https://pipedapi.minoplhy.dev"
];

async function main() {
    console.log("Verifying Piped instances...");
    const working = [];

    for (const instance of PIPED_INSTANCES) {
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 3000);
            const start = Date.now();

            const res = await fetch(`${instance}/streams/${VIDEO_ID}`, {
                signal: controller.signal
            });
            clearTimeout(timeout);

            if (res.ok) {
                const data = await res.json();
                if (data.subtitles && data.subtitles.length > 0) {
                    const time = Date.now() - start;
                    console.log(`✅ ${instance} (${time}ms)`);
                    working.push(instance);
                } else {
                    console.log(`❌ ${instance} (No subtitles)`);
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
