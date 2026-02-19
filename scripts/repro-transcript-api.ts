
export { };
const VIDEO_ID = "UUheH1seQuE";

async function main() {
    console.log(`Debug final fetch for ${VIDEO_ID}...`);
    // This is the inner API URL that the web client uses, sometimes accessible directly
    const apiUrl = `https://www.youtube.com/youtubei/v1/player?key=AIzaSyAO_FJ2SlqU8Q4XVUQfCGcbLVLM1NBdEXe`;

    try {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Content-Type": "application/json",
                "Origin": "https://www.youtube.com",
            },
            body: JSON.stringify({
                videoId: VIDEO_ID,
                context: {
                    client: {
                        clientName: "WEB",
                        clientVersion: "2.20230531.01.00",
                    }
                }
            })
        });

        const data = await response.json();
        console.log("Player Response Status:", response.status);

        if (data.captions?.playerCaptionsTracklistRenderer?.captionTracks) {
            const tracks = data.captions.playerCaptionsTracklistRenderer.captionTracks;
            console.log("Found tracks via API:", tracks.length);
            const track = tracks.find((t: any) => t.languageCode === 'en') || tracks[0];

            if (track) {
                console.log("Track URL:", track.baseUrl);
                const xmlResp = await fetch(track.baseUrl);
                const xml = await xmlResp.text();
                console.log("XML Length:", xml.length);
                if (xml.length > 0) console.log("Success!");
            }
        } else {
            console.log("No captions in API response.");
            if (data.playabilityStatus) {
                console.log("Playability Status:", data.playabilityStatus.status);
            }
        }

    } catch (e: any) {
        console.error("Error:", e.message);
    }
}

main();
