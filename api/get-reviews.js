export default async function handler(req, res) {
  const API_TOKEN = process.env.APIFY_API_TOKEN;

  try {
    const response = await fetch(
      `https://api.apify.com/v2/users/me?token=${API_TOKEN}`,
    );

    const data = await response.json();

    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({
      error: err.message,
    });
  }
}
