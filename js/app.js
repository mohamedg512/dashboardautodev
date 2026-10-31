/**
 * AutoDev Agency — Premium Admin Dashboard App
 * Login · Dark/Light · AR/FR · Tasks · Team · Detail views
 */
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];

const AUTH_KEY = "autodev_dash_auth";
let supabaseSession = null;
function isLoggedIn() { return !!supabaseSession; }
function setLoggedIn(v) { if (!v) supabaseSession = null; }

function formatMoney(n, sym) {
  if (n == null || isNaN(n)) return "—";
  return new Intl.NumberFormat(getLang() === "ar" ? "ar-DZ" : "fr-DZ").format(n) + " " + (sym || t("currency"));
}
function formatDate(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString(getLang() === "ar" ? "ar-DZ" : "fr-FR", { year: "numeric", month: "short", day: "numeric" });
  } catch { return iso; }
}
function formatDateTime(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString(getLang() === "ar" ? "ar-DZ" : "fr-FR", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch { return iso; }
}
function initials(name) {
  if (!name) return "?";
  return name.trim().split(/\s+/).slice(0, 2).map(w => w[0]).join("").toUpperCase();
}
function pickI18n(val) {
  if (val == null) return "";
  if (typeof val === "string") return val;
  const lang = getLang();
  return val[lang] || val.ar || val.fr || val.en || Object.values(val)[0] || "";
}
function esc(str) {
  if (str == null) return "";
  return String(str).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}
function toast(msg, type = "success") {
  const c = $("#toastContainer");
  const el = document.createElement("div");
  el.className = `toast ${type}`;
  el.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${type==="success"?'<path d="M20 6L9 17l-5-5"/>':'<circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/>'}</svg><span>${msg}</span>`;
  c.appendChild(el);
  setTimeout(() => { el.style.opacity="0"; setTimeout(() => el.remove(), 300); }, 3000);
}
function confirmAction(msg) { return window.confirm(msg); }

const STATUS_KEYS = {
  new: "st_new", contacted: "st_contacted", quoted: "st_quoted", won: "st_won", lost: "st_lost",
  active: "active", inactive: "inactive", prospect: "prospect",
  draft: "draft", in_progress: "in_progress", completed: "completed", archived: "archived",
  todo: "todo", doing: "doing", done: "done", cancelled: "cancelled",
  unread: "unread", read: "read", replied: "replied",
  high: "high", medium: "medium", low: "low",
  scheduled: "scheduled", paused: "paused", expired: "expired", terminated: "terminated",
};
function statusBadge(status) {
  const label = t(STATUS_KEYS[status] || status) || status;
  return `<span class="badge badge-${status}">${label}</span>`;
}

const SERVICE_LABELS = () => ({
  website: getLang()==="fr"?"Site web":"موقع ويب",
  mobile: getLang()==="fr"?"App mobile":"تطبيق موبايل",
  dashboard: getLang()==="fr"?"Dashboard":"لوحة تحكم",
  uiux: "UI/UX", automation: getLang()==="fr"?"Automatisation":"أتمتة",
  other: getLang()==="fr"?"Autre":"أخرى",
});
const PLATFORM_LABELS = () => ({
  facebook: "Facebook", instagram: "Instagram", google: "Google",
  linkedin: "LinkedIn", tiktok: "TikTok", other: getLang()==="fr"?"Autre":"أخرى",
});
const ROLE_LABELS = () => ({
  manager: getLang()==="fr"?"Manager":"مدير",
  developer: getLang()==="fr"?"Développeur":"مطور",
  designer: getLang()==="fr"?"Designer":"مصمم",
  marketing: getLang()==="fr"?"Marketing":"تسويق",
  support: getLang()==="fr"?"Support":"دعم",
  automation: getLang()==="fr"?"Automatisation":"أتمتة",
});
const PARTNER_TYPE = () => ({
  technology: getLang()==="fr"?"Tech":"تقني",
  marketing: getLang()==="fr"?"Marketing":"تسويقي",
  agency: getLang()==="fr"?"Agence":"وكالة",
  other: getLang()==="fr"?"Autre":"أخرى",
});

// Theme
function getTheme() { return localStorage.getItem("autodev_dash_theme") || "dark"; }
function setTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("autodev_dash_theme", theme);
  const btn = $("#themeToggle");
  if (btn) btn.title = theme === "dark" ? t("theme_light") : t("theme_dark");
  const moon = $("#iconMoon");
  const sun = $("#iconSun");
  // In dark mode show sun (click to go light); in light mode show moon (click to go dark)
  if (moon && sun) {
    if (theme === "dark") {
      moon.style.display = "none";
      sun.style.display = "inline-flex";
    } else {
      moon.style.display = "inline-flex";
      sun.style.display = "none";
    }
  }
}

const FLAG_SVG = {
  ar: `<svg viewBox="0 0 30 20" preserveAspectRatio="xMidYMid slice"><rect width="15" height="20" fill="#006233"/><rect x="15" width="15" height="20" fill="#fff"/><circle cx="16.5" cy="10" r="4" fill="#d21034"/><circle cx="17.5" cy="10" r="3.2" fill="#fff"/><polygon fill="#d21034" points="19.3,7.8 20,9.6 21.9,9.6 20.4,10.7 20.9,12.5 19.3,11.4 17.7,12.5 18.2,10.7 16.7,9.6 18.6,9.6"/></svg>`,
  fr: `<svg viewBox="0 0 30 20" preserveAspectRatio="xMidYMid slice"><rect width="10" height="20" fill="#002395"/><rect x="10" width="10" height="20" fill="#fff"/><rect x="20" width="10" height="20" fill="#ed2939"/></svg>`,
};

function updateLangFlag() {
  const flag = $("#flagIcon");
  if (!flag) return;
  const lang = getLang();
  flag.innerHTML = FLAG_SVG[lang] || FLAG_SVG.ar;
  const btn = $("#langToggle");
  if (btn) btn.title = lang === "ar" ? "Français" : "العربية";
}

// ---------- Modal ----------
function openModal(title, bodyHtml, footerHtml = "", cls = "") {
  $("#modalTitle").textContent = title;
  $("#modalBody").innerHTML = bodyHtml;
  $("#modalFooter").innerHTML = footerHtml || `<button class="btn btn-outline" onclick="closeModal()">${t("cancel")}</button><button class="btn btn-primary" id="modalSaveBtn">${t("save")}</button>`;
  const modal = $("#modal");
  modal.className = "modal" + (cls ? " " + cls : "");
  $("#modalOverlay").classList.add("open");
}
function closeModal() { $("#modalOverlay").classList.remove("open"); }

// ---------- Router ----------
const views = {};
let currentView = "overview";
let charts = {};

async function navigate(viewId) {
  if (isLoggedIn() && window.canAccess && !(await window.canAccess(viewId))) {
    toast(t("error") || "ليس لديك صلاحية للوصول إلى هذا القسم", "error");
    return;
  }
  currentView = viewId;
  $$(".view").forEach(v => v.classList.remove("active"));
  $$(".nav-item").forEach(n => n.classList.remove("active"));
  const view = $(`#view-${viewId}`);
  const nav = $(`.nav-item[data-view="${viewId}"]`);
  if (view) view.classList.add("active");
  if (nav) nav.classList.add("active");
  const keyMap = {
    overview: "page_overview", requests: "page_requests", clients: "page_clients",
    projects: "page_projects", tasks: "page_tasks", partners: "page_partners",
    contracts: "page_contracts", automations: "page_automations", ads: "page_ads", messages: "page_messages",
    services: "page_services", sitecontent: "nav_sitecontent", portfolioprojects: "nav_portfolioprojects", homeprojects: "page_homeprojects", testimonials: "page_testimonials", blog: "page_blog", faq: "page_faq", invoices: "page_invoices", permissions: "page_permissions", team: "page_team", settings: "page_settings",
  };
  const pt = $("#pageTitle");
  if (pt) { pt.dataset.pageKey = keyMap[viewId] || ""; pt.textContent = t(keyMap[viewId] || viewId); }
  $(".sidebar")?.classList.remove("open");
  $(".sidebar-overlay")?.classList.remove("open");
  if (views[viewId]) views[viewId]();
}

// ========== OVERVIEW ==========
views.overview = async function () {
  const stats = await API.getDashboardStats();
  const settings = await API.getSettings();
  const set = (id, v) => { const el = $(id); if (el) el.textContent = v; };
  set("#statNewRequests", stats.newRequests);
  set("#statTotalRequests", `${t("of_total")} ${stats.totalRequests}`);
  set("#statActiveClients", stats.activeClients);
  set("#statTotalClients", `${t("of_total")} ${stats.totalClients}`);
  set("#statProjects", stats.totalProjects);
  set("#statVisibleProjects", `${stats.visibleProjects} ${t("visible")}`);
  set("#statRevenue", formatMoney(stats.totalRevenue, settings.currency_symbol));
  set("#statOpenTasks", stats.openTasks || 0);
  set("#statUnread", stats.unreadMessages);
  set("#statAdSpent", formatMoney(stats.adSpent, settings.currency_symbol));
  set("#statAdBudget", `${t("of_total")} ${formatMoney(stats.adBudget, settings.currency_symbol)}`);
  const pct = stats.adBudget ? Math.min(100, Math.round((stats.adSpent / stats.adBudget) * 100)) : 0;
  const fill = $("#adProgressFill"); if (fill) fill.style.width = pct + "%";
  set("#adProgressText", pct + "%");

  const reqBody = $("#recentRequestsBody");
  if (reqBody) {
    if (!stats.recentRequests.length) reqBody.innerHTML = `<tr><td colspan="5" class="empty-state">${t("no_data")}</td></tr>`;
    else reqBody.innerHTML = stats.recentRequests.map(r => `
      <tr class="clickable" onclick="viewRequest('${r.id}')">
        <td><div style="display:flex;align-items:center;gap:10px"><div class="avatar-sm">${initials(r.name)}</div>
          <div><div style="font-weight:600">${esc(r.name)}</div><div class="text-muted" style="font-size:.8rem">${esc(r.company||r.email)}</div></div></div></td>
        <td>${SERVICE_LABELS()[r.service]||r.service}</td>
        <td>${statusBadge(r.status)}</td>
        <td>${formatDate(r.created_at)}</td>
        <td><button class="btn-icon" onclick="event.stopPropagation();viewRequest('${r.id}')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></button></td>
      </tr>`).join("");
  }
  const msgBody = $("#recentMessagesBody");
  if (msgBody) {
    if (!stats.recentMessages.length) msgBody.innerHTML = `<tr><td colspan="4" class="empty-state">${t("no_data")}</td></tr>`;
    else msgBody.innerHTML = stats.recentMessages.map(m => `
      <tr class="clickable" onclick="viewMessage('${m.id}')">
        <td><div style="font-weight:600">${esc(m.name)}</div><div class="text-muted" style="font-size:.8rem">${esc(m.email)}</div></td>
        <td>${esc(m.subject)}</td><td>${statusBadge(m.status)}</td><td>${formatDate(m.created_at)}</td>
      </tr>`).join("");
  }
  renderRequestsChart();
};

async function renderRequestsChart() {
  const requests = await API.list("requests");
  const counts = { new:0, contacted:0, quoted:0, won:0, lost:0 };
  requests.forEach(r => { if (counts[r.status]!==undefined) counts[r.status]++; });
  const ctx = $("#requestsChart"); if (!ctx) return;
  if (charts.requests) charts.requests.destroy();
  const isDark = getTheme() === "dark";
  charts.requests = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: [t("st_new"), t("st_contacted"), t("st_quoted"), t("st_won"), t("st_lost")],
      datasets: [{ data: Object.values(counts), backgroundColor: ["#00d4ff","#3b82f6","#eab308","#22c55e","#ef4444"], borderWidth: 0 }],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { position: "bottom", labels: { color: isDark ? "#94a3b8" : "#475569", font: { family: "Cairo", size: 12 }, padding: 14 } } },
    },
  });
}

// ========== REQUESTS ==========
views.requests = async function () {
  const items = await API.list("requests");
  const filter = $("#reqFilterStatus")?.value || "all";
  const search = ($("#reqSearch")?.value || "").toLowerCase();
  let list = items;
  if (filter !== "all") list = list.filter(r => r.status === filter);
  if (search) list = list.filter(r => (r.name||"").toLowerCase().includes(search) || (r.email||"").toLowerCase().includes(search) || (r.company||"").toLowerCase().includes(search));
  const tbody = $("#requestsTableBody");
  if (!tbody) return;
  if (!list.length) { tbody.innerHTML = `<tr><td colspan="8"><div class="empty-state"><h4>${t("no_data")}</h4></div></td></tr>`; return; }
  tbody.innerHTML = list.map(r => `
    <tr class="clickable" onclick="viewRequest('${r.id}')">
      <td><div style="display:flex;align-items:center;gap:10px"><div class="avatar-sm">${initials(r.name)}</div>
        <div><div style="font-weight:600">${esc(r.name)}</div><div class="text-muted" style="font-size:.8rem">${esc(r.company||"—")}</div></div></div></td>
      <td><div>${esc(r.email)}</div><div class="text-muted" style="font-size:.8rem">${esc(r.phone||"")}</div></td>
      <td>${SERVICE_LABELS()[r.service]||r.service}</td>
      <td>${statusBadge(r.status)}</td>
      <td>${statusBadge(r.priority)}</td>
      <td>${formatDate(r.created_at)}</td>
      <td class="text-muted" style="max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(r.description||"—")}</td>
      <td><div class="actions" onclick="event.stopPropagation()">
        <button class="btn-icon" title="${t("view")}" onclick="viewRequest('${r.id}')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></button>
        <button class="btn-icon" title="${t("edit")}" onclick="editRequest('${r.id}')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
        <button class="btn-icon danger" title="${t("delete")}" onclick="deleteItem('requests','${r.id}')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg></button>
      </div></td>
    </tr>`).join("");
};

