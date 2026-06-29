(function () {
  const CONFIG_URL = "https://cdn.jsdelivr.net/gh/Amitmund/amitmund_ad_widget/config.json";
  
  // ⚙️ DOM BUDGET: Max unique ads allowed in the bar tracking container simultaneously
  const MAX_DISPLAY_ADS = 8;

  if (window.__AD_RAIL_LOADED__) return;
  window.__AD_RAIL_LOADED__ = true;

  function init() {
    loadConfig()
      .then(config => {
        if (!config || !Array.isArray(config.ads) || config.ads.length === 0) return;
        
        // 🎯 Compute Weighted Roulette Selection & Slicing
        config.ads = processWeightedPriorities(config.ads, MAX_DISPLAY_ADS);
        
        buildWidget(config);
      })
      .catch(err => {
        console.error("AD WIDGET LOG ERROR:", err);
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  async function loadConfig() {
    try {
      const res = await fetch(CONFIG_URL, { cache: "no-store" });
      if (!res.ok) throw new Error("HTTP Status " + res.status);
      return await res.json();
    } catch (e) {
      console.error("Config network load failure:", e);
      return null;
    }
  }

  // 🧠 Robust Weighted Probability Roulette Selection Engine (Handles Legacy Keys Safely)
  function processWeightedPriorities(allAds, maxBudget) {
    const criticalAlerts = allAds.filter(ad => 
      ad.template_type === 'negative' || ad.template === 'negative'
    );

    const lotteryPool = allAds.filter(ad => 
      ad.template_type !== 'negative' && ad.template !== 'negative'
    );

    const chosenAds = [...criticalAlerts];
    
    while (chosenAds.length < maxBudget && lotteryPool.length > 0) {
      let totalWeight = 0;
      for (let i = 0; i < lotteryPool.length; i++) {
        const weight = Number(lotteryPool[i].priority);
        totalWeight += (!isNaN(weight) && weight > 0) ? weight : 1;
      }

      let randomRoll = Math.random() * totalWeight;
      
      for (let i = 0; i < lotteryPool.length; i++) {
        const weight = Number(lotteryPool[i].priority);
        const activeWeight = (!isNaN(weight) && weight > 0) ? weight : 1;
        
        randomRoll -= activeWeight;
        if (randomRoll <= 0) {
          chosenAds.push(lotteryPool.splice(i, 1)[0]);
          break;
        }
      }
    }

    return shuffleArray(chosenAds);
  }

  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  // 🎯 FOOLPROOF RUNTIME LAYOUT COLLISION CONTROLLER
  function autoOffsetFloatingElements() {
    if (window.innerWidth > 768) return; // Strict execution escape: run on mobile only

    const viewportHeight = window.innerHeight;

    // Fast Selector Array: targets actionable tags or components explicitly using matching names
    const candidates = document.querySelectorAll(
      'button, a, [id*="btn"], [class*="btn"], [id*="scroll"], [class*="scroll"], [id*="roadmap"], [class*="roadmap"]'
    );

    candidates.forEach(el => {
      // SRE Guard Rule: Ignore the ad rail element itself completely
      if (el.id === 'ad-rail' || el.closest('#ad-rail')) return;

      // 1. Fast dimensional bounding box triage check (Avoids reading deep computed styles early)
      const rect = el.getBoundingClientRect();
      
      // If the node has no height/width or sits completely off-screen, skip it instantly
      if (rect.height === 0 || rect.width === 0 || rect.top === 0) return;

      // Guard Rule 2: Exclude large layout structural content frameworks blocks (max width/height limiters)
      if (rect.width > 120 || rect.height > 120) return;

      // 2. Proximity boundary metric checking: Is it physically within the bottom 100px zone?
      const distanceFromBottom = viewportHeight - rect.bottom;
      
      if (rect.bottom > (viewportHeight - 100) && rect.top < (viewportHeight - 5)) {
        try {
          const style = window.getComputedStyle(el);
          const position = style.position;

          if (position === 'fixed' || position === 'absolute') {
            const currentBottom = parseInt(style.bottom, 10) || 0;
            
            // Push it cleanly up above our container boundary footprint margin
            el.style.setProperty('bottom', `${currentBottom + 100}px`, 'important');
            el.style.setProperty('transition', 'bottom 0.2s ease-in-out', 'important');

            // Layer index sanitization protection: prevent elements from slipping underneath our backdrop bar
            const currentZIndex = parseInt(style.zIndex, 10);
            if (!isNaN(currentZIndex) && currentZIndex >= 2147483647) {
              el.style.setProperty('z-index', '2147483646', 'important');
            }
          }
        } catch (e) {
          // Fail silently to keep parent app operations running normally if cross-origin styles misbehave
        }
      }
    });
  }

  function buildWidget(config) {
    injectStyles();

    const rail = document.createElement("div");
    rail.id = "ad-rail";

    const track = document.createElement("div");
    track.className = "ad-track";

    let renderingPool = [...config.ads];
    if (renderingPool.length > 0 && renderingPool.length < 5) {
      while (renderingPool.length < 10) {
        renderingPool = renderingPool.concat([...config.ads]);
      }
    }

    const calculatedSpeed = config.scrollSpeed || 1;
    const duration = Math.max(5, (renderingPool.length * 4.5) / calculatedSpeed);
    track.style.setProperty('--scroll-duration', `${duration}s`);

    const originalCards = renderingPool.map(createCard);
    const clonedCards = renderingPool.map(createCard);

    originalCards.forEach(card => track.appendChild(card));
    clonedCards.forEach(clone => {
      clone.setAttribute('aria-hidden', 'true');
      track.appendChild(clone);
    });

    rail.appendChild(track);
    (document.body || document.documentElement).appendChild(rail);

    // 🎯 Fire scanner once DOM threads settle
    setTimeout(autoOffsetFloatingElements, 150);
  }

  function createCard(ad) {
    const a = document.createElement("a");
    const currentTheme = ad.template_type || ad.template || "promo";
    
    a.className = `ad-card ${currentTheme}`;
    a.href = ad.url || "#";
    a.target = "_blank";
    a.rel = "noopener noreferrer";

    const resolvedImage = ad.image_url || ad.image || "";

    a.innerHTML = `
      <img class="ad-img" src="${resolvedImage}" 
           loading="lazy"
           onerror="this.onerror=null; this.src='https://via.placeholder.com/56?text=Ad'" 
           alt="${ad.title || 'Advertisement'} Thumbnail" />
      <div class="ad-body">
        <div class="ad-title">${ad.title || ""}</div>
        <div class="ad-msg">${ad.message || ""}</div>
      </div>
    `;

    return a;
  }

  function injectStyles() {
    if (document.getElementById("ad-rail-style")) return;

    const style = document.createElement("style");
    style.id = "ad-rail-style";
    style.innerHTML = `
      #ad-rail, #ad-rail *, .ad-track, .ad-card {
        box-sizing: border-box !important;
        margin: 0;
        padding: 0;
      }
      #ad-rail {
        position: fixed;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 100px;
        overflow: hidden;
        background: #ffffff;
        z-index: 2147483647;
        box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.08);
        border-top: 1px solid rgba(0, 0, 0, 0.05);
      }
      .ad-track {
        display: flex;
        gap: 16px;
        width: max-content;
        align-items: center;
        padding: 10px 16px;
        will-change: transform;
        animation: adRailInfiniteLinearLoop var(--scroll-duration, 30s) linear infinite;
      }
      #ad-rail:hover .ad-track {
        animation-play-state: paused;
      }
      .ad-card {
        position: relative;
        display: flex;
        align-items: center;
        width: 260px;
        height: 80px;
        flex-shrink: 0;
        border-radius: 12px;
        overflow: hidden;
        text-decoration: none !important;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        color: #111111 !important;
        background: #f8fafc;
        border: 1px solid rgba(0, 0, 0, 0.04);
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      }
      .ad-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      }
      .ad-img {
        width: 52px;
        height: 52px;
        object-fit: cover;
        border-radius: 8px;
        margin: 0 12px;
        border: 1px solid rgba(0, 0, 0, 0.06);
        background-color: #f1f5f9;
      }
      .ad-body {
        display: flex;
        flex-direction: column;
        justify-content: center;
        overflow: hidden;
        padding-right: 45px;
      }
      .ad-title {
        font-size: 13px;
        font-weight: 700;
        line-height: 1.4;
        color: #0f172a;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .ad-msg {
        font-size: 11px;
        font-weight: 400;
        color: #64748b;
        margin-top: 2px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      /* THEMES */
      .positive {
        border-left: 5px solid #10b981;
        background: linear-gradient(90deg, #f0fdf4 0%, #ffffff 40%);
      }
      .negative {
        border-left: 5px solid #ef4444;
        background: linear-gradient(90deg, #fef2f2 0%, #ffffff 40%);
      }
      .promo {
        border-left: 5px solid #3b82f6;
        background: linear-gradient(90deg, #eff6ff 0%, #ffffff 40%);
      }
      
      /* BADGES */
      .ad-card::before {
        position: absolute;
        top: 8px;
        right: 8px;
        font-size: 8px;
        font-weight: 800;
        letter-spacing: 0.05em;
        padding: 2px 6px;
        border-radius: 4px;
        line-height: 1;
      }
      .ad-card.positive::before { content: "ACTIVE"; color: #047857; background: #d1fae5; }
      .ad-card.negative::before { content: "ALERT"; color: #b91c1c; background: #fee2e2; }
      .ad-card.promo::before { content: "PARTNER"; color: #1d4ed8; background: #dbeafe; }
      
      @keyframes adRailInfiniteLinearLoop {
        0% { transform: translate3d(0, 0, 0); }
        100% { transform: translate3d(-50%, 0, 0); }
      }

      @media (max-width: 768px) {
        body {
          padding-bottom: 100px !important;
        }
      }
    `;
    document.head.appendChild(style);
  }
})();
