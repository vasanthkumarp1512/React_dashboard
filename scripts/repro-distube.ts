
export { };
const { getInfo } = require('@distube/ytdl-core');

const VIDEO_ID = "jNQXAC9IVRw"; // Me at the zoo
const VIDEO_ID_2 = "TckGcxwknYU"; // The user's video

async function main() {
    console.log("Testing @distube/ytdl-core...");

    try {
        console.log(`Fetching info for ${VIDEO_ID}...`);
        const info = await getInfo(`https://www.youtube.com/watch?v=${VIDEO_ID}`);

        const captions = info.player_response.captions;
        if (captions) {
            const tracks = captions.playerCaptionsTracklistRenderer.captionTracks;
            console.log("✅ Captions found:", tracks.length);
            console.log(tracks.map(t => t.name.simpleText).join(", "));
        } else {
            console.log("❌ No captions found.");
        }

    } catch (e) {
        console.log("❌ Error:", e.message);
    }

    try {
        console.log(`\nFetching info for ${VIDEO_ID_2} (User's video)...`);
        const info = await getInfo(`https://www.youtube.com/watch?v=${VIDEO_ID_2}`);

        const captions = info.player_response.captions;
        if (captions) {
            const tracks = captions.playerCaptionsTracklistRenderer.captionTracks;
            console.log("✅ Captions found:", tracks.length);
            console.log(tracks.map(t => t.name.simpleText).join(", "));
        } else {
            console.log("❌ No captions found (likely no CC available).");
        }

    } catch (e) {
        console.log("❌ Error:", e.message);
    }
}

main();
