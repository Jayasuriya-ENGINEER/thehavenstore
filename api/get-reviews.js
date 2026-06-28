// pages/api/get-reviews.js

const fallbackTestimonials = [
  {
    text: "The quality exceeded our expectations. The custom apparel was perfect.",
    name: "Sarah Johnson",
    role: "Verified Client",
    rating: 5,
  },
];

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "application/json");

  const API_TOKEN = process.env.APIFY_API_TOKEN;

  // Check whether the environment variable is available
  if (!API_TOKEN) {
    return res.status(500).json({
      success: false,
      error: "APIFY_API_TOKEN is missing",
    });
  }

  // For now, just verify the API route works
  return res.status(200).json({
    success: true,
    message: "API route is working",
    tokenFound: true,
  });
}
