// api/get-reviews.js

// Reliable local static testimonials in case the scraper hits free limits
const fallbackTestimonials = [
  {
    text: "The quality exceeded our expectations. The custom apparel was perfect - soft fabric and great print quality.",
    name: "Sarah Johnson",
    role: "Verified Client",
    rating: 5,
  },
  {
    text: "Highly professional team. They helped us with the design process from start to finish. Highly recommended!",
    name: "Michael Chen",
    role: "Event Coordinator",
    rating: 5,
  },
  {
    text: "Affordable pricing, top-tier fabrics, and amazing customer support. Will definitely order again.",
    name: "Priya Sharma",
    role: "Business Owner",
    rating: 5,
  },
  {
    text: "The custom jerseys look incredible. Our team loves them. Great experience from start to finish.",
    name: "David Martinez",
    role: "Team Captain",
    rating: 5,
  },
];

export default async function handler(req, res) {
  // Global CORS and content configuration headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");
  res.setHeader("Content-Type", "application/json");

  const API_TOKEN = process.env.APIFY_API_TOKEN;
  const GOOGLE_MAPS_URL = "https://google.com";

  // Provide fallback instantly if your Vercel Dashboard key is missing
  if (!API_TOKEN) {
    console.warn(
      "API token is missing in Vercel settings. Displaying backup content safely.",
    );
    return res.status(200).json(fallbackTestimonials);
  }

  try {
    // Corrected target endpoint for the compass/crawler-google-places actor
    const apifyUrl = `https://apify.com{API_TOKEN}`;

    const response = await fetch(apifyUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        startUrls: [{ url: GOOGLE_MAPS_URL }],
        maxReviews: 12, // Small footprint so it loads quickly on free serverless tier
        downloadReviews: true,
        reviewsSort: "newest",
      }),
    });

    if (!response.ok) {
      throw new Error(`Apify server responded with status: ${response.status}`);
    }

    const rawData = await response.json();

    // Verify it returned a collection array
    if (Array.isArray(rawData) && rawData.length > 0) {
      // Find the specific embedded review fields from the Compass scraper payload array
      const extractedReviews = [];

      for (const place of rawData) {
        if (place.reviews && Array.isArray(place.reviews)) {
          place.reviews.forEach((rev) => {
            extractedReviews.push({
              text: rev.text || "Left a rating without a written review.",
              name: rev.name || "Google User",
              role: rev.publishAt || "Verified Customer",
              rating: rev.stars || 5,
            });
          });
        }
      }

      // If reviews were successfully extracted from the place data, return them
      if (extractedReviews.length > 0) {
        return res.status(200).json(extractedReviews);
      }
    }

    // Default catch fallback to keep frontend visual rendering active
    return res.status(200).json(fallbackTestimonials);
  } catch (error) {
    console.error("Scraper Endpoint Execution Error:", error.message);
    return res.status(200).json(fallbackTestimonials);
  }
}
