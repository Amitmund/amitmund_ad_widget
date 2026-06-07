(async function () {
  const CONFIG_URL =
    "https://cdn.jsdelivr.net/gh/your-org/ad-widget/config.json";

  // -----------------------------
  // Load Config
  // -----------------------------
  const config = await fetch(CONFIG_URL).then(r => r.json());

  if (!config || !config.ads || !config.ads.length) return;

  // -----------------------------
  // Inject Base Styles
  // -----------------------------
  const style = document.createElement("style");
  style.innerHTML = `
    #ad-rail {
      position: fixed;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 100px;
      overflow: hidden;
      background: #ffffff;
      z-index: 999999;
      box-shadow: 0 -2px 10px rgba(0,0,0,0.12);
    }

    .ad-track {
      display: flex;
      flex-direction: row;
      gap: 12px;
      width: max-content;
      will-change: transform;
      align-items: center;
      padding: 10px;
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

  // -----------------------------
  // Create DOM
  // -----------------------------
  const rail = document.createElement("div");
  rail.id = "ad-rail";

  const track = document.createElement("div");
  track.className = "ad-track";

  rail.appendChild(track);
  document.body.appendChild(rail);

  // -----------------------------
  // Build Ad Card
  // -----------------------------
  function createCard(ad) {
    const a = document.createElement("a");

    a.className = `ad-card ${ad.template || "promo"}`;
    a.href = ad.url || "#";
    a.target = "_blank";

    a.innerHTML = `
      <img class="ad-img" src="${ad.image}" />
      <div class="ad-body">
        <div class="ad-title">${ad.title || ""}</div>
        <div class="ad-msg">${ad.message || ""}</div>
      </div>
    `;

    return a;
  }

  // -----------------------------
  // Render Ads
  // -----------------------------
  config.ads.forEach(ad => {
    track.appendChild(createCard(ad));
  });

  // Duplicate for seamless loop
  track.innerHTML += track.innerHTML;

  // -----------------------------
  // Scroll Engine
  // -----------------------------
  let x = 0;
  let paused = false;

  const speed = config.scrollSpeed || 1;

  rail.addEventListener("mouseenter", () => (paused = true));
  rail.addEventListener("mouseleave", () => (paused = false));

  function animate() {
    if (!paused) {
      x -= speed;

      const halfWidth = track.scrollWidth / 2;

      if (Math.abs(x) >= halfWidth) {
        x = 0;
      }

      track.style.transform = `translateX(${x}px)`;
    }

    requestAnimationFrame(animate);
  }

  animate();
})();
