# 🍵 Matcha Terminal

A Bloomberg-style real-time financial news terminal powered by Finnhub.

---

## Deploy to Vercel (recommended)

```bash
npm install -g vercel
vercel
```

That's it. Vercel auto-detects the `vercel.json` config and deploys in ~30 seconds.
You'll get a live URL like `matcha-terminal.vercel.app`.

### Add to iPad Home Screen
1. Open the Vercel URL in Safari on your iPad
2. Tap the **Share** button → **Add to Home Screen**
3. Matcha launches fullscreen like a native app

---

## Local development

```bash
npm install
npm run dev
# open http://localhost:5173
```

### Run on iPad over local network
1. Run `npm run dev` on your Mac
2. Find your Mac's IP: System Preferences → Network
3. Open `http://192.168.x.x:5173` in Safari on your iPad
   (both devices must be on the same WiFi)

---

## Get a free Finnhub API key
1. Go to **https://finnhub.io**
2. Click "Get free API key" — no credit card required
3. Paste the key into the terminal on first launch