window.viewRequest = async function (id) {
  const r = await API.get("requests", id);
  if (!r) return;
  openModal(t("request_detail"), `
    <div class="detail-grid">
      <div class="detail-block">
        <h4>${t("client_info")}</h4>
        <div class="detail-row"><span class="lbl">${t("name")}</span><span class="val">${esc(r.name)}</span></div>
        <div class="detail-row"><span class="lbl">${t("company")}</span><span class="val">${esc(r.company||"—")}</span></div>
        <div class="detail-row"><span class="lbl">${t("email")}</span><span class="val">${esc(r.email)}</span></div>
        <div class="detail-row"><span class="lbl">${t("phone")}</span><span class="val">${esc(r.phone||"—")}</span></div>
      </div>
      <div class="detail-block">
        <h4>${t("request_info")}</h4>
        <div class="detail-row"><span class="lbl">${t("service")}</span><span class="val">${SERVICE_LABELS()[r.service]||r.service}</span></div>
        <div class="detail-row"><span class="lbl">${t("status")}</span><span class="val">${statusBadge(r.status)}</span></div>
        <div class="detail-row"><span class="lbl">${t("priority")}</span><span class="val">${statusBadge(r.priority)}</span></div>
        <div class="detail-row"><span class="lbl">${t("channel")}</span><span class="val">${esc(r.channel||"—")}</span></div>
        <div class="detail-row"><span class="lbl">${t("date")}</span><span class="val">${formatDateTime(r.created_at)}</span></div>
      </div>
      <div class="detail-block full">
        <h4>${t("description")}</h4>
        <p style="font-size:.92rem;line-height:1.7">${esc(r.description||"—")}</p>
      </div>
      ${r.notes ? `<div class="detail-block full"><h4>${t("internal_notes")}</h4><p style="font-size:.92rem">${esc(r.notes)}</p></div>` : ""}
    </div>
  `, `
    <button class="btn btn-outline" onclick="closeModal()">${t("close")}</button>
    <button class="btn btn-outline" onclick="closeModal();editRequest('${id}')">${t("edit")}</button>
    ${r.status==="new"?`<button class="btn btn-success" onclick="updateRequestStatus('${id}','contacted')">${t("mark_contacted")}</button>`:""}
    ${r.status==="contacted"?`<button class="btn btn-primary" onclick="updateRequestStatus('${id}','quoted')">${t("mark_quoted")}</button>`:""}
    ${r.status==="quoted"?`<button class="btn btn-success" onclick="updateRequestStatus('${id}','won')">${t("mark_won")}</button>
    <button class="btn btn-danger" onclick="updateRequestStatus('${id}','lost')">${t("mark_lost")}</button>`:""}
    ${r.status==="new"||r.status==="contacted"?`<button class="btn btn-orange" onclick="updateRequestStatus('${id}','won')">${t("approve")}</button>`:""}
  `, "detail");
};

window.updateRequestStatus = async function (id, status) {
  await API.update("requests", id, { status });
  toast(t("saved"));
  closeModal();
  views.requests();
  updateBadges();
};

window.editRequest = async function (id) {
  const r = id ? await API.get("requests", id) : { name:"",company:"",email:"",phone:"",service:"website",status:"new",priority:"medium",channel:"whatsapp",description:"",notes:"" };
  openModal(id ? t("edit_request") : t("add_request"), `
    <div class="form-grid">
      <div class="form-group"><label>${t("name")} <span class="req">*</span></label><input class="form-control" id="f_name" value="${esc(r.name)}"></div>
      <div class="form-group"><label>${t("company")}</label><input class="form-control" id="f_company" value="${esc(r.company||"")}"></div>
      <div class="form-group"><label>${t("email")} <span class="req">*</span></label><input class="form-control" id="f_email" type="email" value="${esc(r.email)}"></div>
      <div class="form-group"><label>${t("phone")}</label><input class="form-control" id="f_phone" value="${esc(r.phone||"")}"></div>
      <div class="form-group"><label>${t("service")}</label><select class="form-control" id="f_service">${Object.entries(SERVICE_LABELS()).map(([k,v])=>`<option value="${k}" ${r.service===k?"selected":""}>${v}</option>`).join("")}</select></div>
      <div class="form-group"><label>${t("status")}</label><select class="form-control" id="f_status">${["new","contacted","quoted","won","lost"].map(s=>`<option value="${s}" ${r.status===s?"selected":""}>${t(STATUS_KEYS[s])}</option>`).join("")}</select></div>
      <div class="form-group"><label>${t("priority")}</label><select class="form-control" id="f_priority">${["high","medium","low"].map(s=>`<option value="${s}" ${r.priority===s?"selected":""}>${t(s)}</option>`).join("")}</select></div>
      <div class="form-group"><label>${t("channel")}</label><select class="form-control" id="f_channel"><option value="whatsapp" ${r.channel==="whatsapp"?"selected":""}>WhatsApp</option><option value="email" ${r.channel==="email"?"selected":""}>Email</option><option value="phone" ${r.channel==="phone"?"selected":""}>Phone</option></select></div>
      <div class="form-group full"><label>${t("description")}</label><textarea class="form-control" id="f_description">${esc(r.description||"")}</textarea></div>
      <div class="form-group full"><label>${t("internal_notes")}</label><textarea class="form-control" id="f_notes">${esc(r.notes||"")}</textarea></div>
    </div>
  `);
  $("#modalSaveBtn").onclick = async () => {
    const payload = { name:$("#f_name").value.trim(), company:$("#f_company").value.trim(), email:$("#f_email").value.trim(), phone:$("#f_phone").value.trim(), service:$("#f_service").value, status:$("#f_status").value, priority:$("#f_priority").value, channel:$("#f_channel").value, description:$("#f_description").value.trim(), notes:$("#f_notes").value.trim() };
    if (!payload.name || !payload.email) { toast(t("required"), "error"); return; }
    let saved;
    if (id) saved = await API.update("requests", id, payload);
    else {
      saved = await API.create("requests", payload);
      try {
        const wa = await API.notifyWhatsAppNewRequest(saved || payload);
        if (wa) {
          const open = confirm((t("whatsapp_open_confirm") || "فتح واتساب لإرسال إشعار بالطلب الجديد؟"));
          if (open) window.open(wa, "_blank");
        }
      } catch (e) {}
    }
    closeModal(); toast(t("saved")); views.requests(); updateBadges();
  };
};

// ========== CLIENTS (compact) ==========
views.clients = async function () {
  const items = await API.list("clients");
  const search = ($("#cliSearch")?.value||"").toLowerCase();
  let list = search ? items.filter(c => (c.name||"").toLowerCase().includes(search)||(c.email||"").toLowerCase().includes(search)) : items;
  const settings = await API.getSettings();
  const tbody = $("#clientsTableBody"); if (!tbody) return;
  if (!list.length) { tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state"><h4>${t("no_data")}</h4></div></td></tr>`; return; }
  tbody.innerHTML = list.map(c => `
    <tr>
      <td><div style="display:flex;align-items:center;gap:10px"><div class="avatar-sm">${initials(c.name)}</div>
        <div><div style="font-weight:600">${esc(c.name)}</div><div class="text-muted" style="font-size:.8rem">${esc(c.contact_person||"")}</div></div></div></td>
      <td><div>${esc(c.email)}</div><div class="text-muted" style="font-size:.8rem">${esc(c.phone||"")}</div></td>
      <td>${esc(c.industry||"—")}</td>
      <td>${statusBadge(c.status)}</td>
      <td>${c.total_projects||0}</td>
      <td>${formatMoney(c.total_revenue, settings.currency_symbol)}</td>
      <td><div class="actions">
        <button class="btn-icon" onclick="editClient('${c.id}')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
        <button class="btn-icon danger" onclick="deleteItem('clients','${c.id}')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg></button>
      </div></td>
    </tr>`).join("");
};

window.editClient = async function (id) {
  const c = id ? await API.get("clients", id) : { name:"",contact_person:"",email:"",phone:"",website:"",industry:"",status:"prospect",total_revenue:0,notes:"",logo:"" };
  openModal(id ? t("edit_client") : t("add_client"), `
    <div class="form-grid">
      <div class="form-group"><label>${t("name")} <span class="req">*</span></label><input class="form-control" id="f_name" value="${esc(c.name)}"></div>
      <div class="form-group"><label>${t("contact_person")}</label><input class="form-control" id="f_contact" value="${esc(c.contact_person||"")}"></div>
      <div class="form-group"><label>${t("email")}</label><input class="form-control" id="f_email" value="${esc(c.email||"")}"></div>
      <div class="form-group"><label>${t("phone")}</label><input class="form-control" id="f_phone" value="${esc(c.phone||"")}"></div>
      <div class="form-group"><label>${t("website")}</label><input class="form-control" id="f_website" value="${esc(c.website||"")}"></div>
      <div class="form-group"><label>${t("industry")}</label><input class="form-control" id="f_industry" value="${esc(c.industry||"")}"></div>
      <div class="form-group"><label>${t("status")}</label><select class="form-control" id="f_status">${["active","prospect","inactive"].map(s=>`<option value="${s}" ${c.status===s?"selected":""}>${t(STATUS_KEYS[s]||s)}</option>`).join("")}</select></div>
      <div class="form-group"><label>${t("total_revenue")}</label><input class="form-control" id="f_revenue" type="number" value="${c.total_revenue||0}"></div>
      <div class="form-group full"><label>${t("notes")}</label><textarea class="form-control" id="f_notes">${esc(c.notes||"")}</textarea></div>
    <div class="form-group full"><label>Logo</label><input type="file" accept="image/*" id="f_client_logo_file" class="form-control"><input type="hidden" id="f_client_logo" value="${esc(c.logo||"")}"></div>
    </div>
  `);
  document.getElementById("f_client_logo_file")?.addEventListener("change", async (e) => {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader(); r.onload = () => { const el = document.getElementById("f_client_logo"); if (el) el.value = r.result; }; r.readAsDataURL(f);
  });
  $("#modalSaveBtn").onclick = async () => {
    const payload = { name:$("#f_name").value.trim(), contact_person:$("#f_contact").value.trim(), email:$("#f_email").value.trim(), phone:$("#f_phone").value.trim(), website:$("#f_website").value.trim(), industry:$("#f_industry").value.trim(), status:$("#f_status").value, total_revenue:Number($("#f_revenue").value)||0, notes:$("#f_notes").value.trim() };
    if (!payload.name) { toast(t("required"),"error"); return; }
    if (id) await API.update("clients", id, payload); else await API.create("clients", {...payload, total_projects:0});
    closeModal(); toast(t("saved")); views.clients();
  };
};

// ========== PROJECTS ==========
views.projects = async function () {
  const [items, categories, clients] = await Promise.all([API.list("projects"), API.list("categories"), API.list("clients")]);
  const search = ($("#projSearch")?.value||"").toLowerCase();
  let list = search ? items.filter(p => pickI18n(p.title).toLowerCase().includes(search)) : items;
  const catMap = Object.fromEntries(categories.map(c => [c.id, pickI18n(c.name)]));
  const cliMap = Object.fromEntries(clients.map(c => [c.id, c.name]));
  const tbody = $("#projectsTableBody"); if (!tbody) return;
  if (!list.length) { tbody.innerHTML = `<tr><td colspan="8"><div class="empty-state"><h4>${t("no_data")}</h4></div></td></tr>`; return; }
  tbody.innerHTML = list.map(p => `
    <tr class="clickable" onclick="viewProject('${p.id}')">
      <td><div style="display:flex;align-items:center;gap:12px">
        ${p.cover_image_url?`<img src="${esc(p.cover_image_url)}" alt="" style="width:48px;height:36px;object-fit:cover;border-radius:6px">`:`<div class="avatar-sm" style="width:48px;height:36px;border-radius:6px">P</div>`}
        <div><div style="font-weight:600">${esc(pickI18n(p.title))}</div><div class="text-muted" style="font-size:.78rem">${p.year||""} ${p.featured?"★":""}</div></div>
      </div></td>
      <td>${(p.category_ids||[]).map(id=>catMap[id]||id).join(" · ")||"—"}</td>
      <td>${cliMap[p.client_id]||"—"}</td>
      <td>${statusBadge(p.status)}</td>
      <td>${p.is_visible!==false?`<span class="text-success">${t("visible")}</span>`:`<span class="text-muted">${t("hidden")}</span>`}</td>
      <td>${(p.technologies||[]).slice(0,3).join(", ")}${(p.technologies||[]).length>3?"…":""}</td>
      <td>${p.likes_count||0}</td>
      <td><div class="actions" onclick="event.stopPropagation()">
        <button class="btn-icon" onclick="viewProject('${p.id}')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></button>
        <button class="btn-icon" onclick="editProject('${p.id}')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
        <button class="btn-icon danger" onclick="deleteItem('projects','${p.id}')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg></button>
      </div></td>
    </tr>`).join("");
};

window.viewProject = async function (id) {
  const [p, clients, categories] = await Promise.all([API.get("projects", id), API.list("clients"), API.list("categories")]);
  if (!p) return;
  const cli = clients.find(c => c.id === p.client_id);
  const cats = (p.category_ids||[]).map(cid => { const c = categories.find(x=>x.id===cid); return c?pickI18n(c.name):cid; }).join(" · ");
  openModal(t("project_detail"), `
    <div class="detail-grid">
      ${p.cover_image_url?`<div class="detail-block full"><img src="${esc(p.cover_image_url)}" style="width:100%;max-height:200px;object-fit:cover;border-radius:10px"></div>`:""}
      <div class="detail-block">
        <h4>${t("title")}</h4>
        <div style="font-weight:700;font-size:1.1rem;margin-bottom:8px">${esc(pickI18n(p.title))}</div>
        <div class="detail-row"><span class="lbl">${t("year")}</span><span class="val">${esc(p.year||"—")}</span></div>
        <div class="detail-row"><span class="lbl">${t("status")}</span><span class="val">${statusBadge(p.status)}</span></div>
        <div class="detail-row"><span class="lbl">${t("client")}</span><span class="val">${esc(cli?.name||"—")}</span></div>
        <div class="detail-row"><span class="lbl">${t("categories")}</span><span class="val">${esc(cats||"—")}</span></div>
      </div>
      <div class="detail-block">
        <h4>${t("technologies")}</h4>
        <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px">${(p.technologies||[]).map(tech=>`<span class="badge badge-draft">${esc(tech)}</span>`).join("")||"—"}</div>
        <div class="detail-row"><span class="lbl">${t("likes")}</span><span class="val">${p.likes_count||0}</span></div>
        <div class="detail-row"><span class="lbl">${t("budget")}</span><span class="val">${formatMoney(p.budget)}</span></div>
        <div class="detail-row"><span class="lbl">${t("visible")}</span><span class="val">${p.is_visible!==false?t("yes"):t("no")}</span></div>
        <div class="detail-row"><span class="lbl">${t("featured")}</span><span class="val">${p.featured?t("yes"):t("no")}</span></div>
        <div class="detail-row"><span class="lbl">${t("progress")||"التقدم"}</span><span class="val">${typeof p.progress==="number"?p.progress: (p.status==="completed"?100:45)}%</span></div>
      </div>
            <div class="detail-block full">
        <h4>${t("client_tracking")||"متابعة العميل"}</h4>
        <p class="text-muted" style="font-size:.85rem;margin-bottom:10px">${t("client_tracking_hint")||"شارك هذا الرابط مع العميل لمتابعة حالة المشروع."}</p>
        <div class="detail-row"><span class="lbl">${t("progress")||"التقدم"}</span><span class="val">${typeof p.progress==="number"?p.progress:(p.status==="completed"?100:0)}%</span></div>
        <div class="detail-row"><span class="lbl">رمز المتابعة</span><span class="val" style="font-family:monospace;font-size:.85rem">${esc(p.public_token||"—")}</span></div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-top:10px">
          <input class="form-control" id="trackLinkInput" readonly value="" style="flex:1;min-width:200px;font-size:.8rem" placeholder="اضغط توليد رابط">
          <button type="button" class="btn btn-outline btn-sm" onclick="copyTrackLink()">${t("copy_link")||"نسخ"}</button>
          <button type="button" class="btn btn-primary btn-sm" onclick="regenerateTrackLink('${p.id}', false)">${t("generate_link")||"توليد / نسخ"}</button>
          <button type="button" class="btn btn-outline btn-sm" onclick="regenerateTrackLink('${p.id}', true)">توليد من جديد</button>
          <a class="btn btn-outline btn-sm" id="trackOpenBtn" href="#" target="_blank" rel="noopener">فتح صفحة العميل</a>
        </div>
      </div>
<div class="detail-block full">
        <h4>${t("description")}</h4>
        <p style="font-size:.92rem;line-height:1.7">${esc(pickI18n(p.short_description)||pickI18n(p.description)||"—")}</p>
      </div>
    </div>
  `, `<button class="btn btn-outline" onclick="closeModal()">${t("close")}</button>
      <button class="btn btn-primary" onclick="closeModal();editProject('${id}')">${t("edit")}</button>`, "detail");
};

// fill track fields after project detail modal opens
(function patchViewTrack(){
  const _vp = window.viewProject;
  if (!_vp || _vp.__patched) return;
  window.viewProject = async function(id) {
    await _vp(id);
    setTimeout(() => {
      const el = document.getElementById("trackLinkInput");
      const openBtn = document.getElementById("trackOpenBtn");
      const url = window.__trackUrl || "";
      if (el && url) el.value = url;
      if (openBtn && url) openBtn.href = url;
    }, 50);
  };
  window.viewProject.__patched = true;
})();

window.editProject = async function (id) {
  const [p, categories, clients] = await Promise.all([id?API.get("projects",id):null, API.list("categories"), API.list("clients")]);
  const data = p || { title:{ar:"",en:""}, short_description:{ar:""}, year:String(new Date().getFullYear()), cover_image_url:"", category_ids:[], technologies:[], client_id:"", status:"draft", budget:0, is_visible:true, featured:false, likes_count:0 };
  openModal(id?t("edit_project"):t("add_project"), `
    <div class="form-grid">
      <div class="form-group"><label>${t("title")} (AR) *</label><input class="form-control" id="f_title_ar" value="${esc(data.title?.ar||"")}"></div>
      <div class="form-group"><label>${t("title")} (EN)</label><input class="form-control" id="f_title_en" value="${esc(data.title?.en||"")}"></div>
      <div class="form-group full"><label>${t("description")}</label><textarea class="form-control" id="f_short_ar">${esc(data.short_description?.ar||"")}</textarea></div>
      <div class="form-group"><label>${t("year")}</label><input class="form-control" id="f_year" value="${esc(data.year||"")}"></div>
      <div class="form-group"><label>${t("cover")}</label><input class="form-control" id="f_cover" value="${esc(data.cover_image_url||"")}"></div>
      <div class="form-group"><label>${t("categories")}</label><select class="form-control" id="f_cats" multiple style="min-height:80px">${categories.map(c=>`<option value="${c.id}" ${(data.category_ids||[]).includes(c.id)?"selected":""}>${pickI18n(c.name)}</option>`).join("")}</select></div>
      <div class="form-group"><label>${t("client")}</label><select class="form-control" id="f_client"><option value="">—</option>${clients.map(c=>`<option value="${c.id}" ${data.client_id===c.id?"selected":""}>${esc(c.name)}</option>`).join("")}</select></div>
      <div class="form-group"><label>${t("status")}</label><select class="form-control" id="f_status">${["draft","in_progress","completed","archived"].map(s=>`<option value="${s}" ${data.status===s?"selected":""}>${t(STATUS_KEYS[s])}</option>`).join("")}</select></div>
      <div class="form-group"><label>${t("technologies")}</label><input class="form-control" id="f_tech" value="${esc((data.technologies||[]).join(", "))}"></div>
      <div class="form-group"><label>${t("budget")}</label><input class="form-control" id="f_budget" type="number" value="${data.budget||0}"></div>
      <div class="form-group"><label>${t("progress")||"التقدم %"}</label><input class="form-control" id="f_progress" type="number" min="0" max="100" value="${typeof data.progress==="number"?data.progress:(data.status==="completed"?100:0)}"></div>
      <div class="form-group" style="flex-direction:row;align-items:center;gap:20px;padding-top:18px">
        
      <div class="form-group full" style="border-top:1px solid var(--border);padding-top:14px;margin-top:6px">
        <label style="font-weight:700;margin-bottom:8px;display:block">متابعة العميل — المراحل</label>
        <div style="display:grid;gap:8px">
          ${[0,1,2,3].map(i => {
            const ms = (data.milestones && data.milestones[i]) || { title: ["بدء المشروع","التصميم","التطوير","التسليم"][i], done: false };
            return `<div style="display:flex;gap:8px;align-items:center">
              <input type="checkbox" id="f_ms_done_${i}" ${ms.done?"checked":""}>
              <input class="form-control" id="f_ms_title_${i}" value="${esc(ms.title||"")}" placeholder="اسم المرحلة">
            </div>`;
          }).join("")}
        </div>
        <label style="display:flex;align-items:center;gap:8px;margin-top:12px;cursor:pointer">
          <input type="checkbox" id="f_tracking_enabled" ${data.tracking_enabled!==false?"checked":""}>
          تفعيل رابط المتابعة لهذا المشروع
        </label>
      </div>
        <label style="display:flex;align-items:center;gap:8px;cursor:pointer"><input type="checkbox" id="f_visible" ${data.is_visible!==false?"checked":""}> ${t("visible")}</label>
        <label style="display:flex;align-items:center;gap:8px;cursor:pointer"><input type="checkbox" id="f_featured" ${data.featured?"checked":""}> ${t("featured")}</label>
      </div>
    </div>
  `, null, "wide");
  $("#modalSaveBtn").onclick = async () => {
    const titleAr = $("#f_title_ar").value.trim();
    if (!titleAr) { toast(t("required"),"error"); return; }
    const category_ids = [...$("#f_cats").selectedOptions].map(o=>o.value);
    const payload = {
      title: { ar: titleAr, en: $("#f_title_en").value.trim()||titleAr, fr: data.title?.fr||titleAr },
      short_description: { ar: $("#f_short_ar").value.trim(), en: data.short_description?.en||"", fr: data.short_description?.fr||"" },
      description: data.description||{ar:"",en:"",fr:""}, year:$("#f_year").value.trim(), cover_image_url:$("#f_cover").value.trim(),
      category_ids, client_id: $("#f_client").value||null, status:$("#f_status").value,
      technologies: $("#f_tech").value.split(",").map(x=>x.trim()).filter(Boolean),
      budget: Number($("#f_budget").value)||0, is_visible: $("#f_visible").checked, featured: $("#f_featured").checked,
      likes_count: data.likes_count||0,
      progress: Number($("#f_progress")?.value) || data.progress || 0,
      public_token: data.public_token || ("trk_" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4)),
      milestones: [0,1,2,3].map(i => ({
        title: ($("#f_ms_title_"+i)?.value || "").trim() || ["بدء المشروع","التصميم","التطوير","التسليم"][i],
        done: !!$("#f_ms_done_"+i)?.checked,
      })),
      tracking_enabled: $("#f_tracking_enabled") ? $("#f_tracking_enabled").checked : true,
    };
    if (id) await API.update("projects", id, payload); else await API.create("projects", payload);
    try { await API.publishProjectsForTracking?.(); } catch(e) {}
    closeModal(); toast(t("saved")); views.projects();
  };
};

