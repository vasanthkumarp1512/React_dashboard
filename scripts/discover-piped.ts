
export { };

const VIDEO_ID = "jNQXAC9IVRw"; // Me at the zoo

async function main() {
    console.log("Fetching Piped instances list...");

    // Using a known list or scraping the wiki is hard. 
    // Let's use a hardcoded massive list from reliable sources + documentation
    const CANDIDATES = [
        "https://pipedapi.kavin.rocks",
        "https://api.piped.io",
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
        "https://pipedapi.minoplhy.dev",
        "https://piped-api.garudalinux.org",
        "https://pa.il.ax",
        "https://p.euten.eu",
        "https://pipedapi.nwoss.de",
        "https://pipedapi.yt.znix.xyz", // usually good
        "https://pipedapi.kavin.rocks"
    ];

    const working = [];

    for (const instance of CANDIDATES) {
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 5000);

            const res = await fetch(`${instance}/streams/${VIDEO_ID}`, {
                signal: controller.signal
            });
            clearTimeout(timeout);

            if (res.ok) {
                const data = await res.json();
                if (data.subtitles && data.subtitles.length > 0) {
                    console.log(`✅ ${instance}`);
                    working.push(instance);
                } else {
                    console.log(`❌ ${instance} (No subtitles)`);
                }
            } else {
                console.log(`❌ ${instance} (Status ${res.status})`);
            }
        } catch (e: any) {
            console.log(`❌ ${instance} (Error: ${e.message})`);
        }
    }

    console.log("\nWORKING INSTANCES:", JSON.stringify(working, null, 2));
}

main();
