import { useState, useEffect, useCallback } from "react";

const THEME = {
  bg:          "#080C14",
  bgPanel:     "#0C1220",
  bgCard:      "#0F1628",
  bgHover:     "#141D35",
  border:      "#1C2640",
  borderGlow:  "#2A3A5C",
  textPrimary:    "#E8EAEF",
  textSecondary:  "#7A8BA8",
  textMuted:      "#3A4A65",
  amber:   "#FFAD3B",
  teal:    "#2DD4BF",
  coral:   "#FF6B6B",
  violet:  "#9B8FFF",
  seafoam: "#4EEFC4",
  gold:    "#F5C842",
};

const ASSET_CATEGORIES = {
  EQUITIES:    { color: THEME.seafoam, bg: "rgba(78,239,196,0.07)",   icon: "◈" },
  CRYPTO:      { color: THEME.violet,  bg: "rgba(155,143,255,0.07)",  icon: "◎" },
  FOREX:       { color: THEME.amber,   bg: "rgba(255,173,59,0.07)",   icon: "◉" },
  MACRO:       { color: THEME.teal,    bg: "rgba(45,212,191,0.07)",   icon: "◆" },
  COMMODITIES: { color: THEME.gold,    bg: "rgba(245,200,66,0.07)",   icon: "◇" },
  BREAKING:    { color: THEME.coral,   bg: "rgba(255,107,107,0.10)",  icon: "◉" },
};

const SENTIMENT = {
  BULLISH: { color: THEME.seafoam, bg: "rgba(78,239,196,0.08)",   label: "▲ BULLISH" },
  BEARISH: { color: THEME.coral,   bg: "rgba(255,107,107,0.08)",  label: "▼ BEARISH" },
  NEUTRAL: { color: THEME.textSecondary, bg: "rgba(122,139,168,0.08)", label: "● NEUTRAL" },
};

const TICKER_DATA = [
  { sym: "SPX",     val: "6,632.2", chg: "-0.61%", up: false },
  { sym: "NDX",     val: "22,105",  chg: "-0.93%", up: false },
  { sym: "DJI",     val: "46,558",  chg: "-0.26%", up: false },
  { sym: "BTC/USD", val: "71,799",  chg: "+1.79%", up: true  },
  { sym: "ETH/USD", val: "1,958",   chg: "-0.44%", up: false },
  { sym: "EUR/USD", val: "1.0872",  chg: "-0.31%", up: false },
  { sym: "USD/JPY", val: "159.72",  chg: "+0.23%", up: true  },
  { sym: "USD/SGD", val: "1.3502",  chg: "+0.15%", up: true  },
  { sym: "GOLD",    val: "5,061",   chg: "-1.25%", up: false },
  { sym: "BRENT",   val: "88.40",   chg: "+2.10%", up: true  },
  { sym: "10Y UST", val: "4.285%",  chg: "+2bp",   up: true  },
  { sym: "VIX",     val: "27.19",   chg: "-0.37%", up: false },
  { sym: "DXY",     val: "100.50",  chg: "+0.13%", up: true  },
  { sym: "NIKKEI",  val: "36,940",  chg: "-1.20%", up: false },
];

const DEMO_HEADLINES = [
  { headline: "S&P 500 Slides to 6,632 as Iran War Fears Stoke Inflation Concerns Ahead of Fed", source: "MATCHA WIRE" },
  { headline: "Bitcoin Rebounds to $71,800 as Risk Sentiment Stabilizes; ETH Lags at $1,958", source: "SGX FLASH" },
  { headline: "Brent Crude Holds Above $88 as Strait of Hormuz Disruptions Keep Supply Risk Elevated", source: "ASIA DESK" },
  { headline: "Gold Pulls Back to $5,061/oz After Five-Session Rally; Real Yields Tick Higher", source: "MARKETS NOW" },
  { headline: "Fed Expected to Hold Rates at March Meeting; Dot Plot Signals One Cut in Late 2026", source: "MATCHA WIRE" },
  { headline: "USD/JPY Climbs to 159.72 as BoJ Holds Fire Despite Yen Weakness Pressure", source: "SGX FLASH" },
  { headline: "Nasdaq 100 Falls 0.9% to 22,105 Led by Semis; NVDA Down 2.1% on Supply Chain Fears", source: "ASIA DESK" },
  { headline: "EUR/USD Dips to 1.0872 as ECB Lagarde Signals Caution on Rate Path Amid Oil Shock", source: "MARKETS NOW" },
  { headline: "VIX Holds Elevated at 27.19 as Options Markets Price Continued Iran War Volatility", source: "MATCHA WIRE" },
  { headline: "Alibaba Gains 4.8% After Q4 Beat; Cloud Revenue Up 18% YoY Despite Macro Headwinds", source: "SGX FLASH" },
];

