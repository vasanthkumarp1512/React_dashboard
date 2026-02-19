
const { Innertube, UniversalCache } = require('youtubei.js');

const VIDEO_ID = "jNQXAC9IVRw"; // Me at the zoo

async function main() {
    console.log("Testing Innertube (youtubei.js)...");

    try {
        const yt = await Innertube.create({
            cache: new UniversalCache(false),
            generate_session_locally: true,
            client_type: 'IOS'
        });

        console.log("Innertube initialized.");

        console.log(`Fetching info for ${VIDEO_ID}...`);
        const info = await yt.getInfo(VIDEO_ID);

        console.log("Info fetched. Title:", info.basic_info.title);

        console.log("Fetching transcript...");
        const transcriptData = await info.getTranscript();

        if (transcriptData && transcriptData.transcript) {
            console.log("✅ Transcript found!");
            const content = transcriptData.transcript.content.body.initial_segments
                .map(s => s.snippet.text).join(" ");
            console.log("Preview:", content.substring(0, 100));
        } else {
            console.log("❌ No transcript found.");
        }

    } catch (e) {
        console.log("❌ Error:", e.toString());
    }
}

main();
