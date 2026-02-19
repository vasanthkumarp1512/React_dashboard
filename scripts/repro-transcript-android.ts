
import { Innertube, UniversalCache } from "youtubei.js";

const VIDEO_ID = "UUheH1seQuE";

async function main() {
    console.log(`Debug youtubei.js ANDROID for ${VIDEO_ID}...`);

    try {
        const yt = await Innertube.create({
            cache: new UniversalCache(false),
            generate_session_locally: true,
            client_type: "ANDROID" as any, // Trying Android client specifically
        });

        const info = await yt.getInfo(VIDEO_ID);
        try {
            const transcriptData = await info.getTranscript();
            if (transcriptData?.transcript?.content?.body?.initial_segments) {
                console.log("Success with ANDROID client!");
                console.log("Snippet:", transcriptData.transcript.content.body.initial_segments[0].snippet.text);
            } else {
                console.log("ANDROID client returned no segments.");
            }
        } catch (e: any) {
            console.log("ANDROID client getTranscript error:", e.message);
        }

    } catch (error: any) {
        console.error("Fatal error:", error);
    }
}

main();