function classifyCategory(h = "") {
  const t = h.toLowerCase();
  if (t.includes("break") || t.includes("flash") || t.includes("urgent")) return "BREAKING";
  if (t.includes("bitcoin") || t.includes("crypto") || t.includes("eth") || t.includes("btc") || t.includes("solana") || t.includes("blockchain")) return "CRYPTO";
  if (t.includes("fed") || t.includes("powell") || t.includes("fomc") || t.includes("gdp") || t.includes("inflation") || t.includes("cpi") || t.includes("ecb") || t.includes("rba")) return "MACRO";
  if (t.includes("eur") || t.includes("jpy") || t.includes("sgd") || t.includes("yuan") || t.includes("forex") || t.includes("dollar") || t.includes("currency") || t.includes("renminbi")) return "FOREX";
  if (t.includes("gold") || t.includes("oil") || t.includes("crude") || t.includes("brent") || t.includes("copper") || t.includes("wheat") || t.includes("lng")) return "COMMODITIES";
  return "EQUITIES";
}

function classifySentiment(h = "") {
  const t = h.toLowerCase();
  const bull = ["surge","rally","gain","jump","rise","beat","exceed","strong","upgrade","bullish","boost","soar","advance","recover","rebound","climb"];
  const bear = ["fall","drop","decline","plunge","miss","weak","cut","warn","sell","bearish","crash","recession","slump","tumble","retreat","slide","slip"];
  const b = bull.filter(w => t.includes(w)).length;
  const r = bear.filter(w => t.includes(w)).length;
  if (b > r) return "BULLISH";
  if (r > b) return "BEARISH";
  return "NEUTRAL";
}

function makeDemoItems() {
  // Shuffle so demo mode shows variety on each refresh
  const shuffled = [...DEMO_HEADLINES].sort(() => Math.random() - 0.5);
  return shuffled.map((d, i) => ({
    id: "demo_" + d.headline.slice(0, 16).replace(/\s/g, "_"),
    headline: d.headline,
    category: classifyCategory(d.headline),
    sentiment: classifySentiment(d.headline),
    timestamp: new Date(Date.now() - i * 48000),
    isNew: i < 3,
    source: d.source,
  }));
}

async function fetchFinnhubNews(apiKey) {
  if (!apiKey || !apiKey.trim()) return makeDemoItems();
  try {
    const res = await fetch(
      `https://finnhub.io/api/v1/news?category=general&token=${apiKey.trim()}`
    );
    if (!res.ok) return makeDemoItems();
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return makeDemoItems();
    const items = data
      .slice(0, 25)
      .map(item => ({
        id: String(item.id || Math.random()),
        headline: item.headline || item.summary || "",
        category: classifyCategory(item.headline || ""),
        sentiment: classifySentiment(item.headline || ""),
        timestamp: item.datetime ? new Date(item.datetime * 1000) : new Date(),
        isNew: true,
        source: (item.source || "WIRE").toUpperCase().slice(0, 22),
      }))
      .filter(n => n.headline.length > 20);
    return items.length > 0 ? items : makeDemoItems();
  } catch (e) {
    console.warn("[Matcha] fetch error:", e.message);
    return makeDemoItems();
  }
}

