/* =====================================================================
   SHUXBROH — Admin Panel
   Edits the website content stored in Supabase (table: site_content),
   media in Supabase Storage (bucket: media) and contact inquiries.
   ===================================================================== */
(function () {
  "use strict";
  var DB = window.SHUX_DB;
  var DEFAULTS = JSON.parse(JSON.stringify(window.SITE_CONTENT || {}));
  var root = document.getElementById("admin-root");

  /* ---------------- helpers ---------------- */
  function esc(v) {
    return String(v == null ? "" : v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function isObj(v) { return v && typeof v === "object" && !Array.isArray(v); }
  function merge(base, over) {
    if (!isObj(base) || !isObj(over)) return over === undefined ? base : over;
    var out = {};
    Object.keys(base).forEach(function (k) { out[k] = base[k]; });
    Object.keys(over).forEach(function (k) { out[k] = isObj(base[k]) && isObj(over[k]) ? merge(base[k], over[k]) : over[k]; });
    return out;
  }
  function getPath(obj, path) {
    return path.split(".").reduce(function (o, k) { return o == null ? undefined : o[k]; }, obj);
  }
  function setPath(obj, path, val) {
    var ks = path.split("."), o = obj;
    for (var i = 0; i < ks.length - 1; i++) {
      if (o[ks[i]] == null || typeof o[ks[i]] !== "object") o[ks[i]] = /^\d+$/.test(ks[i + 1]) ? [] : {};
      o = o[ks[i]];
    }
    o[ks[ks.length - 1]] = val;
  }
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function fmtDate(d) {
    try { return new Date(d).toLocaleString(undefined, { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }); } catch (e) { return d; }
  }
  function fmtSize(b) { if (!b && b !== 0) return ""; return b > 1048576 ? (b / 1048576).toFixed(1) + " MB" : Math.max(1, Math.round(b / 1024)) + " KB"; }
  function preview(url) {                                  // relative site paths need ../ from /admin/
    if (!url) return "";
    return /^(https?:|data:|blob:|\/)/i.test(url) ? url : "../" + url;
  }
  function isVideo(url) { return /\.(mp4|webm|mov)(\?|$)/i.test(url || ""); }
  function isYouTube(url) { return /(youtube\.com|youtu\.be)\//i.test(url || ""); }

  var ICONS = {
    video: '<rect x="2" y="5" width="14" height="14" rx="3"/><path d="m16 10 6-3v10l-6-3"/>',
    film: '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M7 3v18M17 3v18M3 8h4M3 16h4M17 8h4M17 16h4M3 12h18"/>',
    pen: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
    thread: '<path d="M4 6h16M4 12h10M4 18h13"/><circle cx="19" cy="12" r="1.5"/>',
    share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    star: '<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9Z"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    left: '<path d="M15 6l-6 6 6 6"/>',
    right: '<path d="M9 6l6 6-6 6"/>',
    quote: '<path d="M7 17c-2 0-3-1.5-3-3.5C4 10 6 7 9 6l.5 1C8 8 7 9.5 7 11h2v6Zm10 0c-2 0-3-1.5-3-3.5 0-3.5 2-6.5 5-7.5l.5 1c-1.5 1-2.5 2.5-2.5 4h2v6Z"/>',
    image: '<rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-9 9"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    close: '<path d="M6 6l12 12M18 6 6 18"/>',
    x: '<path d="M4 4l16 16M20 4 4 20"/>',
    telegram: '<path d="M21 4 3 11l6 2 2 6 3-4 5 4Z"/><path d="m9 13 8-6"/>',
    instagram: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".6"/>',
    youtube: '<rect x="2" y="5" width="20" height="14" rx="4"/><path d="m10 9 5 3-5 3Z"/>',
    tiktok: '<path d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5"/><path d="M14 3c.5 2.6 2.4 4.4 5 4.6"/>',
    discord: '<path d="M8 7.5c2.6-.8 5.4-.8 8 0M7 17c3 1.3 7 1.3 10 0"/><path d="M8.5 5 7 4.5C5.3 5 4 6 3.4 7.2 2 10.5 1.8 13.7 2.4 16.8c1.3 1.3 2.8 2.1 4.6 2.6L8 17.5M15.5 5 17 4.5c1.7.5 3 1.5 3.6 2.7 1.4 3.3 1.6 6.5 1 9.6-1.3 1.3-2.8 2.1-4.6 2.6L16 17.5"/><circle cx="9" cy="12.5" r="1.3"/><circle cx="15" cy="12.5" r="1.3"/>',
    linkedin: '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 10v7M8 7v.01M12 17v-4a2 2 0 0 1 4 0v4M12 10v7"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="m3 7 9 6 9-6"/>',
    play: '<path d="M8 5.5v13l11-6.5Z"/>',
    doc: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z"/><path d="M14 3v5h5M9 13h6M9 17h6M9 9h2"/>',
    external: '<path d="M14 4h6v6M20 4l-9 9"/><path d="M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
    chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14.2c2.1.7 3.5 2.8 3.5 5.8"/>',
    eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
    check: '<path d="M5 12.5 10 17 19 7"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    chev: '<path d="m6 9 6 6 6-6"/>',
    send: '<path d="M21 3 10 14"/><path d="M21 3 14 21l-4-7-7-4Z"/>',
    cube: '<path d="M12 2 3 7v10l9 5 9-5V7Z"/><path d="m3 7 9 5 9-5M12 12v10"/>',
    coin: '<circle cx="12" cy="12" r="9"/><path d="M15 9.5c-.5-1-1.6-1.5-3-1.5-1.7 0-3 .8-3 2s1.3 1.7 3 2 3 .8 3 2-1.3 2-3 2c-1.4 0-2.5-.5-3-1.5M12 6v2M12 16v2"/>',
    chip: '<rect x="6" y="6" width="12" height="12" rx="2"/><rect x="9.5" y="9.5" width="5" height="5" rx="1"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/>',
    spark: '<path d="M12 3c.6 4.6 2.8 7.3 7.5 9-4.7 1.7-6.9 4.4-7.5 9-.6-4.6-2.8-7.3-7.5-9C9.2 10.3 11.4 7.6 12 3Z"/>',
    heart: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z"/>'
  };
  function icon(name) {
    if (name === "x") return '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M17.8 3h3.1l-6.8 7.7L22 21h-6.2l-4.9-6.4L5.3 21H2.2l7.3-8.3L2 3h6.4l4.4 5.8L17.8 3Zm-1.1 16.2h1.7L7.4 4.7H5.6l11.1 14.5Z"/></svg>';
    var extra = {
      dash: '<rect x="3" y="3" width="7" height="9" rx="2"/><rect x="14" y="3" width="7" height="5" rx="2"/><rect x="14" y="12" width="7" height="9" rx="2"/><rect x="3" y="16" width="7" height="5" rx="2"/>',
      home: '<path d="M3 11 12 4l9 7"/><path d="M5 10v10h14V10"/>',
      folder: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/>',
      inbox: '<path d="M3 13h5l1.5 3h5L16 13h5"/><path d="M5 5h14l2 8v6H3v-6Z"/>',
      gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/>',
      upload: '<path d="M12 16V4M7 9l5-5 5 5"/><path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3"/>',
      trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
      up: '<path d="m6 15 6-6 6 6"/>', down: '<path d="m6 9 6 6 6-6"/>',
      plus: '<path d="M12 5v14M5 12h14"/>', copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a1 1 0 0 1 1-1h10"/>',
      logout: '<path d="M15 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4M10 17l-5-5 5-5M5 12h11"/>',
      save: '<path d="M5 3h11l3 3v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"/><path d="M8 3v5h7V3M7 21v-7h10v7"/>',
      refresh: '<path d="M20 11a8 8 0 0 0-14.3-4.9L4 8M4 4v4h4M4 13a8 8 0 0 0 14.3 4.9L20 16M20 20v-4h-4"/>',
      open: '<path d="M14 4h6v6M20 4l-9 9"/><path d="M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5"/>',
      lock: '<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
      people: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14.2c2.1.7 3.5 2.8 3.5 5.8"/>',
      photo: '<rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-9 9"/>',
      reply: '<path d="M10 9 4 14l6 5"/><path d="M4 14h11a5 5 0 0 0 5-5V5"/>',
      starfill: '<path fill="currentColor" stroke="none" d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9Z"/>',
      eyeoff: '<path d="M3 3l18 18M10.6 6.1A10 10 0 0 1 12 6c6.4 0 10 6 10 6a17 17 0 0 1-3.2 3.8M6.6 6.6C3.7 8.4 2 12 2 12s3.6 6 10 6c1.6 0 3-.4 4.3-1"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
      palette: '<path d="M12 3a9 9 0 1 0 0 18c1 0 1.5-.8 1.5-1.5 0-1.2-1-1.5-1-2.5S13.3 15 14.5 15H17a4 4 0 0 0 4-4c0-4.4-4-8-9-8Z"/><circle cx="7.5" cy="11" r="1.2"/><circle cx="10" cy="7" r="1.2"/><circle cx="15" cy="7.5" r="1.2"/>'
    };
    var p = extra[name] || ICONS[name] || ICONS.star;
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + p + "</svg>";
  }
  var ICON_CHOICES = ["video", "film", "pen", "thread", "share", "search", "star", "target", "spark", "cube", "coin", "chip", "user", "users", "chart", "eye", "doc", "image", "heart", "globe", "mail", "clock", "check", "x", "telegram", "instagram", "youtube", "linkedin", "tiktok", "discord"];
  var PAGES = ["index.html", "about.html", "services.html", "portfolio.html", "contact.html"];

  /* ---------------- toasts & dialogs ---------------- */
  function toast(msg, type) {
    var t = document.createElement("div");
    t.className = "toast " + (type || "ok");
    t.innerHTML = icon(type === "error" ? "close" : "check") + "<span>" + esc(msg) + "</span>";
    $("#toasts").appendChild(t);
    requestAnimationFrame(function () { t.classList.add("show"); });
    setTimeout(function () { t.classList.remove("show"); setTimeout(function () { t.remove(); }, 300); }, type === "error" ? 6000 : 3200);
  }
  function modal(html, cls) {
    var m = document.createElement("div");
    m.className = "a-modal " + (cls || "");
    m.innerHTML = '<div class="a-modal-bg" data-x></div><div class="a-modal-box" role="dialog" aria-modal="true">' + html + "</div>";
    document.body.appendChild(m);
    requestAnimationFrame(function () { m.classList.add("show"); });
    function close() { m.classList.remove("show"); setTimeout(function () { m.remove(); }, 200); document.removeEventListener("keydown", onKey); }
    function onKey(e) { if (e.key === "Escape") { close(); if (m._onCancel) m._onCancel(); } }
    document.addEventListener("keydown", onKey);
    m.addEventListener("click", function (e) { if (e.target.closest("[data-x]")) { close(); if (m._onCancel) m._onCancel(); } });
    m._close = close;
    return m;
  }
  function confirmBox(title, text, okLabel, danger) {
    return new Promise(function (resolve) {
      var m = modal('<h3>' + esc(title) + '</h3><p class="muted">' + esc(text) + '</p><div class="a-modal-actions"><button class="a-btn ghost" data-x>Cancel</button><button class="a-btn ' + (danger ? "danger" : "primary") + '" data-ok>' + esc(okLabel || "Confirm") + "</button></div>");
      m._onCancel = function () { resolve(false); };
      $("[data-ok]", m).addEventListener("click", function () { m._onCancel = null; m._close(); resolve(true); });
      setTimeout(function () { var b = $("[data-ok]", m); if (b) b.focus(); }, 50);
    });
  }

  /* ---------------- state ---------------- */
  var state = { draft: null, savedJson: "", updatedAt: null, hasRow: false, route: "dashboard", user: null, inquiries: null, media: null };
  function dirty() { return state.draft && JSON.stringify(state.draft) !== state.savedJson; }
  function markDirty() {
    var bar = $("#savebar"); if (!bar) return;
    var d = dirty();
    bar.classList.toggle("is-dirty", d);
    $("#save-status").textContent = d ? "You have unsaved changes" : (state.updatedAt ? "All changes saved · " + fmtDate(state.updatedAt) : "Not published yet");
    $("#save-btn").disabled = !d && state.hasRow;
    $("#discard-btn").hidden = !d;
  }
  window.addEventListener("beforeunload", function (e) { if (dirty()) { e.preventDefault(); e.returnValue = ""; } });

  /* =====================================================================
     SCHEMA — what can be edited on each admin page
     ===================================================================== */
  var T = function (k, l, h, extra) { return Object.assign({ k: k, t: "text", l: l, h: h }, extra || {}); };
  var TA = function (k, l, h, rows) { return { k: k, t: "textarea", l: l, h: h, rows: rows || 3 }; };
  var IMG = function (k, l, h) { return { k: k, t: "image", l: l, h: h }; };
  var TOG = function (k, l, h) { return { k: k, t: "toggle", l: l, h: h }; };
  var ICO = function (k, l) { return { k: k, t: "icon", l: l || "Icon" }; };
  var LINK = function (k, l, h) { return { k: k, t: "link", l: l, h: h }; };

  var SCHEMA = {
    home: { title: "Home Page", icon: "home", view: "../index.html", groups: [
      { g: "Hero", d: "The first section visitors see.", f: [
        T("hero.label", "Small heading"), T("hero.eyebrow", "Topic pill"), T("hero.greeting", "Introduction line"),
        T("hero.handle", "Big brand name"), T("hero.name", "Script name (over the brand name)"), T("hero.title", "Professional headline"),
        TA("hero.intro", "Description", "Leave an empty line between paragraphs.", 5),
        IMG("hero.photo", "Profile image"), T("hero.photoAlt", "Profile image description (for accessibility)"),
        T("hero.ctaLabel", "Button text"), LINK("hero.ctaHref", "Button link"),
        { k: "hero.tags", t: "list", l: "Service labels", add: "Add label" }
      ] },
      { g: "Services Preview", f: [
        T("services.eyebrow", "Script label"), T("services.heading", "Heading"), TA("services.sub", "Intro text", "", 2),
        T("services.ctaLabel", "Button text"), LINK("services.ctaHref", "Button link"),
        { k: "services.items", t: "repeat", l: "Service cards", title: "title", add: "Add service card", tpl: { icon: "star", title: "New service", text: "" },
          f: [ICO("icon"), T("title", "Title"), TA("text", "Short description", "", 2)] }
      ] },
      { g: "Featured Work", d: "Mark projects as Featured in Portfolio to show them here (up to 6). If none are featured, the cards below are shown.", f: [
        T("work.eyebrow", "Script label"), T("work.heading", "Heading"), TA("work.sub", "Intro text", "", 2),
        T("work.ctaLabel", "Button text"), LINK("work.ctaHref", "Button link"),
        { k: "work.items", t: "repeat", l: "Fallback cards", title: "title", thumb: "thumbnail", add: "Add card", tpl: { title: "New card", category: "", thumbnail: "", link: "" },
          f: [T("title", "Title"), T("category", "Category"), IMG("thumbnail", "Thumbnail"), T("link", "Link (optional)", "Full URL starting with https://")] }
      ] },
      { g: "Section Headings", d: "Testimonial and brand entries are managed under Testimonials & Brands.", f: [
        T("testimonials.eyebrow", "Testimonials — script label"), T("testimonials.heading", "Testimonials — heading"),
        T("brands.eyebrow", "Collaborations — script label"), T("brands.heading", "Collaborations — heading")
      ] },
      { g: "Closing Call to Action", f: [
        T("cta.eyebrow", "Script label"), T("cta.headingTop", "Heading — first line"), T("cta.headingBottom", "Heading — second line (gradient)"),
        TA("cta.text", "Text", "", 3), T("cta.ctaLabel", "Button text"), LINK("cta.ctaHref", "Button link"), T("cta.signoff", "Sign-off line")
      ] },
      { g: "Footer", d: "Social icons are managed under Contact.", f: [TA("footer.tagline", "Tagline", "", 2), T("footer.copyright", "Copyright text", "The year is added automatically.")] }
    ] },

    about: { title: "About Page", icon: "user", view: "../about.html", groups: [
      { g: "Introduction", f: [
        T("about.intro.label", "Small heading"), T("about.intro.name", "Name"), T("about.intro.handle", "Brand name"), T("about.intro.role", "Title"),
        IMG("about.intro.photo", "Photo"), T("about.intro.photoAlt", "Photo description (for accessibility)"),
        TA("about.intro.text", "About Me text", "Leave an empty line between paragraphs.", 6)
      ] },
      { g: "Creator Stats", d: "Shown on the About page only when at least one value is filled in. Enter your real numbers, e.g. 1250, 12.5K or 3.2M.", f: [
        T("about.stats.eyebrow", "Script label"), T("about.stats.heading", "Heading"), T("about.stats.sub", "Intro text (optional)"),
        { k: "about.stats.items", t: "repeat", l: "Statistics", title: "label", sub: "value", add: "Add statistic", tpl: { icon: "chart", label: "New statistic", value: "", suffix: "", visible: true },
          f: [T("label", "Label"), T("value", "Value", "Numbers animate on the website. Leave empty to hide."), T("suffix", "Small text under the value (optional)"), ICO("icon"), TOG("visible", "Show on website")] }
      ] },
      { g: "My Journey", f: [
        T("about.journey.eyebrow", "Script label"), T("about.journey.heading", "Heading"), TA("about.journey.quote", "Quote / motto", "", 2),
        { k: "about.journey.chapters", t: "repeat", l: "Chapters", title: "title", add: "Add chapter", tpl: { title: "New chapter", text: "" },
          f: [T("title", "Chapter title"), TA("text", "Story", "Leave an empty line between paragraphs.", 5)] }
      ] },
      { g: "What I Do", f: [
        T("about.whatIDo.eyebrow", "Script label"), T("about.whatIDo.heading", "Heading"),
        { k: "about.whatIDo.items", t: "repeat", l: "Focus areas", title: "title", add: "Add focus area", tpl: { icon: "star", title: "New area", text: "" },
          f: [ICO("icon"), T("title", "Title"), TA("text", "Description", "", 2)] }
      ] },
      { g: "Skills & Expertise", f: [
        T("about.skills.eyebrow", "Script label"), T("about.skills.heading", "Heading"),
        { k: "about.skills.items", t: "repeat", l: "Skills", title: "title", add: "Add skill", tpl: { icon: "star", title: "New skill", text: "" },
          f: [ICO("icon"), T("title", "Skill"), TA("text", "Short note", "", 2)] }
      ] },
      { g: "My Approach", f: [
        T("about.approach.eyebrow", "Script label"), T("about.approach.heading", "Heading"), TA("about.approach.sub", "Intro text", "", 2),
        { k: "about.approach.steps", t: "repeat", l: "Steps", title: "title", add: "Add step", tpl: { title: "New step", text: "" },
          f: [T("title", "Step title"), TA("text", "Explanation", "", 3)] }
      ] }
    ] },

    portfolio: { title: "Portfolio", icon: "folder", view: "../portfolio.html", groups: [
      { g: "Projects", d: "Newest first. Featured projects also appear on the Home page.", f: [
        { k: "portfolio.items", t: "repeat", l: "Projects", title: "title", thumb: "thumbnail", badges: "portfolio", addAtStart: true, add: "Add new project",
          tpl: { title: "New project", description: "", categories: [], platform: "X", type: "video", thumbnail: "", media: "", body: "", link: "", featured: false },
          f: [
            T("title", "Title"), TA("description", "Short description", "", 3),
            { k: "categories", t: "checks", l: "Categories", from: "portfolio.categories" },
            T("platform", "Platform", "e.g. X, YouTube, Instagram, TikTok", { list: ["X", "YouTube", "Instagram", "TikTok", "LinkedIn", "Telegram", "Website"] }),
            { k: "type", t: "select", l: "Content format", opts: [["video", "Video"], ["image", "Image"], ["text", "Written (post / thread)"]] },
            IMG("thumbnail", "Thumbnail"),
            { k: "media", t: "media", l: "Large preview (video, image or YouTube link)", h: "Upload an .mp4 / image, or paste a YouTube link. Leave empty to use the thumbnail." },
            { k: "body", t: "textarea", l: "Full written content", h: "For posts and threads. Leave an empty line between parts.", rows: 6, showIf: { k: "type", v: "text" } },
            T("link", "External link (optional)", "Full URL starting with https://"),
            TOG("featured", "Featured on Home page")
          ] }
      ] },
      { g: "Categories", d: "These are the filter tabs. Renaming a category updates all projects that use it.", f: [{ k: "portfolio.categories", t: "categories", l: "Categories" }] },
      { g: "Page Text", f: [
        T("portfolio.eyebrow", "Script label"), T("portfolio.heading", "Heading"), TA("portfolio.sub", "Intro text", "", 2),
        T("portfolio.allLabel", "“All” tab label"), T("portfolio.emptyText", "Message when a category is empty")
      ] }
    ] },

    services: { title: "Services", icon: "target", view: "../services.html", groups: [
      { g: "Services", f: [
        { k: "servicesPage.items", t: "repeat", l: "Services", title: "title", sub: "price", badges: "service", add: "Add service",
          tpl: { icon: "star", title: "New service", description: "", features: [], price: "", priceNote: "", hidden: false },
          f: [ICO("icon"), T("title", "Title"), TA("description", "Description", "", 3), { k: "features", t: "list", l: "Features", add: "Add feature" },
            T("price", "Price (optional)", "Leave empty to hide the price for this service."), T("priceNote", "Price note", "e.g. per video, per month"),
            TOG("hidden", "Hide this service")] }
      ] },
      { g: "Page Settings", f: [
        T("servicesPage.eyebrow", "Script label"), T("servicesPage.heading", "Heading"), TA("servicesPage.sub", "Intro text", "", 2),
        TOG("servicesPage.showPricing", "Show prices on the website"), T("servicesPage.priceLabel", "Text above prices"), T("servicesPage.ctaLabel", "Button text")
      ] }
    ] },

    contact: { title: "Contact", icon: "mail", view: "../contact.html", groups: [
      { g: "Contact Details & Social Links", d: "Used on the Contact page, the Home page hero, the closing section and the footer.", f: [{ k: "socials", t: "socials" }] },
      { g: "Contact Page Text", f: [
        T("contact.eyebrow", "Script label"), T("contact.heading", "Heading"), TA("contact.sub", "Intro text", "", 2),
        T("contact.detailsHeading", "Contact details heading"), TA("contact.availability", "Availability note", "", 2), T("contact.emptyLink", "Text for links not added yet")
      ] },
      { g: "Inquiry Form Settings", d: "Submitted inquiries appear under Inquiries.", f: [
        TOG("contact.form.enabled", "Accept inquiries through the form"), TA("contact.form.disabledText", "Message when the form is turned off", "", 2),
        T("contact.form.heading", "Form heading"), T("contact.form.nameLabel", "Name label"), T("contact.form.emailLabel", "Email label"),
        T("contact.form.companyLabel", "Brand / project label"), T("contact.form.serviceLabel", "Service label"), T("contact.form.servicePlaceholder", "Service placeholder"),
        T("contact.form.otherService", "“Other” service option"), T("contact.form.messageLabel", "Message label"), T("contact.form.messagePlaceholder", "Message placeholder"),
        T("contact.form.submitLabel", "Button text"), T("contact.form.successTitle", "Success title"), TA("contact.form.successText", "Success message", "", 2),
        TA("contact.form.errorText", "Message if sending fails", "", 2)
      ] }
    ] },

    people: { title: "Testimonials & Brands", icon: "people", view: "../index.html#testimonials", groups: [
      { g: "Client Testimonials", d: "Shown in the sliding cards on the Home page. Remove all to hide the section.", f: [
        { k: "testimonials.items", t: "repeat", l: "Testimonials", title: "name", sub: "role", thumb: "avatar", add: "Add testimonial", tpl: { quote: "", name: "Client name", role: "", avatar: "" },
          f: [TA("quote", "Testimonial", "", 4), T("name", "Client name"), T("role", "Role & company", "e.g. Founder · Company"), IMG("avatar", "Client photo / logo (optional)")] }
      ] },
      { g: "Brand Collaborations", d: "Shown in the moving row on the Home page. Remove all to hide the section.", f: [
        { k: "brands.items", t: "repeat", l: "Brands", title: "name", thumb: "logo", add: "Add brand", tpl: { name: "Brand name", logo: "", url: "", details: "" },
          f: [T("name", "Brand / project name"), IMG("logo", "Logo (optional)", "Without a logo the name is shown."), T("url", "Website link (optional)", "Full URL starting with https://"), TA("details", "Collaboration details (optional)", "Shown when hovering the brand.", 2)] }
      ] }
    ] },

    settings: { title: "Website Settings", icon: "gear", groups: [
      { g: "Brand & Logo", f: [T("brand.logoText", "Logo text"), T("brand.logoMark", "Logo badge letter", "Shown in the round badge when no logo image is set."), IMG("brand.logoImage", "Logo image (optional)")] },
      { g: "Search & Browser Tab", f: [T("seo.homeTitle", "Home page title"), T("seo.siteTitle", "Site name", "Other pages show “Page — Site name”."), TA("seo.description", "Site description (search engines)", "", 3)] },
      { g: "Navigation", f: [
        { k: "nav", t: "repeat", l: "Menu links", title: "label", sub: "href", add: "Add menu link", tpl: { label: "New link", href: "index.html" }, f: [T("label", "Label"), LINK("href", "Link")] },
        T("navCta.label", "Menu button text", "Leave empty to hide the button."), LINK("navCta.href", "Menu button link")
      ] },
      { g: "Colors", f: [{ k: "theme", t: "theme" }] },
      { g: "Footer", f: [TA("footer.tagline", "Tagline", "", 2), T("footer.copyright", "Copyright text")] }
    ] }
  };
  var NAV = [
    ["dashboard", "Dashboard", "dash"], ["home", "Home Page", "home"], ["about", "About Page", "user"], ["portfolio", "Portfolio", "folder"],
    ["services", "Services", "target"], ["contact", "Contact", "mail"], ["people", "Testimonials & Brands", "people"],
    ["media", "Media Library", "photo"], ["inquiries", "Inquiries", "inbox"], ["settings", "Settings", "gear"]
  ];

  /* =====================================================================
     AUTH SCREENS
     ===================================================================== */
  function screenSetup() {
    root.className = "auth-screen";
    root.innerHTML = '<div class="auth-card">' + brandBlock() +
      '<h1>Connect Supabase</h1><p class="muted">The Admin Panel needs your Supabase project before you can sign in.</p>' +
      '<ol class="setup-steps"><li>Run <code>supabase/setup.sql</code> in the Supabase SQL Editor.</li>' +
      "<li>Add <code>SUPABASE_URL</code> and <code>SUPABASE_ANON_KEY</code> in Netlify → Site configuration → Environment variables, then redeploy.</li>" +
      "<li>Or paste both values into <code>assets/js/config.js</code>.</li></ol>" +
      '<p class="muted small">Full steps are in README.md.</p><a class="a-btn ghost" href="../index.html">' + icon("arrow") + "View website</a></div>";
  }
  function brandBlock() {
    return '<div class="auth-brand"><span class="a-logo">' + esc((DEFAULTS.brand && DEFAULTS.brand.logoMark) || "S") + "</span><span>" + esc((DEFAULTS.brand && DEFAULTS.brand.logoText) || "ShuxBroh") + ' <em>Admin</em></span></div>';
  }
  function screenLogin(msg) {
    root.className = "auth-screen";
    root.innerHTML = '<div class="auth-card">' + brandBlock() +
      "<h1>Welcome back</h1><p class=\"muted\">Sign in to manage your website.</p>" +
      '<form id="login-form" novalidate>' +
        '<label class="a-field"><span>Email</span><input type="email" name="email" autocomplete="username" required></label>' +
        '<label class="a-field"><span>Password</span><div class="pw-wrap"><input type="password" name="password" autocomplete="current-password" required><button type="button" class="pw-toggle" aria-label="Show password">' + icon("eye") + "</button></div></label>" +
        '<div class="auth-msg" role="alert">' + (msg ? esc(msg) : "") + "</div>" +
        '<button class="a-btn primary wide" type="submit">' + icon("lock") + "<span>Sign in</span></button>" +
      "</form>" +
      '<button class="link-btn" id="forgot">Forgot password?</button>' +
      '<a class="back-link" href="../index.html">← Back to website</a></div>';
    var f = $("#login-form"), m = $(".auth-msg");
    if (msg) m.classList.add("show");
    $(".pw-toggle").addEventListener("click", function () {
      var i = f.password; i.type = i.type === "password" ? "text" : "password";
      this.innerHTML = icon(i.type === "password" ? "eye" : "eyeoff");
    });
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var email = f.email.value.trim(), pw = f.password.value;
      if (!email || !pw) { m.textContent = "Enter your email and password."; m.classList.add("show"); return; }
      var b = f.querySelector("button[type=submit]"); b.disabled = true; b.classList.add("loading");
      m.classList.remove("show");
      DB.auth.signIn(email, pw).then(function () { return afterLogin(); }).catch(function (err) {
        b.disabled = false; b.classList.remove("loading");
        m.textContent = /invalid/i.test(err.message) ? "Incorrect email or password." : err.message;
        m.classList.add("show");
      });
    });
    $("#forgot").addEventListener("click", function () {
      var md = modal('<h3>Reset password</h3><p class="muted">We\'ll email you a link to set a new password.</p><label class="a-field"><span>Email</span><input type="email" id="reset-email" value="' + esc(f.email.value) + '"></label><div class="a-modal-actions"><button class="a-btn ghost" data-x>Cancel</button><button class="a-btn primary" data-ok>Send link</button></div>');
      $("[data-ok]", md).addEventListener("click", function () {
        var em = $("#reset-email", md).value.trim();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) { toast("Enter a valid email.", "error"); return; }
        var btn = this; btn.disabled = true;
        DB.auth.sendReset(em, location.origin + location.pathname).then(function () {
          md._close(); toast("If that email belongs to an admin, a reset link is on its way.");
        }).catch(function (err) { btn.disabled = false; toast(err.message, "error"); });
      });
    });
    setTimeout(function () { f.email.focus(); }, 50);
  }
  function screenNewPassword() {
    root.className = "auth-screen";
    root.innerHTML = '<div class="auth-card">' + brandBlock() + "<h1>Set a new password</h1><p class=\"muted\">Use at least 10 characters.</p>" +
      '<form id="pw-form" novalidate><label class="a-field"><span>New password</span><input type="password" name="p1" autocomplete="new-password" minlength="10" required></label>' +
      '<label class="a-field"><span>Repeat password</span><input type="password" name="p2" autocomplete="new-password" required></label>' +
      '<div class="auth-msg" role="alert"></div><button class="a-btn primary wide" type="submit">Save password</button></form></div>';
    var f = $("#pw-form"), m = $(".auth-msg");
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      if (f.p1.value.length < 10) { m.textContent = "Password must be at least 10 characters."; m.classList.add("show"); return; }
      if (f.p1.value !== f.p2.value) { m.textContent = "Passwords don't match."; m.classList.add("show"); return; }
      DB.auth.updatePassword(f.p1.value).then(function () { toast("Password updated."); afterLogin(); })
        .catch(function (err) { m.textContent = err.message; m.classList.add("show"); });
    });
  }

  function afterLogin() {
    return DB.auth.isAdmin().then(function (ok) {
      if (!ok) { return DB.auth.signOut().then(function () { screenLogin("This account doesn't have admin access."); }); }
      return Promise.all([DB.auth.user(), DB.db.getContent()]).then(function (r) {
        state.user = r[0];
        var row = r[1];
        state.hasRow = !!row;
        state.updatedAt = row ? row.updated_at : null;
        state.draft = row && isObj(row.data) ? merge(clone(DEFAULTS), row.data) : clone(DEFAULTS);
        state.savedJson = row ? JSON.stringify(state.draft) : "";
        renderShell();
        go(location.hash.replace("#", "") || "dashboard");
        loadInquiries(true);
      });
    }).catch(function (err) {
      if (err.status === 401) screenLogin("Your session expired. Please sign in again.");
      else screenLogin("Couldn't connect to Supabase: " + err.message);
    });
  }

  /* =====================================================================
     SHELL
     ===================================================================== */
  function renderShell() {
    root.className = "app";
    root.innerHTML =
      '<aside class="side" id="side"><div class="side-head">' + brandBlock() + '<button class="icon-btn side-close" aria-label="Close menu">' + icon("close") + "</button></div>" +
        '<nav class="side-nav">' + NAV.map(function (n) {
          return '<a href="#' + n[0] + '" data-route="' + n[0] + '">' + icon(n[2]) + "<span>" + n[1] + "</span>" + (n[0] === "inquiries" ? '<b class="badge" id="inq-badge" hidden></b>' : "") + "</a>";
        }).join("") + "</nav>" +
        '<div class="side-foot"><a class="side-link" href="../index.html" target="_blank" rel="noopener">' + icon("open") + "<span>View website</span></a>" +
        '<div class="who"><span class="who-av">' + esc(((state.user && state.user.email) || "?")[0].toUpperCase()) + '</span><span class="who-mail">' + esc(state.user && state.user.email) + "</span></div>" +
        '<button class="side-link" id="logout">' + icon("logout") + "<span>Log out</span></button></div></aside>" +
      '<div class="side-scrim"></div>' +
      '<main class="main"><header class="topbar"><button class="icon-btn menu-btn" aria-label="Open menu">' + icon("menu") + '</button><h1 id="page-title"></h1><a class="a-btn ghost sm" id="view-page" target="_blank" rel="noopener" hidden>' + icon("open") + "<span>View page</span></a></header>" +
        '<div class="content" id="content"></div></main>' +
      '<div class="savebar" id="savebar"><span id="save-status"></span><div class="savebar-actions"><button class="a-btn ghost sm" id="discard-btn" hidden>Discard</button><button class="a-btn primary" id="save-btn">' + icon("save") + "<span>Save & publish</span></button></div></div>";

    if (!renderShell.bound) {
      renderShell.bound = true;
      window.addEventListener("hashchange", function () { if ($("#content")) go(location.hash.replace("#", "") || "dashboard"); });
      document.addEventListener("keydown", function (e) {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s" && $("#save-btn")) { e.preventDefault(); if (dirty() || !state.hasRow) save(); }
      });
    }
    $(".menu-btn").addEventListener("click", function () { document.body.classList.add("side-open"); });
    $(".side-close").addEventListener("click", closeSide);
    $(".side-scrim").addEventListener("click", closeSide);
    $("#logout").addEventListener("click", function () {
      var p = dirty() ? confirmBox("Log out?", "You have unsaved changes that will be lost.", "Log out", true) : Promise.resolve(true);
      p.then(function (ok) { if (!ok) return; state.savedJson = JSON.stringify(state.draft); DB.auth.signOut().then(function () { location.hash = ""; screenLogin(); toast("Logged out."); }); });
    });
    $("#save-btn").addEventListener("click", save);
    $("#discard-btn").addEventListener("click", function () {
      confirmBox("Discard changes?", "All unsaved edits will be undone.", "Discard", true).then(function (ok) {
        if (!ok) return;
        state.draft = state.savedJson ? JSON.parse(state.savedJson) : clone(DEFAULTS);
        go(state.route, true); markDirty();
      });
    });
    markDirty();
  }
  function closeSide() { document.body.classList.remove("side-open"); }

  function go(route, force) {
    if (!NAV.some(function (n) { return n[0] === route; })) route = "dashboard";
    if (route === state.route && !force && $("#content").childElementCount) { closeSide(); return; }
    state.route = route;
    if (location.hash.replace("#", "") !== route) history.replaceState(null, "", "#" + route);
    $$(".side-nav a").forEach(function (a) { a.classList.toggle("active", a.getAttribute("data-route") === route); });
    var name = NAV.filter(function (n) { return n[0] === route; })[0][1];
    $("#page-title").textContent = name;
    var vp = $("#view-page"), sc = SCHEMA[route];
    vp.hidden = !(sc && sc.view); if (sc && sc.view) vp.href = sc.view;
    var c = $("#content"); c.innerHTML = ""; c.scrollTop = 0; window.scrollTo(0, 0);
    if (route === "dashboard") viewDashboard(c);
    else if (route === "media") viewMedia(c);
    else if (route === "inquiries") viewInquiries(c);
    else renderSchema(c, SCHEMA[route]);
    closeSide();
  }

  /* =====================================================================
     SAVE
     ===================================================================== */
  var saving = false;
  function save() {
    if (saving) return;
    saving = true;
    var btn = $("#save-btn"); btn.disabled = true; btn.classList.add("loading");
    // Protect against overwriting a newer version saved from another device
    DB.db.getContent().then(function (row) {
      if (row && state.updatedAt && row.updated_at !== state.updatedAt) {
        return confirmBox("Content changed elsewhere", "The website was saved from another device or tab since you opened the Admin Panel. Saving now will replace those changes.", "Save anyway", true);
      }
      return true;
    }).then(function (ok) {
      if (!ok) throw { cancelled: true };
      return DB.db.saveContent(state.draft);
    }).then(function (row) {
      state.hasRow = true;
      state.updatedAt = row ? row.updated_at : new Date().toISOString();
      state.savedJson = JSON.stringify(state.draft);
      toast("Saved — your website is updated.");
      if (state.route === "dashboard") go("dashboard", true);
    }).catch(function (err) {
      if (err && err.cancelled) return;
      if (err.status === 401) { toast("Session expired — sign in again. Your edits are kept in this tab until you reload.", "error"); return; }
      toast("Couldn't save: " + (err.message || err), "error");
    }).then(function () { saving = false; btn.classList.remove("loading"); markDirty(); });
  }

  /* =====================================================================
     SCHEMA RENDERER
     ===================================================================== */
  var uid = 0;
  function renderSchema(c, sc) {
    c.innerHTML = sc.groups.map(function (g, gi) {
      return '<section class="card group" data-g="' + gi + '"><div class="group-head"><h2>' + esc(g.g) + "</h2>" + (g.d ? '<p class="muted">' + esc(g.d) + "</p>" : "") + "</div>" +
        '<div class="fields">' + g.f.map(function (f) { return fieldHtml(f, f.k); }).join("") + "</div></section>";
    }).join("");
    bindFields(c);
  }

  function val(path) { return getPath(state.draft, path); }

  function fieldHtml(f, path, ctx) {
    var id = "f" + (++uid), v = val(path), help = f.h ? '<small class="help">' + esc(f.h) + "</small>" : "";
    var lab = f.l ? '<label class="lab" for="' + id + '">' + esc(f.l) + "</label>" : "";
    var hide = "";
    if (f.showIf && ctx) { hide = getPath(state.draft, ctx + "." + f.showIf.k) === f.showIf.v ? "" : " hidden"; }
    var wrapAttr = ' data-path="' + esc(path) + '" data-type="' + f.t + '"' + (f.showIf ? ' data-showif="' + esc(f.showIf.k) + '" data-showv="' + esc(f.showIf.v) + '"' : "");
    switch (f.t) {
      case "text": case "link":
        var dl = "";
        var listId = f.t === "link" || f.list ? id + "-dl" : "";
        if (f.t === "link") dl = '<datalist id="' + listId + '">' + PAGES.map(function (p) { return '<option value="' + p + '">'; }).join("") + "</datalist>";
        if (f.list) dl = '<datalist id="' + listId + '">' + f.list.map(function (p) { return '<option value="' + esc(p) + '">'; }).join("") + "</datalist>";
        return '<div class="field"' + wrapAttr + hide + ">" + lab + '<input id="' + id + '" type="text" value="' + esc(v) + '"' + (listId ? ' list="' + listId + '"' : "") + (f.t === "link" ? ' placeholder="contact.html or https://…"' : "") + ">" + dl + help + "</div>";
      case "textarea":
        return '<div class="field"' + wrapAttr + hide + ">" + lab + '<textarea id="' + id + '" rows="' + (f.rows || 3) + '">' + esc(v) + "</textarea>" + help + "</div>";
      case "toggle":
        return '<div class="field toggle-field"' + wrapAttr + hide + '><label class="switch"><input id="' + id + '" type="checkbox"' + (v ? " checked" : "") + '><span class="track"></span><span class="switch-label">' + esc(f.l) + "</span></label>" + help + "</div>";
      case "select":
        return '<div class="field"' + wrapAttr + hide + ">" + lab + '<div class="sel"><select id="' + id + '">' + f.opts.map(function (o) { return '<option value="' + esc(o[0]) + '"' + (o[0] === v ? " selected" : "") + ">" + esc(o[1]) + "</option>"; }).join("") + "</select>" + icon("down") + "</div>" + help + "</div>";
      case "icon":
        return '<div class="field"' + wrapAttr + hide + ">" + lab + '<div class="icon-pick" role="radiogroup">' + ICON_CHOICES.map(function (n) {
          return '<button type="button" class="ip' + (n === v ? " on" : "") + '" data-icon="' + n + '" title="' + n + '" aria-label="' + n + '">' + icon(n) + "</button>";
        }).join("") + "</div></div>";
      case "image": case "media":
        return '<div class="field media-field"' + wrapAttr + hide + ">" + lab + mediaBox(f, v, id) + help + "</div>";
      case "list":
        return '<div class="field"' + wrapAttr + hide + ">" + lab + '<div class="list-items">' + (v || []).map(function (it, i) { return listRow(it, i); }).join("") + "</div>" +
          '<button type="button" class="a-btn ghost sm list-add">' + icon("plus") + "<span>" + esc(f.add || "Add") + "</span></button></div>";
      case "checks":
        var opts = getPath(state.draft, f.from) || [], cur = v || [];
        return '<div class="field"' + wrapAttr + hide + ">" + lab + '<div class="checks">' + (opts.length ? opts.map(function (o) {
          return '<label class="chk"><input type="checkbox" value="' + esc(o) + '"' + (cur.indexOf(o) > -1 ? " checked" : "") + "><span>" + esc(o) + "</span></label>";
        }).join("") : '<span class="muted small">Add categories first.</span>') + "</div></div>";
      case "repeat": return repeatHtml(f, path);
      case "categories": return categoriesHtml(f, path);
      case "socials": return socialsHtml(path);
      case "theme": return themeHtml(path);
    }
    return "";
  }

  function mediaBox(f, v, id) {
    var accept = f.t === "image" ? "image/*" : "image/*,video/mp4,video/webm,video/quicktime";
    var prev;
    if (!v) prev = '<div class="mb-empty">' + icon(f.t === "image" ? "photo" : "video") + "<span>No file</span></div>";
    else if (isYouTube(v)) prev = '<div class="mb-empty yt">' + icon("youtube") + "<span>YouTube link</span></div>";
    else if (isVideo(v)) prev = '<video src="' + esc(preview(v)) + '" muted playsinline preload="metadata"></video>';
    else prev = '<img src="' + esc(preview(v)) + '" alt="">';
    return '<div class="mediabox"><div class="mb-prev">' + prev + '</div><div class="mb-side">' +
      '<input id="' + id + '" type="text" class="mb-url" value="' + esc(v) + '" placeholder="' + (f.t === "image" ? "Upload or paste an image URL" : "Upload or paste a URL / YouTube link") + '">' +
      '<div class="mb-actions"><label class="a-btn primary sm">' + icon("upload") + '<span>Upload</span><input type="file" class="mb-file" accept="' + accept + '" hidden></label>' +
      '<button type="button" class="a-btn ghost sm mb-lib">' + icon("photo") + "<span>Library</span></button>" +
      (v ? '<button type="button" class="a-btn ghost sm mb-clear">' + icon("trash") + "<span>Remove</span></button>" : "") + "</div>" +
      '<div class="mb-progress" hidden><span></span></div></div></div>';
  }
  function listRow(it, i) {
    return '<div class="list-row" data-i="' + i + '"><input type="text" value="' + esc(it) + '"><button type="button" class="icon-btn sm lr-up" aria-label="Move up">' + icon("up") + '</button><button type="button" class="icon-btn sm lr-del" aria-label="Remove">' + icon("trash") + "</button></div>";
  }

  function repeatHtml(f, path) {
    var arr = val(path) || [];
    var items = arr.map(function (it, i) { return repeatItem(f, path, it, i, arr.length); }).join("");
    return '<div class="repeat" data-path="' + esc(path) + '" data-type="repeat">' +
      '<div class="repeat-head"><span class="lab">' + esc(f.l) + ' <em class="count">' + arr.length + "</em></span>" +
      '<button type="button" class="a-btn primary sm rep-add">' + icon("plus") + "<span>" + esc(f.add || "Add") + "</span></button></div>" +
      '<div class="repeat-items">' + (items || '<p class="empty muted">Nothing here yet.</p>') + "</div></div>";
  }
  function repeatItem(f, path, it, i, n) {
    var p = path + "." + i;
    var title = (f.title && it[f.title]) || "Untitled";
    var sub = f.sub && it[f.sub] ? '<small>' + esc(it[f.sub]) + "</small>" : "";
    var th = f.thumb ? (it[f.thumb] ? '<img class="ri-thumb" src="' + esc(preview(it[f.thumb])) + '" alt="">' : '<span class="ri-thumb ph">' + icon("photo") + "</span>") : "";
    var badges = "";
    if (f.badges === "portfolio") {
      if (it.featured) badges += '<span class="pill star">' + icon("starfill") + "Featured</span>";
      badges += '<span class="pill">' + esc(({ video: "Video", image: "Image", text: "Written" })[it.type] || "") + "</span>";
    }
    if (f.badges === "service" && it.hidden) badges += '<span class="pill off">' + icon("eyeoff") + "Hidden</span>";
    return '<div class="ri" data-i="' + i + '"><div class="ri-head" role="button" tabindex="0" aria-expanded="false">' + th +
      '<span class="ri-title"><b>' + esc(title) + "</b>" + sub + "</span>" + '<span class="ri-badges">' + badges + "</span>" +
      '<span class="ri-tools"><button type="button" class="icon-btn sm ri-up" aria-label="Move up"' + (i === 0 ? " disabled" : "") + ">" + icon("up") + "</button>" +
      '<button type="button" class="icon-btn sm ri-down" aria-label="Move down"' + (i === n - 1 ? " disabled" : "") + ">" + icon("down") + "</button>" +
      '<button type="button" class="icon-btn sm danger ri-del" aria-label="Delete">' + icon("trash") + "</button></span>" +
      '<span class="ri-chev">' + icon("down") + "</span></div>" +
      '<div class="ri-body" hidden>' + f.f.map(function (sf) { return fieldHtml(sf, p + "." + sf.k, p); }).join("") + "</div></div>";
  }

  function categoriesHtml(f, path) {
    var arr = val(path) || [];
    return '<div class="field cats" data-path="' + esc(path) + '" data-type="categories"><div class="list-items">' + arr.map(function (c, i) {
      var used = ((state.draft.portfolio && state.draft.portfolio.items) || []).filter(function (it) { return (it.categories || []).indexOf(c) > -1; }).length;
      return '<div class="list-row" data-i="' + i + '"><input type="text" value="' + esc(c) + '" data-old="' + esc(c) + '"><span class="muted small nowrap">' + used + " project" + (used === 1 ? "" : "s") + '</span><button type="button" class="icon-btn sm lr-up" aria-label="Move up">' + icon("up") + '</button><button type="button" class="icon-btn sm lr-del" aria-label="Remove">' + icon("trash") + "</button></div>";
    }).join("") + '</div><button type="button" class="a-btn ghost sm cat-add">' + icon("plus") + "<span>Add category</span></button></div>";
  }

  var MAIN_SOCIALS = [["mail", "Email", "Email address", "you@example.com"], ["x", "X", "Profile link", "https://x.com/yourhandle"], ["telegram", "Telegram", "Profile / channel link", "https://t.me/yourname"], ["instagram", "Instagram", "Profile link", "https://instagram.com/yourname"], ["youtube", "YouTube", "Channel link", "https://youtube.com/@yourchannel"]];
  var OTHER_PLATFORMS = [["linkedin", "LinkedIn"], ["tiktok", "TikTok"], ["discord", "Discord"], ["globe", "Website"], ["youtube", "YouTube (2nd)"], ["x", "X (2nd)"], ["mail", "Email (2nd)"]];
  function socialsHtml(path) {
    var arr = val(path) || [];
    var used = {};
    var main = MAIN_SOCIALS.map(function (m) {
      var idx = -1;
      arr.forEach(function (s, i) { if (idx < 0 && s.platform === m[0] && !used[i]) idx = i; });
      if (idx > -1) used[idx] = true;
      var s = idx > -1 ? arr[idx] : { url: "", display: "" };
      var url = m[0] === "mail" ? String(s.url || "").replace(/^mailto:/, "") : s.url;
      return '<div class="soc-row" data-platform="' + m[0] + '" data-i="' + idx + '"><span class="soc-ic">' + icon(m[0]) + '</span><div class="soc-fields">' +
        '<label class="lab">' + esc(m[1]) + ' — ' + esc(m[2]) + '</label><input type="' + (m[0] === "mail" ? "email" : "url") + '" class="soc-url" value="' + esc(url) + '" placeholder="' + m[3] + '">' +
        (m[0] === "mail" ? "" : '<label class="lab sm">Text shown on the website</label><input type="text" class="soc-display" value="' + esc(s.display) + '" placeholder="e.g. @yourhandle">') +
        "</div></div>";
    }).join("");
    var others = arr.map(function (s, i) { return used[i] ? "" : otherSocialRow(s, i); }).join("");
    return '<div class="socials-ed" data-path="' + esc(path) + '" data-type="socials"><div class="soc-main">' + main + '</div><p class="help">Leave a link empty to hide it (the Contact page shows “Link coming soon”).</p>' +
      '<div class="lab soc-other-lab">Other social links</div><div class="soc-others">' + (others || '<p class="muted small empty">No other links yet.</p>') + "</div>" +
      '<button type="button" class="a-btn ghost sm soc-add">' + icon("plus") + "<span>Add link</span></button></div>";
  }
  function otherSocialRow(s, i) {
    return '<div class="soc-other" data-i="' + i + '"><div class="sel"><select class="so-platform">' + OTHER_PLATFORMS.map(function (p) { return '<option value="' + p[0] + '"' + (p[0] === s.platform ? " selected" : "") + ">" + p[1] + "</option>"; }).join("") + "</select>" + icon("down") + "</div>" +
      '<input type="text" class="so-label" value="' + esc(s.label) + '" placeholder="Label"><input type="text" class="so-display" value="' + esc(s.display) + '" placeholder="Text shown"><input type="url" class="so-url" value="' + esc(s.url) + '" placeholder="https://…">' +
      '<button type="button" class="icon-btn sm danger so-del" aria-label="Remove">' + icon("trash") + "</button></div>";
  }

  var THEME_PRESETS = [
    ["Soft Blue (current design)", { navy: "#0E2A6E", royal: "#2D5BD3", peri: "#7A9BE8", sky: "#C9DAFB", cloud: "#F4F8FF" }],
    ["Original palette", { navy: "#0A1931", royal: "#1A3D63", peri: "#4A7FA7", sky: "#B3CFE5", cloud: "#F6FAFD" }]
  ];
  var THEME_KEYS = [["navy", "Headings & dark text"], ["royal", "Buttons & highlights"], ["peri", "Waves & accents"], ["sky", "Page background"], ["cloud", "Cards & panels"]];
  function themeHtml(path) {
    var t = val(path) || {};
    return '<div class="theme-ed" data-path="' + esc(path) + '" data-type="theme"><div class="presets">' + THEME_PRESETS.map(function (p, i) {
      return '<button type="button" class="preset" data-preset="' + i + '"><span class="sw">' + THEME_KEYS.map(function (k) { return '<i style="background:' + p[1][k[0]] + '"></i>'; }).join("") + "</span><span>" + esc(p[0]) + "</span></button>";
    }).join("") + "</div>" +
      '<div class="colors">' + THEME_KEYS.map(function (k) {
        return '<label class="color-row"><input type="color" data-key="' + k[0] + '" value="' + esc(t[k[0]] || "#000000") + '"><span><b>' + esc(k[1]) + '</b><code>' + esc(t[k[0]] || "") + "</code></span></label>";
      }).join("") + '</div><div class="theme-prev" style="' + themeVars(t) + '"><div class="tp-panel"><span class="tp-script">preview</span><b>Heading text</b><p>Body text on a card.</p><span class="tp-btn">Button</span></div></div></div>';
  }
  function themeVars(t) { return "--n:" + t.navy + ";--r:" + t.royal + ";--p:" + t.peri + ";--s:" + t.sky + ";--c:" + t.cloud; }

  /* ---------- events ---------- */
  function bindFields(c) {
    if (c._bound) return;                         // #content is reused for every section
    c._bound = true;
    c.addEventListener("input", function (e) {
      var w = e.target.closest("[data-path]"); if (!w) return;
      var type = w.getAttribute("data-type"), path = w.getAttribute("data-path");
      if (type === "text" || type === "link" || type === "textarea") { setPath(state.draft, path, e.target.value); updateRepeatHead(w); }
      else if (type === "image" || type === "media") { if (e.target.classList.contains("mb-url")) { setPath(state.draft, path, e.target.value.trim()); refreshMedia(w); } }
      else if (type === "list") { syncList(w, path); }
      else if (type === "socials") { syncSocials(w, path); }
      else if (type === "theme" && e.target.type === "color") { setPath(state.draft, path + "." + e.target.getAttribute("data-key"), e.target.value); refreshTheme(w); }
      markDirty();
    });
    c.addEventListener("change", function (e) {
      var w = e.target.closest("[data-path]"); if (!w) return;
      var type = w.getAttribute("data-type"), path = w.getAttribute("data-path");
      if (type === "toggle") { setPath(state.draft, path, e.target.checked); updateRepeatHead(w); }
      else if (type === "select") {
        setPath(state.draft, path, e.target.value); updateRepeatHead(w);
        var body = w.closest(".ri-body");                          // show/hide dependent fields
        if (body) $$("[data-showif]", body).forEach(function (d) {
          var base = path.slice(0, path.lastIndexOf("."));
          d.hidden = getPath(state.draft, base + "." + d.getAttribute("data-showif")) !== d.getAttribute("data-showv");
        });
      }
      else if (type === "checks") { setPath(state.draft, path, $$("input:checked", w).map(function (i) { return i.value; })); }
      else if (type === "socials") { syncSocials(w, path); }
      else if (type === "categories" && e.target.matches("input[type=text]")) { renameCategory(w, path, e.target); }
      else if ((type === "image" || type === "media") && e.target.classList.contains("mb-file") && e.target.files[0]) { uploadInto(w, path, e.target.files[0]); e.target.value = ""; }
      markDirty();
    });
    c.addEventListener("click", function (e) {
      var t = e.target, w;
      // repeater
      if ((w = t.closest(".rep-add"))) { var rp = w.closest(".repeat"); repAdd(rp); return; }
      if (t.closest(".ri-tools button")) {
        var ri = t.closest(".ri"), rep = ri.closest(".repeat"), i = +ri.getAttribute("data-i"), path = rep.getAttribute("data-path"), arr = val(path);
        if (t.closest(".ri-del")) {
          var name = $(".ri-title b", ri).textContent;
          confirmBox("Delete “" + name + "”?", "This removes it from the website after you save.", "Delete", true).then(function (ok) {
            if (!ok) return; arr.splice(i, 1); rerenderRepeat(rep); markDirty(); toast("Deleted — click Save & publish to update the website.");
          });
        } else if (t.closest(".ri-up") && i > 0) { arr.splice(i - 1, 0, arr.splice(i, 1)[0]); rerenderRepeat(rep, i - 1); markDirty(); }
        else if (t.closest(".ri-down") && i < arr.length - 1) { arr.splice(i + 1, 0, arr.splice(i, 1)[0]); rerenderRepeat(rep, i + 1); markDirty(); }
        return;
      }
      if ((w = t.closest(".ri-head"))) { toggleItem(w.closest(".ri")); return; }
      // icon picker
      if ((w = t.closest(".ip"))) {
        var f = w.closest("[data-path]"); $$(".ip", f).forEach(function (b) { b.classList.remove("on"); }); w.classList.add("on");
        setPath(state.draft, f.getAttribute("data-path"), w.getAttribute("data-icon")); markDirty(); return;
      }
      // list
      if ((w = t.closest(".list-add"))) { var lf = w.closest("[data-path]"), la = val(lf.getAttribute("data-path")) || []; la.push(""); setPath(state.draft, lf.getAttribute("data-path"), la); $(".list-items", lf).insertAdjacentHTML("beforeend", listRow("", la.length - 1)); $(".list-items .list-row:last-child input", lf).focus(); markDirty(); return; }
      if ((w = t.closest(".lr-del, .lr-up"))) {
        var lw = w.closest("[data-path]"), lp = lw.getAttribute("data-path"), ltype = lw.getAttribute("data-type"), li = +w.closest(".list-row").getAttribute("data-i"), larr = val(lp);
        if (ltype === "categories") return catAction(lw, lp, li, w.classList.contains("lr-del") ? "del" : "up");
        if (w.classList.contains("lr-del")) larr.splice(li, 1); else if (li > 0) larr.splice(li - 1, 0, larr.splice(li, 1)[0]);
        rerenderField(lw); markDirty(); return;
      }
      if ((w = t.closest(".cat-add"))) { var cw = w.closest("[data-path]"), ca = val(cw.getAttribute("data-path")); ca.push("New category"); rerenderField(cw); refreshChecks(); markDirty(); return; }
      // media
      if ((w = t.closest(".mb-clear"))) { var mf = w.closest("[data-path]"); setPath(state.draft, mf.getAttribute("data-path"), ""); refreshMedia(mf, true); markDirty(); return; }
      if ((w = t.closest(".mb-lib"))) { var mf2 = w.closest("[data-path]"); pickFromLibrary(mf2.getAttribute("data-type")).then(function (url) { if (!url) return; setPath(state.draft, mf2.getAttribute("data-path"), url); refreshMedia(mf2, true); markDirty(); }); return; }
      // socials
      if ((w = t.closest(".soc-add"))) { var sw = w.closest("[data-path]"), sa = val(sw.getAttribute("data-path")) || []; sa.push({ platform: "linkedin", label: "LinkedIn", display: "", url: "" }); setPath(state.draft, sw.getAttribute("data-path"), sa); rerenderField(sw); markDirty(); return; }
      if ((w = t.closest(".so-del"))) { var sw2 = w.closest("[data-path]"), sa2 = val(sw2.getAttribute("data-path")); sa2.splice(+w.closest(".soc-other").getAttribute("data-i"), 1); rerenderField(sw2); markDirty(); return; }
      // theme
      if ((w = t.closest(".preset"))) { var tw = w.closest("[data-path]"); setPath(state.draft, tw.getAttribute("data-path"), clone(THEME_PRESETS[+w.getAttribute("data-preset")][1])); rerenderField(tw); markDirty(); toast("Palette applied — Save & publish to use it on the website."); return; }
    });
    c.addEventListener("keydown", function (e) {
      if ((e.key === "Enter" || e.key === " ") && e.target.classList.contains("ri-head")) { e.preventDefault(); toggleItem(e.target.closest(".ri")); }
    });
  }

  function toggleItem(ri, open) {
    var body = $(".ri-body", ri), head = $(".ri-head", ri);
    var show = open === undefined ? body.hidden : open;
    body.hidden = !show; ri.classList.toggle("open", show); head.setAttribute("aria-expanded", show);
  }
  function findSchemaField(rep) {
    var path = rep.getAttribute("data-path"), sc = SCHEMA[state.route], found = null;
    sc.groups.forEach(function (g) { g.f.forEach(function (f) { if (f.k === path) found = f; }); });
    return found;
  }
  function rerenderRepeat(rep, openIndex) {
    var f = findSchemaField(rep);
    var tmp = document.createElement("div"); tmp.innerHTML = repeatHtml(f, f.k);
    var fresh = tmp.firstChild; rep.replaceWith(fresh);
    if (openIndex !== undefined) { var ri = $('.ri[data-i="' + openIndex + '"]', fresh); if (ri) { toggleItem(ri, true); ri.scrollIntoView({ block: "nearest", behavior: "smooth" }); } }
    return fresh;
  }
  function repAdd(rep) {
    var f = findSchemaField(rep), arr = val(f.k);
    if (!Array.isArray(arr)) { arr = []; setPath(state.draft, f.k, arr); }
    var item = clone(f.tpl);
    var at = f.addAtStart ? 0 : arr.length;
    arr.splice(at, 0, item);
    var fresh = rerenderRepeat(rep, at); markDirty();
    var first = $('.ri[data-i="' + at + '"] .ri-body input, .ri[data-i="' + at + '"] .ri-body textarea', fresh);
    if (first) { first.focus(); if (first.select) first.select(); }
  }
  function rerenderField(w) {
    var path = w.getAttribute("data-path"), type = w.getAttribute("data-type"), html;
    if (type === "list") html = fieldHtml({ k: path, t: "list", l: ($(".lab", w) || {}).textContent, add: ($(".list-add span", w) || {}).textContent, h: ($(".help", w) || {}).textContent }, path);
    else if (type === "categories") html = categoriesHtml({}, path);
    else if (type === "socials") html = socialsHtml(path);
    else if (type === "theme") html = themeHtml(path);
    var tmp = document.createElement("div"); tmp.innerHTML = html; var fresh = tmp.firstChild;
    if (type === "list") { var oldLab = w.querySelector("label.lab"); if (oldLab) fresh.querySelector("label.lab").setAttribute("for", oldLab.getAttribute("for")); }
    w.replaceWith(fresh); return fresh;
  }
  function updateRepeatHead(w) {
    var ri = w.closest(".ri"); if (!ri) return;
    var rep = ri.closest(".repeat"), f = findSchemaField(rep); if (!f) return;
    var it = val(rep.getAttribute("data-path"))[+ri.getAttribute("data-i")];
    $(".ri-title", ri).innerHTML = "<b>" + esc((f.title && it[f.title]) || "Untitled") + "</b>" + (f.sub && it[f.sub] ? "<small>" + esc(it[f.sub]) + "</small>" : "");
    var tmp = document.createElement("div"); tmp.innerHTML = repeatItem(f, rep.getAttribute("data-path"), it, 0, 1);
    $(".ri-badges", ri).innerHTML = $(".ri-badges", tmp).innerHTML;
    if (f.thumb) { var old = $(".ri-thumb", ri), nu = $(".ri-thumb", tmp); if (old && nu) old.replaceWith(nu); }
  }
  function syncList(w, path) { setPath(state.draft, path, $$(".list-row input", w).map(function (i) { return i.value; })); }

  /* categories: rename / delete propagate to projects */
  function renameCategory(w, path, input) {
    var oldName = input.getAttribute("data-old"), newName = input.value.trim(), i = +input.closest(".list-row").getAttribute("data-i"), arr = val(path);
    if (!newName) { input.value = oldName; toast("Category name can't be empty.", "error"); return; }
    if (arr.some(function (c, j) { return c === newName && j !== i; })) { input.value = oldName; toast("That category already exists.", "error"); return; }
    arr[i] = newName;
    (state.draft.portfolio.items || []).forEach(function (it) { it.categories = (it.categories || []).map(function (c) { return c === oldName ? newName : c; }); });
    input.setAttribute("data-old", newName);
    refreshChecks();
  }
  function catAction(w, path, i, action) {
    var arr = val(path), name = arr[i];
    if (action === "up") { if (i > 0) { arr.splice(i - 1, 0, arr.splice(i, 1)[0]); rerenderField(w); markDirty(); } return; }
    confirmBox("Delete category “" + name + "”?", "Projects keep their other categories; this one is removed from them.", "Delete", true).then(function (ok) {
      if (!ok) return;
      arr.splice(i, 1);
      (state.draft.portfolio.items || []).forEach(function (it) { it.categories = (it.categories || []).filter(function (c) { return c !== name; }); });
      rerenderField(w); refreshChecks(); markDirty();
    });
  }
  function refreshChecks() {
    $$('[data-type="checks"]').forEach(function (w) {
      var path = w.getAttribute("data-path"), html = fieldHtml({ k: "categories", t: "checks", l: "Categories", from: "portfolio.categories" }, path);
      var tmp = document.createElement("div"); tmp.innerHTML = html; w.replaceWith(tmp.firstChild);
    });
  }

  /* socials editor → state */
  function syncSocials(w, path) {
    var arr = val(path) || [];
    $$(".soc-row", w).forEach(function (row) {
      var pf = row.getAttribute("data-platform"), i = +row.getAttribute("data-i");
      var url = $(".soc-url", row).value.trim(), disp = $(".soc-display", row) ? $(".soc-display", row).value : null;
      var label = MAIN_SOCIALS.filter(function (m) { return m[0] === pf; })[0][1];
      if (i < 0) { arr.push({ platform: pf, label: label, display: "", url: "" }); i = arr.length - 1; row.setAttribute("data-i", i); }
      var s = arr[i];
      if (pf === "mail") { s.url = url ? "mailto:" + url : ""; s.display = url; }
      else { s.url = url; s.display = disp; }
      if (!s.label) s.label = label;
    });
    $$(".soc-other", w).forEach(function (row) {
      var s = arr[+row.getAttribute("data-i")]; if (!s) return;
      s.platform = $(".so-platform", row).value; s.label = $(".so-label", row).value; s.display = $(".so-display", row).value; s.url = $(".so-url", row).value.trim();
    });
    setPath(state.draft, path, arr);
  }

  function refreshTheme(w) {
    var t = val(w.getAttribute("data-path"));
    $(".theme-prev", w).setAttribute("style", themeVars(t));
    $$(".color-row", w).forEach(function (r) { $("code", r).textContent = $("input", r).value; });
  }

  /* media fields */
  function refreshMedia(w, rebuild) {
    var path = w.getAttribute("data-path"), type = w.getAttribute("data-type"), v = val(path);
    if (rebuild) {
      var lab = $(".lab", w), help = $(".help", w), id = $(".mb-url", w).id;
      var tmp = document.createElement("div"); tmp.innerHTML = mediaBox({ t: type }, v, id);
      $(".mediabox", w).replaceWith(tmp.firstChild);
    } else {
      var tmp2 = document.createElement("div"); tmp2.innerHTML = mediaBox({ t: type }, v, "x");
      $(".mb-prev", w).replaceWith($(".mb-prev", tmp2));
      var hasClear = !!$(".mb-clear", w);
      if (!!v !== hasClear) refreshMedia(w, true);
    }
    updateRepeatHead(w);
  }
  var LIMITS = { image: 10 * 1048576, video: 50 * 1048576 };
  function checkFile(file, kind) {
    var isImg = /^image\//.test(file.type), isVid = /^video\/(mp4|webm|quicktime)$/.test(file.type);
    if (kind === "image" && !isImg) return "Please choose an image file (JPG, PNG, WebP, GIF, SVG).";
    if (!isImg && !isVid) return "Unsupported file type. Use an image or an MP4 / WebM / MOV video.";
    if (isImg && file.size > LIMITS.image) return "Images must be under 10 MB.";
    if (isVid && file.size > LIMITS.video) return "Videos must be under 50 MB (Supabase free plan limit). For longer videos, upload to YouTube and paste the link.";
    return null;
  }
  function uploadInto(w, path, file) {
    var err = checkFile(file, w.getAttribute("data-type"));
    if (err) { toast(err, "error"); return; }
    var bar = $(".mb-progress", w), fill = $(".mb-progress span", w);
    bar.hidden = false; fill.style.width = "4%";
    DB.storage.upload(file, function (p) { fill.style.width = Math.max(4, Math.round(p * 100)) + "%"; }).then(function (r) {
      setPath(state.draft, path, r.url); state.media = null;
      refreshMedia(w, true); markDirty();
      toast("Uploaded — click Save & publish to show it on the website.");
    }).catch(function (e) { bar.hidden = true; toast(e.message, "error"); });
  }

  function pickFromLibrary(kind) {
    return new Promise(function (resolve) {
      var m = modal('<div class="picker-head"><h3>Media Library</h3><button class="icon-btn" data-x aria-label="Close">' + icon("close") + '</button></div><div class="picker-grid"><div class="boot-spinner"></div></div>', "wide");
      m._onCancel = function () { resolve(null); };
      loadMedia().then(function (files) {
        var list = files.filter(function (f) { return kind === "image" ? /^image\//.test(f.type) : true; });
        $(".picker-grid", m).innerHTML = list.length ? list.map(function (f) {
          return '<button type="button" class="pick" data-url="' + esc(f.url) + '">' + (/^video\//.test(f.type) ? '<video src="' + esc(f.url) + '" muted preload="metadata"></video>' : '<img src="' + esc(f.url) + '" alt="" loading="lazy">') + "<span>" + esc(f.name.replace(/^[a-z0-9]+-[a-z0-9]{4}-/, "")) + "</span></button>";
        }).join("") : '<p class="muted">No ' + (kind === "image" ? "images" : "files") + " uploaded yet. Use Upload on the field or the Media Library page.</p>";
        $$(".pick", m).forEach(function (b) { b.addEventListener("click", function () { m._onCancel = null; m._close(); resolve(b.getAttribute("data-url")); }); });
      }).catch(function (e) { $(".picker-grid", m).innerHTML = '<p class="muted">' + esc(e.message) + "</p>"; });
    });
  }
  function loadMedia(force) {
    if (state.media && !force) return Promise.resolve(state.media);
    return DB.storage.list().then(function (f) { state.media = f; return f; });
  }

  /* =====================================================================
     DASHBOARD
     ===================================================================== */
  function viewDashboard(c) {
    var d = state.draft;
    var projects = (d.portfolio && d.portfolio.items) || [];
    var services = ((d.servicesPage && d.servicesPage.items) || []);
    var stats = ((d.about && d.about.stats && d.about.stats.items) || []).filter(function (s) { return String(s.value || "").trim(); }).length;
    var unread = state.inquiries ? state.inquiries.filter(function (q) { return !q.is_read; }).length : "–";
    var tiles = [
      ["portfolio", "folder", projects.length, "Portfolio projects", projects.filter(function (p) { return p.featured; }).length + " featured"],
      ["services", "target", services.filter(function (s) { return !s.hidden; }).length, "Visible services", services.filter(function (s) { return s.hidden; }).length + " hidden"],
      ["people", "people", ((d.testimonials && d.testimonials.items) || []).length, "Testimonials", ((d.brands && d.brands.items) || []).length + " brands"],
      ["inquiries", "inbox", unread, "Unread inquiries", state.inquiries ? state.inquiries.length + " total" : "Loading…"],
      ["about", "chart", stats, "Creator stats filled", "Shown on About page"]
    ];
    c.innerHTML =
      (!state.hasRow ? '<div class="notice">' + icon("spark") + '<div><b>Publish your first version.</b><p>Your website is still showing the built-in content. Click <b>Save & publish</b> once to store it in Supabase — after that every edit goes live when you save.</p></div></div>' : "") +
      '<section class="hello card"><div><span class="script">welcome back</span><h2>' + esc((d.brand && d.brand.name) || "Admin") + "</h2><p class=\"muted\">" +
        (state.updatedAt ? "Last published " + esc(fmtDate(state.updatedAt)) : "Not published yet") + '</p></div><a class="a-btn primary" href="../index.html" target="_blank" rel="noopener">' + icon("open") + "<span>View website</span></a></section>" +
      '<div class="tiles">' + tiles.map(function (t) {
        return '<a class="tile card" href="#' + t[0] + '"><span class="tile-ic">' + icon(t[1]) + '</span><b class="tile-n">' + esc(t[2]) + "</b><span>" + esc(t[3]) + "</span><small>" + esc(t[4]) + "</small></a>";
      }).join("") + "</div>" +
      '<section class="card"><div class="group-head"><h2>Manage your website</h2></div><div class="quick">' + NAV.slice(1).map(function (n) {
        return '<a class="quick-link" href="#' + n[0] + '">' + icon(n[2]) + "<span>" + n[1] + "</span>" + icon("right") + "</a>";
      }).join("") + "</div></section>";
  }

  /* =====================================================================
     MEDIA LIBRARY
     ===================================================================== */
  function viewMedia(c) {
    c.innerHTML = '<section class="card"><div class="drop" id="drop"><span class="drop-ic">' + icon("upload") + "</span><b>Drop files here or</b>" +
      '<label class="a-btn primary sm">' + icon("upload") + '<span>Choose files</span><input type="file" id="media-files" multiple accept="image/*,video/mp4,video/webm,video/quicktime" hidden></label>' +
      '<small class="muted">Images up to 10 MB · Videos (MP4, WebM, MOV) up to 50 MB</small><div class="upl-list" id="upl-list"></div></div></section>' +
      '<section class="card"><div class="group-head row"><h2>Your files</h2><div class="filters"><button class="chipf on" data-f="all">All</button><button class="chipf" data-f="image">Images</button><button class="chipf" data-f="video">Videos</button><button class="icon-btn sm" id="media-refresh" aria-label="Refresh">' + icon("refresh") + '</button></div></div><div class="media-grid" id="media-grid"><div class="boot-spinner"></div></div></section>';
    var filter = "all";
    function draw(files) {
      var g = $("#media-grid"); if (!g) return;
      var list = files.filter(function (f) { return filter === "all" || f.type.indexOf(filter + "/") === 0; });
      var used = JSON.stringify(state.draft);
      g.innerHTML = list.length ? list.map(function (f) {
        var isV = /^video\//.test(f.type);
        return '<div class="mfile"><div class="mf-prev">' + (isV ? '<video src="' + esc(f.url) + '" muted preload="metadata" controls></video>' : '<img src="' + esc(f.url) + '" alt="" loading="lazy">') + "</div>" +
          '<div class="mf-info"><b title="' + esc(f.name) + '">' + esc(f.name.replace(/^[a-z0-9]+-[a-z0-9]{4}-/, "")) + "</b><small>" + esc(fmtSize(f.size)) + (used.indexOf(f.url) > -1 ? ' · <span class="inuse">In use</span>' : "") + "</small></div>" +
          '<div class="mf-actions"><button class="icon-btn sm mf-copy" data-url="' + esc(f.url) + '" aria-label="Copy link">' + icon("copy") + '</button><a class="icon-btn sm" href="' + esc(f.url) + '" target="_blank" rel="noopener" aria-label="Open">' + icon("open") + '</a><button class="icon-btn sm danger mf-del" data-name="' + esc(f.name) + '" data-url="' + esc(f.url) + '" aria-label="Delete">' + icon("trash") + "</button></div></div>";
      }).join("") : '<p class="muted empty">No files yet.</p>';
    }
    function refresh(force) { loadMedia(force).then(draw).catch(function (e) { $("#media-grid").innerHTML = '<p class="muted">Couldn\'t load files: ' + esc(e.message) + "</p>"; }); }
    refresh(true);
    $("#media-refresh").addEventListener("click", function () { refresh(true); });
    $$(".chipf", c).forEach(function (b) { b.addEventListener("click", function () { $$(".chipf", c).forEach(function (x) { x.classList.remove("on"); }); b.classList.add("on"); filter = b.getAttribute("data-f"); draw(state.media || []); }); });
    function uploadMany(files) {
      Array.prototype.slice.call(files).forEach(function (file) {
        var row = document.createElement("div"); row.className = "upl";
        row.innerHTML = "<span>" + esc(file.name) + '</span><div class="mb-progress"><span style="width:4%"></span></div>';
        $("#upl-list").appendChild(row);
        var err = checkFile(file, "media");
        if (err) { row.classList.add("bad"); row.querySelector(".mb-progress").outerHTML = "<small>" + esc(err) + "</small>"; return; }
        DB.storage.upload(file, function (p) { var s = row.querySelector(".mb-progress span"); if (s) s.style.width = Math.round(p * 100) + "%"; })
          .then(function () { row.classList.add("done"); row.querySelector(".mb-progress").outerHTML = "<small>Uploaded</small>"; setTimeout(function () { row.remove(); }, 2500); refresh(true); })
          .catch(function (e) { row.classList.add("bad"); var pb = row.querySelector(".mb-progress"); if (pb) pb.outerHTML = "<small>" + esc(e.message) + "</small>"; });
      });
    }
    $("#media-files").addEventListener("change", function () { uploadMany(this.files); this.value = ""; });
    var drop = $("#drop");
    ["dragenter", "dragover"].forEach(function (ev) { drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.add("over"); }); });
    ["dragleave", "drop"].forEach(function (ev) { drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.remove("over"); }); });
    drop.addEventListener("drop", function (e) { if (e.dataTransfer && e.dataTransfer.files.length) uploadMany(e.dataTransfer.files); });
    $("#media-grid").addEventListener("click", function (e) {
      var b;
      if ((b = e.target.closest(".mf-copy"))) {
        var url = b.getAttribute("data-url");
        (navigator.clipboard ? navigator.clipboard.writeText(url) : Promise.reject()).then(function () { toast("Link copied."); }, function () { window.prompt("Copy this link:", url); });
      }
      if ((b = e.target.closest(".mf-del"))) {
        var inUse = JSON.stringify(state.draft).indexOf(b.getAttribute("data-url")) > -1;
        confirmBox("Delete this file?", inUse ? "This file is used on your website. Deleting it will leave an empty image there." : "This permanently deletes the file from storage.", "Delete", true).then(function (ok) {
          if (!ok) return;
          DB.storage.remove(b.getAttribute("data-name")).then(function () { toast("File deleted."); refresh(true); }).catch(function (er) { toast(er.message, "error"); });
        });
      }
    });
  }

  /* =====================================================================
     INQUIRIES
     ===================================================================== */
  function loadInquiries(silent) {
    return DB.db.listInquiries().then(function (rows) {
      state.inquiries = rows || [];
      var n = state.inquiries.filter(function (q) { return !q.is_read; }).length, b = $("#inq-badge");
      if (b) { b.hidden = !n; b.textContent = n; }
      if (state.route === "dashboard" && silent) go("dashboard", true);
      return state.inquiries;
    }).catch(function (e) { if (!silent) throw e; });
  }
  function viewInquiries(c) {
    var filter = "all";
    c.innerHTML = '<section class="card"><div class="group-head row"><h2>Contact form inquiries</h2><div class="filters"><button class="chipf on" data-f="all">All</button><button class="chipf" data-f="unread">Unread</button><button class="icon-btn sm" id="inq-refresh" aria-label="Refresh">' + icon("refresh") + '</button></div></div><div id="inq-list"><div class="boot-spinner"></div></div></section>';
    function draw() {
      var l = $("#inq-list"); if (!l) return;
      var rows = (state.inquiries || []).filter(function (q) { return filter === "all" || !q.is_read; });
      l.innerHTML = rows.length ? rows.map(function (q) {
        var subject = "Re: " + (q.service ? q.service + " inquiry" : "Your inquiry");
        return '<article class="inq' + (q.is_read ? "" : " unread") + '" data-id="' + esc(q.id) + '"><div class="inq-head" role="button" tabindex="0">' +
          '<span class="dot"></span><span class="inq-who"><b>' + esc(q.name) + "</b><small>" + esc(q.email) + (q.company ? " · " + esc(q.company) : "") + "</small></span>" +
          (q.service ? '<span class="pill">' + esc(q.service) + "</span>" : "") + '<time>' + esc(fmtDate(q.created_at)) + "</time></div>" +
          '<div class="inq-body"' + (q._open ? "" : " hidden") + '><p class="inq-msg">' + esc(q.message).replace(/\n/g, "<br>") + "</p>" +
          '<div class="inq-actions"><a class="a-btn primary sm" href="mailto:' + esc(q.email) + "?subject=" + encodeURIComponent(subject) + '">' + icon("reply") + "<span>Reply by email</span></a>" +
          '<button class="a-btn ghost sm inq-read">' + (q.is_read ? "Mark as unread" : "Mark as read") + '</button><button class="a-btn ghost sm danger inq-del">' + icon("trash") + "<span>Delete</span></button></div></div></article>";
      }).join("") : '<p class="muted empty">' + (filter === "unread" ? "No unread inquiries." : "No inquiries yet. Messages sent through your Contact page will appear here.") + "</p>";
    }
    function refresh() { $("#inq-list").innerHTML = '<div class="boot-spinner"></div>'; loadInquiries().then(draw).catch(function (e) { $("#inq-list").innerHTML = '<p class="muted">Couldn\'t load inquiries: ' + esc(e.message) + "</p>"; }); }
    if (state.inquiries) draw(); else refresh();
    $("#inq-refresh").addEventListener("click", refresh);
    $$(".chipf", c).forEach(function (b) { b.addEventListener("click", function () { $$(".chipf", c).forEach(function (x) { x.classList.remove("on"); }); b.classList.add("on"); filter = b.getAttribute("data-f"); draw(); }); });
    function find(el) { var id = el.closest(".inq").getAttribute("data-id"); return state.inquiries.filter(function (q) { return String(q.id) === id; })[0]; }
    function setRead(q, read) {
      return DB.db.markInquiry(q.id, read).then(function () { q.is_read = read; var n = state.inquiries.filter(function (x) { return !x.is_read; }).length, b = $("#inq-badge"); if (b) { b.hidden = !n; b.textContent = n; } });
    }
    $("#inq-list").addEventListener("click", function (e) {
      var t = e.target, q;
      if (t.closest(".inq-head")) {
        q = find(t); q._open = !q._open;
        if (q._open && !q.is_read) setRead(q, true).then(draw).catch(function (er) { toast(er.message, "error"); }); else draw();
      } else if (t.closest(".inq-read")) {
        q = find(t); setRead(q, !q.is_read).then(draw).catch(function (er) { toast(er.message, "error"); });
      } else if (t.closest(".inq-del")) {
        q = find(t);
        confirmBox("Delete inquiry from " + q.name + "?", "This can't be undone.", "Delete", true).then(function (ok) {
          if (!ok) return;
          DB.db.deleteInquiry(q.id).then(function () { state.inquiries = state.inquiries.filter(function (x) { return x !== q; }); draw(); toast("Inquiry deleted."); var n = state.inquiries.filter(function (x) { return !x.is_read; }).length, b = $("#inq-badge"); if (b) { b.hidden = !n; b.textContent = n; } })
            .catch(function (er) { toast(er.message, "error"); });
        });
      }
    });
    $("#inq-list").addEventListener("keydown", function (e) { if ((e.key === "Enter" || e.key === " ") && e.target.classList.contains("inq-head")) { e.preventDefault(); e.target.click(); } });
  }

  /* ---------- settings extras: account + reset ---------- */
  var baseRenderSchema = renderSchema;
  renderSchema = function (c, sc) {
    baseRenderSchema(c, sc);
    if (sc !== SCHEMA.settings) return;
    c.insertAdjacentHTML("beforeend",
      '<section class="card group"><div class="group-head"><h2>Account</h2><p class="muted">Signed in as ' + esc(state.user && state.user.email) + "</p></div>" +
      '<form class="fields" id="pw-change" novalidate><div class="field"><label class="lab" for="np1">New password</label><input id="np1" type="password" autocomplete="new-password" minlength="10"></div>' +
      '<div class="field"><label class="lab" for="np2">Repeat new password</label><input id="np2" type="password" autocomplete="new-password"></div>' +
      '<div><button class="a-btn primary sm" type="submit">' + icon("lock") + "<span>Change password</span></button></div></form></section>" +
      '<section class="card group danger-zone"><div class="group-head"><h2>Reset content</h2><p class="muted">Load the original built-in content into the editor. Nothing changes on the website until you Save & publish.</p></div><div><button class="a-btn ghost sm danger" id="reset-content">' + icon("refresh") + "<span>Load original content</span></button></div></section>");
    $("#pw-change").addEventListener("submit", function (e) {
      e.preventDefault();
      var a = $("#np1").value, b = $("#np2").value;
      if (a.length < 10) return toast("Password must be at least 10 characters.", "error");
      if (a !== b) return toast("Passwords don't match.", "error");
      DB.auth.updatePassword(a).then(function () { $("#np1").value = $("#np2").value = ""; toast("Password changed."); }).catch(function (er) { toast(er.message, "error"); });
    });
    $("#reset-content").addEventListener("click", function () {
      confirmBox("Load original content?", "All text, images and lists in the editor will be replaced with the built-in version. You can still Discard before saving.", "Load original", true).then(function (ok) {
        if (!ok) return; state.draft = clone(DEFAULTS); markDirty(); toast("Original content loaded — Save & publish to apply it.");
      });
    });
  };

  /* =====================================================================
     START
     ===================================================================== */
  if (!DB || !DB.configured()) { screenSetup(); return; }
  var fromUrl = DB.auth.fromUrl();
  if (fromUrl && fromUrl.error) { screenLogin(fromUrl.error); return; }
  if (fromUrl && fromUrl.type === "recovery") { screenNewPassword(); return; }
  if (DB.auth.session()) afterLogin(); else screenLogin();
})();
