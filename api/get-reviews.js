const APIFY_TOKEN = process.env.APIFY_API_TOKEN;
const ACTOR_ID = "Xb8osYTtOjlsgI6k9";

// Google Maps place information
const INPUT = {
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
};

// ========================================================
// FALLBACK REVIEWS
// These are shown if Apify is unavailable.
// ========================================================

const fallbackReviews = [
  {
    name: "Rahul Sharma",
    role: "Business Owner",
    text: "Excellent fabric quality and premium printing. Delivery was on time and exactly as promised.",
    rating: 5,
    photo: null,
  },
  {
    name: "Priya Verma",
    role: "School Coordinator",
    text: "The uniforms exceeded our expectations. Great quality and very professional service.",
    rating: 5,
    photo: null,
  },
  {
    name: "Arjun Mehta",
    role: "Startup Founder",
    text: "Amazing customer support. The team helped us from design to delivery.",
    rating: 5,
    photo: null,
  },
  {
    name: "Sneha Kapoor",
    role: "Event Organizer",
    text: "Fast delivery, affordable pricing and beautiful print quality.",
    rating: 5,
    photo: null,
  },
  {
    name: "Vikram Singh",
    role: "Gym Owner",
    text: "Ordered custom gym t-shirts and everyone loved them. Highly recommended.",
    rating: 5,
    photo: null,
  },
  {
    name: "Ananya Gupta",
    role: "College Club",
    text: "Very smooth ordering process. Will definitely order again.",
    rating: 5,
    photo: null,
  },
];

// ========================================================
// API
// ========================================================

export default async function handler(req, res) {
  // Allow Vercel CDN to cache for 6 hours
  res.setHeader(
    "Cache-Control",
    "s-maxage=21600, stale-while-revalidate=86400",
  );

  // If token missing → fallback
  if (!APIFY_TOKEN) {
    return res.status(200).json(fallbackReviews);
  }

  try {
    const response = await fetch(
      `https://api.apify.com/v2/acts/${ACTOR_ID}/run-sync-get-dataset-items?token=${APIFY_TOKEN}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(INPUT),
      },
    );

    if (!response.ok) {
      throw new Error(await response.text());
    }

    const reviews = await response.json();

    if (!Array.isArray(reviews)) {
      return res.status(200).json(fallbackReviews);
    }

    const formatted = reviews

      // only 4★ and above
      .filter((review) => review.stars >= 4)

      // remove empty reviews
      .filter((review) => review.text)

      .map((review) => ({
        name: review.name,

        text: review.text,

        rating: review.stars,

        role: review.publishAt,

        photo: review.reviewerPhotoUrl,

        reviewUrl: review.reviewUrl,
      }));

    if (formatted.length === 0) {
      return res.status(200).json(fallbackReviews);
    }

    return res.status(200).json(formatted);
  } catch (err) {
    console.error("Apify Error:", err);

    return res.status(200).json(fallbackReviews);
  }
}
