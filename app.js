const main = document.getElementById("main");
const navButtons = document.querySelectorAll(".nav-btn");
const toast = document.getElementById("toast");
const FAVORITE_KEY = "xinjiang_travel_favorites_v1";

let state = {
  route: "home",
  selectedTag: "全部",
  search: ""
};

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 1700);
}

function getFavorites() {
  try {
    return JSON.parse(localStorage.getItem(FAVORITE_KEY)) || [];
  } catch {
    return [];
  }
}

function setFavorites(ids) {
  localStorage.setItem(FAVORITE_KEY, JSON.stringify(ids));
}

function isFavorite(id) {
  return getFavorites().includes(id);
}

function toggleFavorite(id) {
  const ids = getFavorites();
  if (ids.includes(id)) {
    setFavorites(ids.filter(item => item !== id));
    showToast("已取消收藏");
  } else {
    setFavorites([...ids, id]);
    showToast("已加入收藏");
  }
  render();
}

function setRoute(route) {
  state.route = route;
  window.location.hash = route;
  updateNav();
  render();
}

function updateNav() {
  navButtons.forEach(btn => {
    btn.classList.toggle("active", btn.dataset.route === state.route);
  });
}

function escapeHTML(str) {
  return String(str).replace(/[&<>"']/g, s => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[s]));
}

function badgeHTML(badge) {
  const cls = badge.type === "risk" ? "risk" : badge.type === "warn" ? "warn" : badge.type === "good" ? "good" : "";
  return `<span class="badge ${cls}">${escapeHTML(badge.text || badge)}</span>`;
}

function destinationCard(d) {
  return `
    <article class="card card-click" onclick="openDestination('${d.id}')">
      <h3>${escapeHTML(d.name)}</h3>
      <p class="muted">${escapeHTML(d.short)}</p>
      <p><strong>建议：</strong>${escapeHTML(d.days)} ｜ <strong>自驾难度：</strong>${escapeHTML(d.driveLevel)}</p>
      <div class="badges">${d.badges.map(badgeHTML).join("")}</div>
    </article>
  `;
}

function renderHome() {
  const top = DESTINATIONS.slice(0, 4).map(destinationCard).join("");
  main.innerHTML = `
    <section class="hero">
      <h2>不是宣传图合集，而是旅行决策工具。</h2>
      <p>这个小 App 用来整理新疆伊犁旅行攻略：怎么玩、怎么去、适合谁、哪里容易踩坑，以及小红书和旅行评论里反复出现的高频问题。</p>
      <div class="action-row">
        <button class="primary-btn" onclick="setRoute('destinations')">查看目的地</button>
        <button class="secondary-btn" onclick="setRoute('pitfalls')">先看避坑</button>
      </div>
      <div class="notice">第一版建议只做伊犁河谷：伊宁、赛里木湖、霍城、特克斯、恰西、库尔德宁、琼库什台。先做精，再扩展全新疆。</div>
    </section>

    <h2 class="section-title">优先研究目的地</h2>
    <section class="grid">${top}</section>

    <h2 class="section-title">使用原则</h2>
    <section class="card">
      <p><strong>第一原则：</strong>新疆旅行的核心变量不是景点数量，而是距离、天气、路况、体力和住宿稳定性。</p>
      <p><strong>第二原则：</strong>小红书适合发现灵感，不适合直接当决策依据。真正要看的是差评、近期实拍和高频抱怨。</p>
      <p><strong>第三原则：</strong>越是风景上限高的地方，越需要行程弹性。</p>
    </section>
  `;
}

function renderDestinations() {
  const tags = ["全部", ...Array.from(new Set(DESTINATIONS.flatMap(d => d.tags)))];
  const filtered = DESTINATIONS.filter(d => {
    const matchTag = state.selectedTag === "全部" || d.tags.includes(state.selectedTag);
    const q = state.search.trim();
    const matchSearch = !q || `${d.name}${d.short}${d.tags.join("")}${d.judgement}`.includes(q);
    return matchTag && matchSearch;
  });

  main.innerHTML = `
    <section class="search-panel">
      <input class="search-input" placeholder="搜索：赛里木湖、草原、亲子、自驾..." value="${escapeHTML(state.search)}" oninput="handleSearch(event)" />
      <div class="tag-row">
        ${tags.map(tag => `<button class="tag-btn ${state.selectedTag === tag ? "active" : ""}" onclick="selectTag('${tag}')">${escapeHTML(tag)}</button>`).join("")}
      </div>
    </section>
    <section class="grid">
      ${filtered.length ? filtered.map(destinationCard).join("") : `<div class="empty">没有找到匹配的目的地。</div>`}
    </section>
  `;
}

function handleSearch(event) {
  state.search = event.target.value;
  renderDestinations();
}

function selectTag(tag) {
  state.selectedTag = tag;
  renderDestinations();
}

function openDestination(id) {
  state.route = `destination:${id}`;
  window.location.hash = state.route;
  updateNav();
  render();
}

function renderDestinationDetail(id) {
  const d = DESTINATIONS.find(item => item.id === id);
  if (!d) {
    main.innerHTML = `<div class="empty">没有找到这个目的地。</div>`;
    return;
  }

  main.innerHTML = `
    <section class="detail-header">
      <div class="detail-title-line">
        <div>
          <p class="eyebrow" style="color:#55706d;">${escapeHTML(d.region)}</p>
          <h2>${escapeHTML(d.name)}</h2>
        </div>
        <button class="favorite-btn ${isFavorite(d.id) ? "active" : ""}" onclick="toggleFavorite('${d.id}')">
          ${isFavorite(d.id) ? "已收藏" : "收藏"}
        </button>
      </div>
      <p>${escapeHTML(d.short)}</p>
      <div class="badges">${d.badges.map(badgeHTML).join("")}</div>
      <div class="info-table">
        <div class="info-row"><strong>最佳季节</strong><span>${escapeHTML(d.bestSeason)}</span></div>
        <div class="info-row"><strong>建议时间</strong><span>${escapeHTML(d.days)}</span></div>
        <div class="info-row"><strong>自驾难度</strong><span>${escapeHTML(d.driveLevel)}</span></div>
      </div>
    </section>

    <h2 class="section-title">核心看点</h2>
    <section class="card">
      <ul class="list">${d.highlights.map(x => `<li>${escapeHTML(x)}</li>`).join("")}</ul>
    </section>

    <h2 class="section-title">适合 / 不适合</h2>
    <section class="grid">
      <article class="card">
        <h3>适合这些人</h3>
        <ul class="list">${d.suitableFor.map(x => `<li>${escapeHTML(x)}</li>`).join("")}</ul>
      </article>
      <article class="card">
        <h3>不太适合这些人</h3>
        <ul class="list">${d.notSuitableFor.map(x => `<li>${escapeHTML(x)}</li>`).join("")}</ul>
      </article>
    </section>

    <h2 class="section-title">交通与自驾判断</h2>
    <section class="card">
      <ul class="list">${d.transport.map(x => `<li>${escapeHTML(x)}</li>`).join("")}</ul>
    </section>

    <h2 class="section-title">重点避坑</h2>
    <section>
      ${d.pitfalls.map(p => `
        <article class="pitfall-card">
          <h4>${escapeHTML(p.title)}</h4>
          <p><strong>原因：</strong>${escapeHTML(p.reason)}</p>
          <p><strong>影响：</strong>${escapeHTML(p.impact)}</p>
          <p><strong>规避：</strong>${escapeHTML(p.avoid)}</p>
        </article>
      `).join("")}
    </section>

    <h2 class="section-title">评论高频反馈摘要</h2>
    <section class="card">
      <p><strong>常见好评：</strong>${d.reviewSummary.positive.map(escapeHTML).join("；")}</p>
      <p><strong>常见差评：</strong>${d.reviewSummary.negative.map(escapeHTML).join("；")}</p>
      <p><strong>综合判断：</strong>${escapeHTML(d.reviewSummary.judgement)}</p>
    </section>

    <h2 class="section-title">我的最终判断</h2>
    <section class="card">
      <p>${escapeHTML(d.judgement)}</p>
      <div class="action-row">
        <button class="secondary-btn" onclick="setRoute('destinations')">返回目的地</button>
        <button class="primary-btn" onclick="setRoute('routes')">查看路线</button>
      </div>
    </section>
  `;
}

function renderRoutes() {
  main.innerHTML = `
    <section class="hero">
      <h2>路线不是越满越好。</h2>
      <p>伊犁旅行最重要的是留出天气、路况和体力冗余。下面三条路线按强度递增。</p>
    </section>
    ${ROUTES.map(route => `
      <section class="card" style="margin-top:14px;">
        <h3>${escapeHTML(route.name)}</h3>
        <p class="muted">${escapeHTML(route.summary)}</p>
        <p><strong>适合：</strong>${escapeHTML(route.fit)}</p>
        <p><strong>强度：</strong>${escapeHTML(route.level)}</p>
        ${route.days.map(day => `
          <div class="route-day">
            <h4>第 ${day.day} 天：${escapeHTML(day.title)}</h4>
            <p><strong>住宿：</strong>${escapeHTML(day.stay)} ｜ <strong>驾驶：</strong>${escapeHTML(day.drive)}</p>
            <p>${escapeHTML(day.plan)}</p>
            <p class="muted"><strong>风险提醒：</strong>${escapeHTML(day.risk)}</p>
          </div>
        `).join("")}
      </section>
    `).join("")}
  `;
}

function renderPitfalls() {
  const destinationPitfalls = DESTINATIONS.flatMap(d => d.pitfalls.map(p => ({...p, destination: d.name, id: d.id})));
  main.innerHTML = `
    <section class="hero">
      <h2>先看避坑，再排行程。</h2>
      <p>这页不是劝退，而是帮你判断哪些风险是真风险，哪些只是预期管理问题。</p>
    </section>

    <h2 class="section-title">全局避坑原则</h2>
    <section class="grid">
      ${GLOBAL_PITFALLS.map(p => `
        <article class="card">
          <h3>${escapeHTML(p.title)}</h3>
          <p class="muted">${escapeHTML(p.detail)}</p>
        </article>
      `).join("")}
    </section>

    <h2 class="section-title">按景点查看避坑</h2>
    <section>
      ${destinationPitfalls.map(p => `
        <article class="pitfall-card card-click" onclick="openDestination('${p.id}')">
          <h4>${escapeHTML(p.destination)}：${escapeHTML(p.title)}</h4>
          <p><strong>影响：</strong>${escapeHTML(p.impact)}</p>
          <p><strong>规避：</strong>${escapeHTML(p.avoid)}</p>
        </article>
      `).join("")}
    </section>
  `;
}

function renderFavorites() {
  const ids = getFavorites();
  const favorites = DESTINATIONS.filter(d => ids.includes(d.id));
  main.innerHTML = `
    <section class="hero">
      <h2>我的收藏</h2>
      <p>收藏会保存在当前手机或浏览器里，不需要登录。</p>
    </section>
    <section class="grid" style="margin-top:14px;">
      ${favorites.length ? favorites.map(destinationCard).join("") : `<div class="empty">还没有收藏。进入目的地详情页，点击“收藏”。</div>`}
    </section>
  `;
}

function render() {
  if (state.route.startsWith("destination:")) {
    renderDestinationDetail(state.route.split(":")[1]);
    return;
  }
  switch (state.route) {
    case "destinations":
      renderDestinations();
      break;
    case "routes":
      renderRoutes();
      break;
    case "pitfalls":
      renderPitfalls();
      break;
    case "favorites":
      renderFavorites();
      break;
    default:
      renderHome();
  }
}

navButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    state.route = btn.dataset.route;
    window.location.hash = state.route;
    updateNav();
    render();
  });
});

document.getElementById("installTipBtn").addEventListener("click", () => {
  showToast("iPhone：Safari 分享按钮 → 添加到主屏幕");
});

window.addEventListener("hashchange", () => {
  state.route = location.hash.replace("#", "") || "home";
  updateNav();
  render();
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("service-worker.js").catch(() => {});
  });
}

state.route = location.hash.replace("#", "") || "home";
updateNav();
render();
