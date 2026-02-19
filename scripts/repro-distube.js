
const { getInfo } = require('@distube/ytdl-core');

const VIDEO_ID = "jNQXAC9IVRw"; // Me at the zoo
const VIDEO_ID_2 = "qw6s62Nkp4w"; // The user's new problem video

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
        // Simulate passing cookies
        const requestOptions = {
            headers: {
                cookie: "DUMMY_COOKIE=123",
            }
        };
        const info = await getInfo(`https://www.youtube.com/watch?v=${VIDEO_ID_2}`, { requestOptions });

        const captions = info.player_response.captions;
        if (captions) {
            const tracks = captions.playerCaptionsTracklistRenderer.captionTracks;
            console.log("✅ Captions found:", tracks.length);
            console.log(tracks.map(t => t.name.simpleText).join(", "));
        } else {
            console.log("❌ No captions found (possibly disabled).");
        }

    } catch (e) {
        console.log("❌ Error:", e.message);
    }
}

main();