// ─── TICKER ────────────────────────────────────────────────────────────────
function TickerTape() {
  const items = [...TICKER_DATA, ...TICKER_DATA, ...TICKER_DATA];
  return (
    <div style={{ background: THEME.bgPanel, borderBottom: `1px solid ${THEME.border}`, overflow: "hidden", height: "30px", display: "flex", alignItems: "center", position: "relative" }}>
      <div style={{ position:"absolute", left:0, top:0, bottom:0, width:"50px", background:`linear-gradient(to right,${THEME.bgPanel},transparent)`, zIndex:2, pointerEvents:"none" }} />
      <div style={{ position:"absolute", right:0, top:0, bottom:0, width:"50px", background:`linear-gradient(to left,${THEME.bgPanel},transparent)`, zIndex:2, pointerEvents:"none" }} />
      <div style={{ display:"flex", animation:"ticker 50s linear infinite", whiteSpace:"nowrap" }}>
        {items.map((item, i) => (
          <span key={i} style={{ display:"inline-flex", alignItems:"center", gap:"6px", padding:"0 18px", borderRight:`1px solid ${THEME.border}`, fontFamily:"'Syne',sans-serif", fontSize:"11px", letterSpacing:"0.04em" }}>
            <span style={{ color: THEME.textMuted, fontSize:"10px" }}>{item.sym}</span>
            <span style={{ color: THEME.textPrimary, fontWeight:600 }}>{item.val}</span>
            <span style={{ color: item.up ? THEME.seafoam : THEME.coral, fontSize:"10px" }}>{item.chg}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── BREAKING BANNER ───────────────────────────────────────────────────────
function BreakingBanner({ item, onDismiss }) {
  if (!item) return null;
  return (
    <div style={{ background:"linear-gradient(135deg,rgba(255,107,107,0.13),rgba(255,107,107,0.04))", border:`1px solid rgba(255,107,107,0.25)`, borderLeft:`3px solid ${THEME.coral}`, margin:"10px 16px", padding:"11px 14px", borderRadius:"4px", display:"flex", alignItems:"flex-start", gap:"12px", animation:"breakingSlide 0.4s ease" }}>
      <span style={{ width:"8px", height:"8px", borderRadius:"50%", background:THEME.coral, display:"inline-block", animation:"pulse 0.9s infinite", flexShrink:0, marginTop:"4px" }} />
      <span style={{ fontFamily:"'Syne',sans-serif", fontSize:"9px", fontWeight:700, color:THEME.coral, letterSpacing:"0.15em", flexShrink:0, marginTop:"2px" }}>BREAKING</span>
      <span style={{ fontFamily:"'Lora',serif", fontSize:"13px", color:"#FFD0D0", lineHeight:"1.55", flex:1, fontStyle:"italic" }}>{item.headline}</span>
      <button onClick={onDismiss} style={{ background:"transparent", border:"none", color:THEME.textMuted, cursor:"pointer", fontSize:"13px", flexShrink:0, padding:"0 2px" }}>✕</button>
    </div>
  );
}

// ─── NEWS CARD ─────────────────────────────────────────────────────────────
function NewsCard({ item }) {
  const cat = ASSET_CATEGORIES[item.category] || ASSET_CATEGORIES.EQUITIES;
  const sent = SENTIMENT[item.sentiment];
  const age = Math.floor((new Date() - item.timestamp) / 1000);
  const ageStr = age < 60 ? `${age}s ago` : age < 3600 ? `${Math.floor(age/60)}m ago` : `${Math.floor(age/3600)}h ago`;

  return (
    <div
      style={{ padding:"12px 18px 12px 20px", borderBottom:`1px solid ${THEME.border}`, background: item.isNew ? THEME.bgCard : "transparent", animation: item.isNew ? "cardIn 0.5s ease" : "none", display:"flex", gap:"12px", alignItems:"flex-start", cursor:"pointer", transition:"background 0.2s", borderLeft: item.category === "BREAKING" ? `2px solid ${THEME.coral}` : "2px solid transparent" }}
      onMouseEnter={e => e.currentTarget.style.background = THEME.bgHover}
      onMouseLeave={e => e.currentTarget.style.background = item.isNew ? THEME.bgCard : "transparent"}
    >
      <div style={{ flexShrink:0, display:"flex", flexDirection:"column", gap:"5px", alignItems:"center", width:"84px", marginTop:"2px" }}>
        <span style={{ padding:"2px 6px", background:cat.bg, border:`1px solid ${cat.color}28`, borderRadius:"2px", fontFamily:"'Syne',sans-serif", fontSize:"8.5px", color:cat.color, letterSpacing:"0.04em", fontWeight:"700", width:"100%", textAlign:"center", whiteSpace:"nowrap", overflow:"hidden" }}>
          {cat.icon} {item.category}
        </span>
        <span style={{ padding:"2px 5px", background:sent.bg, borderRadius:"2px", fontFamily:"'Syne',sans-serif", fontSize:"8px", color:sent.color, letterSpacing:"0.06em", fontWeight:"600", width:"100%", textAlign:"center" }}>
          {sent.label}
        </span>
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <p style={{ fontFamily:"'Lora',serif", fontSize:"13.5px", color: item.category === "BREAKING" ? "#FFD0D0" : THEME.textPrimary, lineHeight:"1.6", margin:0, fontStyle: item.category === "BREAKING" ? "italic" : "normal" }}>
          {item.headline}
        </p>
        <div style={{ display:"flex", gap:"8px", marginTop:"5px", fontFamily:"'Syne',sans-serif", fontSize:"9.5px", color:THEME.textMuted, letterSpacing:"0.05em" }}>
          <span style={{ color:THEME.amber, fontWeight:600 }}>{item.source}</span>
          <span>·</span>
          <span>{ageStr}</span>
        </div>
      </div>
    </div>
  );
}

// ─── CITY GLOW ─────────────────────────────────────────────────────────────
function CityGlow() {
  return (
    <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0, overflow:"hidden" }}>
      <div style={{ position:"absolute", bottom:0, left:"50%", transform:"translateX(-50%)", width:"150%", height:"50%", background:"radial-gradient(ellipse at 50% 100%,rgba(255,140,30,0.07) 0%,transparent 70%)" }} />
      <div style={{ position:"absolute", top:0, left:"50%", transform:"translateX(-50%)", width:"100%", height:"55%", background:"radial-gradient(ellipse at 50% 0%,rgba(60,35,110,0.13) 0%,transparent 70%)" }} />
      <div style={{ position:"absolute", bottom:"15%", left:"-5%", width:"45%", height:"35%", background:"radial-gradient(ellipse at 0% 100%,rgba(45,212,191,0.04) 0%,transparent 70%)" }} />
    </div>
  );
}

// ─── API KEY ENTRY SCREEN ──────────────────────────────────────────────────
function KeyEntryScreen({ onConnect }) {
  const [val, setVal] = useState("");
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", flex:1, gap:"20px", padding:"32px 24px" }}>
      <div style={{ fontFamily:"'Syne',sans-serif", fontSize:"11px", color:THEME.amber, letterSpacing:"0.2em", fontWeight:700 }}>
        WIRE SERVICE SETUP
      </div>
      <div style={{ fontFamily:"'Lora',serif", fontSize:"13px", color:THEME.textSecondary, textAlign:"center", lineHeight:1.8, maxWidth:"320px", fontStyle:"italic" }}>
        Enter your free Finnhub API key to connect to live financial news.
        Get one in 30 seconds at{" "}
        <a href="https://finnhub.io" target="_blank" rel="noreferrer" style={{ color:THEME.amber, textDecoration:"none" }}>finnhub.io</a>
        {" "}— no credit card required.
      </div>
      <div style={{ display:"flex", gap:"8px", width:"100%", maxWidth:"400px" }}>
        <input
          type="text"
          placeholder="Paste Finnhub API key..."
          value={val}
          onChange={e => setVal(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") onConnect(val); }}
          style={{ flex:1, background:THEME.bgCard, border:`1px solid ${THEME.borderGlow}`, borderRadius:"3px", padding:"9px 12px", fontFamily:"'IBM Plex Mono',monospace", fontSize:"11px", color:THEME.textPrimary, outline:"none", letterSpacing:"0.04em" }}
        />
        <button
          onClick={() => onConnect(val)}
          style={{ background:"transparent", border:`1px solid ${THEME.amber}`, borderRadius:"3px", padding:"9px 16px", fontFamily:"'Syne',sans-serif", fontSize:"10px", fontWeight:700, color:THEME.amber, cursor:"pointer", letterSpacing:"0.1em", whiteSpace:"nowrap" }}
        >
          CONNECT →
        </button>
      </div>
      <button
        onClick={() => onConnect("")}
        style={{ background:"transparent", border:"none", fontFamily:"'Syne',sans-serif", fontSize:"9px", color:THEME.teal, cursor:"pointer", letterSpacing:"0.08em", textDecoration:"underline" }}
      >
        Skip — load demo headlines instead
      </button>
    </div>
  );
}

// ─── MAIN TERMINAL ─────────────────────────────────────────────────────────
export default function MatchaTerminal() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [filter, setFilter] = useState("ALL");
  const [countdown, setCountdown] = useState(60);
  const [breakingItem, setBreakingItem] = useState(null);
  const [clock, setClock] = useState(new Date());
  const [apiKey, setApiKey] = useState(null); // null = not yet set

  const refresh = useCallback(async () => {
    setLoading(true);
    const fresh = await fetchFinnhubNews(apiKey);
    setNews(prev => {
      const existingIds = new Set(prev.map(n => n.id));
      // Mark truly new items
      const tagged = fresh.map(n => ({ ...n, isNew: !existingIds.has(n.id) }));
      // Merge: new items first, then old ones (mark old as not new), dedupe by id
      const merged = [...tagged, ...prev.map(n => ({ ...n, isNew: false }))];
      const seen = new Set();
      const deduped = merged.filter(n => {
        if (seen.has(n.id)) return false;
        seen.add(n.id);
        return true;
      });
      // Surface breaking alert only for genuinely new items
      const brk = tagged.find(n => n.isNew && n.category === "BREAKING");
      if (brk) setBreakingItem(brk);
      return deduped.slice(0, 80);
    });
    setLastUpdate(new Date());
    setCountdown(60);
    setLoading(false);
  }, [apiKey]);

  // Start fetching once apiKey is set
  useEffect(() => {
    if (apiKey === null) return;
    refresh();
    const iv = setInterval(refresh, 60000);
    return () => clearInterval(iv);
  }, [refresh, apiKey]);

  useEffect(() => {
    const t = setInterval(() => setCountdown(c => c <= 1 ? 60 : c - 1), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const filtered = filter === "ALL" ? news : news.filter(n => n.category === filter);
  const sgTime = clock.toLocaleTimeString("en-SG", { hour12:false, timeZone:"Asia/Singapore" });
  const nyTime = clock.toLocaleTimeString("en-US", { hour12:false, timeZone:"America/New_York" });
  const sentCounts = {
    BULLISH: news.filter(n => n.sentiment === "BULLISH").length,
    BEARISH: news.filter(n => n.sentiment === "BEARISH").length,
    NEUTRAL: news.filter(n => n.sentiment === "NEUTRAL").length,
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Lora:ital,wght@0,400;0,500;1,400&family=IBM+Plex+Mono:wght@400;500&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        html,body{background:${THEME.bg};height:100%;}
        ::-webkit-scrollbar{width:3px;}
        ::-webkit-scrollbar-track{background:${THEME.bg};}
        ::-webkit-scrollbar-thumb{background:${THEME.border};border-radius:2px;}
        @keyframes ticker{0%{transform:translateX(0)}100%{transform:translateX(-33.333%)}}
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.3;transform:scale(0.8)}}
        @keyframes cardIn{from{opacity:0;transform:translateX(-6px);background:rgba(78,239,196,0.07)}to{opacity:1;transform:translateX(0)}}
        @keyframes breakingSlide{from{opacity:0;transform:translateY(-5px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes shimmer{0%,100%{opacity:0.5}50%{opacity:1}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
      `}</style>

      <div style={{ background:THEME.bg, minHeight:"100vh", display:"flex", flexDirection:"column", position:"relative", fontFamily:"'Syne',sans-serif" }}>
        <CityGlow />

        {/* HEADER */}
        <div style={{ position:"relative", zIndex:10, padding:"10px 16px", background:`linear-gradient(to bottom,${THEME.bgPanel},${THEME.bg}88)`, borderBottom:`1px solid ${THEME.border}`, backdropFilter:"blur(8px)" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:"8px" }}>
            <div style={{ display:"flex", alignItems:"baseline", gap:"10px" }}>
              <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"18px", letterSpacing:"0.2em", background:`linear-gradient(135deg,${THEME.amber},${THEME.gold})`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>MATCHA</span>
              <span style={{ fontSize:"8px", color:THEME.textMuted, letterSpacing:"0.18em", fontWeight:600 }}>FINANCIAL INTELLIGENCE · SGP</span>
            </div>
            <div style={{ display:"flex", gap:"12px", alignItems:"center" }}>
              <div style={{ fontSize:"10px", color:THEME.textSecondary, letterSpacing:"0.07em", lineHeight:1.6, textAlign:"right" }}>
                <div><span style={{ color:THEME.amber }}>SGT </span>{sgTime}</div>
                <div><span style={{ color:THEME.textMuted }}>EST </span>{nyTime}</div>
              </div>
              {apiKey !== null && (
                <button onClick={refresh} disabled={loading} style={{ background:"transparent", border:`1px solid ${loading ? THEME.border : THEME.borderGlow}`, borderRadius:"3px", padding:"6px 12px", fontFamily:"'Syne',sans-serif", fontSize:"10px", fontWeight:600, color: loading ? THEME.textMuted : THEME.amber, cursor: loading ? "not-allowed" : "pointer", letterSpacing:"0.08em", display:"flex", alignItems:"center", gap:"5px", whiteSpace:"nowrap" }}>
                  <span style={{ display:"inline-block", animation:loading ? "spin 0.8s linear infinite" : "none" }}>↻</span>
                  {loading ? "SYNCING" : `${countdown}s`}
                </button>
              )}
            </div>
          </div>
          {apiKey !== null && (
            <div style={{ display:"flex", gap:"14px", fontSize:"10px", letterSpacing:"0.06em", marginTop:"6px" }}>
              <span style={{ color:THEME.seafoam }}>▲ {sentCounts.BULLISH} BULLISH</span>
              <span style={{ color:THEME.coral }}>▼ {sentCounts.BEARISH} BEARISH</span>
              <span style={{ color:THEME.textMuted }}>● {sentCounts.NEUTRAL} NEUTRAL</span>
            </div>
          )}
        </div>

        {/* TICKER */}
        <div style={{ position:"relative", zIndex:10 }}><TickerTape /></div>

        {/* STATUS BAR */}
        {apiKey !== null && (
          <div style={{ position:"relative", zIndex:10, padding:"5px 20px", background:THEME.bgPanel, borderBottom:`1px solid ${THEME.border}`, display:"flex", justifyContent:"space-between", fontSize:"9.5px", color:THEME.textMuted, letterSpacing:"0.08em" }}>
            <div style={{ display:"flex", gap:"14px", alignItems:"center" }}>
              <span style={{ color: loading ? THEME.amber : THEME.seafoam, animation: loading ? "shimmer 1s infinite" : "none" }}>
                {loading ? "⟳ FETCHING WIRE" : "● LIVE FEED"}
              </span>
              <span style={{ color:THEME.border }}>|</span>
              <span>EQUITIES · CRYPTO · FOREX · COMMODITIES</span>
            </div>
            <div>{lastUpdate && `LAST SYNC ${lastUpdate.toLocaleTimeString()} · `}{news.length} ITEMS</div>
          </div>
        )}

        {/* FILTER BAR */}
        {apiKey !== null && (
          <div style={{ position:"relative", zIndex:10, padding:"8px 20px", background:THEME.bg, borderBottom:`1px solid ${THEME.border}`, display:"flex", gap:"5px", flexWrap:"wrap" }}>
            {["ALL", ...Object.keys(ASSET_CATEGORIES)].map(cat => {
              const active = filter === cat;
              const col = cat === "ALL" ? THEME.textSecondary : ASSET_CATEGORIES[cat]?.color;
              const cnt = cat === "ALL" ? news.length : news.filter(n => n.category === cat).length;
              return (
                <button key={cat} onClick={() => setFilter(cat)} style={{ background: active ? (cat === "ALL" ? "rgba(122,139,168,0.1)" : ASSET_CATEGORIES[cat]?.bg) : "transparent", border:`1px solid ${active ? col + "55" : THEME.border}`, borderRadius:"3px", padding:"3px 10px", fontFamily:"'Syne',sans-serif", fontSize:"9px", fontWeight: active ? 700 : 400, color: active ? col : THEME.textMuted, cursor:"pointer", letterSpacing:"0.1em", display:"flex", gap:"5px", alignItems:"center", transition:"all 0.15s" }}>
                  {cat}
                  <span style={{ background: active ? col + "22" : THEME.border, borderRadius:"10px", padding:"0 5px", fontSize:"8px", color: active ? col : THEME.textMuted }}>{cnt}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* BREAKING BANNER */}
        {apiKey !== null && (
          <div style={{ position:"relative", zIndex:10 }}>
            <BreakingBanner item={breakingItem} onDismiss={() => setBreakingItem(null)} />
          </div>
        )}

        {/* FEED / KEY ENTRY */}
        <div style={{ position:"relative", zIndex:10, flex:1, overflowY:"auto", display:"flex", flexDirection:"column" }}>
          {apiKey === null ? (
            <KeyEntryScreen onConnect={key => setApiKey(key)} />
          ) : loading && news.length === 0 ? (
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", flex:1, gap:"20px" }}>
              <div style={{ width:"34px", height:"34px", border:`2px solid ${THEME.border}`, borderTop:`2px solid ${THEME.amber}`, borderRadius:"50%", animation:"spin 0.9s linear infinite" }} />
              <div style={{ fontFamily:"'Syne',sans-serif", fontSize:"10px", color:THEME.textMuted, letterSpacing:"0.18em", animation:"shimmer 1.5s infinite" }}>CONNECTING TO WIRE SERVICES...</div>
              <div style={{ fontFamily:"'Lora',serif", fontSize:"12px", color:THEME.textMuted, fontStyle:"italic", opacity:0.4 }}>Marina Bay · Singapore</div>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding:"40px", textAlign:"center", fontFamily:"'Syne',sans-serif", fontSize:"10px", color:THEME.textMuted, letterSpacing:"0.12em" }}>NO ITEMS IN THIS CATEGORY</div>
          ) : (
            filtered.map((item, i) => (
              <div key={item.id} style={{ animation:`fadeUp 0.32s ease ${Math.min(i * 0.04, 0.5)}s both` }}>
                <NewsCard item={item} />
              </div>
            ))
          )}
        </div>

        {/* FOOTER */}
        <div style={{ position:"relative", zIndex:10, padding:"6px 20px", background:THEME.bgPanel, borderTop:`1px solid ${THEME.border}`, display:"flex", justifyContent:"space-between", fontSize:"9px", color:THEME.textMuted, letterSpacing:"0.08em" }}>
          <span>FOR INFORMATIONAL PURPOSES ONLY · NOT INVESTMENT ADVICE</span>
          <span style={{ color:THEME.amber, opacity:0.5 }}>MATCHA FINANCIAL SYSTEMS · SINGAPORE © 2026</span>
        </div>
      </div>
    </>
  );
}
