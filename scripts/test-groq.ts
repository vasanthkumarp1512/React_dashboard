
import Groq from "groq-sdk";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function run() {
    console.log("Testing Groq API...");
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
        console.error("No GROQ_API_KEY found.");
        process.exit(1);
    }

    try {
        const groq = new Groq({ apiKey });
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "user",
                    content: "Hello, say 'Groq is working' if you can hear me."
                }
            ],
            model: "llama3-8b-8192",
        });

        console.log("Response:", completion.choices[0]?.message?.content);
    } catch (e: any) {
        console.error("Groq error:", e);
    }
}

run();
