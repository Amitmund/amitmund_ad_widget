(function () {
  const CONFIG_URL =
    "https://cdn.jsdelivr.net/gh/Amitmund/amitmund_ad_widget/config.json";

  // -----------------------------
  // Prevent duplicate injection
  // -----------------------------
  if (window.__AD_RAIL_LOADED__) return;
  window.__AD_RAIL_LOADED__ = true;

  // -----------------------------
  // Safe init
  // -----------------------------
  function init() {
    console.log("AD WIDGET LOADED");

    loadConfig()
      .then(config => {
        if (!Array.isArray(config?.ads) || config.ads.length === 0) return;
        buildWidget(config);
      })
      .catch(err => {
        console.error("AD WIDGET ERROR:", err);
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  // -----------------------------
  // Safe config loader
  // -----------------------------
  async function loadConfig() {
    try {
      const res = await fetch(CONFIG_URL, { cache: "no-store" });
      if (!res.ok) throw new Error("HTTP " + res.status);
      return await res.json();
    } catch (e) {
      console.error("Config load failed:", e);
      return null;
    }
  }

  // -----------------------------
  // Build widget
  // -----------------------------
  function buildWidget(config) {
    injectStyles();

    const rail = document.createElement("div");
    rail.id = "ad-rail";

    const track = document.createElement("div");
    track.className = "ad-track";

    rail.appendChild(track);

    // Safe append (body fallback included)
    (document.body || document.documentElement).appendChild(rail);

    const cards = config.ads.map(createCard);

    // Add originals
    cards.forEach(c => track.appendChild(c));

    // Safe clone (no innerHTML hack)
    cards.forEach(c => track.appendChild(c.cloneNode(true)));

    startScroll(track, rail, config.scrollSpeed || 1);
  }

  // -----------------------------
  // Create ad card
  // -----------------------------
  function createCard(ad) {
    const a = document.createElement("a");

    a.className = `ad-card ${ad.template || "promo"}`;
    a.href = ad.url || "#";
    a.target = "_blank";
    a.rel = "noopener noreferrer";

    a.innerHTML = `
      <img class="ad-img" src="${ad.image}" 
           onerror="this.src='https://via.placeholder.com/56?text=Ad'" />
      <div class="ad-body">
        <div class="ad-title">${ad.title || ""}</div>
        <div class="ad-msg">${ad.message || ""}</div>
      </div>
    `;

    return a;
  }

  // -----------------------------
  // Scroll engine
  // -----------------------------
  function startScroll(track, rail, speed) {
    let x = 0;
    let paused = false;
    let raf;

    rail.addEventListener("mouseenter", () => (paused = true));
    rail.addEventListener("mouseleave", () => (paused = false));

    function animate() {
      if (!paused) {
        x -= speed;

        const half = track.scrollWidth / 2;

        if (Math.abs(x) >= half) {
          x = 0;
        }

        track.style.transform = `translateX(${x}px)`;
      }

      raf = requestAnimationFrame(animate);
    }

    animate();
  }

  // -----------------------------
  // Styles (safe inject once)
  // -----------------------------
  function injectStyles() {
    if (document.getElementById("ad-rail-style")) return;

    const style = document.createElement("style");
    style.id = "ad-rail-style";

    style.innerHTML = `
      #ad-rail {
        position: fixed;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 100px;
        overflow: hidden;
        background: #fff;
        z-index: 2147483647;
        box-shadow: 0 -2px 10px rgba(0,0,0,0.12);
      }

      .ad-track {
        display: flex;
        gap: 12px;
        width: max-content;
        align-items: center;
        padding: 10px;
        will-change: transform;
      }

      .ad-card {
        display: flex;
        align-items: center;
        width: 240px;
        height: 80px;
        flex-shrink: 0;
        border-radius: 10px;
        overflow: hidden;
        text-decoration: none;
        font-family: Arial, sans-serif;
        color: #111;
        background: #f7f7f7;
      }

      .ad-img {
        width: 56px;
        height: 56px;
        object-fit: cover;
        border-radius: 8px;
        margin: 0 10px;
      }

      .ad-body {
        display: flex;
        flex-direction: column;
        justify-content: center;
        overflow: hidden;
      }

      .ad-title {
        font-size: 13px;
        font-weight: 600;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .ad-msg {
        font-size: 11px;
        opacity: 0.75;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .positive {
        border-left: 6px solid #16a34a;
        background: linear-gradient(90deg, #ecfdf5, #ffffff);
      }
      
      .negative {
        border-left: 6px solid #dc2626;
        background: linear-gradient(90deg, #fef2f2, #ffffff);
        position: relative;
      }
      
      .negative::after {
        content: "⚠";
        position: absolute;
        top: 6px;
        right: 10px;
        font-size: 14px;
      }
      
      .promo {
        border-left: 6px solid #2563eb;
        background: linear-gradient(90deg, #eff6ff, #ffffff);
      }


    `;

    document.head.appendChild(style);
  }
})();
