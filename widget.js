(function () {
  const CONFIG_URL = "https://cdn.jsdelivr.net/gh/Amitmund/amitmund_ad_widget/config.json";
  
  // ⚙️ SYSTEM SETTINGS
  const MAX_DISPLAY_ADS = 8;

  if (window.__AD_RAIL_LOADED__) return;
  window.__AD_RAIL_LOADED__ = true;

  function init() {
    loadConfig()
      .then(config => {
        if (!config || !Array.isArray(config.ads) || config.ads.length === 0) return;
        
        // 🎯 Compute Weighted Roulette Selection & Slicing
        const filteredPool = processWeightedPriorities(config.ads, MAX_DISPLAY_ADS);
        
        // 🎲 Extract exactly 1 non-repeating random ad using Session History tracking
        const selectedAd = selectTrueRandomAd(filteredPool);
        if (!selectedAd) return;
        
        buildWidget(selectedAd);
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

  function selectTrueRandomAd(pool) {
    if (pool.length === 0) return null;
    if (pool.length === 1) return pool[0];

    const lastViewedSlug = sessionStorage.getItem('__LAST_VIEWED_AD_SLUG__');
    let rotationCandidates = pool.filter(ad => ad.slug !== lastViewedSlug);
    
    if (rotationCandidates.length === 0) {
      rotationCandidates = pool;
    }

    const shuffledCandidates = shuffleArray([...rotationCandidates]);
    const finalSelection = shuffledCandidates[0];

    if (finalSelection && finalSelection.slug) {
      sessionStorage.setItem('__LAST_VIEWED_AD_SLUG__', finalSelection.slug);
    }

    return finalSelection;
  }

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

      if (rect.bottom > (viewportHeight - 140) && rect.top < (viewportHeight - 5)) {
        try {
          const style = window.getComputedStyle(el);
          if (style.position === 'fixed' || style.position === 'absolute') {
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
    rail.style.transform = "translateY(140px)"; // Out of frame baseline

    const card = createCard(ad);
    rail.appendChild(card);
    (document.body || document.documentElement).appendChild(rail);

    // 🎯 INTERCEPT: CLOSE EVENT BINDINGS
    const closeBtn = card.querySelector('.ad-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation(); // Stop anchor tag click routing
        
        // Slide away offscreen
        rail.style.transform = "translateY(140px)";
        adjustFloatingElements(0); // Restore site layouts instantly
        
        // Hard-evict container from document tree when transition ends
        setTimeout(() => {
          rail.remove();
        }, 500);
      });
    }

    // Smooth entrance execution
    setTimeout(() => {
      rail.style.transform = "translateY(0)";
      adjustFloatingElements(110);
    }, 150);
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
      <button class="ad-close-btn" type="button" aria-label="Dismiss Advertisement">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
      
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
        bottom: 24px;
        left: 0;
        width: 100%;
        height: auto;
        display: flex;
        justify-content: center;
        align-items: center;
        overflow: hidden;
        z-index: 2147483647;
        pointer-events: none;
        transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
      }
      .ad-card {
        pointer-events: auto;
        position: relative;
        display: flex;
        align-items: center;
        width: 350px;
        height: 86px;
        background: #ffffff;
        border-radius: 18px;
        text-decoration: none !important;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        color: #111111 !important;
        box-shadow: 0 15px 35px rgba(15, 23, 42, 0.18), 0 2px 4px rgba(0, 0, 0, 0.04);
        border: 1px solid rgba(15, 23, 42, 0.08);
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      }
      .ad-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 18px 40px rgba(15, 23, 42, 0.24);
      }
      
      /* 🎯 DISMISS CONTROLLER BUTTON STYLING */
      .ad-close-btn {
        position: absolute;
        top: 10px;
        right: 10px;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(15, 23, 42, 0.05);
        border: none;
        border-radius: 50%;
        color: #64748b;
        cursor: pointer;
        padding: 0;
        z-index: 10;
        transition: background 0.2s, color 0.2s;
      }
      .ad-close-btn:hover {
        background: rgba(15, 23, 42, 0.1);
        color: #0f172a;
      }
      .ad-close-btn svg {
        width: 10px;
        height: 10px;
      }

      .ad-img {
        width: 54px;
        height: 54px;
        object-fit: cover;
        border-radius: 12px;
        margin: 0 14px;
        border: 1px solid rgba(0, 0, 0, 0.06);
        background-color: #f1f5f9;
      }
      .ad-body {
        display: flex;
        flex-direction: column;
        justify-content: center;
        overflow: hidden;
        padding-right: 36px; /* Expanded clear zone to protect text overlapping cross button */
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

      @media (max-width: 480px) {
        .ad-card {
          width: 92vw;
        }
      }
    `;
    document.head.appendChild(style);
  }
})();
