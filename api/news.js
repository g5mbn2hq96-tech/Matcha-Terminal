export default async function handler(req, res) {
  const { token } = req.query;
  if (!token) return res.status(400).json({ error: "Missing token" });
  try {
    const r = await fetch(
      "https://finnhub.io/api/v1/news?category=general&token=" + token
    );
    const data = await r.json();
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
