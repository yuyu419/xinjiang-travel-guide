const main = document.getElementById("main");
const navButtons = document.querySelectorAll(".nav-btn");
const toast = document.getElementById("toast");
const FAVORITE_KEY = "xinjiang_travel_favorites_v1";

let state = { route: "home", selectedTag: "全部", search: "" };

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 1700);
}
function getFavorites() { try { return JSON.parse(localStorage.getItem(FAVORITE_KEY)) || []; } catch { return []; } }
function setFavorites(ids) { localStorage.setItem(FAVORITE_KEY, JSON.stringify(ids)); }
function isFavorite(id) { return getFavorites().includes(id); }
function toggleFavorite(id) {
  const ids = getFavorites();
  if (ids.includes(id)) { setFavorites(ids.filter(item => item !== id)); showToast("已取消收藏"); }
  else { setFavorites([...ids, id]); showToast("已加入收藏"); }
  render();
}
function setRoute(route) { state.route = route; window.location.hash = route; updateNav(); render(); }
function updateNav() { navButtons.forEach(btn => btn.classList.toggle("active", btn.dataset.route === state.route)); }
function escapeHTML(str) { return String(str).replace(/[&<>"']/g, s => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[s])); }
function badgeHTML(badge) {
  const cls = badge.type === "risk" ? "risk" : badge.type === "warn" ? "warn" : badge.type === "good" ? "good" : "";
  return `<span class="badge ${cls}">${escapeHTML(badge.text || badge)}</span>`;
}
function destinationCard(d) {
  return `
    <article class="card card-click destination-card" onclick="openDestination('${d.id}')">
      <div class="card-media media-${d.id}"><div class="media-label">${escapeHTML(d.region)}</div></div>
      <div class="card-body">
        <h3>${escapeHTML(d.name)}</h3>
        <p class="muted">${escapeHTML(d.short)}</p>
        <p><strong>${escapeHTML(d.days)}</strong> · 自驾难度 ${escapeHTML(d.driveLevel)}</p>
        <div class="badges">${d.badges.map(badgeHTML).join("")}</div>
        <button class="secondary-btn card-cta">查看详情</button>
      </div>
    </article>`;
}

function renderHome() {
  const top = DESTINATIONS.slice(0, 6).map(destinationCard).join("");
  main.innerHTML = `
    <section class="hero"><div class="hero-inner">
      <p class="eyebrow">Xinjiang · Yili Valley</p>
      <h2>更像成品产品的伊犁旅行指南</h2>
      <p>先判断值不值得去，再决定怎么去。聚焦目的地价值、行程强度与真实避坑，而不是信息堆砌。</p>
      <div class="action-row">
        <button class="primary-btn" onclick="setRoute('destinations')">开始选目的地</button>
        <button class="secondary-btn" onclick="setRoute('routes')">查看推荐路线</button>
      </div>
    </div></section>

    <section class="quick-start card">
      <h3>第一次使用，按这 3 步走</h3>
      <ol class="list">
        <li>先点底部 <strong>目的地</strong>，筛出你感兴趣的地点</li>
        <li>点卡片上的 <strong>查看详情</strong>，看季节/难度/避坑</li>
        <li>满意就点 <strong>收藏</strong>，最后到 <strong>路线</strong>页组合行程</li>
      </ol>
    </section>

    <h2 class="section-title">精选目的地</h2>
    <section class="grid">${top}</section>
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
    <section class="grid">${filtered.length ? filtered.map(destinationCard).join("") : `<div class="empty">没有找到匹配目的地，请更换关键词。</div>`}</section>
  <h2 class="section-title">来源型避雷（小红书/公众号）</h2><section class="grid">${RISK_SOURCES.map(r=>`<article class="card" style="grid-column:span 4"><h3>${escapeHTML(r.title)}</h3><p><strong>风险等级：</strong>${escapeHTML(r.level)}</p><p><strong>规避建议：</strong>${escapeHTML(r.avoid)}</p><p class="muted">来源：${escapeHTML(r.source)} · ${escapeHTML(r.sourceDate)}</p><p class="muted">链接：<a href="${escapeHTML(r.url)}" target="_blank">${escapeHTML(r.url)}</a></p></article>`).join("")}</section>`;
}

function handleSearch(event) { state.search = event.target.value; renderDestinations(); }
function selectTag(tag) { state.selectedTag = tag; renderDestinations(); }
function openDestination(id) { state.route = `destination:${id}`; window.location.hash = state.route; updateNav(); render(); }

function renderDestinationDetail(id) {
  const d = DESTINATIONS.find(item => item.id === id);
  if (!d) { main.innerHTML = `<div class="empty">没有找到这个目的地。</div>`; return; }
  main.innerHTML = `
    <section class="detail-header card">
      <div class="detail-hero">
        <div class="detail-title-line">
          <div><p class="eyebrow">${escapeHTML(d.region)}</p><h2>${escapeHTML(d.name)}</h2></div>
          <button class="favorite-btn ${isFavorite(d.id) ? "active" : ""}" onclick="toggleFavorite('${d.id}')">${isFavorite(d.id) ? "已收藏" : "收藏"}</button>
        </div>
        <p>${escapeHTML(d.short)}</p>
        <div class="badges">${d.badges.map(badgeHTML).join("")}</div>
        <div class="info-table">
          <div class="info-row"><strong>最佳季节</strong><span>${escapeHTML(d.bestSeason)}</span></div>
          <div class="info-row"><strong>建议时间</strong><span>${escapeHTML(d.days)}</span></div>
          <div class="info-row"><strong>自驾难度</strong><span>${escapeHTML(d.driveLevel)}</span></div>
        </div>
      </div>
    </section>

    <h2 class="section-title">核心看点</h2><section class="card"><ul class="list">${d.highlights.map(x => `<li>${escapeHTML(x)}</li>`).join("")}</ul></section>
    <h2 class="section-title">适合 / 不适合</h2>
    <section class="grid">
      <article class="card" style="grid-column:span 6"><h3>适合这些人</h3><ul class="list">${d.suitableFor.map(x => `<li>${escapeHTML(x)}</li>`).join("")}</ul></article>
      <article class="card" style="grid-column:span 6"><h3>不太适合这些人</h3><ul class="list">${d.notSuitableFor.map(x => `<li>${escapeHTML(x)}</li>`).join("")}</ul></article>
    </section>
    <h2 class="section-title">交通与建议</h2><section class="card"><ul class="list">${d.transport.map(x => `<li>${escapeHTML(x)}</li>`).join("")}</ul></section>
    <h2 class="section-title">重点避坑</h2><section>${d.pitfalls.map(p => `<article class="card" style="margin-bottom:12px;"><h3>${escapeHTML(p.title)}</h3><p><strong>原因：</strong>${escapeHTML(p.reason)}</p><p><strong>影响：</strong>${escapeHTML(p.impact)}</p><p><strong>规避：</strong>${escapeHTML(p.avoid)}</p></article>`).join("")}</section>
    <div class="floating-actions">
      <button class="secondary-btn" onclick="setRoute('destinations')">返回目的地</button>
      <button class="primary-btn" onclick="toggleFavorite('${d.id}')">${isFavorite(d.id) ? '已收藏' : '加入收藏'}</button>
    </div>`;
}

function renderRoutes() {
  main.innerHTML = `<section class="hero"><div class="hero-inner"><h2>推荐路线（按强度递增）</h2><p>旅行节奏优先于景点数量，先保证稳定，再追求上限。</p></div></section>
  ${ROUTES.map(route => `<section class="card" style="margin-top:14px;"><h3>${escapeHTML(route.name)}</h3><p class="muted">${escapeHTML(route.summary)}</p><p><strong>适合：</strong>${escapeHTML(route.fit)} · <strong>强度：</strong>${escapeHTML(route.level)}</p>${route.days.map(day => `<div class="route-day"><h4>第 ${day.day} 天：${escapeHTML(day.title)}</h4><p><strong>住宿：</strong>${escapeHTML(day.stay)} ｜ <strong>驾驶：</strong>${escapeHTML(day.drive)}</p><p>${escapeHTML(day.plan)}</p><p class="muted"><strong>提醒：</strong>${escapeHTML(day.risk)}</p></div>`).join("")}</section>`).join("")}`;
}

function renderPitfalls() {
  const destinationPitfalls = DESTINATIONS.flatMap(d => d.pitfalls.map(p => ({ ...p, destination: d.name, id: d.id })));
  main.innerHTML = `<section class="hero"><div class="hero-inner"><h2>先看避坑，再排行程</h2><p>这页聚焦高频风险，帮助你快速过滤不可控因素。</p></div></section>
  <h2 class="section-title">全局避坑原则</h2><section class="grid">${GLOBAL_PITFALLS.map(p => `<article class="card" style="grid-column:span 4"><h3>${escapeHTML(p.title)}</h3><p class="muted">${escapeHTML(p.detail)}</p></article>`).join("")}</section>
  <h2 class="section-title">按景点查看避坑</h2><section>${destinationPitfalls.map(p => `<article class="card card-click" style="margin-bottom:12px;" onclick="openDestination('${p.id}')"><h3>${escapeHTML(p.destination)} · ${escapeHTML(p.title)}</h3><p><strong>影响：</strong>${escapeHTML(p.impact)}</p><p><strong>规避：</strong>${escapeHTML(p.avoid)}</p></article>`).join("")}</section>
  <h2 class="section-title">来源型避雷（小红书/公众号）</h2><section class="grid">${RISK_SOURCES.map(r=>`<article class="card" style="grid-column:span 4"><h3>${escapeHTML(r.title)}</h3><p><strong>风险等级：</strong>${escapeHTML(r.level)}</p><p><strong>规避建议：</strong>${escapeHTML(r.avoid)}</p><p class="muted">来源：${escapeHTML(r.source)} · ${escapeHTML(r.sourceDate)}</p><p class="muted">链接：<a href="${escapeHTML(r.url)}" target="_blank">${escapeHTML(r.url)}</a></p></article>`).join("")}</section>`;
}



function renderInspiration() {
  main.innerHTML = `<section class="hero"><div class="hero-inner"><h2>美食与旅行灵感</h2><p>把用餐、节奏和补给纳入行程，减少“路上饿、景区贵、排队久”的体验波动。</p></div></section>
  <h2 class="section-title">美食建议</h2>
  <section class="grid">${FOOD_SPOTS.map(item => `<article class="card" style="grid-column:span 4"><h3>${escapeHTML(item.city)} · ${escapeHTML(item.name)}</h3><div class="badges">${item.tags.map(t=>`<span class="badge">${escapeHTML(t)}</span>`).join("")}</div><p class="muted" style="margin-top:10px;">${escapeHTML(item.tip)}</p></article>`).join("")}</section>
  <h2 class="section-title">来源型避雷（小红书/公众号）</h2><section class="grid">${RISK_SOURCES.map(r=>`<article class="card" style="grid-column:span 4"><h3>${escapeHTML(r.title)}</h3><p><strong>风险等级：</strong>${escapeHTML(r.level)}</p><p><strong>规避建议：</strong>${escapeHTML(r.avoid)}</p><p class="muted">来源：${escapeHTML(r.source)} · ${escapeHTML(r.sourceDate)}</p><p class="muted">链接：<a href="${escapeHTML(r.url)}" target="_blank">${escapeHTML(r.url)}</a></p></article>`).join("")}</section>`;
}

function renderTools() {
  main.innerHTML = `<section class="hero"><div class="hero-inner"><h2>旅行工具箱</h2><p>聚合交通、租车、公厕和住宿建议，减少临场决策压力。</p></div></section>
  <h2 class="section-title">交通工具对比</h2>
  <section class="grid">${TRAVEL_TOOLS.transport.map(t=>`<article class="card" style="grid-column:span 4"><h3>${escapeHTML(t.mode)}</h3><p><strong>适合：</strong>${escapeHTML(t.fit)}</p><p><strong>成本：</strong>${escapeHTML(t.cost)}</p><p class="muted"><strong>风险：</strong>${escapeHTML(t.risk)}</p></article>`).join("")}</section>
  <h2 class="section-title">租车清单</h2><section class="card"><ul class="list">${TRAVEL_TOOLS.carRental.map(x=>`<li>${escapeHTML(x)}</li>`).join("")}</ul></section>
  <h2 class="section-title">公共厕所位置提示</h2><section class="grid">${TRAVEL_TOOLS.toilets.map(x=>`<article class="card" style="grid-column:span 4"><h3>${escapeHTML(x.area)}</h3><p>${escapeHTML(x.note)}</p></article>`).join("")}</section>
  <h2 class="section-title">住宿建议</h2><section class="grid">${TRAVEL_TOOLS.hotels.map(x=>`<article class="card" style="grid-column:span 4"><h3>${escapeHTML(x.area)}</h3><p>${escapeHTML(x.suggest)}</p></article>`).join("")}</section>
  <h2 class="section-title">来源型避雷（小红书/公众号）</h2><section class="grid">${RISK_SOURCES.map(r=>`<article class="card" style="grid-column:span 4"><h3>${escapeHTML(r.title)}</h3><p><strong>风险等级：</strong>${escapeHTML(r.level)}</p><p><strong>规避建议：</strong>${escapeHTML(r.avoid)}</p><p class="muted">来源：${escapeHTML(r.source)} · ${escapeHTML(r.sourceDate)}</p><p class="muted">链接：<a href="${escapeHTML(r.url)}" target="_blank">${escapeHTML(r.url)}</a></p></article>`).join("")}</section>`;
}

function renderFavorites() {
  const favorites = DESTINATIONS.filter(d => getFavorites().includes(d.id));
  main.innerHTML = `<section class="hero"><div class="hero-inner"><h2>我的收藏</h2><p>收藏保存在当前设备，可用于后续行程筛选。</p></div></section><h2 class="section-title">收藏目的地</h2><section class="grid">${favorites.length ? favorites.map(destinationCard).join("") : `<div class="empty">还没有收藏，去目的地详情页点“收藏”。</div>`}</section>
  <h2 class="section-title">来源型避雷（小红书/公众号）</h2><section class="grid">${RISK_SOURCES.map(r=>`<article class="card" style="grid-column:span 4"><h3>${escapeHTML(r.title)}</h3><p><strong>风险等级：</strong>${escapeHTML(r.level)}</p><p><strong>规避建议：</strong>${escapeHTML(r.avoid)}</p><p class="muted">来源：${escapeHTML(r.source)} · ${escapeHTML(r.sourceDate)}</p><p class="muted">链接：<a href="${escapeHTML(r.url)}" target="_blank">${escapeHTML(r.url)}</a></p></article>`).join("")}</section>`;
}

function render() {
  if (state.route.startsWith("destination:")) return renderDestinationDetail(state.route.split(":")[1]);
  switch (state.route) {
    case "destinations": return renderDestinations();
    case "routes": return renderRoutes();
    case "inspiration": return renderInspiration();
    case "tools": return renderTools();
    case "pitfalls": return renderPitfalls();
    case "favorites": return renderFavorites();
    default: return renderHome();
  }
}

navButtons.forEach(btn => btn.addEventListener("click", () => setRoute(btn.dataset.route)));
document.getElementById("installTipBtn").addEventListener("click", () => showToast("iPhone：Safari 分享按钮 → 添加到主屏幕"));
window.addEventListener("hashchange", () => { state.route = location.hash.replace("#", "") || "home"; updateNav(); render(); });
if ("serviceWorker" in navigator) window.addEventListener("load", () => navigator.serviceWorker.register("service-worker.js").catch(() => {}));
state.route = location.hash.replace("#", "") || "home"; updateNav(); render();