// ========== TASKS (Kanban) ==========
views.tasks = async function () {
  const [tasks, team] = await Promise.all([API.list("tasks"), API.list("team")]);
  const teamMap = Object.fromEntries(team.map(m => [m.id, m.name]));
  const cols = { todo: $("#kanbanTodo"), doing: $("#kanbanDoing"), done: $("#kanbanDone") };
  Object.values(cols).forEach(c => { if (c) c.innerHTML = ""; });
  const counts = { todo:0, doing:0, done:0 };
  tasks.forEach(task => {
    const col = cols[task.status];
    if (!col) return;
    counts[task.status] = (counts[task.status]||0)+1;
    const overdue = task.due_date && task.status !== "done" && new Date(task.due_date) < new Date(new Date().toDateString());
    col.innerHTML += `
      <div class="task-card" onclick="editTask('${task.id}')">
        <h5>${esc(task.title)}</h5>
        <div class="meta">
          ${statusBadge(task.priority)}
          ${overdue?`<span class="badge badge-overdue">${t("overdue")}</span>`:""}
          <span>${esc(teamMap[task.assignee_id]||"—")}</span>
          <span>${formatDate(task.due_date)}</span>
        </div>
      </div>`;
  });
  const setCount = (id, n) => { const el = $(id); if (el) el.textContent = n; };
  setCount("#countTodo", counts.todo||0);
  setCount("#countDoing", counts.doing||0);
  setCount("#countDone", counts.done||0);
};

window.editTask = async function (id) {
  const [task, team] = await Promise.all([id?API.get("tasks",id):null, API.list("team")]);
  const data = task || { title:"", description:"", status:"todo", priority:"medium", assignee_id:"", related_type:"none", related_id:null, due_date:"" };
  openModal(id?t("edit_task"):t("add_task"), `
    <div class="form-grid">
      <div class="form-group full"><label>${t("task_title")} *</label><input class="form-control" id="f_title" value="${esc(data.title)}"></div>
      <div class="form-group full"><label>${t("description")}</label><textarea class="form-control" id="f_desc">${esc(data.description||"")}</textarea></div>
      <div class="form-group"><label>${t("task_status")}</label><select class="form-control" id="f_status">${["todo","doing","done","cancelled"].map(s=>`<option value="${s}" ${data.status===s?"selected":""}>${t(STATUS_KEYS[s]||s)}</option>`).join("")}</select></div>
      <div class="form-group"><label>${t("priority")}</label><select class="form-control" id="f_priority">${["high","medium","low"].map(s=>`<option value="${s}" ${data.priority===s?"selected":""}>${t(s)}</option>`).join("")}</select></div>
      <div class="form-group"><label>${t("assignee")}</label><select class="form-control" id="f_assignee"><option value="">—</option>${team.map(m=>`<option value="${m.id}" ${data.assignee_id===m.id?"selected":""}>${esc(m.name)}</option>`).join("")}</select></div>
      <div class="form-group"><label>${t("due_date")}</label><input class="form-control" id="f_due" type="date" value="${(data.due_date||"").slice(0,10)}"></div>
      <div class="form-group"><label>${t("related_to")}</label><select class="form-control" id="f_reltype">
        <option value="none" ${data.related_type==="none"?"selected":""}>—</option>
        <option value="request" ${data.related_type==="request"?"selected":""}>${t("nav_requests")}</option>
        <option value="project" ${data.related_type==="project"?"selected":""}>${t("nav_projects")}</option>
        <option value="partner" ${data.related_type==="partner"?"selected":""}>${t("nav_partners")}</option>
        <option value="client" ${data.related_type==="client"?"selected":""}>${t("nav_clients")}</option>
      </select></div>
      <div class="form-group"><label>ID ${t("related_to")}</label><input class="form-control" id="f_relid" value="${esc(data.related_id||"")}" placeholder="req_001 / p1 / par_001"></div>
    </div>
  `);
  $("#modalSaveBtn").onclick = async () => {
    const payload = {
      title: $("#f_title").value.trim(), description: $("#f_desc").value.trim(),
      status: $("#f_status").value, priority: $("#f_priority").value,
      assignee_id: $("#f_assignee").value||null, due_date: $("#f_due").value,
      related_type: $("#f_reltype").value, related_id: $("#f_relid").value.trim()||null,
    };
    if (!payload.title) { toast(t("required"),"error"); return; }
    if (id) await API.update("tasks", id, payload); else await API.create("tasks", payload);
    closeModal(); toast(t("saved")); views.tasks();
  };
};

