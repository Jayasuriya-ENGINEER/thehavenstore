// api/get-reviews.js
export default async function handler(req, res) {
  // Allow your React app to fetch this data securely
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");

  // Pulls your secret token securely from Vercel's backend dashboard
  const API_TOKEN = process.env.APIFY_API_TOKEN;

  // Your target store link from the previous step
  const GOOGLE_MAPS_URL = "https://google.com";

  try {
    // 1. Kick off the scraper execution synchronously
    const runResponse = await fetch(`https://apify.com{API_TOKEN}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        startUrls: [{ url: GOOGLE_MAPS_URL }],
        maxReviews: 20,
        sort: "newest",
      }),
    });

    const runData = await runResponse.json();
    const datasetId = runData.data.defaultDatasetId;

    // 2. Fetch the output data containing your live maps feedback
    const datasetResponse = await fetch(
      `https://apify.com{datasetId}/items?token=${API_TOKEN}`,
    );
    const rawReviews = await datasetResponse.json();

    // 3. Format the data to fit your marquee layout properties
    const formattedReviews = rawReviews.map((rev) => ({
      text: rev.text || "Left a rating without a written review.",
      name: rev.name || "Google Local Guide",
      role: rev.publishAt || "Verified Reviewer",
      rating: rev.stars || 5,
    }));

    return res.status(200).json(formattedReviews);
  } catch (error) {
    console.error("Scraper Error:", error);
    return res
      .status(500)
      .json({ error: "Failed to scrape live maps records" });
  }
}
