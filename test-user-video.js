const { Innertube, UniversalCache } = require("youtubei.js");

async function test() {
    try {
        console.log("Initializing Innertube...");
        const youtube = await Innertube.create({
            cache: new UniversalCache(false),
            generate_session_locally: true,
        });

        const videoId = "i5WYp4wMXfc";
        console.log("Fetching info for:", videoId);

        const info = await youtube.getInfo(videoId);
        console.log("Video title:", info.basic_info.title);

        console.log("Fetching transcript...");
        try {
            const transcriptData = await info.getTranscript();
            if (!transcriptData || !transcriptData.transcript) {
                console.log("No transcript data found from WEB client");
            } else {
                console.log("SUCCESS with WEB client!");
                return;
            }
        } catch (e) {
            console.log("WEB client failed:", e.message);
        }

        console.log("\nTrying ANDROID client...");
        const youtubeAndroid = await Innertube.create({
            cache: new UniversalCache(false),
            generate_session_locally: true,
            client_type: "ANDROID",
        });

        const infoAndroid = await youtubeAndroid.getInfo(videoId);
        try {
            const transcriptData = await infoAndroid.getTranscript();
            if (!transcriptData || !transcriptData.transcript) {
                console.log("No transcript data found from ANDROID client");
            } else {
                console.log("SUCCESS with ANDROID client!");
            }
        } catch (e) {
            console.log("ANDROID client failed:", e.message);
        }

    } catch (err) {
        console.error("FAILED:", err.message);
    }
}

test();
