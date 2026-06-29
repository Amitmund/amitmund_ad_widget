(function () {
  const CONFIG_URL = "https://cdn.jsdelivr.net/gh/Amitmund/amitmund_ad_widget/config.json";

  if (window.__AD_RAIL_LOADED__) return;
  window.__AD_RAIL_LOADED__ = true;

  function init() {
    loadConfig()
      .then(config => {
        if (!config || !Array.isArray(config.ads) || config.ads.length === 0) return;
        
        // 🎯 Choose exactly 1 mathematically optimized campaign card
        const singleAd = selectSingleWeightedAd(config.ads);
        if (!singleAd) return;
        
        buildWidget(singleAd);
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

  // 🧠 Optimized Single-Winner Weighted Roulette Wheel Selection
  function selectSingleWeightedAd(allAds) {
    // 1. Critical Safety Alerts take absolute absolute precedence
    const criticalAlerts = allAds.filter(ad => 
      ad.template_type === 'negative' || ad.template === 'negative'
    );
    if (criticalAlerts.length > 0) {
      // If multiple critical alerts exist, pick one at random
      return criticalAlerts[Math.floor(Math.random() * criticalAlerts.length)];
    }

    // 2. Triage standard candidates pool
    const lotteryPool = allAds.filter(ad => 
      ad.template_type !== 'negative' && ad.template !== 'negative'
    );
    if (lotteryPool.length === 0) return null;

    // 3. Compute cumulative weight boundaries
    let totalWeight = 0;
    for (let i = 0; i < lotteryPool.length; i++) {
      const weight = Number(lotteryPool[i].priority);
      totalWeight += (!isNaN(weight) && weight > 0) ? weight : 1;
    }

    let randomRoll = Math.random() * totalWeight;
    
    // 4. Spin the wheel
    for (let i = 0; i < lotteryPool.length; i++) {
      const weight = Number(lotteryPool[i].priority);
      const activeWeight = (!isNaN(weight) && weight > 0) ? weight : 1;
      
      randomRoll -= activeWeight;
      if (randomRoll <= 0) {
        return lotteryPool[i];
      }
    }
    return lotteryPool[0];
  }

  // 🎯 CENTRALLY OFFSET AND ADJUST EXISTING FLOATING ELEMENTS 
  function adjustFloatingElements(offsetValue) {
    if (window.innerWidth > 768) return;
    const viewportHeight = window.innerHeight;
    const candidates = document.querySelectorAll(
      'button, a, [id*="btn"], [class*="btn"], [id*="scroll"], [class*="scroll"], [id*="roadmap"], [class*="roadmap"]'
    );

    candidates.forEach(el => {
      if (el.id === 'ad-rail' || el.closest('#ad-rail')) return;
      
      const rect = el.getBoundingClientRect();
      if (rect.height === 0 || rect.width === 0 || rect.top === 0) return;
      if (rect.width > 120 || rect.height > 120) return;

      if (rect.bottom > (viewportHeight - 120) && rect.top < (viewportHeight - 5)) {
        try {
          const style = window.getComputedStyle(el);
          if (style.position === 'fixed' || style.position === 'absolute') {
            // Read or initialize baselines
            if (!el.hasAttribute('data-original-bottom')) {
              el.setAttribute('data-original-bottom', style.bottom);
            }
            
            const baseBottom = parseInt(el.getAttribute('data-original-bottom'), 10) || 0;
            el.style.setProperty('bottom', `${baseBottom + offsetValue}px`, 'important');
            el.style.setProperty('transition', 'bottom 0.4s cubic-bezier(0.16, 1, 0.3, 1)', 'important');
          }
        } catch (e) {}
      }
    });
  }

  function buildWidget(ad) {
    injectStyles();

    const rail = document.createElement("div");
    rail.id = "ad-rail";
    // Initialize offscreen for a smooth slide-in entry
    rail.style.transform = "translateY(120px)"; 

    const card = createCard(ad);
    rail.appendChild(card);
    (document.body || document.documentElement).appendChild(rail);

    // 🎬 ANIMATION LIFECYCLE MANAGEMENT STEPS
    
    // Step 1: Smooth transition onto the viewpoint canvas after paint
    setTimeout(() => {
      rail.style.transform = "translateY(0)";
      adjustFloatingElements(100); // Push floating icons up out of collision zone
    }, 100);

    // Step 2: Hold visibility for 3 seconds, then reverse transition offscreen
    setTimeout(() => {
      rail.style.transform = "translateY(120px)";
      adjustFloatingElements(0); // Return floating site layout icons to baseline coordinates
    }, 3100); // 100ms entry delay + 3000ms duration

    // Step 3: Evict container completely from active DOM trees to release runtime resources
    setTimeout(() => {
      rail.remove();
    }, 3600); // Wait for the 500ms slide-away transition curve to end cleanly
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
      #ad-rail, #ad-rail * {
        box-sizing: border-box !important;
        margin: 0;
        padding: 0;
      }
      #ad-rail {
        position: fixed;
        bottom: 20px;
        left: 0;
        width: 100%;
        height: auto;
        display: flex;
        justify-content: center;
        align-items: center;
        overflow: hidden;
        z-index: 2147483647;
        pointer-events: none; /* Let clicks pass through outside the actual card boundary */
        transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
      }
      .ad-card {
        pointer-events: auto; /* Re-enable pointer capture on the interactive element itself */
        position: relative;
        display: flex;
        align-items: center;
        width: 340px;
        height: 84px;
        background: #ffffff;
        border-radius: 16px;
        text-decoration: none !important;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        color: #111111 !important;
        box-shadow: 0 10px 30px rgba(15, 23, 42, 0.15), 0 1px 3px rgba(0, 0, 0, 0.05);
        border: 1px solid rgba(15, 23, 42, 0.08);
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      }
      .ad-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 12px 35px rgba(15, 23, 42, 0.2);
      }
      .ad-img {
        width: 52px;
        height: 52px;
        object-fit: cover;
        border-radius: 10px;
        margin: 0 14px;
        border: 1px solid rgba(0, 0, 0, 0.06);
        background-color: #f1f5f9;
      }
      .ad-body {
        display: flex;
        flex-direction: column;
        justify-content: center;
        overflow: hidden;
        padding-right: 50px;
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
        background: linear-gradient(90deg, #f0fdf4 0%, #ffffff 30%);
      }
      .negative {
        border-left: 5px solid #ef4444;
        background: linear-gradient(90deg, #fef2f2 0%, #ffffff 30%);
      }
      .promo {
        border-left: 5px solid #3b82f6;
        background: linear-gradient(90deg, #eff6ff 0%, #ffffff 30%);
      }
      
      /* BADGES */
      .ad-card::before {
        position: absolute;
        top: 10px;
        right: 10px;
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

      @media (max-width: 480px) {
        .ad-card {
          width: 90vw; /* Perfect width adjustments across responsive devices */
        }
      }
    `;
    document.head.appendChild(style);
  }
})();
