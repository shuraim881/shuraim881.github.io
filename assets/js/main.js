/* SHUXBROH — renders content.js into the page + all interactions */
(function () {
  "use strict";
  var DEFAULTS = window.SITE_CONTENT || {};
  var C = DEFAULTS;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function esc(v) {
    return String(v == null ? "" : v)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function initials(name) {
    return esc((name || "?").trim().split(/\s+/).map(function (w) { return w[0]; }).join("").slice(0, 2).toUpperCase());
  }

  /* ---------- Icons (inline SVG, stroke = currentColor) ---------- */
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
  var SPARK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 1.5c.7 5.6 3.4 8.9 9.5 10.5-6.1 1.6-8.8 4.9-9.5 10.5-.7-5.6-3.4-8.9-9.5-10.5C8.6 10.4 11.3 7.1 12 1.5Z"/></svg>';
  function sparks(list) {
    return list.map(function (c) { return '<span class="spark ' + c + '">' + SPARK + "</span>"; }).join("");
  }
  var SWOOSH = '<svg class="swoosh" viewBox="0 0 200 20" aria-hidden="true" preserveAspectRatio="none"><path d="M4 14C50 4 120 2 196 8" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"/></svg>';
  // X logo drawn as filled path for brand accuracy
  var X_LOGO = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M17.8 3h3.1l-6.8 7.7L22 21h-6.2l-4.9-6.4L5.3 21H2.2l7.3-8.3L2 3h6.4l4.4 5.8L17.8 3Zm-1.1 16.2h1.7L7.4 4.7H5.6l11.1 14.5Z"/></svg>';
  function icon(name) {
    if (name === "x") return X_LOGO;
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICONS[name] || ICONS.star) + "</svg>";
  }
  function catIcon(cat) {
    var c = (cat || "").toLowerCase();
    if (c.indexOf("video") > -1) return "video";
    if (c.indexOf("review") > -1) return "star";
    if (c.indexOf("thread") > -1) return "thread";
    if (c.indexOf("explain") > -1) return "search";
    if (c.indexOf("post") > -1) return "pen";
    if (c.indexOf("campaign") > -1) return "target";
    return "image";
  }

  /* ---------- Shared: header + footer (used on every page) ---------- */
  function logoMark() {
    var b = C.brand || {};
    if (b.logoImage) return '<span class="logo-mark has-img"><img src="' + esc(b.logoImage) + '" alt=""></span>';
    return '<span class="logo-mark">' + esc(b.logoMark || "S") + "</span>";
  }
  function currentPage() {
    var p = location.pathname.split("/").pop();
    return p === "" ? "index.html" : p;
  }
  function renderHeader() {
    var el = $("#site-header"); if (!el) return;
    var here = currentPage();
    var links = (C.nav || []).map(function (n) {
      var active = n.href === here ? ' aria-current="page" class="active"' : "";
      return '<li><a href="' + esc(n.href) + '"' + active + ">" + esc(n.label) + "</a></li>";
    }).join("");
    el.innerHTML =
      '<div class="container nav-wrap">' +
        '<a class="logo" href="index.html" aria-label="' + esc(C.brand.logoText) + ' home">' +
          logoMark() + '<span class="logo-text">' + esc(C.brand.logoText) + "</span></a>" +
        '<nav class="nav" id="primary-nav" aria-label="Main"><ul>' + links + "</ul>" +
          (C.navCta && C.navCta.label ? '<a class="btn btn-primary btn-sm nav-cta" href="' + esc(C.navCta.href || "contact.html") + '">' + esc(C.navCta.label) + "</a>" : "") + "</nav>" +
        '<button class="nav-toggle" aria-label="Open menu" aria-expanded="false" aria-controls="primary-nav">' + icon("menu") + "</button>" +
      "</div>";

    var toggle = $(".nav-toggle", el), nav = $("#primary-nav", el);
    toggle.addEventListener("click", function () {
      var open = document.body.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", open);
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      toggle.innerHTML = icon(open ? "close" : "menu");
    });
    $$("a", nav).forEach(function (a) {
      a.addEventListener("click", function () {
        if (document.body.classList.contains("nav-open")) toggle.click();
      });
    });
    var onScroll = function () { el.classList.toggle("scrolled", window.scrollY > 12); };
    window.addEventListener("scroll", onScroll, { passive: true }); onScroll();
  }

  function socialLinks(cls) {
    return (C.socials || []).filter(function (s) { return s.url; }).map(function (s) {
      var ext = /^https?:/.test(s.url) ? ' target="_blank" rel="noopener"' : "";
      return '<a class="' + cls + '" href="' + esc(s.url) + '" aria-label="' + esc(s.label) + '"' + ext + ">" + icon(s.platform) + "</a>";
    }).join("");
  }

  function renderFooter() {
    var el = $("#site-footer"); if (!el) return;
    var links = (C.nav || []).map(function (n) {
      return '<li><a href="' + esc(n.href) + '">' + esc(n.label) + "</a></li>";
    }).join("");
    el.innerHTML =
      '<div class="container footer-grid">' +
        '<div class="footer-brand">' + sparks(["s1"]) +
          '<a class="logo" href="index.html">' + logoMark() + '<span class="logo-text">' + esc(C.brand.logoText) + "</span></a>" +
          "<p>" + esc(C.footer.tagline) + "</p>" +
        "</div>" +
        '<div><h4>Quick Links</h4><ul class="footer-links">' + links + "</ul></div>" +
        '<div><h4>Connect</h4><div class="socials">' + socialLinks("social") + "</div></div>" +
      "</div>" +
      '<div class="container footer-bottom"><p>© ' + new Date().getFullYear() + " " + esc(C.footer.copyright) + "</p>" +
        '<a href="#top" class="to-top">Back to top ↑</a></div>';
  }

  /* ---------- Home sections ---------- */
  function sectionHead(o, center) {
    return '<div class="section-head' + (center ? " center" : "") + ' reveal">' +
      '<span class="script-eyebrow">' + esc(o.eyebrow) + "</span>" +
      '<h2>' + esc(o.heading) + '<span class="h-line" aria-hidden="true"></span></h2>' +
      (o.sub ? "<p>" + esc(o.sub) + "</p>" : "") + "</div>";
  }
  function panel(inner, extra) {
    return '<div class="container"><div class="panel ' + (extra || "") + '">' + inner + "</div></div>";
  }
  function contactList() {
    return (C.socials || []).filter(function (s) { return s.url && s.display; }).map(function (s) {
      var ext = /^https?:/.test(s.url) ? ' target="_blank" rel="noopener"' : "";
      return '<li><a href="' + esc(s.url) + '"' + ext + '><span class="ci">' + icon(s.platform) + "</span>" + esc(s.display) + "</a></li>";
    }).join("");
  }

  function renderHero() {
    var el = $("#hero"); if (!el) return;
    var h = C.hero;
    var photo = h.photo
      ? '<img src="' + esc(h.photo) + '" alt="' + esc(h.photoAlt) + '" loading="eager">'
      : '<div class="photo-placeholder"><span class="ph-initials">' + initials(h.name) + "</span>" +
        '<span class="ph-label">' + icon("user") + "Profile photo placeholder</span></div>";
    var tags = (h.tags || []).map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("");
    el.innerHTML = panel(
      sparks(["s1", "s2", "s3"]) +
      '<div class="hero-grid">' +
        '<div class="hero-copy">' +
          '<div class="hero-top reveal"><span class="label">' + esc(h.label) + '<i></i></span><span class="eyebrow-pill">' + esc(h.eyebrow) + "</span></div>" +
          '<p class="greet reveal d1">' + esc(h.greeting) + "</p>" +
          '<h1 class="wordmark reveal d1"><span class="wm-bold">' + esc(h.handle) + '</span><span class="wm-script">' + esc(h.name) + "</span></h1>" +
          '<p class="hero-title reveal d2">' + esc(h.title) + "</p>" +
          '<div class="hero-intro reveal d3">' + String(h.intro || "").split(/\n\s*\n/).map(function (para) { return "<p>" + esc(para.trim()) + "</p>"; }).join("") + "</div>" +
          '<div class="hero-actions reveal d4">' +
            '<a class="btn btn-primary" href="' + esc(h.ctaHref) + '">' + esc(h.ctaLabel) + icon("arrow") + "</a>" +
            '<ul class="hero-tags">' + tags + "</ul>" +
          "</div>" +
          /* social links removed from hero (kept in footer + Contact page) */
        "</div>" +
        '<div class="hero-media reveal from-right">' +
          '<span class="doodle-heart">' + icon("heart") + "</span>" +
          '<div class="arch">' + photo + "</div>" +
          '<div class="float-chip chip-a">' + icon("video") + "<span>Videos</span></div>" +
          '<div class="float-chip chip-b">' + icon("search") + "<span>Research</span></div>" +
        "</div>" +
      "</div>", "hero-panel");
  }

  function renderServices() {
    var el = $("#services"); if (!el) return;
    var s = C.services;
    var cards = (s.items || []).map(function (it, i) {
      return '<a class="service-card reveal" style="--i:' + (i % 4) + '" href="' + esc(s.ctaHref) + '">' +
        '<span class="svc-icon">' + icon(it.icon) + "</span>" +
        "<h3>" + esc(it.title) + "</h3><p>" + esc(it.text) + "</p>" +
        '<span class="svc-more">Learn more ' + icon("arrow") + "</span></a>";
    }).join("");
    el.innerHTML = panel(sparks(["s2"]) + sectionHead(s, false) +
      '<div class="services-grid">' + cards + "</div>" +
      '<div class="section-foot reveal"><a class="btn btn-ghost" href="' + esc(s.ctaHref) + '">' + esc(s.ctaLabel) + icon("arrow") + "</a></div>");
  }

  function renderWork() {
    var el = $("#work"); if (!el) return;
    var w = C.work;
    // Projects marked "featured" in the Portfolio take priority over the placeholder cards
    var featured = ((C.portfolio && C.portfolio.items) || []).filter(function (it) { return it.featured; }).slice(0, 6).map(function (it) {
      var cats = Array.isArray(it.categories) ? it.categories : [];
      var xl = it.link || (/^https:\/\/(x|twitter)\.com\//.test(it.media || "") ? String(it.media).split("?")[0] : ""); /* featured cards link to the X post (falls back to the media URL when link is empty) */
      return { title: it.title, category: cats[0] || it.platform || "", thumbnail: it.thumbnail, link: xl || "portfolio.html", internal: !xl };
    });
    var list = featured.length ? featured : (w.items || []);
    var cards = list.map(function (it, i) {
      var thumb = it.thumbnail
        ? '<img src="' + esc(it.thumbnail) + '" alt="' + esc(it.title) + '" loading="lazy">'
        : '<div class="thumb-placeholder v' + (i % 3) + '">' + icon(catIcon(it.category)) + "<span>Thumbnail placeholder</span></div>";
      var tag = it.link ? "a" : "div";
      var attrs = it.link ? ' href="' + esc(it.link) + '"' + (it.internal ? "" : ' target="_blank" rel="noopener"') : "";
      return "<" + tag + ' class="work-card reveal" style="--i:' + (i % 3) + '"' + attrs + ">" +
        '<div class="work-thumb">' + thumb + "</div>" +
        '<div class="work-body"><span class="work-cat">' + esc(it.category) + "</span><h3>" + esc(it.title) + "</h3></div></" + tag + ">";
    }).join("");
    el.innerHTML = panel(sparks(["s1"]) + sectionHead(w, false) +
      '<div class="work-grid">' + cards + "</div>" +
      '<div class="section-foot reveal"><a class="btn btn-primary" href="' + esc(w.ctaHref) + '">' + esc(w.ctaLabel) + icon("arrow") + "</a></div>");
  }

  function renderTestimonials() {
    var el = $("#testimonials"); if (!el) return;
    var t = C.testimonials, items = t.items || [];
    el.hidden = !items.length; if (!items.length) return;
    var cards = items.map(function (it) {
      var av = it.avatar ? '<img src="' + esc(it.avatar) + '" alt="">' : "<span>" + initials(it.name) + "</span>";
      return '<figure class="t-card">' + '<span class="t-quote-icon">' + icon("quote") + "</span>" +
        (it.video ? '<div class="t-media"><video src="' + esc(it.video) + '"' + (it.poster ? ' poster="' + esc(it.poster) + '"' : "") + ' autoplay muted loop playsinline aria-label="' + esc(it.name) + ' reply GIF">' + (it.poster ? '<img src="' + esc(it.poster) + '" alt="">' : "") + "</video></div>" : "") +
        (it.quote ? "<blockquote>" + esc(it.quote) + "</blockquote>" : "") +
        '<span class="t-heart">' + icon("heart") + '</span><figcaption><span class="t-avatar">' + av + "</span><span><strong>" + esc(it.name) + "</strong><small>" + (it.link ? '<a class="t-source" href="' + esc(it.link) + '" target="_blank" rel="noopener">' + esc(it.role) + "</a>" : esc(it.role)) + "</small></span></figcaption></figure>";
    }).join("");
    el.innerHTML = panel(sparks(["s3"]) + sectionHead(t, true) +
      '<div class="slider reveal" aria-roledescription="carousel">' +
        '<div class="slider-viewport"><div class="slider-track">' + cards + "</div></div>" +
        '<div class="slider-controls">' +
          '<button class="slider-btn prev" aria-label="Previous testimonial">' + icon("left") + "</button>" +
          '<div class="slider-dots"></div>' +
          '<button class="slider-btn next" aria-label="Next testimonial">' + icon("right") + "</button>" +
        "</div></div>");
    initSlider($(".slider", el));
  }

  function renderBrands() {
    var el = $("#brands"); if (!el) return;
    var b = C.brands, items = b.items || [];
    el.hidden = !items.length; if (!items.length) return;
    function row(copy) {
      return items.map(function (it) {
        var inner = it.logo ? '<img src="' + esc(it.logo) + '" alt="" aria-hidden="true"><span>' + esc(it.name) + "</span>" :
          '<span class="brand-dot"></span><span>' + esc(it.name) + "</span>";
        var title = it.details ? ' title="' + esc(it.details) + '"' : "";
        if (it.url) inner = '<a href="' + esc(it.url) + '" target="_blank" rel="noopener"' + (copy ? ' tabindex="-1"' : "") + title + ">" + inner + "</a>";
        return '<li class="brand-item"' + (copy ? ' aria-hidden="true"' : "") + (it.url ? "" : title) + ">" + inner + "</li>";
      }).join("");
    }
    el.innerHTML = '<div class="container">' + sectionHead(b, true) + "</div>" +
      '<div class="marquee reveal"><ul class="marquee-track">' + row(false) + row(true) + "</ul></div>";
  }

  function renderCTA() {
    var el = $("#cta"); if (!el) return;
    var c = C.cta;
    el.innerHTML = panel(sparks(["s1", "s2"]) +
      '<div class="cta-grid">' +
        '<div class="cta-main reveal">' +
          '<span class="script-eyebrow">' + esc(c.eyebrow) + "</span>" +
          '<h2><span class="top">' + esc(c.headingTop) + '</span><span class="bottom">' + esc(c.headingBottom) + "</span>" + SWOOSH + "</h2>" +
          "<p>" + esc(c.text) + "</p>" +
          '<a class="btn btn-primary" href="' + esc(c.ctaHref) + '">' + esc(c.ctaLabel) + icon("arrow") + "</a>" +
        "</div>" +
        '<div class="cta-side reveal d2"><ul class="contact-list">' + contactList() + "</ul>" +
          '<p class="signoff">' + esc(c.signoff) + " " + icon("heart") + "</p></div>" +
      "</div>", "cta-panel");
  }

  /* ---------- Testimonial slider ---------- */
  function initSlider(root) {
    if (!root) return;
    var track = $(".slider-track", root), cards = $$(".t-card", root), dotsWrap = $(".slider-dots", root);
    var idx = 0, timer = null;
    function perView() { return window.innerWidth >= 900 ? 2 : 1; }
    function maxIdx() { return Math.max(0, cards.length - perView()); }
    function buildDots() {
      dotsWrap.innerHTML = "";
      for (var i = 0; i <= maxIdx(); i++) {
        var d = document.createElement("button");
        d.className = "dot"; d.setAttribute("aria-label", "Go to slide " + (i + 1));
        (function (n) { d.addEventListener("click", function () { go(n); restart(); }); })(i);
        dotsWrap.appendChild(d);
      }
    }
    function go(n) {
      var m = maxIdx();
      idx = n > m ? 0 : n < 0 ? m : n;
      root.style.setProperty("--per", perView());
      var step = cards[0] ? cards[0].getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap || 0) : 0;
      track.style.transform = "translateX(" + -idx * step + "px)";
      $$(".dot", dotsWrap).forEach(function (d, i) { d.classList.toggle("active", i === idx); });
    }
    function restart() {
      clearInterval(timer);
      if (!reduceMotion && cards.length > perView()) timer = setInterval(function () { go(idx + 1); }, 5000);
    }
    $(".prev", root).addEventListener("click", function () { go(idx - 1); restart(); });
    $(".next", root).addEventListener("click", function () { go(idx + 1); restart(); });
    root.addEventListener("mouseenter", function () { clearInterval(timer); });
    root.addEventListener("mouseleave", restart);
    // swipe
    var sx = null;
    root.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; }, { passive: true });
    root.addEventListener("touchend", function (e) {
      if (sx === null) return;
      var dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 40) { go(idx + (dx < 0 ? 1 : -1)); restart(); }
      sx = null;
    });
    var rt; window.addEventListener("resize", function () {
      clearTimeout(rt); rt = setTimeout(function () { buildDots(); go(Math.min(idx, maxIdx())); restart(); }, 150);
    });
    root.style.setProperty("--per", perView());
    buildDots(); requestAnimationFrame(function () { go(0); }); restart();
  }

  /* ---------- Scroll reveal ---------- */
  function initReveal() {
    var els = $$(".reveal");
    if (reduceMotion || !("IntersectionObserver" in window)) {
      els.forEach(function (e) { e.classList.add("in"); }); return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    els.forEach(function (e) { io.observe(e); });
  }

  /* ---------- Simple pages (stubs) ---------- */
  function renderStub() {
    var el = $("#page-stub"); if (!el) return;
    var title = el.getAttribute("data-title") || "";
    el.innerHTML = panel(sparks(["s1", "s2", "s3"]) + '<div class="stub reveal"><span class="script-eyebrow">coming next</span><h1>' + esc(title) +
      "</h1><p>This page is part of the next build step and will follow the same design.</p>" +
      '<a class="btn btn-primary" href="index.html">Back to Home' + icon("arrow") + "</a></div>", "stub-panel");
  }

  // helpers shared with page scripts (e.g. portfolio.js)

  /* ---------- Content loading (Supabase → fallback to content.js) ---------- */
  function isObj(v) { return v && typeof v === "object" && !Array.isArray(v); }
  function merge(base, over) {                       // objects merge deeply, arrays/values are replaced
    if (!isObj(base) || !isObj(over)) return over === undefined ? base : over;
    var out = {};
    Object.keys(base).forEach(function (k) { out[k] = base[k]; });
    Object.keys(over).forEach(function (k) { out[k] = isObj(base[k]) && isObj(over[k]) ? merge(base[k], over[k]) : over[k]; });
    return out;
  }
  function loadContent() {
    var DB = window.SHUX_DB;
    if (!DB || !DB.configured()) return Promise.resolve(DEFAULTS);
    return DB.db.getContent(5000).then(function (row) {
      return row && isObj(row.data) ? merge(DEFAULTS, row.data) : DEFAULTS;
    }).catch(function () { return DEFAULTS; });
  }

  var THEME_DEFAULT = { navy: "#0E2A6E", royal: "#2D5BD3", peri: "#7A9BE8", sky: "#C9DAFB", cloud: "#F4F8FF" };
  function hex(c, fb) { return /^#[0-9a-f]{6}$/i.test(c || "") ? c : fb; }
  function mix(a, b, t) {
    var pa = [1, 3, 5].map(function (i) { return parseInt(a.substr(i, 2), 16); }), pb = [1, 3, 5].map(function (i) { return parseInt(b.substr(i, 2), 16); });
    return "#" + pa.map(function (v, i) { return ("0" + Math.round(v + (pb[i] - v) * t).toString(16)).slice(-2); }).join("");
  }
  function applyTheme() {
    var t = C.theme || {}, d = THEME_DEFAULT;
    var th = { navy: hex(t.navy, d.navy), royal: hex(t.royal, d.royal), peri: hex(t.peri, d.peri), sky: hex(t.sky, d.sky), cloud: hex(t.cloud, d.cloud) };
    var same = Object.keys(d).every(function (k) { return th[k].toLowerCase() === d[k].toLowerCase(); });
    if (same) return;                                  // default look: nothing to change
    var r = document.documentElement.style;
    Object.keys(th).forEach(function (k) { r.setProperty("--" + k, th[k]); });
    r.setProperty("--tile", mix(th.sky, "#ffffff", 0.45));
    r.setProperty("--grad-text", "linear-gradient(100deg, " + th.royal + " 0%, " + mix(th.royal, th.peri, 0.5) + " 60%, " + th.peri + " 100%)");
    var e = function (c) { return c.replace("#", "%23"); };
    r.setProperty("--wave-bl", "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 500 220' preserveAspectRatio='none'%3E%3Cpath d='M0 70C90 40 150 130 250 150C340 168 420 120 500 220H0Z' fill='" + e(th.peri) + "' fill-opacity='.55'/%3E%3Cpath d='M0 130C80 110 160 180 260 190C350 200 420 170 470 220H0Z' fill='" + e(th.royal) + "' fill-opacity='.75'/%3E%3C/svg%3E\")");
    r.setProperty("--wave-tr", "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 260' preserveAspectRatio='none'%3E%3Cpath d='M400 0V200C340 230 300 160 250 120C200 80 120 100 90 50C70 20 80 0 80 0Z' fill='" + e(th.peri) + "' fill-opacity='.35'/%3E%3Cpath d='M400 0V110C350 130 320 80 290 55C260 30 220 30 210 0Z' fill='" + e(th.sky) + "'/%3E%3C/svg%3E\")");
    var meta = document.querySelector('meta[name="theme-color"]'); if (meta) meta.setAttribute("content", th.sky);
  }
  function applySeo() {
    var seo = C.seo || {}, here = currentPage();
    if (here === "index.html") { if (seo.homeTitle) document.title = seo.homeTitle; }
    else if (seo.siteTitle) {
      var item = (C.nav || []).filter(function (n) { return n.href === here; })[0];
      var page = item ? item.label : document.title.split(" — ")[0];
      document.title = page + " — " + seo.siteTitle;
    }
    var md = document.querySelector('meta[name="description"]');
    if (md && seo.description) md.setAttribute("content", seo.description);
  }

  // helpers shared with page scripts (portfolio.js, about.js, …)
  window.SHUX = { C: C, esc: esc, icon: icon, initials: initials, contactList: contactList, paras: function (t) { return String(t || "").split(/\n\s*\n/).map(function (p) { return "<p>" + esc(p.trim()) + "</p>"; }).join(""); }, panel: panel, sparks: sparks, sectionHead: sectionHead, reduceMotion: reduceMotion };

  function boot() {
    loadContent().then(function (content) {
      C = content; window.SITE_CONTENT = content; window.SHUX.C = content;
      applyTheme(); applySeo();
      renderHeader(); renderHero(); renderServices(); renderWork();
      renderTestimonials(); renderBrands(); renderCTA(); renderStub();
      if (typeof window.SHUX_PAGE === "function") window.SHUX_PAGE();
      renderFooter();
      initReveal();
      document.documentElement.classList.add("content-ready");
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();

})();
