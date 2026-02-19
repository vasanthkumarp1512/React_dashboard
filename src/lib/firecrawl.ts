
export async function deepSearch(query: string) {
    const apiKey = process.env.FIRECRAWL_API_KEY;
    if (!apiKey) {
        console.error("Firecrawl API key missing");
        return null;
    }

    try {
        const response = await fetch("https://api.firecrawl.dev/v0/search", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                query: query,
                searchOptions: {
                    limit: 5 // Get top 5 results
                },
                pageOptions: {
                    fetchPageContent: true // Get content for RAG
                }
            })
        });

        if (!response.ok) {
            console.error(`Firecrawl error: ${response.statusText}`);
            return null;
        }

        const data = await response.json();
        return data.data || [];
    } catch (error) {
        console.error("Deep search failed:", error);
        return null;
    }
}
