export default async function handler(req, res) {
  const API_TOKEN = process.env.APIFY_API_TOKEN;
  const ACTOR_ID = "Xb8osYTtOjlsgI6k9";

  try {
    const response = await fetch(
      `https://api.apify.com/v2/actors/${ACTOR_ID}/run-sync-get-dataset-items?token=${API_TOKEN}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          language: "en",
          maxReviews: 12,
          personalData: true,
          placeIds: ["ChIJW2u3OCBxdDkR9MlpYndVw-E"],
          reviewsOrigin: "all",
          reviewsSort: "newest",
          startUrls: [
            {
              url: "https://www.google.com/maps/place/The+Haven+Store/@28.6897091,77.4910126,17z/data=!4m6!3m5!1s0x390cf18d28286e85:0x4ebba7d0741b49a0!8m2!3d28.6897292!4d77.4910661!16s%2Fg%2F11lcyzvxjr!18m1!1e1",
            },
          ],
        }),
      },
    );

    if (!response.ok) {
      const error = await response.text();

      return res.status(response.status).json({
        success: false,
        error,
      });
    }

    const data = await response.json();

    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
}
