import { Innertube, UniversalCache } from "youtubei.js";

async function test() {
    try {
        console.log("Initializing Innertube...");
        const youtube = await Innertube.create({
            cache: new UniversalCache(false),
            generate_session_locally: true,
        });

        const videoId = "i5WYp4wMXfc"; // The user's failing video
        console.log("Fetching info for:", videoId);

        try {
            const info = await youtube.getInfo(videoId);
            console.log("Video title:", info.basic_info.title);

            console.log("Fetching transcript...");
            const transcriptData = await info.getTranscript();

            if (!transcriptData || !transcriptData.transcript) {
                console.log("No transcript data found from WEB client");
            } else {
                console.log("SUCCESS with WEB client!");
                const content = transcriptData.transcript.content?.body?.initial_segments
                    .map(segment => segment.snippet.text)
                    .join(" ") ?? "";
                console.log("Length:", content.length);
            }
        } catch (e: any) {
            console.log("WEB client failed:", e.message);
        }

        console.log("\nTrying ANDROID client...");
        const youtubeAndroid = await Innertube.create({
            cache: new UniversalCache(false),
            generate_session_locally: true,
            client_type: "ANDROID",
        });

        try {
            const infoAndroid = await youtubeAndroid.getInfo(videoId);
            const transcriptData = await infoAndroid.getTranscript();
            if (!transcriptData || !transcriptData.transcript) {
                console.log("No transcript data found from ANDROID client");
            } else {
                console.log("SUCCESS with ANDROID client!");
                const content = transcriptData.transcript.content?.body?.initial_segments
                    .map(segment => segment.snippet.text)
                    .join(" ") ?? "";
                console.log("Length:", content.length);
            }
        } catch (e: any) {
            console.log("ANDROID client failed:", e.message);
        }

    } catch (err: any) {
        console.error("FAILED to initialize:", err.message);
    }
}

test();
