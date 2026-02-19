
const VIDEO_ID = "TckGcxwknYU";

async function main() {
    console.log(`Debug extended Piped fetch for ${VIDEO_ID}...`);

    // More instances from https://github.com/TeamPiped/Piped/wiki/Instances
    const instances = [
        "https://pipedapi.kavin.rocks",
        "https://api.piped.io",
        "https://piped-api.garudalinux.org",
        "https://pipedapi.drgns.space",
        "https://pipedapi.tokhmi.xyz",
        "https://piped-api.lunar.icu",
        "https://api.piped.privacy.com.de",
        "https://pipedapi.ducks.party",
        "https://api.onemandev.net",
        "https://pipedapi.r4fo.com"
    ];

    for (const instance of instances) {
        console.log(`Trying ${instance}...`);
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout per instance

            const response = await fetch(`${instance}/streams/${VIDEO_ID}`, {
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (!response.ok) {
                console.log(`Failed: ${response.status}`);
                continue;
            }

            const data = await response.json();
            if (data.subtitles && data.subtitles.length > 0) {
                console.log(`SUCCESS! Found ${data.subtitles.length} tracks on ${instance}`);
                const track = data.subtitles.find((t: any) => t.code === 'en' || t.code.startsWith('en')) || data.subtitles[0];
                if (track) {
                    console.log(`Testing fetch from: ${track.url}`);
                    const subResponse = await fetch(track.url);
                    const vtt = await subResponse.text();
                    if (vtt.length > 0) {
                        console.log("Subtitle content retrieved!");
                        console.log("Snippet:", vtt.substring(0, 100));
                        return; // Exit on first success
                    }
                }
            } else {
                console.log(`No subtitles on ${instance}`);
            }
        } catch (e: any) {
            console.log(`Error on ${instance}:`, e.message);
        }
    }
    console.log("All instances failed.");
}

main();
