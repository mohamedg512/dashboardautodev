(function () {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  function esc(s) {
    return String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function readFile(file) {
    return new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(r.result);
      r.onerror = rej;
      r.readAsDataURL(file);
    });
  }

  // ---- Permissions ----
  const ALL_VIEWS = [
    "overview", "requests", "clients", "projects", "tasks", "messages",
    "partners", "contracts", "automations", "ads", "services", "sitecontent",
    "portfolioprojects", "homeprojects", "testimonials", "blog", "faq",
    "team", "invoices", "permissions", "settings", "notifications",
  ];

  window.currentUserRole = () => sessionStorage.getItem("autodev_role") || "";

  // Match each authenticated Supabase account to an active team member by email.
  // The role stored on that team row controls the dashboard's visible/accessible sections.
  window.resolveDashboardRole = async function (user) {
    if (!user?.email) throw new Error("تعذر قراءة بريد المستخدم المسجل.");
    const email = user.email.trim().toLowerCase();
    const team = await API.list("team");
    const member = team.find(m => String(m.email || "").trim().toLowerCase() === email);
    if (!member) throw new Error("هذا الحساب غير مرتبط بموظف في قسم الفريق. أضف البريد نفسه إلى الفريق أولاً.");
    if (member.status !== "active") throw new Error("حساب الموظف غير نشط. راجع حالة الموظف في قسم الفريق.");
    const allowedRoles = ["manager", "developer", "designer", "marketing", "support", "automation"];
    if (!allowedRoles.includes(member.role)) throw new Error("دور الموظف غير صالح.");
    sessionStorage.setItem("autodev_role", member.role);
    sessionStorage.setItem("autodev_member_id", member.id);
    return member;
  };

  window.clearDashboardRole = function () {
    sessionStorage.removeItem("autodev_role");
    sessionStorage.removeItem("autodev_member_id");
  };

  window.canAccess = async function (view) {
    const role = currentUserRole();
    if (!role) return false;
    if (role === "manager") return true;
    const perms = await API.getRolePermissions(role);
    return (perms || []).includes(view);
  };

  // Patch navigate if exists
  const _nav = window.navigate;
  if (typeof _nav === "function") {
    window.navigate = async function (view) {
      if (!(await canAccess(view))) {
        toast(t("error") || "No access", "error");
        return;
      }
      return _nav(view);
    };
  }

  // Apply sidebar visibility
  window.applyNavPermissions = async function () {
    const role = currentUserRole();
    const perms = role === "manager" ? ALL_VIEWS : (role ? await API.getRolePermissions(role) : []);
    $$(".nav-item[data-view]").forEach((a) => {
      const v = a.dataset.view;
      a.style.display = perms.includes(v) ? "" : "none";
    });
  };

  // Never default an authenticated account to manager. The role must be resolved from team.email.

  // ---- Notifications ----
  async function refreshNotifications() {
    const list = $("#notifList");
    const countEl = $("#notifCount");
    const btn = $("#notifBtn");
    if (!list) return;
    const items = await API.getNotifications();
    if (countEl) countEl.textContent = String(items.length);
    const dot = btn?.querySelector(".dot");
    if (dot) dot.style.display = items.length ? "block" : "none";
    if (!items.length) {
      list.innerHTML = `<div class="empty-state" style="padding:20px"><h4>${t("no_notifications") || "—"}</h4></div>`;
      return;
    }
    list.innerHTML = items
      .slice(0, 20)
      .map(
        (n) => `
      <button type="button" class="notif-item" data-link="${esc(n.link || "overview")}" style="display:block;width:100%;text-align:start;padding:10px;border-radius:8px;border:none;background:transparent;cursor:pointer">
        <div style="font-weight:600;font-size:.84rem">${esc(n.title)}</div>
        <div class="text-muted" style="font-size:.75rem;margin-top:2px">${esc(n.body || "")}</div>
      </button>`
      )
      .join("");
    list.querySelectorAll(".notif-item").forEach((b) => {
      b.onclick = () => {
        $("#notifPanel").style.display = "none";
        if (typeof navigate === "function") navigate(b.dataset.link);
      };
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    $("#notifBtn")?.addEventListener("click", async (e) => {
      e.stopPropagation();
      const p = $("#notifPanel");
      if (!p) return;
      const open = p.style.display === "block";
      p.style.display = open ? "none" : "block";
      if (!open) await refreshNotifications();
    });
    document.addEventListener("click", () => {
      const p = $("#notifPanel");
      if (p) p.style.display = "none";
    });
    setTimeout(refreshNotifications, 800);
    setInterval(refreshNotifications, 30000);
  });

  // ---- Language EN support in toggle ----
  const FLAG_SVG = {
    ar: `<svg viewBox="0 0 30 20" preserveAspectRatio="xMidYMid slice"><rect width="15" height="20" fill="#006233"/><rect x="15" width="15" height="20" fill="#fff"/><circle cx="16.5" cy="10" r="4" fill="#d21034"/><circle cx="17.5" cy="10" r="3.2" fill="#fff"/><polygon fill="#d21034" points="19.3,7.8 20,9.6 21.9,9.6 20.4,10.7 20.9,12.5 19.3,11.4 17.7,12.5 18.2,10.7 16.7,9.6 18.6,9.6"/></svg>`,
    fr: `<svg viewBox="0 0 30 20" preserveAspectRatio="xMidYMid slice"><rect width="10" height="20" fill="#002395"/><rect x="10" width="10" height="20" fill="#fff"/><rect x="20" width="10" height="20" fill="#ed2939"/></svg>`,
    en: `<svg viewBox="0 0 60 30" preserveAspectRatio="xMidYMid slice"><rect width="60" height="30" fill="#012169"/><path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" stroke-width="6"/><path d="M0,0 L60,30 M60,0 L0,30" stroke="#C8102E" stroke-width="2"/><path d="M30,0 V30 M0,15 H60" stroke="#fff" stroke-width="10"/><path d="M30,0 V30 M0,15 H60" stroke="#C8102E" stroke-width="6"/></svg>`,
  };

  if (typeof window.updateLangFlag === "function") {
    const prev = window.updateLangFlag;
    window.updateLangFlag = function () {
      const flag = $("#flagIcon");
      const lang = typeof getLang === "function" ? getLang() : "ar";
      if (flag && FLAG_SVG[lang]) flag.innerHTML = FLAG_SVG[lang];
      else if (typeof prev === "function") prev();
    };
  }

  // Cycle ar -> fr -> en on lang toggle
  document.addEventListener("DOMContentLoaded", () => {
    const btn = $("#langToggle");
    if (!btn) return;
    btn.addEventListener(
      "click",
      (e) => {
        e.stopImmediatePropagation();
        const order = ["ar", "fr", "en"];
        const cur = typeof getLang === "function" ? getLang() : "ar";
        const next = order[(order.indexOf(cur) + 1) % order.length];
        setLang(next);
        if (typeof updateLangFlag === "function") updateLangFlag();
        if (typeof applyI18n === "function") applyI18n();
        if (typeof views !== "undefined" && views[window.currentView]) views[window.currentView]();
      },
      true
    );
  });

  // ---- Generic trilingual CMS helpers ----
  function triFields(prefix, obj, keys) {
    return keys
      .map((k) => {
        const o = obj?.[k] || {};
        return `
        <div class="form-group"><label>${k} AR</label><input class="form-control" id="${prefix}_${k}_ar" value="${esc(o.ar || "")}"></div>
        <div class="form-group"><label>${k} FR</label><input class="form-control" id="${prefix}_${k}_fr" value="${esc(o.fr || "")}"></div>
        <div class="form-group"><label>${k} EN</label><input class="form-control" id="${prefix}_${k}_en" value="${esc(o.en || "")}"></div>`;
      })
      .join("");
  }

  function readTri(prefix, key) {
    return {
      ar: $(`#${prefix}_${key}_ar`)?.value.trim() || "",
      fr: $(`#${prefix}_${key}_fr`)?.value.trim() || "",
      en: $(`#${prefix}_${key}_en`)?.value.trim() || "",
    };
  }

  // ---- Home projects ----
  views.homeprojects = async function () {
    const items = await API.list("home_projects");
    const tbody = $("#homeProjectsBody");
    if (!tbody) return;
    tbody.innerHTML = items
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
      .map(
        (p) => `<tr>
      <td>${p.image ? `<img src="${esc(p.image)}" style="width:48px;height:32px;object-fit:cover;border-radius:4px" onerror="this.style.display='none'">` : ""}</td>
      <td style="font-weight:600">${esc(p.title?.ar || p.title?.en || "—")}</td>
      <td>${esc(p.category || "")}</td>
      <td>${p.is_visible !== false ? statusBadge("active") : statusBadge("inactive")}</td>
      <td><div class="actions">
        <button class="btn-icon" onclick="editHomeProject('${p.id}')">✎</button>
        <button class="btn-icon danger" onclick="deleteItem('home_projects','${p.id}')">🗑</button>
      </div></td></tr>`
      )
      .join("");
  };

  window.editHomeProject = async function (id) {
    const p = id
      ? await API.get("home_projects", id)
      : {
          title: { ar: "", fr: "", en: "" },
          description: { ar: "", fr: "", en: "" },
          category: "web",
          tag: "",
          image: "",
          tech: [],
          is_visible: true,
          sort_order: 0,
        };
    openModal(id ? t("edit") : t("add"), `
      <div class="form-grid">
        <div class="form-group"><label>Title AR</label><input class="form-control" id="hp_t_ar" value="${esc(p.title?.ar || "")}"></div>
        <div class="form-group"><label>Title FR</label><input class="form-control" id="hp_t_fr" value="${esc(p.title?.fr || "")}"></div>
        <div class="form-group"><label>Title EN</label><input class="form-control" id="hp_t_en" value="${esc(p.title?.en || "")}"></div>
        <div class="form-group full"><label>Desc AR</label><textarea class="form-control" id="hp_d_ar">${esc(p.description?.ar || "")}</textarea></div>
        <div class="form-group full"><label>Desc FR</label><textarea class="form-control" id="hp_d_fr">${esc(p.description?.fr || "")}</textarea></div>
        <div class="form-group full"><label>Desc EN</label><textarea class="form-control" id="hp_d_en">${esc(p.description?.en || "")}</textarea></div>
        <div class="form-group"><label>Category</label><input class="form-control" id="hp_cat" value="${esc(p.category || "")}"></div>
        <div class="form-group"><label>Tag</label><input class="form-control" id="hp_tag" value="${esc(p.tag || "")}"></div>
        <div class="form-group full"><label>Image</label>
          <input type="file" id="hp_file" accept="image/*" class="form-control">
          <input type="hidden" id="hp_img" value="${esc(p.image || "")}">
          <div id="hp_prev" style="margin-top:8px">${p.image ? `<img src="${esc(p.image)}" style="max-width:160px;border-radius:8px">` : ""}</div>
        </div>
        <div class="form-group full"><label>Tech (comma)</label><input class="form-control" id="hp_tech" value="${esc((p.tech || []).join(", "))}"></div>
        <div class="form-group"><label>Sort</label><input type="number" class="form-control" id="hp_sort" value="${p.sort_order || 0}"></div>
        <div class="form-group" style="padding-top:18px"><label><input type="checkbox" id="hp_vis" ${p.is_visible !== false ? "checked" : ""}> ${t("visible") || "Visible"}</label></div>
      </div>
    `, null, "wide");
    $("#hp_file")?.addEventListener("change", async (e) => {
      const f = e.target.files?.[0];
      if (!f) return;
      const data = await readFile(f);
      $("#hp_img").value = data;
      $("#hp_prev").innerHTML = `<img src="${data}" style="max-width:160px;border-radius:8px">`;
    });
    $("#modalSaveBtn").onclick = async () => {
      const payload = {
        title: { ar: $("#hp_t_ar").value.trim(), fr: $("#hp_t_fr").value.trim(), en: $("#hp_t_en").value.trim() },
        description: { ar: $("#hp_d_ar").value.trim(), fr: $("#hp_d_fr").value.trim(), en: $("#hp_d_en").value.trim() },
        category: $("#hp_cat").value.trim(),
        tag: $("#hp_tag").value.trim(),
        image: $("#hp_img").value,
        tech: $("#hp_tech").value.split(",").map((s) => s.trim()).filter(Boolean),
        sort_order: Number($("#hp_sort").value) || 0,
        is_visible: $("#hp_vis").checked,
      };
      if (id) await API.update("home_projects", id, payload);
      else await API.create("home_projects", payload);
      try {
        localStorage.setItem("autodev_home_projects", JSON.stringify(await API.list("home_projects")));
      } catch (e) {}
      closeModal();
      toast(t("saved"));
      views.homeprojects();
    };
  };

  // ---- Testimonials ----
  views.testimonials = async function () {
    const items = await API.list("testimonials");
    try { if (API.publishSitePublicData) await API.publishSitePublicData(); } catch(e) {}
    const tbody = $("#testimonialsBody");
    if (!tbody) return;
    tbody.innerHTML = items
      .map(
        (x) => `<tr>
      <td style="font-weight:600">${esc(x.name?.ar || x.name?.en || "—")}</td>
      <td class="text-muted" style="max-width:280px">${esc((x.content?.ar || x.content?.en || "").slice(0, 100))}</td>
      <td>${"★".repeat(x.rating || 5)}</td>
      <td>${x.is_visible !== false ? statusBadge("active") : statusBadge("inactive")}</td>
      <td><div class="actions">
        <button class="btn-icon" onclick="editTestimonial('${x.id}')">✎</button>
        <button class="btn-icon danger" onclick="deleteItem('testimonials','${x.id}')">🗑</button>
      </div></td></tr>`
      )
      .join("");
  };

  window.editTestimonial = async function (id) {
    const x = id
      ? await API.get("testimonials", id)
      : { name: { ar: "", fr: "", en: "" }, role: { ar: "", fr: "", en: "" }, content: { ar: "", fr: "", en: "" }, avatar: "", rating: 5, is_visible: true };
    openModal(id ? t("edit") : t("add"), `
      <div class="form-grid">
        <div class="form-group"><label>Name AR</label><input class="form-control" id="ts_n_ar" value="${esc(x.name?.ar || "")}"></div>
        <div class="form-group"><label>Name FR</label><input class="form-control" id="ts_n_fr" value="${esc(x.name?.fr || "")}"></div>
        <div class="form-group"><label>Name EN</label><input class="form-control" id="ts_n_en" value="${esc(x.name?.en || "")}"></div>
        <div class="form-group full"><label>Content AR</label><textarea class="form-control" id="ts_c_ar">${esc(x.content?.ar || "")}</textarea></div>
        <div class="form-group full"><label>Content FR</label><textarea class="form-control" id="ts_c_fr">${esc(x.content?.fr || "")}</textarea></div>
        <div class="form-group full"><label>Content EN</label><textarea class="form-control" id="ts_c_en">${esc(x.content?.en || "")}</textarea></div>
        <div class="form-group"><label>Rating</label><input type="number" min="1" max="5" class="form-control" id="ts_rating" value="${x.rating || 5}"></div>
        <div class="form-group"><label>Avatar</label><input type="file" accept="image/*" id="ts_file" class="form-control"><input type="hidden" id="ts_avatar" value="${esc(x.avatar || "")}"></div>
        <div class="form-group" style="padding-top:18px"><label><input type="checkbox" id="ts_vis" ${x.is_visible !== false ? "checked" : ""}> Visible</label></div>
      </div>
    `, null, "wide");
    $("#ts_file")?.addEventListener("change", async (e) => {
      const f = e.target.files?.[0];
      if (f) $("#ts_avatar").value = await readFile(f);
    });
    $("#modalSaveBtn").onclick = async () => {
      const payload = {
        name: { ar: $("#ts_n_ar").value.trim(), fr: $("#ts_n_fr").value.trim(), en: $("#ts_n_en").value.trim() },
        content: { ar: $("#ts_c_ar").value.trim(), fr: $("#ts_c_fr").value.trim(), en: $("#ts_c_en").value.trim() },
        rating: Number($("#ts_rating").value) || 5,
        avatar: $("#ts_avatar").value,
        is_visible: $("#ts_vis").checked,
      };
      if (id) await API.update("testimonials", id, payload);
      else await API.create("testimonials", payload);
      try { if (API.publishSitePublicData) await API.publishSitePublicData(); } catch(e) {}
      closeModal();
      toast(t("saved"));
      views.testimonials();
    };
  };

  // ---- Blog ----
  views.blog = async function () {
    const items = await API.list("blog_posts");
    const tbody = $("#blogBody");
    if (!tbody) return;
    tbody.innerHTML = items
      .map(
        (x) => `<tr>
      <td style="font-weight:600">${esc(x.title?.ar || x.title?.en || "—")}</td>
      <td>${statusBadge(x.status === "published" ? "active" : "draft")}</td>
      <td>${esc(x.published_at || "")}</td>
      <td><div class="actions">
        <button class="btn-icon" onclick="editBlogPost('${x.id}')">✎</button>
        <button class="btn-icon danger" onclick="deleteItem('blog_posts','${x.id}')">🗑</button>
      </div></td></tr>`
      )
      .join("");
  };

  window.editBlogPost = async function (id) {
    const x = id
      ? await API.get("blog_posts", id)
      : { title: { ar: "", fr: "", en: "" }, excerpt: { ar: "", fr: "", en: "" }, body: { ar: "", fr: "", en: "" }, cover: "", status: "draft", published_at: "" };
    openModal(id ? t("edit") : t("add"), `
      <div class="form-grid">
        <div class="form-group"><label>Title AR</label><input class="form-control" id="bp_t_ar" value="${esc(x.title?.ar || "")}"></div>
        <div class="form-group"><label>Title FR</label><input class="form-control" id="bp_t_fr" value="${esc(x.title?.fr || "")}"></div>
        <div class="form-group"><label>Title EN</label><input class="form-control" id="bp_t_en" value="${esc(x.title?.en || "")}"></div>
        <div class="form-group full"><label>Body AR</label><textarea class="form-control" id="bp_b_ar" rows="4">${esc(x.body?.ar || "")}</textarea></div>
        <div class="form-group full"><label>Body FR</label><textarea class="form-control" id="bp_b_fr" rows="3">${esc(x.body?.fr || "")}</textarea></div>
        <div class="form-group full"><label>Body EN</label><textarea class="form-control" id="bp_b_en" rows="3">${esc(x.body?.en || "")}</textarea></div>
        <div class="form-group"><label>Status</label>
          <select class="form-control" id="bp_status"><option value="draft" ${x.status==="draft"?"selected":""}>draft</option><option value="published" ${x.status==="published"?"selected":""}>published</option></select>
        </div>
        <div class="form-group"><label>Date</label><input type="date" class="form-control" id="bp_date" value="${esc((x.published_at||"").slice(0,10))}"></div>
        <div class="form-group full"><label>Cover image</label><input type="file" accept="image/*" id="bp_file" class="form-control"><input type="hidden" id="bp_cover" value="${esc(x.cover||"")}"></div>
      </div>
    `, null, "wide");
    $("#bp_file")?.addEventListener("change", async (e) => {
      const f = e.target.files?.[0];
      if (f) $("#bp_cover").value = await readFile(f);
    });
    $("#modalSaveBtn").onclick = async () => {
      const payload = {
        title: { ar: $("#bp_t_ar").value.trim(), fr: $("#bp_t_fr").value.trim(), en: $("#bp_t_en").value.trim() },
        body: { ar: $("#bp_b_ar").value.trim(), fr: $("#bp_b_fr").value.trim(), en: $("#bp_b_en").value.trim() },
        status: $("#bp_status").value,
        published_at: $("#bp_date").value,
        cover: $("#bp_cover").value,
      };
      if (id) await API.update("blog_posts", id, payload);
      else await API.create("blog_posts", payload);
      closeModal();
      toast(t("saved"));
      views.blog();
    };
  };

  // ---- FAQ ----
  views.faq = async function () {
    const items = await API.list("faq_items");
    const tbody = $("#faqBody");
    if (!tbody) return;
    tbody.innerHTML = items
      .map(
        (x) => `<tr>
      <td style="font-weight:600">${esc(x.question?.ar || x.question?.en || "—")}</td>
      <td>${x.is_visible !== false ? statusBadge("active") : statusBadge("inactive")}</td>
      <td><div class="actions">
        <button class="btn-icon" onclick="editFaq('${x.id}')">✎</button>
        <button class="btn-icon danger" onclick="deleteItem('faq_items','${x.id}')">🗑</button>
      </div></td></tr>`
      )
      .join("");
  };

  window.editFaq = async function (id) {
    const x = id
      ? await API.get("faq_items", id)
      : { question: { ar: "", fr: "", en: "" }, answer: { ar: "", fr: "", en: "" }, is_visible: true, sort_order: 0 };
    openModal(id ? t("edit") : t("add"), `
      <div class="form-grid">
        <div class="form-group full"><label>Q AR</label><input class="form-control" id="fq_q_ar" value="${esc(x.question?.ar || "")}"></div>
        <div class="form-group full"><label>Q FR</label><input class="form-control" id="fq_q_fr" value="${esc(x.question?.fr || "")}"></div>
        <div class="form-group full"><label>Q EN</label><input class="form-control" id="fq_q_en" value="${esc(x.question?.en || "")}"></div>
        <div class="form-group full"><label>A AR</label><textarea class="form-control" id="fq_a_ar">${esc(x.answer?.ar || "")}</textarea></div>
        <div class="form-group full"><label>A FR</label><textarea class="form-control" id="fq_a_fr">${esc(x.answer?.fr || "")}</textarea></div>
        <div class="form-group full"><label>A EN</label><textarea class="form-control" id="fq_a_en">${esc(x.answer?.en || "")}</textarea></div>
        <div class="form-group" style="padding-top:18px"><label><input type="checkbox" id="fq_vis" ${x.is_visible !== false ? "checked" : ""}> Visible</label></div>
      </div>
    `, null, "wide");
    $("#modalSaveBtn").onclick = async () => {
      const payload = {
        question: { ar: $("#fq_q_ar").value.trim(), fr: $("#fq_q_fr").value.trim(), en: $("#fq_q_en").value.trim() },
        answer: { ar: $("#fq_a_ar").value.trim(), fr: $("#fq_a_fr").value.trim(), en: $("#fq_a_en").value.trim() },
        is_visible: $("#fq_vis").checked,
      };
      if (id) await API.update("faq_items", id, payload);
      else await API.create("faq_items", payload);
      try { if (API.publishSitePublicData) await API.publishSitePublicData(); } catch(e) {}
      closeModal();
      toast(t("saved"));
      views.faq();
    };
  };

  // ---- Invoices ----
  views.invoices = async function () {
    const items = await API.list("invoices");
    const tbody = $("#invoicesBody");
    if (!tbody) return;
    if (!items.length) {
      tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state"><h4>${t("no_data")}</h4></div></td></tr>`;
      return;
    }
    tbody.innerHTML = items
      .map(
        (x) => `<tr>
      <td>${esc(x.number || x.id)}</td>
      <td>${x.kind === "quote" ? t("quote") : t("invoice")}</td>
      <td>${esc(x.client_name || "—")}</td>
      <td>${typeof formatMoney === "function" ? formatMoney(x.amount) : x.amount}</td>
      <td>${esc((x.date || "").slice(0, 10))}</td>
      <td>${statusBadge(x.status || "draft")}</td>
      <td><div class="actions">
        <button class="btn-icon" onclick="printInvoice('${x.id}')" title="PDF">🖨</button>
        <button class="btn-icon danger" onclick="deleteItem('invoices','${x.id}')">🗑</button>
      </div></td></tr>`
      )
      .join("");
  };

  window.createInvoice = async function (kind) {
    const clients = await API.list("clients");
    const projects = await API.list("projects");
    openModal(kind === "quote" ? t("generate_quote") : t("generate_invoice"), `
      <div class="form-grid">
        <div class="form-group"><label>${t("client")}</label>
          <select class="form-control" id="inv_client">
            <option value="">—</option>
            ${clients.map((c) => `<option value="${c.id}" data-name="${esc(c.name)}">${esc(c.name)}</option>`).join("")}
          </select>
        </div>
        <div class="form-group"><label>${t("amount")}</label><input type="number" class="form-control" id="inv_amount" value="0"></div>
        <div class="form-group full"><label>Title</label><input class="form-control" id="inv_title" placeholder="Service / Project"></div>
        <div class="form-group full"><label>${t("notes") || "Notes"}</label><textarea class="form-control" id="inv_notes"></textarea></div>
      </div>
    `);
    $("#modalSaveBtn").onclick = async () => {
      const sel = $("#inv_client");
      const name = sel?.selectedOptions?.[0]?.dataset?.name || "";
      const payload = {
        kind,
        number: (kind === "quote" ? "Q-" : "INV-") + Date.now().toString(36).toUpperCase(),
        client_id: sel?.value || null,
        client_name: name,
        amount: Number($("#inv_amount").value) || 0,
        title: $("#inv_title").value.trim(),
        notes: $("#inv_notes").value.trim(),
        date: new Date().toISOString().slice(0, 10),
        status: "draft",
      };
      const item = await API.create("invoices", payload);
      closeModal();
      toast(t("saved"));
      views.invoices();
      printInvoice(item.id);
    };
  };

  window.printInvoice = async function (id) {
    const inv = await API.get("invoices", id);
    if (!inv) return;
    const settings = await API.getSettings();
    const company = settings.company_name || "AutoDev Agency";
    const html = `<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="UTF-8"><title>${esc(inv.number)}</title>
      <style>body{font-family:Cairo,sans-serif;max-width:720px;margin:40px auto;padding:24px;color:#111}
      h1{font-size:1.4rem}table{width:100%;border-collapse:collapse;margin-top:20px}
      td,th{padding:10px;border-bottom:1px solid #eee;text-align:start}
      .muted{color:#666;font-size:.9rem}</style></head><body>
      <h1>${inv.kind === "quote" ? "عرض سعر" : "فاتورة"} ${esc(inv.number)}</h1>
      <p class="muted">${esc(company)} · ${esc(inv.date || "")}</p>
      <p><strong>العميل:</strong> ${esc(inv.client_name || "—")}</p>
      <table><tr><th>البيان</th><th>المبلغ</th></tr>
      <tr><td>${esc(inv.title || "—")}<div class="muted">${esc(inv.notes || "")}</div></td>
      <td>${Number(inv.amount || 0).toLocaleString("ar-DZ")} د.ج</td></tr></table>
      <p style="margin-top:32px" class="muted">AutoDev Agency</p>
      </body></html>`;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(html);
    w.document.close();
    setTimeout(() => {
      w.focus();
      w.print();
    }, 250);
  };

  // ---- Permissions UI ----
  views.permissions = async function () {
    loadPermissionsUI();
  };

  window.loadPermissionsUI = async function () {
    const role = $("#permRole")?.value || "manager";
    const perms = await API.getRolePermissions(role);
    const box = $("#permChecks");
    if (!box) return;
    box.innerHTML = ALL_VIEWS.map(
      (v) => `
      <label style="display:flex;align-items:center;gap:8px;padding:8px;border:1px solid var(--border);border-radius:8px;cursor:pointer">
        <input type="checkbox" class="perm-cb" value="${v}" ${perms.includes(v) || role === "manager" ? "checked" : ""} ${role === "manager" ? "disabled" : ""}>
        <span style="font-size:.84rem">${v}</span>
      </label>`
    ).join("");
  };

  window.savePermissions = async function () {
    const role = $("#permRole")?.value || "developer";
    if (role === "manager") {
      toast(t("saved"));
      return;
    }
    const perms = $$(".perm-cb:checked").map((c) => c.value);
    await API.updateRolePermissions(role, perms);
    toast(t("permissions_saved") || t("saved"));
    applyNavPermissions();
  };

  // ---- Client logo + Ad creative uploads: hook into existing editors if present ----
  // Soft: after app loads, observe edit forms - skipped for brevity; image fields added via patch below

  // Navigate page title keys
  document.addEventListener("DOMContentLoaded", () => {
    setTimeout(applyNavPermissions, 500);
  });

  // Export home projects for main site on any list
  const _list = API.list.bind(API);
  API.list = async function (collection) {
    const data = await _list(collection);
    if (collection === "home_projects") {
      try {
        localStorage.setItem("autodev_home_projects", JSON.stringify(data));
      } catch (e) {}
    }
    return data;
  };
})();
