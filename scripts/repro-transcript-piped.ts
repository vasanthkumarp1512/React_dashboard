export { };
const VIDEO_ID = "TckGcxwknYU";

async function main() {
    console.log(`Debug third-party fetch for ${VIDEO_ID}...`);

    // Using a common third-party instance often used as fallback
    // Note: In production, we should handle rate limits or host our own instance of Invidious/Piped
    // But for this specific blocking issue, Piped API is a good alternative
    const pipedInstances = [
        "https://pipedapi.kavin.rocks",
        "https://api.piped.io",
        "https://piped-api.garudalinux.org"
    ];

    for (const instance of pipedInstances) {
        console.log(`Trying Piped instance: ${instance}`);
        try {
            const response = await fetch(`${instance}/streams/${VIDEO_ID}`);
            if (!response.ok) {
                console.log(`Failed: ${response.status}`);
                continue;
            }

            const data = await response.json();
            if (data.subtitles && data.subtitles.length > 0) {
                console.log(`Found ${data.subtitles.length} subtitle tracks.`);
                const track = data.subtitles.find((t: any) => t.code === 'en' || t.code.startsWith('en')) || data.subtitles[0];

                if (track) {
                    console.log(`Fetching subtitles from: ${track.url}`);
                    const subResponse = await fetch(track.url);
                    const vtt = await subResponse.text();
                    console.log("Subtitle Length:", vtt.length);
                    if (vtt.length > 0) {
                        console.log("Success! Snippet:", vtt.substring(0, 100));
                        return;
                    }
                }
            } else {
                console.log("No subtitles found in Piped response.");
            }
        } catch (e: any) {
            console.error("Error:", e.message);
        }
    }
    console.log("All third-party attempts failed.");
}

main();
