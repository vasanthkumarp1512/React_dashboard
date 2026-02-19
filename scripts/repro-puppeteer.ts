
export { };
const puppeteer = require('puppeteer');

const VIDEO_ID = "jNQXAC9IVRw"; // Me at the zoo
const VIDEO_ID_2 = "TckGcxwknYU"; // The user's video

async function fetchTranscript(videoId) {
    console.log(`Fetching transcript for ${videoId} via Puppeteer...`);
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    let transcript = null;

    try {
        const page = await browser.newPage();

        // Intercept network requests to find get_transcript
        await page.setRequestInterception(true);
        page.on('request', request => {
            request.continue();
        });

        const transcriptPromise = new Promise((resolve) => {
            page.on('response', async response => {
                const url = response.url();
                if (url.includes('/youtubei/v1/get_transcript') || url.includes('/api/timedtext')) {
                    try {
                        const json = await response.json();
                        if (json.actions) {
                            // youtubei format
                            const segments = json.actions[0].updateEngagementPanelAction.content.transcriptRenderer.content.transcriptSearchPanelRenderer.body.transcriptSegmentListRenderer.initialSegments;
                            if (segments) {
                                const text = segments.map(s => s.snippet.text).join(" ");
                                resolve(text);
                            }
                        } else if (json.events) {
                            // timedtext format
                            const text = json.events.map(e => e.segs ? e.segs.map(s => s.utf8).join("") : "").join(" ");
                            resolve(text);
                        }
                    } catch (e) {
                        // ignore parsing errors for non-json responses
                    }
                }
            });
        });

        // Set a timeout for the transcript promise
        const timeoutPromise = new Promise(resolve => setTimeout(() => resolve(null), 15000));

        await page.goto(`https://www.youtube.com/watch?v=${videoId}`, { waitUntil: 'networkidle2' });

        // Sometimes valid transcripts are loaded via initial data, not network request.
        // We can try to click "Show transcript" if network intercept failed.
        // But for now, let's see if network interception catches it.

        // Also check if we hit consent page
        const consentButton = await page.$('button[aria-label="Reject all"]');
        // Check Page Title
        const pageTitle = await page.title();
        console.log(`Page Title: "${pageTitle}"`);

        if (pageTitle.includes("Sign in") || pageTitle.includes("Restricted")) {
            console.log("⚠️ CAUTION: Page might be restricted/login-walled.");
        }

        if (consentButton) {
            console.log("Creating consent cookie...");
            await consentButton.click();
            await page.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => { });
        }

        // Take screenshot for debugging
        await page.screenshot({ path: `debug-puppeteer-${videoId}.png` });

        // Strategy A: Check window.ytInitialPlayerResponse
        try {
            const playerResponse = await page.evaluate(() => {
                // @ts-ignore
                return window.ytInitialPlayerResponse || null;
            });

            if (playerResponse && playerResponse.captions) {
                const tracks = playerResponse.captions.playerCaptionsTracklistRenderer.captionTracks;
                if (tracks && tracks.length > 0) {
                    console.log("Found captions in global variable!");
                    // Fetch the first track URL
                    const trackUrl = tracks[0].baseUrl;
                    const response = await page.evaluate(async (url) => {
                        const r = await fetch(url);
                        return await r.text();
                    }, trackUrl);

                    // Simple XML parse (regex)
                    transcript = response.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
                }
            }
        } catch (e) {
            console.log("Global variable check failed:", e.message);
        }

        // Strategy B: Scrape HTML content directly for captionTracks
        // This works because Puppeteer loads the page even if fetch is blocked
        const html = await page.content();
        const captionMatch = html.match(/"captionTracks":\s*(\[.*?\])/);

        if (captionMatch) {
            console.log("Found captionTracks in HTML!");
            try {
                const tracks = JSON.parse(captionMatch[1]);
                const track = tracks.find(t => t.languageCode === 'en' || t.languageCode.startsWith('en')) || tracks[0];
                if (track) {
                    console.log(`Fetching transcript from: ${track.baseUrl}`);
                    // Use page.evaluate to fetch to preserve cookies/headers
                    const xml = await page.evaluate(async (url) => {
                        const r = await fetch(url);
                        return await r.text();
                    }, track.baseUrl);

                    transcript = xml.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
                }
            } catch (e) {
                console.log("HTML parse error:", e.message);
            }
        } else {
            console.log("No captionTracks found in HTML source.");
        }

        if (!transcript) {
            transcript = await Promise.race([transcriptPromise, timeoutPromise]);
        }

        if (!transcript) {
            console.log("No transcript caught via network or global var.");
        }

    } catch (e) {
        console.error("Puppeteer error:", e.message);
    } finally {
        await browser.close();
    }

    return transcript;
}

async function main() {
    // Only test the user's video for now to be fast
    const t2 = await fetchTranscript(VIDEO_ID_2);
    console.log(`\n\nFINAL RESULT for ${VIDEO_ID_2}:`);
    if (t2) {
        console.log("SUCCESS!");
        console.log("Preview:", t2.substring(0, 200));
    } else {
        console.log("FAILED.");
    }
}

main();
