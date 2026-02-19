
import { Innertube, UniversalCache } from "youtubei.js";

const VIDEO_ID = "UUheH1seQuE"; // Video from user screenshot

async function main() {
    console.log(`Attempting to fetch transcript for ${VIDEO_ID}...`);

    try {
        console.log("--- Strategy 1: WEB Client ---");
        const yt = await Innertube.create({
            cache: new UniversalCache(false),
            generate_session_locally: true,
        });
        const info = await yt.getInfo(VIDEO_ID);
        try {
            const transcriptData = await info.getTranscript();
            if (transcriptData?.transcript?.content?.body?.initial_segments) {
                console.log("Success with WEB client!");
                console.log("Snippet:", transcriptData.transcript.content.body.initial_segments[0].snippet.text);
                return;
            } else {
                console.log("WEB client returned no segments.");
            }
        } catch (e: any) {
            console.log("WEB client getTranscript error:", e.message);
        }

        console.log("--- Strategy 2: ANDROID Client ---");
        const ytAndroid = await Innertube.create({
            cache: new UniversalCache(false),
            generate_session_locally: true,
            client_type: "ANDROID" as any,
        });
        const infoAndroid = await ytAndroid.getInfo(VIDEO_ID);
        try {
            const transcriptData = await infoAndroid.getTranscript();
            if (transcriptData?.transcript?.content?.body?.initial_segments) {
                console.log("Success with ANDROID client!");
                return;
            }
        } catch (e: any) {
            console.log("ANDROID client getTranscript error:", e.message);
        }

    } catch (error: any) {
        console.error("Fatal error:", error);
    }
}

main();
