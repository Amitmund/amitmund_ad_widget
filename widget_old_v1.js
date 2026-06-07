(function () {
  const CONFIG_URL =
    "https://cdn.jsdelivr.net/gh/Amitmund/amitmund_ad_widget/config.json";

  // -----------------------------
  // Prevent duplicate injection
  // -----------------------------
  if (window.__AD_RAIL_LOADED__) return;
  window.__AD_RAIL_LOADED__ = true;

  // -----------------------------
  // Init wrapper (DOM safe)
  // -----------------------------
  function init() {
    console.log("AD WIDGET LOADED");

    loadConfig()
      .then(config => {
        if (!config || !config.ads || !config.ads.length) return;
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
  // Load config safely
  // -----------------------------
  async function loadConfig() {
    const res = await fetch(CONFIG_URL, { cache: "no-cache" });
    if (!res.ok) throw new Error("Config load failed");
    return await res.json();
  }

  // -----------------------------
  // Build entire widget
  // -----------------------------
  function buildWidget(config) {
    injectStyles();

    const rail = document.createElement("div");
    rail.id = "ad-rail";

    const track = document.createElement("div");
    track.className = "ad-track";

    rail.appendChild(track);
    document.body.appendChild(rail);

    // Build cards
    const cards = config.ads.map(createCard);

    // Append original
    cards.forEach(c => track.appendChild(c));

    // Safe duplication (no innerHTML hack)
    cards.forEach(c => {
      track.appendChild(c.cloneNode(true));
    });

    startScroll(track, rail, config.scrollSpeed || 1);
  }

  // -----------------------------
  // Create single card
  // -----------------------------
  function createCard(ad) {
    const a = document.createElement("a");

    a.className = `ad-card ${ad.template || "promo"}`;
    a.href = ad.url || "#";
    a.target = "_blank";

    a.innerHTML = `
      <img class="ad-img" src="${ad.image}" 
           onerror="this.style.display='none'" />
      <div class="ad-body">
        <div class="ad-title">${ad.title || ""}</div>
        <div class="ad-msg">${ad.message || ""}</div>
      </div>
    `;

    return a;
  }

  // -----------------------------
  // Smooth scroll engine
  // -----------------------------
  function startScroll(track, rail, speed) {
    let x = 0;
    let paused = false;

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

      requestAnimationFrame(animate);
    }

    animate();
  }

  // -----------------------------
  // Inject styles (isolated)
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
        flex-direction: row;
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
        line-height: 1.2;
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

      .positive { border-left: 4px solid #2ecc71; background: #eaffea; }
      .negative { border-left: 4px solid #e74c3c; background: #fff0f0; }
      .promo    { border-left: 4px solid #3498db; background: #eef5ff; }
    `;

    document.head.appendChild(style);
  }
})();
