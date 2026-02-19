async function test() {
    const videoId = "UUheH1seQuE";

    // Step 1: GET the watch page and extract needed data
    const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const pageResp = await fetch(watchUrl, {
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept-Language": "en-US,en;q=0.9",
        },
    });
    const html = await pageResp.text();

    // Extract cookies
    const cookies = pageResp.headers.getSetCookie?.() || [];
    const cookieStr = cookies.map(c => c.split(";")[0]).join("; ");
    console.log("Cookies:", cookieStr.substring(0, 100));

    // Try fetching captions with cookies  
    const captionMatch = html.match(/"captionTracks":\s*(\[.*?\])/);
    if (captionMatch) {
        const tracks = JSON.parse(captionMatch[1]);
        let baseUrl = tracks[0].baseUrl.replace(/\\u0026/g, "&");

        console.log("\nRetrying with cookies...");
        const resp = await fetch(baseUrl, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                "Cookie": cookieStr,
                "Referer": watchUrl,
            },
        });
        const content = await resp.text();
        console.log("Content length with cookies:", content.length);
        if (content.length > 0) {
            console.log("First 500 chars:", content.substring(0, 500));
        }
    }

    // Alternative: try youtube-transcript with different config
    console.log("\n--- Trying alternate timedtext URL ---");
    const timedtextUrl = `https://www.youtube.com/api/timedtext?v=${videoId}&lang=en&fmt=json3`;
    const ttResp = await fetch(timedtextUrl, {
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Cookie": cookieStr,
        },
    });
    console.log("Timedtext status:", ttResp.status);
    const ttContent = await ttResp.text();
    console.log("Timedtext length:", ttContent.length);
    if (ttContent.length > 0) {
        console.log("First 300:", ttContent.substring(0, 300));
    }

    // Alternative 2: try the simple direct timedtext URL without auth
    console.log("\n--- Trying simple timedtext URL ---");
    const simpleUrl = `https://www.youtube.com/api/timedtext?v=${videoId}&lang=en&kind=asr`;
    const simpleResp = await fetch(simpleUrl);
    console.log("Simple status:", simpleResp.status);
    const simpleContent = await simpleResp.text();
    console.log("Simple length:", simpleContent.length);
    if (simpleContent.length > 0) {
        console.log("First 300:", simpleContent.substring(0, 300));
    }

    process.exit(0);
}

test();

export { };
