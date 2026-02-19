
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);
const VIDEO_ID = "jNQXAC9IVRw"; // Me at the zoo

async function main() {
    console.log("Testing Python script integration...");
    try {
        const { stdout, stderr } = await execAsync(`python scripts/fetch_transcript.py ${VIDEO_ID}`);

        if (stderr) {
            console.error("Stderr:", stderr);
        }

        if (stdout && stdout.trim().length > 50) {
            console.log("✅ Success! Transcript fetched via Python.");
            console.log("Preview:", stdout.substring(0, 100));
        } else {
            console.log("❌ Failed. Stdout empty or too short.");
            console.log("Stdout:", stdout);
        }

    } catch (e: any) {
        console.error("❌ Execution failed:", e.message);
    }
}

main();