// ========== PARTNERS / CONTRACTS / ADS / MESSAGES / SERVICES / TEAM — streamlined ==========
views.partners = async function () {
  const items = await API.list("partners");
  const tbody = $("#partnersTableBody"); if (!tbody) return;
  if (!items.length) { tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state"><h4>${t("no_data")}</h4></div></td></tr>`; return; }
  tbody.innerHTML = items.map(p => `
    <tr>
      <td><div style="display:flex;align-items:center;gap:10px"><div class="avatar-sm">${initials(p.name)}</div>
        <div><div style="font-weight:600">${esc(p.name)}</div><div class="text-muted" style="font-size:.8rem">${esc(p.contact_person||"")}</div></div></div></td>
      <td>${PARTNER_TYPE()[p.type]||p.type}</td>
      <td><div>${esc(p.email||"")}</div><div class="text-muted" style="font-size:.8rem">${esc(p.phone||"")}</div></td>
      <td>${statusBadge(p.status)}</td>
      <td>${formatDate(p.partnership_start)}</td>
      <td><div class="actions">
        <button class="btn-icon" onclick="editPartner('${p.id}')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
        <button class="btn-icon danger" onclick="deleteItem('partners','${p.id}')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg></button>
      </div></td>
    </tr>`).join("");
};

window.editPartner = async function (id) {
  const p = id ? await API.get("partners", id) : { name:"", type:"technology", contact_person:"", email:"", phone:"", website:"", status:"active", partnership_start:"", notes:"" };
  openModal(id?t("edit_partner"):t("add_partner"), `
    <div class="form-grid">
      <div class="form-group"><label>${t("name")} *</label><input class="form-control" id="f_name" value="${esc(p.name)}"></div>
      <div class="form-group"><label>${t("partner_type")}</label><select class="form-control" id="f_type">${Object.entries(PARTNER_TYPE()).map(([k,v])=>`<option value="${k}" ${p.type===k?"selected":""}>${v}</option>`).join("")}</select></div>
      <div class="form-group"><label>${t("contact_person")}</label><input class="form-control" id="f_contact" value="${esc(p.contact_person||"")}"></div>
      <div class="form-group"><label>${t("email")}</label><input class="form-control" id="f_email" value="${esc(p.email||"")}"></div>
      <div class="form-group"><label>${t("phone")}</label><input class="form-control" id="f_phone" value="${esc(p.phone||"")}"></div>
      <div class="form-group"><label>${t("website")}</label><input class="form-control" id="f_website" value="${esc(p.website||"")}"></div>
      <div class="form-group"><label>${t("status")}</label><select class="form-control" id="f_status"><option value="active" ${p.status==="active"?"selected":""}>${t("active")}</option><option value="inactive" ${p.status==="inactive"?"selected":""}>${t("inactive")}</option></select></div>
      <div class="form-group"><label>${t("partnership_start")}</label><input class="form-control" id="f_start" type="date" value="${(p.partnership_start||"").slice(0,10)}"></div>
      <div class="form-group full"><label>${t("notes")}</label><textarea class="form-control" id="f_notes">${esc(p.notes||"")}</textarea></div>
    </div>
  `);
  $("#modalSaveBtn").onclick = async () => {
    const payload = { name:$("#f_name").value.trim(), type:$("#f_type").value, contact_person:$("#f_contact").value.trim(), email:$("#f_email").value.trim(), phone:$("#f_phone").value.trim(), website:$("#f_website").value.trim(), status:$("#f_status").value, partnership_start:$("#f_start").value, notes:$("#f_notes").value.trim() };
    if (!payload.name) { toast(t("required"),"error"); return; }
    if (id) await API.update("partners", id, payload); else await API.create("partners", payload);
    closeModal(); toast(t("saved")); views.partners();
  };
};

views.contracts = async function () {
  const [items, partners, team] = await Promise.all([API.list("contracts"), API.list("partners"), API.list("team")]);
  const pMap = Object.fromEntries(partners.map(p => [p.id, p.name]));
  const eMap = Object.fromEntries(team.map(m => [m.id, m.name]));
  const filter = $("#ctrFilterParty")?.value || "all";
  let list = items;
  if (filter !== "all") list = list.filter(c => (c.party_type || "partner") === filter);
  const tbody = $("#contractsTableBody"); if (!tbody) return;
  if (!list.length) { tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state"><h4>${t("no_data")}</h4></div></td></tr>`; return; }
  tbody.innerHTML = list.map(c => {
    const party = c.party_type === "employee"
      ? (eMap[c.employee_id] || "—")
      : (pMap[c.partner_id] || "—");
    const partyBadge = c.party_type === "employee"
      ? `<span class="badge badge-doing">${t("party_employee")}</span>`
      : `<span class="badge badge-todo">${t("party_partner")}</span>`;
    return `<tr>
      <td style="font-weight:600">${esc(c.title)}</td>
      <td>${partyBadge}<div class="text-muted" style="font-size:.8rem;margin-top:4px">${esc(party)}</div></td>
      <td>${esc(c.type)}</td>
      <td>${formatDate(c.start_date)} → ${formatDate(c.end_date)}</td>
      <td>${c.currency==="%"?c.value+"%":formatMoney(c.value)}</td>
      <td>${statusBadge(c.status)}</td>
      <td><div class="actions">
        <button class="btn-icon" title="${t("write_contract")}" onclick="openContractEditor('${c.id}')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg></button>
        <button class="btn-icon" onclick="editContract('${c.id}')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
        <button class="btn-icon danger" onclick="deleteItem('contracts','${c.id}')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg></button>
      </div></td>
    </tr>`;
  }).join("");
};

window.editContract = async function (id) {
  const [c, partners, team] = await Promise.all([
    id ? API.get("contracts", id) : null,
    API.list("partners"),
    API.list("team"),
  ]);
  const data = c || {
    title: "", party_type: "employee", partner_id: "", employee_id: "",
    type: "employment", start_date: "", end_date: "", value: 0, currency: "DZD",
    status: "draft", terms: "", body: "", auto_renew: false,
  };
  openModal(id ? t("edit_contract") : t("add_contract"), `
    <div class="form-grid">
      <div class="form-group full"><label>${t("contract_title")} *</label><input class="form-control" id="f_title" value="${esc(data.title)}"></div>
      <div class="form-group"><label>${t("party_type")}</label>
        <select class="form-control" id="f_party" onchange="document.getElementById('f_partner_wrap').style.display=this.value==='partner'?'':'none';document.getElementById('f_emp_wrap').style.display=this.value==='employee'?'':'none';">
          <option value="partner" ${data.party_type==="partner"?"selected":""}>${t("party_partner")}</option>
          <option value="employee" ${(data.party_type||"employee")==="employee"?"selected":""}>${t("party_employee")}</option>
        </select>
      </div>
      <div class="form-group"><label>${t("type")}</label>
        <select class="form-control" id="f_type">
          <option value="employment" ${data.type==="employment"?"selected":""}>${t("employment")}</option>
          <option value="freelance" ${data.type==="freelance"?"selected":""}>${t("freelance")}</option>
          <option value="nda" ${data.type==="nda"?"selected":""}>${t("nda")}</option>
          <option value="service" ${data.type==="service"?"selected":""}>service</option>
          <option value="referral" ${data.type==="referral"?"selected":""}>referral</option>
          <option value="revenue_share" ${data.type==="revenue_share"?"selected":""}>revenue_share</option>
          <option value="exclusive" ${data.type==="exclusive"?"selected":""}>exclusive</option>
        </select>
      </div>
      <div class="form-group" id="f_partner_wrap" style="display:${data.party_type==="partner"?"block":"none"}">
        <label>${t("partner")}</label>
        <select class="form-control" id="f_partner"><option value="">—</option>
          ${partners.map(p=>`<option value="${p.id}" ${data.partner_id===p.id?"selected":""}>${esc(p.name)}</option>`).join("")}
        </select>
      </div>
      <div class="form-group" id="f_emp_wrap" style="display:${(data.party_type||"employee")==="employee"?"block":"none"}">
        <label>${t("employee")}</label>
        <select class="form-control" id="f_employee"><option value="">—</option>
          ${team.map(m=>`<option value="${m.id}" ${data.employee_id===m.id?"selected":""}>${esc(m.name)}</option>`).join("")}
        </select>
      </div>
      <div class="form-group"><label>${t("start_date")}</label><input class="form-control" id="f_start" type="date" value="${(data.start_date||"").slice(0,10)}"></div>
      <div class="form-group"><label>${t("end_date")}</label><input class="form-control" id="f_end" type="date" value="${(data.end_date||"").slice(0,10)}"></div>
      <div class="form-group"><label>${t("value")}</label><input class="form-control" id="f_value" type="number" value="${data.value||0}"></div>
      <div class="form-group"><label>${t("currency")}</label>
        <select class="form-control" id="f_currency">
          <option value="DZD" ${data.currency==="DZD"?"selected":""}>DZD</option>
          <option value="%" ${data.currency==="%"?"selected":""}>%</option>
          <option value="EUR" ${data.currency==="EUR"?"selected":""}>EUR</option>
        </select>
      </div>
      <div class="form-group"><label>${t("status")}</label>
        <select class="form-control" id="f_status">
          ${["draft","active","expired","terminated"].map(s=>`<option value="${s}" ${data.status===s?"selected":""}>${t(STATUS_KEYS[s]||s)}</option>`).join("")}
        </select>
      </div>
      <div class="form-group" style="padding-top:18px">
        <label style="display:flex;align-items:center;gap:8px;cursor:pointer">
          <input type="checkbox" id="f_renew" ${data.auto_renew?"checked":""}> ${t("auto_renew")}
        </label>
      </div>
      <div class="form-group full"><label>${t("terms")}</label><textarea class="form-control" id="f_terms">${esc(data.terms||"")}</textarea></div>
    </div>
  `);
  $("#modalSaveBtn").onclick = async () => {
    const party_type = $("#f_party").value;
    const payload = {
      title: $("#f_title").value.trim(),
      party_type,
      partner_id: party_type === "partner" ? ($("#f_partner").value || null) : null,
      employee_id: party_type === "employee" ? ($("#f_employee").value || null) : null,
      type: $("#f_type").value,
      start_date: $("#f_start").value,
      end_date: $("#f_end").value,
      value: Number($("#f_value").value) || 0,
      currency: $("#f_currency").value,
      status: $("#f_status").value,
      terms: $("#f_terms").value.trim(),
      auto_renew: $("#f_renew").checked,
      body: data.body || "",
    };
    if (!payload.title) { toast(t("required"), "error"); return; }
    let saved;
    if (id) saved = await API.update("contracts", id, payload);
    else saved = await API.create("contracts", payload);
    closeModal();
    toast(t("saved"));
    views.contracts();
    // Automation: if new employment contract linked to employee - optional
  };
};

window.openContractEditor = async function (id) {
  const [c, partners, team, settings] = await Promise.all([
    API.get("contracts", id),
    API.list("partners"),
    API.list("team"),
    API.getSettings(),
  ]);
  if (!c) return;
  const partyName = c.party_type === "employee"
    ? (team.find(m => m.id === c.employee_id)?.name || "—")
    : (partners.find(p => p.id === c.partner_id)?.name || "—");
  const company = settings.company_name || "AutoDev Agency";

  openModal(t("contract_editor") + " — " + (c.title || ""), `
    <div class="form-grid full">
      <div class="flex-between mb-2">
        <div class="text-sec" style="font-size:.88rem">${esc(partyName)} · ${esc(c.type)}</div>
        <button type="button" class="btn btn-sm btn-outline" onclick="generateContractTemplate('${id}')">${t("generate_template")}</button>
      </div>
      <div class="form-group">
        <label>${t("contract_body")}</label>
        <textarea class="form-control" id="f_body" style="min-height:320px;font-family:Cairo,serif;line-height:1.8">${esc(c.body || c.terms || "")}</textarea>
      </div>
    </div>
  `, `
    <button class="btn btn-outline" onclick="closeModal()">${t("close")}</button>
    <button class="btn btn-outline" onclick="exportContract('${id}','txt')">${t("export_txt")}</button>
    <button class="btn btn-outline" onclick="exportContract('${id}','html')">${t("export_html")}</button>
    <button class="btn btn-primary" onclick="exportContract('${id}','print')">${t("print_contract")} / PDF</button>
    <button class="btn btn-orange" id="modalSaveBtn">${t("save")}</button>
  `, "wide");

  $("#modalSaveBtn").onclick = async () => {
    const body = $("#f_body").value;
    await API.update("contracts", id, { body });
    closeModal();
    toast(t("saved"));
    views.contracts();
  };
};

window.generateContractTemplate = async function (id) {
  const [c, partners, team, settings] = await Promise.all([
    API.get("contracts", id), API.list("partners"), API.list("team"), API.getSettings(),
  ]);
  if (!c) return;
  const company = settings.company_name || "AutoDev Agency";
  const party = c.party_type === "employee"
    ? (team.find(m => m.id === c.employee_id)?.name || "الطرف الثاني")
    : (partners.find(p => p.id === c.partner_id)?.name || "الطرف الثاني");
  const isEmp = c.party_type === "employee";
  const loc = getLang() === "fr";
  let tpl;
  if (loc) {
    tpl = `CONTRAT\
\
Entre : ${company} (ci-après « la Société »)\
Et : ${party} (ci-après « le ${isEmp?"Salarié":"Partenaire"} »)\
\
Article 1 — Objet\
${c.title || ""}\
\
Article 2 — Durée\
Du ${c.start_date || "…"} au ${c.end_date || "…"}\
\
Article 3 — Rémunération / Valeur\
${c.value || 0} ${c.currency || ""}\
\
Article 4 — Conditions\
${c.terms || "—"}\
\
Article 5 — Confidentialité\
Les parties s'engagent à préserver la confidentialité des informations échangées.\
\
Fait à ${settings.location || "…"}, le ${new Date().toLocaleDateString("fr-FR")}\
\
Signature Société          Signature ${isEmp?"Salarié":"Partenaire"}`;
  } else {
    tpl = `عقد\
\
بين: ${company} (يُشار إليها بـ «الشركة»)\
و: ${party} (يُشار إليه بـ «${isEmp?"الموظف":"الشريك"}»)\
\
المادة 1 — الموضوع\
${c.title || ""}\
\
المادة 2 — المدة\
من ${c.start_date || "…"} إلى ${c.end_date || "…"}\
\
المادة 3 — القيمة / الأجر\
${c.value || 0} ${c.currency || "د.ج"}\
\
المادة 4 — الشروط\
${c.terms || "—"}\
\
المادة 5 — السرية\
يلتزم الطرفان بالحفاظ على سرية المعلومات المتبادلة.\
\
حُرر في ${settings.location || "…"} بتاريخ ${new Date().toLocaleDateString("ar-DZ")}\
\
توقيع الشركة                    توقيع ${isEmp?"الموظف":"الشريك"}`;
  }
  const ta = $("#f_body");
  if (ta) ta.value = tpl;
};

window.exportContract = async function (id, format) {
  const [c, partners, team, settings] = await Promise.all([
    API.get("contracts", id), API.list("partners"), API.list("team"), API.getSettings(),
  ]);
  if (!c) return;
  // Prefer current editor text if open
  const liveBody = $("#f_body")?.value;
  const body = liveBody != null ? liveBody : (c.body || c.terms || "");
  const party = c.party_type === "employee"
    ? (team.find(m => m.id === c.employee_id)?.name || "")
    : (partners.find(p => p.id === c.partner_id)?.name || "");
  const company = settings.company_name || "AutoDev Agency";
  const safeName = (c.title || "contract").replace(/[^\\w\\u0600-\\u06FF\\-]+/g, "_").slice(0, 60);

  if (format === "txt") {
    const blob = new Blob([body], { type: "text/plain;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = safeName + ".txt";
    a.click();
    URL.revokeObjectURL(a.href);
    toast(t("saved"));
    return;
  }

  const htmlDoc = `<!DOCTYPE html><html lang="${getLang()}" dir="${getLang()==="ar"?"rtl":"ltr"}"><head><meta charset="UTF-8"><title>${esc(c.title)}</title>
  <style>
    body{font-family:Cairo,Segoe UI,serif;max-width:800px;margin:40px auto;padding:24px;line-height:1.85;color:#111}
    h1{font-size:1.4rem;margin-bottom:8px} .meta{color:#555;font-size:.9rem;margin-bottom:24px}
    pre{white-space:pre-wrap;font-family:inherit;font-size:1rem}
    @media print{body{margin:0;padding:16px}}
  </style></head><body>
  <h1>${esc(c.title)}</h1>
  <div class="meta">${esc(company)} · ${esc(party)} · ${esc(c.start_date||"")} → ${esc(c.end_date||"")}</div>
  <pre>${esc(body)}</pre>
  </body></html>`;

  if (format === "html") {
    const blob = new Blob([htmlDoc], { type: "text/html;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = safeName + ".html";
    a.click();
    URL.revokeObjectURL(a.href);
    toast(t("saved"));
    return;
  }

  // print / PDF via browser print dialog
  const w = window.open("", "_blank");
  if (!w) { toast(t("error"), "error"); return; }
  w.document.write(htmlDoc);
  w.document.close();
  setTimeout(() => { w.focus(); w.print(); }, 300);
};

// ========== AUTOMATIONS ==========
views.automations = async function () {
  const items = await API.list("automations");
  const tbody = $("#automationsTableBody"); if (!tbody) return;
  const triggerLabels = {
    contract_expiring: getLang()==="fr" ? "Contrat bientôt expiré" : "اقتراب انتهاء عقد",
    employee_added: getLang()==="fr" ? "Employé ajouté" : "إضافة موظف",
    request_new: getLang()==="fr" ? "Nouvelle demande" : "طلب جديد",
    task_overdue: getLang()==="fr" ? "Tâche en retard" : "مهمة متأخرة",
  };
  const actionLabels = {
    create_task: getLang()==="fr" ? "Créer une tâche" : "إنشاء مهمة",
    notify: getLang()==="fr" ? "Notification" : "إشعار",
  };
  if (!items.length) {
    tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state"><h4>${t("no_data")}</h4></div></td></tr>`;
    return;
  }
  tbody.innerHTML = items.map(a => `
    <tr>
      <td style="font-weight:600">${esc(a.name)}</td>
      <td>${esc(triggerLabels[a.trigger]||a.trigger)}</td>
      <td>${esc(actionLabels[a.action]||a.action)}</td>
      <td>${a.enabled ? `<span class="badge badge-active">${t("enabled")}</span>` : `<span class="badge badge-inactive">${t("disabled")}</span>`}</td>
      <td><div class="actions">
        <button class="btn-icon success" title="${t("run_now")}" onclick="runAutomation('${a.id}')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg></button>
        <button class="btn-icon" onclick="editAutomation('${a.id}')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
        <button class="btn-icon danger" onclick="deleteItem('automations','${a.id}')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg></button>
      </div></td>
    </tr>`).join("");
};

window.editAutomation = async function (id) {
  const a = id ? await API.get("automations", id) : {
    name: "", trigger: "contract_expiring", enabled: true, days_before: 30,
    action: "create_task", action_config: { task_title: "", assignee_role: "manager" },
  };
  openModal(id ? t("edit") : t("add"), `
    <div class="form-grid">
      <div class="form-group full"><label>${t("automation_name")} *</label><input class="form-control" id="f_name" value="${esc(a.name)}"></div>
      <div class="form-group"><label>${t("trigger")}</label>
        <select class="form-control" id="f_trigger">
          <option value="contract_expiring" ${a.trigger==="contract_expiring"?"selected":""}>contract_expiring</option>
          <option value="employee_added" ${a.trigger==="employee_added"?"selected":""}>employee_added</option>
          <option value="request_new" ${a.trigger==="request_new"?"selected":""}>request_new</option>
          <option value="task_overdue" ${a.trigger==="task_overdue"?"selected":""}>task_overdue</option>
        </select>
      </div>
      <div class="form-group"><label>${t("action")}</label>
        <select class="form-control" id="f_action">
          <option value="create_task" ${a.action==="create_task"?"selected":""}>create_task</option>
          <option value="notify" ${a.action==="notify"?"selected":""}>notify</option>
        </select>
      </div>
      <div class="form-group"><label>${t("days_before")}</label><input class="form-control" id="f_days" type="number" value="${a.days_before??30}"></div>
      <div class="form-group" style="padding-top:18px">
        <label style="display:flex;align-items:center;gap:8px;cursor:pointer">
          <input type="checkbox" id="f_enabled" ${a.enabled!==false?"checked":""}> ${t("enabled")}
        </label>
      </div>
      <div class="form-group full"><label>${t("task_title")}</label><input class="form-control" id="f_task_title" value="${esc(a.action_config?.task_title||"")}" placeholder="{{title}} / {{name}}"></div>
    </div>
  `);
  $("#modalSaveBtn").onclick = async () => {
    const payload = {
      name: $("#f_name").value.trim(),
      trigger: $("#f_trigger").value,
      action: $("#f_action").value,
      days_before: Number($("#f_days").value) || 0,
      enabled: $("#f_enabled").checked,
      action_config: { task_title: $("#f_task_title").value.trim(), assignee_role: "manager" },
    };
    if (!payload.name) { toast(t("required"), "error"); return; }
    if (id) await API.update("automations", id, payload);
    else await API.create("automations", payload);
    closeModal();
    toast(t("automation_saved") || t("saved"));
    views.automations();
  };
};

window.runAutomation = async function (id) {
  const auto = await API.get("automations", id);
  if (!auto || !auto.enabled) { toast(t("disabled"), "error"); return; }
  const team = await API.list("team");
  const manager = team.find(m => m.role === "manager") || team[0];
  let created = 0;

  if (auto.trigger === "contract_expiring") {
    const contracts = await API.list("contracts");
    const days = auto.days_before || 30;
    const now = new Date();
    for (const c of contracts) {
      if (!c.end_date || c.status !== "active") continue;
      const end = new Date(c.end_date);
      const diff = Math.ceil((end - now) / 86400000);
      if (diff >= 0 && diff <= days) {
        const title = (auto.action_config?.task_title || "تجديد عقد: {{title}}").replace("{{title}}", c.title);
        await API.create("tasks", {
          title, description: `عقد ينتهي خلال ${diff} يوم`, status: "todo", priority: "high",
          assignee_id: manager?.id || null, related_type: "none", related_id: c.id, due_date: c.end_date,
        });
        created++;
      }
    }
  } else if (auto.trigger === "employee_added") {
    // demo: create task for last employee without employment contract
    const employees = await API.list("team");
    const contracts = await API.list("contracts");
    for (const e of employees) {
      const has = contracts.some(c => c.employee_id === e.id && c.party_type === "employee");
      if (!has) {
        const title = (auto.action_config?.task_title || "إعداد عقد عمل لـ {{name}}").replace("{{name}}", e.name);
        await API.create("tasks", {
          title, description: "", status: "todo", priority: "medium",
          assignee_id: manager?.id || null, related_type: "none", related_id: e.id, due_date: "",
        });
        created++;
      }
    }
  } else if (auto.trigger === "request_new") {
    const requests = await API.list("requests");
    for (const r of requests.filter(x => x.status === "new")) {
      const title = (auto.action_config?.task_title || "متابعة طلب: {{name}}").replace("{{name}}", r.name);
      await API.create("tasks", {
        title, description: r.description || "", status: "todo", priority: r.priority || "medium",
        assignee_id: manager?.id || null, related_type: "request", related_id: r.id, due_date: "",
      });
      created++;
    }
  }
  toast(`${t("saved")} (${created})`);
};

views.ads = async function () {
  const items = await API.list("ads");
  const settings = await API.getSettings();
  const totalBudget = items.reduce((s,a)=>s+(a.budget||0),0);
  const totalSpent = items.reduce((s,a)=>s+(a.spent||0),0);
  const totalConv = items.reduce((s,a)=>s+(a.conversions||0),0);
  const set = (id,v)=>{const el=$(id);if(el)el.textContent=v};
  set("#adsTotalBudget", formatMoney(totalBudget, settings.currency_symbol));
  set("#adsTotalSpent", formatMoney(totalSpent, settings.currency_symbol));
  set("#adsRemaining", formatMoney(totalBudget-totalSpent, settings.currency_symbol));
  set("#adsTotalConv", totalConv);
  const tbody = $("#adsTableBody"); if (!tbody) return;
  if (!items.length) { tbody.innerHTML = `<tr><td colspan="9"><div class="empty-state"><h4>${t("no_data")}</h4></div></td></tr>`; return; }
  tbody.innerHTML = items.map(a => {
    const pct = a.budget ? Math.min(100, Math.round((a.spent/a.budget)*100)) : 0;
    return `<tr>
      <td style="font-weight:600">${esc(a.title)}</td>
      <td>${PLATFORM_LABELS()[a.platform]||a.platform}</td>
      <td>${statusBadge(a.status)}</td>
      <td>${formatMoney(a.budget, settings.currency_symbol)}</td>
      <td><div>${formatMoney(a.spent, settings.currency_symbol)}</div><div class="progress-bar mt-1" style="width:70px"><div class="fill" style="width:${pct}%"></div></div></td>
      <td>${(a.impressions||0).toLocaleString()}</td>
      <td>${(a.clicks||0).toLocaleString()}</td>
      <td>${a.conversions||0}</td>
      <td><div class="actions">
        <button class="btn-icon" onclick="editAd('${a.id}')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
        <button class="btn-icon danger" onclick="deleteItem('ads','${a.id}')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg></button>
      </div></td>
    </tr>`;
  }).join("");
};

window.editAd = async function (id) {
  // creative upload wired after modal open

  const a = id ? await API.get("ads", id) : { title:"", platform:"facebook", status:"draft", budget:0, spent:0, start_date:"", end_date:"", target:"", impressions:0, clicks:0, conversions:0, notes:"" };
  openModal(id?t("edit_ad"):t("add_ad"), `
    <div class="form-grid">
      <div class="form-group full"><label>${t("campaign")} *</label><input class="form-control" id="f_title" value="${esc(a.title)}"></div>
      <div class="form-group"><label>${t("platform")}</label><select class="form-control" id="f_platform">${Object.entries(PLATFORM_LABELS()).map(([k,v])=>`<option value="${k}" ${a.platform===k?"selected":""}>${v}</option>`).join("")}</select></div>
      <div class="form-group"><label>${t("status")}</label><select class="form-control" id="f_status">${["draft","scheduled","active","paused","completed"].map(s=>`<option value="${s}" ${a.status===s?"selected":""}>${t(STATUS_KEYS[s]||s)}</option>`).join("")}</select></div>
      <div class="form-group"><label>${t("budget")}</label><input class="form-control" id="f_budget" type="number" value="${a.budget||0}"></div>
      <div class="form-group"><label>${t("spent")}</label><input class="form-control" id="f_spent" type="number" value="${a.spent||0}"></div>
      <div class="form-group"><label>${t("start_date")}</label><input class="form-control" id="f_start" type="date" value="${(a.start_date||"").slice(0,10)}"></div>
      <div class="form-group"><label>${t("end_date")}</label><input class="form-control" id="f_end" type="date" value="${(a.end_date||"").slice(0,10)}"></div>
      <div class="form-group"><label>${t("impressions")}</label><input class="form-control" id="f_imp" type="number" value="${a.impressions||0}"></div>
      <div class="form-group"><label>${t("clicks")}</label><input class="form-control" id="f_clicks" type="number" value="${a.clicks||0}"></div>
      <div class="form-group"><label>${t("conversions")}</label><input class="form-control" id="f_conv" type="number" value="${a.conversions||0}"></div>
      <div class="form-group full"><label>${t("target")}</label><input class="form-control" id="f_target" value="${esc(a.target||"")}"></div>
      <div class="form-group full"><label>${t("notes")}</label><textarea class="form-control" id="f_notes">${esc(a.notes||"")}</textarea></div>
    </div>
  `);
  $("#modalSaveBtn").onclick = async () => {
    const payload = { title:$("#f_title").value.trim(), platform:$("#f_platform").value, status:$("#f_status").value, budget:Number($("#f_budget").value)||0, spent:Number($("#f_spent").value)||0, start_date:$("#f_start").value, end_date:$("#f_end").value, impressions:Number($("#f_imp").value)||0, clicks:Number($("#f_clicks").value)||0, conversions:Number($("#f_conv").value)||0, target:$("#f_target").value.trim(), notes:$("#f_notes").value.trim() };
    if (!payload.title) { toast(t("required"),"error"); return; }
    if (id) await API.update("ads", id, payload); else await API.create("ads", payload);
    closeModal(); toast(t("saved")); views.ads();
  };
};

views.messages = async function () {
  const items = await API.list("messages");
  const tbody = $("#messagesTableBody"); if (!tbody) return;
  if (!items.length) { tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state"><h4>${t("no_data")}</h4></div></td></tr>`; return; }
  tbody.innerHTML = items.map(m => `
    <tr class="clickable" style="${m.status==="unread"?"background:rgba(0,212,255,0.04)":""}" onclick="viewMessage('${m.id}')">
      <td><div style="font-weight:600">${esc(m.name)}</div><div class="text-muted" style="font-size:.8rem">${esc(m.email)}</div></td>
      <td>${esc(m.subject)}</td>
      <td class="text-muted" style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(m.message)}</td>
      <td>${statusBadge(m.status)}</td>
      <td>${formatDateTime(m.created_at)}</td>
      <td><div class="actions" onclick="event.stopPropagation()">
        <button class="btn-icon success" onclick="markMessage('${m.id}','replied')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg></button>
        <button class="btn-icon danger" onclick="deleteItem('messages','${m.id}')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg></button>
      </div></td>
    </tr>`).join("");
};

window.viewMessage = async function (id) {
  const m = await API.get("messages", id);
  if (!m) return;
  if (m.status === "unread") await API.update("messages", id, { status: "read" });
  openModal(t("message_detail"), `
    <div class="detail-grid">
      <div class="detail-block">
        <h4>${t("sender")}</h4>
        <div class="detail-row"><span class="lbl">${t("name")}</span><span class="val">${esc(m.name)}</span></div>
        <div class="detail-row"><span class="lbl">${t("email")}</span><span class="val">${esc(m.email)}</span></div>
        <div class="detail-row"><span class="lbl">${t("phone")}</span><span class="val">${esc(m.phone||"—")}</span></div>
        <div class="detail-row"><span class="lbl">${t("date")}</span><span class="val">${formatDateTime(m.created_at)}</span></div>
      </div>
      <div class="detail-block">
        <h4>${t("status")}</h4>
        <div style="margin-bottom:12px">${statusBadge(m.status==="unread"?"read":m.status)}</div>
        <div class="detail-row"><span class="lbl">${t("subject")}</span><span class="val">${esc(m.subject)}</span></div>
      </div>
      <div class="detail-block full">
        <h4>${t("message")}</h4>
        <p style="font-size:.95rem;line-height:1.75;white-space:pre-wrap">${esc(m.message)}</p>
      </div>
    </div>
  `, `
    <button class="btn btn-outline" onclick="closeModal();views.messages();updateBadges()">${t("close")}</button>
    <button class="btn btn-success" onclick="markMessage('${id}','replied');closeModal()">${t("mark_replied")}</button>
  `, "detail");
  updateBadges();
};

window.markMessage = async function (id, status) {
  await API.update("messages", id, { status });
  toast(t("saved"));
  if (currentView === "messages") views.messages();
  updateBadges();
};

views.services = async function () {
  const items = await API.list("services");
  const tbody = $("#servicesTableBody"); if (!tbody) return;
  if (!items.length) { tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state"><h4>${t("no_data")}</h4></div></td></tr>`; return; }
  tbody.innerHTML = items.sort((a,b)=>(a.sort_order||0)-(b.sort_order||0)).map(s => `
    <tr>
      <td style="font-weight:600">${esc(pickI18n(s.title))}</td>
      <td class="text-muted">${esc(pickI18n(s.short_description))}</td>
      <td>${s.is_visible!==false?`<span class="text-success">${t("visible")}</span>`:`<span class="text-muted">${t("hidden")}</span>`}</td>
      <td>${s.sort_order||0}</td>
      <td><div class="actions">
        <button class="btn-icon" onclick="editService('${s.id}')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
        <button class="btn-icon danger" onclick="deleteItem('services','${s.id}')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg></button>
      </div></td>
    </tr>`).join("");
};

window.editService = async function (id) {
  const s = id ? await API.get("services", id) : { title:{ar:"",en:""}, short_description:{ar:""}, slug:"", is_visible:true, sort_order:0 };
  openModal(id?t("edit_service"):t("add_service"), `
    <div class="form-grid">
      <div class="form-group"><label>${t("title")} (AR) *</label><input class="form-control" id="f_title_ar" value="${esc(s.title?.ar||"")}"></div>
      <div class="form-group"><label>${t("title")} (FR)</label><input class="form-control" id="f_title_fr" value="${esc(s.title?.fr||"")}"></div>
      <div class="form-group"><label>${t("title")} (EN)</label><input class="form-control" id="f_title_en" value="${esc(s.title?.en||"")}"></div>
      <div class="form-group full"><label>${t("description")} (AR)</label><textarea class="form-control" id="f_desc_ar">${esc(s.short_description?.ar||"")}</textarea></div>
      <div class="form-group full"><label>${t("description")} (FR)</label><textarea class="form-control" id="f_desc_fr">${esc(s.short_description?.fr||"")}</textarea></div>
      <div class="form-group full"><label>${t("description")} (EN)</label><textarea class="form-control" id="f_desc_en">${esc(s.short_description?.en||"")}</textarea></div>
      <div class="form-group"><label>${t("slug")}</label><input class="form-control" id="f_slug" value="${esc(s.slug||"")}"></div>
      <div class="form-group"><label>${t("sort_order")}</label><input class="form-control" id="f_order" type="number" value="${s.sort_order||0}"></div>
      <div class="form-group" style="padding-top:18px"><label style="display:flex;align-items:center;gap:8px;cursor:pointer"><input type="checkbox" id="f_visible" ${s.is_visible!==false?"checked":""}> ${t("visible")}</label></div>
    </div>
  `);
  $("#modalSaveBtn").onclick = async () => {
    const titleAr = $("#f_title_ar").value.trim();
    if (!titleAr) { toast(t("required"),"error"); return; }
    const payload = { title:{ar:titleAr,en:$("#f_title_en").value.trim()||titleAr,fr:$("#f_title_fr").value.trim()||titleAr}, short_description:{ar:$("#f_desc_ar").value.trim(),en:$("#f_desc_en").value.trim(),fr:$("#f_desc_fr").value.trim()}, slug:$("#f_slug").value.trim(), sort_order:Number($("#f_order").value)||0, is_visible:$("#f_visible").checked, icon:s.icon||"" };
    if (id) await API.update("services", id, payload); else await API.create("services", payload);
    closeModal(); toast(t("saved")); views.services();
  };
};

views.team = async function () {
  const items = await API.list("team");
  const tbody = $("#teamTableBody"); if (!tbody) return;
  if (!items.length) { tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state"><h4>${t("no_data")}</h4></div></td></tr>`; return; }
  tbody.innerHTML = items.map(m => `
    <tr>
      <td><div style="display:flex;align-items:center;gap:10px"><div class="avatar-sm">${initials(m.name)}</div>
        <div><div style="font-weight:600">${esc(m.name)}</div>
        <div class="text-muted" style="font-size:.78rem">${esc(m.job_title||"")}</div></div></div></td>
      <td>${ROLE_LABELS()[m.role]||m.role}</td>
      <td>${esc(m.department||"—")}</td>
      <td><div>${esc(m.email)}</div><div class="text-muted" style="font-size:.8rem">${esc(m.phone||"")}</div></td>
      <td>${statusBadge(m.status)}</td>
      <td>${formatDate(m.joined_at)}</td>
      <td><div class="actions">
        <button class="btn-icon" onclick="editMember('${m.id}')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
        <button class="btn-icon danger" onclick="deleteItem('team','${m.id}')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg></button>
      </div></td>
    </tr>`).join("");
};

window.editMember = async function (id) {
  const m = id ? await API.get("team", id) : { name:"", email:"", phone:"", role:"developer", status:"active", joined_at:"", department:"", job_title:"", salary:0, notes:"" };
  openModal(id?t("edit_member"):t("add_member"), `
    <div class="form-grid">
      <div class="form-group"><label>${t("name")} *</label><input class="form-control" id="f_name" value="${esc(m.name)}"></div>
      <div class="form-group"><label>${t("role")}</label><select class="form-control" id="f_role">${Object.entries(ROLE_LABELS()).map(([k,v])=>`<option value="${k}" ${m.role===k?"selected":""}>${v}</option>`).join("")}</select></div>
      <div class="form-group"><label>${t("job_title")}</label><input class="form-control" id="f_job" value="${esc(m.job_title||"")}" placeholder="Full-stack Developer"></div>
      <div class="form-group"><label>${t("department")}</label><input class="form-control" id="f_dept" value="${esc(m.department||"")}" placeholder="Development"></div>
      <div class="form-group"><label>${t("email")} *</label><input class="form-control" id="f_email" type="email" required autocomplete="off" value="${esc(m.email||"")}"></div>
      ${id ? "" : `<div class="form-group"><label>كلمة مرور الدخول *</label><input class="form-control" id="f_employee_password" type="password" minlength="8" autocomplete="new-password" placeholder="8 أحرف على الأقل"><small class="text-muted">سيُنشأ حساب Supabase Auth تلقائيًا عند حفظ الموظف.</small></div>`}
      <div class="form-group"><label>${t("phone")}</label><input class="form-control" id="f_phone" value="${esc(m.phone||"")}"></div>
      <div class="form-group"><label>${t("salary")}</label><input class="form-control" id="f_salary" type="number" value="${m.salary||0}"></div>
      <div class="form-group"><label>${t("status")}</label><select class="form-control" id="f_status"><option value="active" ${m.status==="active"?"selected":""}>${t("active")}</option><option value="inactive" ${m.status==="inactive"?"selected":""}>${t("inactive")}</option></select></div>
      <div class="form-group"><label>${t("date")}</label><input class="form-control" id="f_joined" type="date" value="${(m.joined_at||"").slice(0,10)}"></div>
      <div class="form-group full"><label>${t("notes")}</label><textarea class="form-control" id="f_notes">${esc(m.notes||"")}</textarea></div>
    </div>
  `);
  $("#modalSaveBtn").onclick = async () => {
    const payload = {
      name:$("#f_name").value.trim(), role:$("#f_role").value,
      job_title:$("#f_job").value.trim(), department:$("#f_dept").value.trim(),
      email:$("#f_email").value.trim(), phone:$("#f_phone").value.trim(),
      salary:Number($("#f_salary").value)||0, status:$("#f_status").value,
      joined_at:$("#f_joined").value, notes:$("#f_notes").value.trim(),
    };
    if (!payload.name || !payload.email) { toast(t("required"),"error"); return; }
    const saveBtn = $("#modalSaveBtn");
    if (saveBtn) { saveBtn.disabled = true; saveBtn.textContent = "جارٍ الحفظ..."; }
    try {
    if (id) await API.update("team", id, payload);
    else {
      const employeePassword = $("#f_employee_password")?.value || "";
      if (employeePassword.length < 8) throw new Error("كلمة المرور مطلوبة ويجب أن تكون 8 أحرف على الأقل.");
      const { data, error } = await window.supabaseClient.functions.invoke("smooth-worker", {
        body: { employee: payload, password: employeePassword }
      });
      if (error) {
        let detail = error.message || "تعذر إنشاء حساب الموظف";
        try { const ctx = error.context; if (ctx && typeof ctx.json === "function") { const j = await ctx.json(); detail = j.error || j.message || detail; } } catch (_) {}
        throw new Error(detail);
      }
      if (data?.error) throw new Error(data.error);
      // trigger automation employee_added if enabled
      try {
        const autos = await API.list("automations");
        const auto = autos.find(a => a.trigger === "employee_added" && a.enabled);
        if (auto) {
          const teamList = await API.list("team");
          const manager = teamList.find(m => m.role === "manager") || teamList[0];
          const title = (auto.action_config?.task_title || "إعداد عقد عمل لـ {{name}}").replace("{{name}}", payload.name);
          await API.create("tasks", {
            title, description: "", status: "todo", priority: "medium",
            assignee_id: manager?.id || null, related_type: "none", related_id: null, due_date: "",
          });
        }
      } catch (e) {}
    }
    closeModal(); toast(t("saved")); views.team();
    } catch (err) {
      toast(err?.message || "تعذر حفظ الموظف", "error");
      if (saveBtn) { saveBtn.disabled = false; saveBtn.textContent = t("save"); }
    }
  };
};

// ========== SETTINGS ==========
views.settings = async function () {
  const s = await API.getSettings();
  const fill = (id, v) => { const el = $(id); if (el) el.value = v ?? ""; };
  const check = (id, v) => { const el = $(id); if (el) el.checked = !!v; };
  fill("#set_company", s.company_name);
  fill("#set_email", s.email);
  fill("#set_phone", s.phone);
  fill("#set_whatsapp", s.whatsapp);
  fill("#set_location", s.location);
  fill("#set_website", s.website);
  fill("#set_currency", s.currency_symbol);
  fill("#set_hours", s.working_hours);
  fill("#set_timezone", s.timezone);
  fill("#set_invoice", s.invoice_prefix);
  fill("#set_tax", s.tax_id);
  fill("#set_fb", s.social_facebook);
  fill("#set_ig", s.social_instagram);
  fill("#set_li", s.social_linkedin);
  fill("#set_tw", s.social_twitter);
  fill("#set_logo", s.logo_url);
  fill("#set_favicon", s.favicon_url);
  fill("#set_primary", s.primary_color || "#00d4ff");
  fill("#set_secondary", s.secondary_color || "#f97316");
  fill("#set_seo_title", s.seo_title);
  fill("#set_seo_canonical", s.seo_canonical);
  fill("#set_seo_og_image", s.seo_og_image);
  fill("#set_seo_notes", s.seo_notes);
  if ($("#set_seo_robots")) $("#set_seo_robots").value = s.seo_robots || "index, follow";
  fill("#set_seo_desc", s.seo_description);
  fill("#set_seo_kw", s.seo_keywords);
  fill("#set_ga", s.google_analytics);
  fill("#set_pixel", s.facebook_pixel);
  fill("#set_smtp_host", s.smtp_host);
  fill("#set_smtp_port", s.smtp_port);
  fill("#set_smtp_user", s.smtp_user);
  fill("#set_smtp_pass", s.smtp_pass);
  fill("#set_email_from", s.email_from);
  fill("#set_session", s.session_timeout ?? 60);
  fill("#set_perpage", s.items_per_page ?? 20);
  fill("#set_datefmt", s.date_format || "DD/MM/YYYY");
  fill("#set_defcur", s.currency || "DZD");
  check("#set_notif_req", s.notify_email_requests !== false);
  check("#set_notif_msg", s.notify_email_messages !== false);
  check("#set_notif_wa", s.notify_whatsapp);
  check("#set_notif_contract", s.notify_contracts !== false);
  check("#set_notif_budget", s.notify_low_budget !== false);
  check("#set_2fa", s.two_factor);
  check("#set_maintenance", s.maintenance_mode);
  check("#set_autobackup", s.auto_backup !== false);
  // Legal from site_content
  try {
    const sc = await API.getSiteContent();
    const l = sc.legal || {};
    const setL = (id, v) => { const el = $(id); if (el) el.value = v || ""; };
    setL("#set_terms_ar", l.terms_ar); setL("#set_terms_fr", l.terms_fr); setL("#set_terms_en", l.terms_en);
    setL("#set_privacy_ar", l.privacy_ar); setL("#set_privacy_fr", l.privacy_fr); setL("#set_privacy_en", l.privacy_en);
    setL("#set_cookies_ar", l.cookies_ar); setL("#set_cookies_fr", l.cookies_fr); setL("#set_cookies_en", l.cookies_en);
  } catch (e) {}
};

window.saveSettingsLegal = async function () {
  const v = (id) => $(id)?.value ?? "";
  await API.updateSiteContent({
    legal: {
      terms_ar: v("#set_terms_ar"), terms_fr: v("#set_terms_fr"), terms_en: v("#set_terms_en"),
      privacy_ar: v("#set_privacy_ar"), privacy_fr: v("#set_privacy_fr"), privacy_en: v("#set_privacy_en"),
      cookies_ar: v("#set_cookies_ar"), cookies_fr: v("#set_cookies_fr"), cookies_en: v("#set_cookies_en"),
    },
  });
  toast(t("save_success") || t("saved"));
};

window.saveSettings = async function () {
  const val = (id) => $(id)?.value?.trim?.() ?? $(id)?.value ?? "";
  const chk = (id) => !!$(id)?.checked;
  const payload = {
    company_name: val("#set_company"),
    email: val("#set_email"),
    phone: val("#set_phone"),
    whatsapp: val("#set_whatsapp"),
    location: val("#set_location"),
    website: val("#set_website"),
    currency_symbol: val("#set_currency") || "د.ج",
    working_hours: val("#set_hours"),
    timezone: val("#set_timezone"),
    invoice_prefix: val("#set_invoice"),
    tax_id: val("#set_tax"),
    social_facebook: val("#set_fb"),
    social_instagram: val("#set_ig"),
    social_linkedin: val("#set_li"),
    social_twitter: val("#set_tw"),
    logo_url: val("#set_logo"),
    favicon_url: val("#set_favicon"),
    primary_color: val("#set_primary"),
    secondary_color: val("#set_secondary"),
    seo_title: val("#set_seo_title"),
    seo_description: val("#set_seo_desc"),
    seo_keywords: val("#set_seo_kw"),
    seo_canonical: val("#set_seo_canonical"),
    seo_og_image: val("#set_seo_og_image"),
    seo_robots: val("#set_seo_robots") || "index, follow",
    seo_notes: val("#set_seo_notes"),
    google_analytics: val("#set_ga"),
    facebook_pixel: val("#set_pixel"),
    smtp_host: val("#set_smtp_host"),
    smtp_port: val("#set_smtp_port"),
    smtp_user: val("#set_smtp_user"),
    smtp_pass: val("#set_smtp_pass"),
    email_from: val("#set_email_from"),
    session_timeout: Number(val("#set_session")) || 60,
    items_per_page: Number(val("#set_perpage")) || 20,
    date_format: val("#set_datefmt") || "DD/MM/YYYY",
    currency: val("#set_defcur") || "DZD",
    notify_email_requests: chk("#set_notif_req"),
    notify_email_messages: chk("#set_notif_msg"),
    notify_whatsapp: chk("#set_notif_wa"),
    notify_contracts: chk("#set_notif_contract"),
    notify_low_budget: chk("#set_notif_budget"),
    two_factor: chk("#set_2fa"),
    maintenance_mode: chk("#set_maintenance"),
    auto_backup: chk("#set_autobackup"),
  };
  await API.updateSettings(payload);
  try {
    localStorage.setItem("autodev_public_seo", JSON.stringify({
      title: payload.seo_title,
      description: payload.seo_description,
      keywords: payload.seo_keywords,
      canonical: payload.seo_canonical,
      og_image: payload.seo_og_image,
      robots: payload.seo_robots,
    }));
  } catch (e) {}
  toast(t("save_success") || t("saved"));
};

window.exportData = async function () {
  const data = await API.exportAll();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `autodev-backup-${new Date().toISOString().slice(0,10)}.json`; a.click();
  URL.revokeObjectURL(url);
  toast(t("saved"));
};

window.resetData = async function () {
  if (!confirmAction(t("reset_confirm"))) return;
  await API.resetAll();
  toast(t("saved"));
  navigate("overview");
  updateBadges();
};

window.deleteItem = async function (collection, id) {
  if (!confirmAction(t("confirm_delete"))) return;
  await API.remove(collection, id);
  toast(t("deleted"));
  if (views[currentView]) views[currentView]();
  updateBadges();
};

async function updateBadges() {
  const [requests, messages] = await Promise.all([API.list("requests"), API.list("messages")]);
  const newReq = requests.filter(r => r.status === "new").length;
  const unread = messages.filter(m => m.status === "unread").length;
  const reqBadge = $("#badgeRequests");
  const msgBadge = $("#badgeMessages");
  if (reqBadge) { reqBadge.textContent = newReq || ""; reqBadge.style.display = newReq ? "inline-flex" : "none"; }
  if (msgBadge) { msgBadge.textContent = unread || ""; msgBadge.style.display = unread ? "inline-flex" : "none"; }
  const notifDot = $("#notifDot");
  if (notifDot) notifDot.style.display = (newReq + unread) > 0 ? "block" : "none";
}

// ========== AUTH ==========
async function showApp() {
  try {
    const user = supabaseSession?.user;
    if (!user) throw new Error("لا توجد جلسة دخول صالحة.");
    if (window.resolveDashboardRole) await window.resolveDashboardRole(user);
    $("#loginScreen").style.display = "none";
    $("#appRoot").classList.add("visible");
    applyI18n();
    if (window.applyNavPermissions) await window.applyNavPermissions();
    navigate("overview");
    updateBadges();
  } catch (e) {
    try { await window.supabaseClient.auth.signOut(); } catch (_) {}
    supabaseSession = null;
    window.clearDashboardRole?.();
    const err = $("#loginError");
    if (err) { err.textContent = e?.message || "هذا الحساب غير مصرح له بدخول الداشبورد."; err.classList.add("show"); }
    showLogin();
  }
}
function showLogin() {
  $("#loginScreen").style.display = "flex";
  $("#appRoot").classList.remove("visible");
  window.clearDashboardRole?.();
}

async function handleLogin(e) {
  e.preventDefault();
  const email = $("#loginEmail").value.trim();
  const pass = $("#loginPassword").value;
  const err = $("#loginError");
  const btn = $('#loginForm button[type="submit"]');
  if (btn) btn.disabled = true;
  try {
    const { data, error } = await window.supabaseClient.auth.signInWithPassword({ email, password: pass });
    if (error) throw error;
    supabaseSession = data.session;
    err.classList.remove("show");
    await showApp();
  } catch (error) {
    err.textContent = "تعذر تسجيل الدخول. تحقق من البريد وكلمة المرور وأنشأت المستخدم في Supabase Auth.";
    err.classList.add("show");
  } finally { if (btn) btn.disabled = false; }
}

async function handleLogout() {
  try { await window.supabaseClient.auth.signOut(); } catch (e) {}
  setLoggedIn(false);
  window.clearDashboardRole?.();
  showLogin();
}

// Settings tabs
window.showSettingsTab = function (tab) {
  $$(".settings-panel").forEach(p => p.classList.remove("active"));
  $$(".settings-tabs button").forEach(b => b.classList.remove("active"));
  $(`#settings-${tab}`)?.classList.add("active");
  $$(`.settings-tabs button[data-tab="${tab}"]`).forEach(b => b.classList.add("active"));
};


// ========== SITE CONTENT CMS ==========
window.showCmsTab = function (tab) {
  $$("#view-sitecontent .settings-panel").forEach(p => p.classList.remove("active"));
  $$("#cmsTabs button").forEach(b => b.classList.remove("active"));
  $(`#${tab}`)?.classList.add("active");
  $$(`#cmsTabs button[data-tab="${tab}"]`).forEach(b => b.classList.add("active"));
};

views.sitecontent = async function () {
  const c = await API.getSiteContent();
  const h = c.hero || {}, a = c.about || {}, l = c.legal || {};
  const set = (id, v) => { const el = $(id); if (el) el.value = v || ""; };
  set("#cms_hero_title_ar", h.title_ar); set("#cms_hero_title_fr", h.title_fr); set("#cms_hero_title_en", h.title_en);
  set("#cms_hero_sub_ar", h.subtitle_ar); set("#cms_hero_sub_fr", h.subtitle_fr); set("#cms_hero_sub_en", h.subtitle_en);
  set("#cms_about_title_ar", a.title_ar); set("#cms_about_title_fr", a.title_fr); set("#cms_about_title_en", a.title_en);
  set("#cms_about_desc_ar", a.desc_ar); set("#cms_about_desc_fr", a.desc_fr); set("#cms_about_desc_en", a.desc_en);
  set("#cms_b1t_ar", a.box1_t_ar); set("#cms_b1d_ar", a.box1_d_ar);
  set("#cms_b2t_ar", a.box2_t_ar); set("#cms_b2d_ar", a.box2_d_ar);
  set("#cms_b3t_ar", a.box3_t_ar); set("#cms_b3d_ar", a.box3_d_ar);
  set("#cms_b4t_ar", a.box4_t_ar); set("#cms_b4d_ar", a.box4_d_ar);
  set("#cms_terms_ar", l.terms_ar); set("#cms_terms_fr", l.terms_fr); set("#cms_terms_en", l.terms_en);
  set("#cms_privacy_ar", l.privacy_ar); set("#cms_privacy_fr", l.privacy_fr); set("#cms_privacy_en", l.privacy_en);
  set("#cms_cookies_ar", l.cookies_ar); set("#cms_cookies_fr", l.cookies_fr); set("#cms_cookies_en", l.cookies_en);
};

window.saveSiteContent = async function () {
  const v = (id) => $(id)?.value ?? "";
  await API.updateSiteContent({
    hero: {
      title_ar: v("#cms_hero_title_ar"), title_fr: v("#cms_hero_title_fr"), title_en: v("#cms_hero_title_en"),
      subtitle_ar: v("#cms_hero_sub_ar"), subtitle_fr: v("#cms_hero_sub_fr"), subtitle_en: v("#cms_hero_sub_en"),
    },
    about: {
      title_ar: v("#cms_about_title_ar"), title_fr: v("#cms_about_title_fr"), title_en: v("#cms_about_title_en"),
      desc_ar: v("#cms_about_desc_ar"), desc_fr: v("#cms_about_desc_fr"), desc_en: v("#cms_about_desc_en"),
      box1_t_ar: v("#cms_b1t_ar"), box1_d_ar: v("#cms_b1d_ar"),
      box2_t_ar: v("#cms_b2t_ar"), box2_d_ar: v("#cms_b2d_ar"),
      box3_t_ar: v("#cms_b3t_ar"), box3_d_ar: v("#cms_b3d_ar"),
      box4_t_ar: v("#cms_b4t_ar"), box4_d_ar: v("#cms_b4d_ar"),
    },
    legal: {
      terms_ar: v("#cms_terms_ar"), terms_fr: v("#cms_terms_fr"), terms_en: v("#cms_terms_en"),
      privacy_ar: v("#cms_privacy_ar"), privacy_fr: v("#cms_privacy_fr"), privacy_en: v("#cms_privacy_en"),
      cookies_ar: v("#cms_cookies_ar"), cookies_fr: v("#cms_cookies_fr"), cookies_en: v("#cms_cookies_en"),
    },
  });
  toast(t("save_success") || t("saved"));
};

// ========== PORTFOLIO PROJECTS ==========
views.portfolioprojects = async function () {
  const items = await API.list("portfolio_projects");
  const tbody = $("#portfolioProjectsBody"); if (!tbody) return;
  if (!items.length) {
    tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state"><h4>${t("no_data")}</h4></div></td></tr>`;
    return;
  }
  tbody.innerHTML = items.sort((a,b)=>(a.sort_order||0)-(b.sort_order||0)).map(p => `
    <tr>
      <td><div style="display:flex;align-items:center;gap:10px">
        ${p.cover_image_url ? `<img src="${esc(p.cover_image_url)}" alt="" style="width:40px;height:28px;object-fit:cover;border-radius:4px;border:1px solid var(--border)" onerror="this.style.display='none'">` : ""}
        <span style="font-weight:600">${esc(p.title?.ar || p.title?.en || "—")}</span>
      </div></td>
      <td class="text-muted" style="font-size:.78rem">
        <div>${esc(p.title?.ar || "—")}</div>
        <div>${esc(p.title?.fr || "—")}</div>
        <div>${esc(p.title?.en || "—")}</div>
      </td>
      <td>${esc(p.category || "—")}</td>
      <td>${esc(p.year || "—")}</td>
      <td>${p.is_visible !== false ? statusBadge("active") : statusBadge("inactive")}</td>
      <td><div class="actions">
        <button class="btn-icon" onclick="editPortfolioProject('${p.id}')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
        <button class="btn-icon danger" onclick="deleteItem('portfolio_projects','${p.id}')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg></button>
      </div></td>
    </tr>`).join("");
};

window.editPortfolioProject = async function (id) {
  const p = id ? await API.get("portfolio_projects", id) : {
    title: { ar: "", fr: "", en: "" },
    short_description: { ar: "", fr: "", en: "" },
    description: { ar: "", fr: "", en: "" },
    year: new Date().getFullYear().toString(),
    cover_image_url: "", gallery: [], category: "web", tech: [], is_visible: true, sort_order: 0,
  };
  const galleryStr = (p.gallery || []).join("||");
  openModal(id ? t("edit") : t("add"), `
    <div class="form-grid">
      <div class="form-group"><label>العنوان AR *</label><input class="form-control" id="f_t_ar" value="${esc(p.title?.ar||"")}"></div>
      <div class="form-group"><label>Titre FR</label><input class="form-control" id="f_t_fr" value="${esc(p.title?.fr||"")}"></div>
      <div class="form-group"><label>Title EN</label><input class="form-control" id="f_t_en" value="${esc(p.title?.en||"")}"></div>
      <div class="form-group full"><label>وصف قصير AR</label><textarea class="form-control" id="f_sd_ar">${esc(p.short_description?.ar||"")}</textarea></div>
      <div class="form-group full"><label>Résumé FR</label><textarea class="form-control" id="f_sd_fr">${esc(p.short_description?.fr||"")}</textarea></div>
      <div class="form-group full"><label>Short EN</label><textarea class="form-control" id="f_sd_en">${esc(p.short_description?.en||"")}</textarea></div>
      <div class="form-group full"><label>التفاصيل AR</label><textarea class="form-control" id="f_d_ar" rows="3">${esc(p.description?.ar||"")}</textarea></div>
      <div class="form-group full"><label>Détails FR</label><textarea class="form-control" id="f_d_fr" rows="3">${esc(p.description?.fr||"")}</textarea></div>
      <div class="form-group full"><label>Details EN</label><textarea class="form-control" id="f_d_en" rows="3">${esc(p.description?.en||"")}</textarea></div>
      <div class="form-group"><label>${t("year")||"Year"}</label><input class="form-control" id="f_year" value="${esc(p.year||"")}"></div>
      <div class="form-group"><label>${t("type")}</label>
        <select class="form-control" id="f_cat">
          ${["web","mobile","dashboard","ui","automation"].map(c=>`<option value="${c}" ${p.category===c?"selected":""}>${c}</option>`).join("")}
        </select>
      </div>
      <div class="form-group full">
        <label>الصورة الرئيسية</label>
        <div style="display:flex;gap:12px;align-items:flex-start;flex-wrap:wrap">
          <div id="f_cover_preview" style="width:120px;height:80px;border-radius:8px;border:1px solid var(--border);background:var(--bg-elevated);overflow:hidden;display:flex;align-items:center;justify-content:center">
            ${p.cover_image_url ? `<img src="${esc(p.cover_image_url)}" style="width:100%;height:100%;object-fit:cover" onerror="this.parentElement.innerHTML='—'">` : `<span class="text-muted" style="font-size:.75rem">—</span>`}
          </div>
          <div style="flex:1;min-width:180px">
            <input type="file" id="f_img_file" accept="image/*" class="form-control" style="padding:6px">
            <input type="hidden" id="f_img" value="${esc(p.cover_image_url||"")}">
            <div class="text-muted" style="font-size:.72rem;margin-top:4px">اختر صورة من جهازك (تُحفظ محلياً حتى ربط الباك‑اند)</div>
          </div>
        </div>
      </div>
      <div class="form-group full">
        <label>صور المشروع (معرض)</label>
        <input type="file" id="f_gallery_files" accept="image/*" multiple class="form-control" style="padding:6px">
        <input type="hidden" id="f_gallery" value="${esc((p.gallery||[]).join("||"))}">
        <div id="f_gallery_preview" style="display:flex;flex-wrap:wrap;gap:8px;margin-top:8px">
          ${(p.gallery||[]).map((g,i)=>`<div style="position:relative;width:72px;height:52px;border-radius:6px;overflow:hidden;border:1px solid var(--border)"><img src="${esc(g)}" style="width:100%;height:100%;object-fit:cover"><button type="button" data-gi="${i}" class="gal-remove" style="position:absolute;top:2px;inset-inline-end:2px;background:rgba(0,0,0,.6);color:#fff;border:none;border-radius:4px;width:18px;height:18px;font-size:11px;cursor:pointer">×</button></div>`).join("")}
        </div>
        <div class="text-muted" style="font-size:.72rem;margin-top:4px">يمكن اختيار عدة صور من الجهاز</div>
      </div>
      <div class="form-group full"><label>Tech (comma)</label><input class="form-control" id="f_tech" value="${esc((p.tech||[]).join(", "))}"></div>
      <div class="form-group"><label>Sort</label><input class="form-control" id="f_sort" type="number" value="${p.sort_order||0}"></div>
      <div class="form-group" style="padding-top:18px">
        <label style="display:flex;align-items:center;gap:8px;cursor:pointer">
          <input type="checkbox" id="f_vis" ${p.is_visible!==false?"checked":""}> ${t("visible")||"Visible"}
        </label>
      </div>
    </div>
  `, null, "wide");
  // File upload helpers
  const readFileAsDataURL = (file) => new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
  let galleryList = (p.gallery || []).slice();
  const renderGal = () => {
    const box = $("#f_gallery_preview");
    if (!box) return;
    box.innerHTML = galleryList.map((g,i)=>`<div style="position:relative;width:72px;height:52px;border-radius:6px;overflow:hidden;border:1px solid var(--border)"><img src="${g}" style="width:100%;height:100%;object-fit:cover"><button type="button" data-gi="${i}" class="gal-remove" style="position:absolute;top:2px;inset-inline-end:2px;background:rgba(0,0,0,.6);color:#fff;border:none;border-radius:4px;width:18px;height:18px;font-size:11px;cursor:pointer">×</button></div>`).join("");
    box.querySelectorAll(".gal-remove").forEach(btn => btn.onclick = () => {
      galleryList.splice(Number(btn.dataset.gi), 1);
      $("#f_gallery").value = galleryList.join("||");
      renderGal();
    });
  };
  renderGal();
  $("#f_img_file")?.addEventListener("change", async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const data = await readFileAsDataURL(file);
    $("#f_img").value = data;
    const prev = $("#f_cover_preview");
    if (prev) prev.innerHTML = `<img src="${data}" style="width:100%;height:100%;object-fit:cover">`;
  });
  $("#f_gallery_files")?.addEventListener("change", async (e) => {
    const files = Array.from(e.target.files || []);
    for (const f of files) {
      const data = await readFileAsDataURL(f);
      galleryList.push(data);
    }
    $("#f_gallery").value = galleryList.join("||");
    renderGal();
    e.target.value = "";
  });

  $("#modalSaveBtn").onclick = async () => {
    const payload = {
      title: { ar: $("#f_t_ar").value.trim(), fr: $("#f_t_fr").value.trim(), en: $("#f_t_en").value.trim() },
      short_description: { ar: $("#f_sd_ar").value.trim(), fr: $("#f_sd_fr").value.trim(), en: $("#f_sd_en").value.trim() },
      description: { ar: $("#f_d_ar").value.trim(), fr: $("#f_d_fr").value.trim(), en: $("#f_d_en").value.trim() },
      year: $("#f_year").value.trim(),
      category: $("#f_cat").value,
      cover_image_url: $("#f_img").value.trim(),
      gallery: galleryList.slice(),
      tech: $("#f_tech").value.split(",").map(s=>s.trim()).filter(Boolean),
      sort_order: Number($("#f_sort").value)||0,
      is_visible: $("#f_vis").checked,
    };
    if (!payload.title.ar && !payload.title.en) { toast(t("required"), "error"); return; }
    if (id) await API.update("portfolio_projects", id, payload);
    else await API.create("portfolio_projects", payload);
    try {
      localStorage.setItem("autodev_portfolio_projects", JSON.stringify(await API.list("portfolio_projects")));
    } catch(e){}
    closeModal(); toast(t("saved")); views.portfolioprojects();
  };
};





function trackBaseUrl() {
  return location.href.replace(/dashboard\/.*$/, "track.html");
}
function makeTrackToken() {
  return "trk_" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-6);
}
function buildTrackUrl(token) {
  if (!token) return "";
  return trackBaseUrl() + "?t=" + encodeURIComponent(token);
}

window.copyTrackLink = function () {
  const el = document.getElementById("trackLinkInput");
  const text = el?.value || window.__trackUrl || "";
  if (!text) { toast("لا يوجد رابط بعد — ولّد رابطاً أولاً", "error"); return; }
  navigator.clipboard?.writeText(text).then(() => toast(t("copied") || "تم نسخ الرابط")).catch(() => {
    if (el) { el.select(); document.execCommand("copy"); }
    toast(t("copied") || "تم نسخ الرابط");
  });
};

/** regenerate=true دائماً رمز جديد؛ false يستخدم الموجود أو ينشئ إن لم يوجد */
window.regenerateTrackLink = async function (id, forceNew) {
  let p = await API.get("projects", id);
  if (!p) return;
  const token = (forceNew || !p.public_token) ? makeTrackToken() : p.public_token;
  p = await API.update("projects", id, {
    public_token: token,
    tracking_enabled: p.tracking_enabled !== false,
    progress: typeof p.progress === "number" ? p.progress : (p.status === "completed" ? 100 : 0),
    milestones: p.milestones || [
      { title: "بدء المشروع", done: false },
      { title: "التصميم", done: false },
      { title: "التطوير", done: false },
      { title: "التسليم", done: false },
    ],
  });
  try { if (API.publishProjectsForTracking) await API.publishProjectsForTracking(); } catch (e) {}
  try { if (API.publishSitePublicData) await API.publishSitePublicData(); } catch (e) {}
  const url = buildTrackUrl(p.public_token);
  window.__trackUrl = url;
  const el = document.getElementById("trackLinkInput");
  if (el) el.value = url;
  const openBtn = document.getElementById("trackOpenBtn");
  if (openBtn) openBtn.href = url;
  try {
    await navigator.clipboard?.writeText(url);
    toast(forceNew ? "تم توليد رابط جديد ونسخه" : (t("copied") || "تم نسخ الرابط"));
  } catch (e) {
    toast(url);
  }
  if (typeof renderTrackingLinks === "function") {
    const panel = document.getElementById("settings-tracking");
    if (panel && panel.classList.contains("active")) renderTrackingLinks();
  }
};

window.ensureAndCopyTrack = function (id) {
  return regenerateTrackLink(id, false);
};

window.generateAllTrackLinks = async function () {
  const projects = await API.list("projects");
  let n = 0;
  for (const p of projects) {
    if (!p.public_token || p.tracking_enabled === false) {
      await API.update("projects", p.id, {
        public_token: p.public_token || makeTrackToken(),
        tracking_enabled: true,
        progress: typeof p.progress === "number" ? p.progress : (p.status === "completed" ? 100 : 0),
        milestones: p.milestones || [
          { title: "بدء المشروع", done: p.status !== "draft" },
          { title: "التصميم", done: ["in_progress","completed"].includes(p.status) },
          { title: "التطوير", done: p.status === "completed" },
          { title: "التسليم", done: p.status === "completed" },
        ],
      });
      n++;
    }
  }
  try { if (API.publishProjectsForTracking) await API.publishProjectsForTracking(); } catch (e) {}
  toast("تم تجهيز روابط المتابعة (" + n + " تحديث)");
  renderTrackingLinks();
};

window.renderTrackingLinks = async function () {
  const tbody = document.getElementById("trackingLinksBody");
  if (!tbody) return;
  const projects = await API.list("projects");
  if (!projects.length) {
    tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state"><h4>${t("no_data")||"لا بيانات"}</h4></div></td></tr>`;
    return;
  }
  tbody.innerHTML = projects.map(p => {
    const title = pickI18n(p.title) || p.name || p.id;
    const progress = typeof p.progress === "number" ? p.progress : (p.status === "completed" ? 100 : 0);
    const tok = p.public_token || "";
    const url = buildTrackUrl(tok);
    const enabled = p.tracking_enabled !== false && !!tok;
    return `<tr>
      <td style="font-weight:600">${esc(title)}</td>
      <td>${statusBadge(p.status)}</td>
      <td>
        <div style="display:flex;align-items:center;gap:8px;min-width:120px">
          <input type="range" min="0" max="100" value="${progress}" style="flex:1" onchange="quickSetProgress('${p.id}', this.value)">
          <span style="font-size:.8rem;width:36px">${progress}%</span>
        </div>
      </td>
      <td>${enabled ? '<span class="badge badge-won">مفعّل</span>' : '<span class="badge badge-draft">بدون رابط</span>'}</td>
      <td style="font-size:.75rem;max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${esc(url)}">${esc(url || "—")}</td>
      <td><div class="actions" style="flex-wrap:wrap">
        <button class="btn btn-primary btn-sm" onclick="regenerateTrackLink('${p.id}', false)">نسخ</button>
        <button class="btn btn-outline btn-sm" onclick="regenerateTrackLink('${p.id}', true)">جديد</button>
        ${url ? `<a class="btn btn-outline btn-sm" href="${esc(url)}" target="_blank" rel="noopener">فتح</a>` : ""}
        <button class="btn-icon" onclick="editProject('${p.id}')" title="تعديل">✎</button>
      </div></td>
    </tr>`;
  }).join("");
};

window.quickSetProgress = async function (id, value) {
  const progress = Math.max(0, Math.min(100, Number(value) || 0));
  const p = await API.get("projects", id);
  if (!p) return;
  const milestones = (p.milestones || [
    { title: "بدء المشروع", done: false },
    { title: "التصميم", done: false },
    { title: "التطوير", done: false },
    { title: "التسليم", done: false },
  ]).map((m, i) => {
    const thresholds = [15, 40, 70, 100];
    return { ...m, done: progress >= thresholds[i] };
  });
  await API.update("projects", id, { progress, milestones });
  try { if (API.publishProjectsForTracking) await API.publishProjectsForTracking(); } catch (e) {}
  renderTrackingLinks();
  toast("تم تحديث التقدم: " + progress + "%");
};


// ========== INIT ==========
document.addEventListener("DOMContentLoaded", () => {
  setTheme(getTheme());
  const lang = localStorage.getItem("autodev_dash_lang") || "ar";
  setLang(lang);
  updateLangFlag();

  // Login / Logout
  $("#loginForm")?.addEventListener("submit", handleLogin);
  $("#logoutBtn")?.addEventListener("click", handleLogout);
  $("#sidebarLogout")?.addEventListener("click", handleLogout);

  // User menu dropdown
  $("#userMenuBtn")?.addEventListener("click", (e) => {
    e.stopPropagation();
    $("#userMenu")?.classList.toggle("open");
  });
  document.addEventListener("click", () => $("#userMenu")?.classList.remove("open"));

  // Lang buttons on login
  $$(".login-lang button").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.lang === getLang());
    btn.addEventListener("click", () => {
      setLang(btn.dataset.lang);
      $$(".login-lang button").forEach(b => b.classList.toggle("active", b.dataset.lang === getLang()));
      applyI18n();
    });
  });

  // Theme toggle
  $("#themeToggle")?.addEventListener("click", () => {
    setTheme(getTheme() === "dark" ? "light" : "dark");
    if (currentView === "overview") renderRequestsChart();
  });

  // Lang toggle in app
  $("#langToggle")?.addEventListener("click", () => {
    setLang(getLang() === "ar" ? "fr" : "ar");
    updateLangFlag();
    applyI18n();
    if (views[currentView]) views[currentView]();
  });

  // Nav
  $$(".nav-item[data-view]").forEach(el => {
    el.addEventListener("click", e => { e.preventDefault(); navigate(el.dataset.view); });
  });

  $("#menuToggle")?.addEventListener("click", () => {
    $(".sidebar").classList.toggle("open");
    $(".sidebar-overlay").classList.toggle("open");
  });
  $(".sidebar-overlay")?.addEventListener("click", () => {
    $(".sidebar").classList.remove("open");
    $(".sidebar-overlay").classList.remove("open");
  });

  $("#modalClose")?.addEventListener("click", closeModal);
  $("#modalOverlay")?.addEventListener("click", e => { if (e.target === $("#modalOverlay")) closeModal(); });

  $("#reqSearch")?.addEventListener("input", () => views.requests());
  $("#reqFilterStatus")?.addEventListener("change", () => views.requests());
  $("#cliSearch")?.addEventListener("input", () => views.clients());
  $("#projSearch")?.addEventListener("input", () => views.projects());
  $("#ctrFilterParty")?.addEventListener("change", () => views.contracts());

  window.supabaseClient.auth.getSession().then(async ({data, error}) => {
    if (!error && data.session) { supabaseSession = data.session; await showApp(); }
    else { supabaseSession = null; showLogin(); }
  }).catch(() => showLogin());
  window.supabaseClient.auth.onAuthStateChange((_event, session) => {
    supabaseSession = session;
    if (!session) { window.clearDashboardRole?.(); showLogin(); }
  });
});

window.navigate = navigate;
window.closeModal = closeModal;
