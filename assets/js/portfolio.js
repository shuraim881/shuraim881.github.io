/* SHUXBROH — Portfolio page: filters, grid, lightbox */
window.SHUX_PAGE = function () {
  "use strict";
  var S = window.SHUX, esc = S.esc, icon = S.icon;
  var P = (S.C && S.C.portfolio) || { categories: [], items: [] };
  var root = document.getElementById("portfolio");
  if (!root) return;

  var items = (P.items || []).map(function (it, i) {
    var cats = Array.isArray(it.categories) ? it.categories : (it.category ? [it.category] : []);
    return Object.assign({}, it, { _i: i, _cats: cats, type: it.type || "image" });
  });
  var current = "all";
  var visible = items.slice();

  function typeIcon(t) { return t === "video" ? "play" : t === "text" ? "doc" : "image"; }
  function typeLabel(t) { return t === "video" ? "Video" : t === "text" ? "Written" : "Image"; }
  function count(cat) {
    return cat === "all" ? items.length : items.filter(function (it) { return it._cats.indexOf(cat) > -1; }).length;
  }

  /* ---------- Page markup ---------- */
  var tabs = [{ key: "all", label: P.allLabel || "All Work" }].concat(
    (P.categories || []).map(function (c) { return { key: c, label: c }; })
  );
  var tabsHtml = tabs.map(function (t, i) {
    return '<button class="filter-tab' + (i === 0 ? " active" : "") + '" role="tab" aria-selected="' + (i === 0) + '" data-filter="' + esc(t.key) + '">' +
      esc(t.label) + '<span class="tab-count">' + count(t.key) + "</span></button>";
  }).join("");

  function cardHtml(it, n) {
    var thumb = it.thumbnail
      ? '<img src="' + esc(it.thumbnail) + '" alt="" loading="lazy">'
      : '<div class="thumb-placeholder v' + (n % 3) + '">' + icon(typeIcon(it.type)) + "<span>Thumbnail placeholder</span></div>";
    var play = it.type === "video" ? '<span class="play-badge">' + icon("play") + "</span>" : "";
    return '<button class="pf-card" data-index="' + it._i + '" aria-haspopup="dialog" aria-label="Open ' + esc(it.title) + '">' +
        '<div class="work-thumb">' + thumb + play +
          '<span class="pf-type">' + icon(typeIcon(it.type)) + esc(typeLabel(it.type)) + "</span></div>" +
        '<div class="pf-body">' +
          '<div class="pf-meta"><span class="work-cat">' + esc(it._cats[0] || "") + "</span>" +
            (it.platform ? '<span class="pf-platform">' + icon("globe") + esc(it.platform) + "</span>" : "") + "</div>" +
          "<h3>" + esc(it.title) + "</h3>" +
          "<p>" + esc(it.description) + "</p>" +
          '<span class="pf-open">View details ' + icon("arrow") + "</span>" +
        "</div></button>";
  }

  root.innerHTML = S.panel(
    S.sparks(["s1", "s2"]) + S.sectionHead({ eyebrow: P.eyebrow, heading: P.heading, sub: P.sub }, false) +
    '<div class="filter-bar reveal"><div class="filter-tabs" role="tablist" aria-label="Filter portfolio">' + tabsHtml + "</div></div>" +
    '<div class="pf-grid" aria-live="polite">' +
      items.map(function (it, n) { return '<div class="pf-cell reveal" style="--i:' + (n % 3) + '">' + cardHtml(it, n) + "</div>"; }).join("") +
    "</div>" +
    '<p class="pf-empty" hidden>' + esc(P.emptyText) + "</p>",
    "pf-panel"
  );

  /* ---------- Filtering ---------- */
  var cells = Array.prototype.slice.call(root.querySelectorAll(".pf-cell"));
  var tabBtns = Array.prototype.slice.call(root.querySelectorAll(".filter-tab"));
  var empty = root.querySelector(".pf-empty");
  var filterTimer;

  function applyFilter(key) {
    current = key;
    tabBtns.forEach(function (b) {
      var on = b.getAttribute("data-filter") === key;
      b.classList.toggle("active", on); b.setAttribute("aria-selected", on);
      if (on && b.scrollIntoView) b.scrollIntoView({ behavior: S.reduceMotion ? "auto" : "smooth", block: "nearest", inline: "center" });
    });
    cells.forEach(function (c) { c.classList.add("is-out"); });
    clearTimeout(filterTimer);
    filterTimer = setTimeout(function () {
      visible = [];
      var shown = 0;
      cells.forEach(function (c) {
        var it = items[+c.firstChild.getAttribute("data-index")];
        var match = key === "all" || it._cats.indexOf(key) > -1;
        c.hidden = !match;
        if (match) {
          visible.push(it);
          c.classList.add("in");                       // skip scroll-reveal once filtered
          c.style.setProperty("--i", shown % 6);
          shown++;
        }
      });
      empty.hidden = shown > 0;
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { cells.forEach(function (c) { if (!c.hidden) c.classList.remove("is-out"); }); });
      });
    }, S.reduceMotion ? 0 : 260);
  }
  tabBtns.forEach(function (b) {
    b.addEventListener("click", function () { if (b.getAttribute("data-filter") !== current) applyFilter(b.getAttribute("data-filter")); });
  });

  /* ---------- Lightbox ---------- */
  var lb = document.createElement("div");
  lb.className = "lightbox"; lb.hidden = true;
  lb.setAttribute("role", "dialog"); lb.setAttribute("aria-modal", "true"); lb.setAttribute("aria-labelledby", "lb-title");
  lb.innerHTML =
    '<div class="lb-backdrop" data-close></div>' +
    '<div class="lb-dialog">' +
      '<button class="lb-close" data-close aria-label="Close">' + icon("close") + "</button>" +
      '<div class="lb-media"></div>' +
      '<div class="lb-info"></div>' +
      '<div class="lb-nav"><button class="lb-prev" aria-label="Previous item">' + icon("left") + '</button><span class="lb-pos"></span><button class="lb-next" aria-label="Next item">' + icon("right") + "</button></div>" +
    "</div>";
  document.body.appendChild(lb);
  var lbMedia = lb.querySelector(".lb-media"), lbInfo = lb.querySelector(".lb-info"), lbPos = lb.querySelector(".lb-pos");
  var openIdx = -1, lastFocus = null;

  function youtubeId(url) {
    var m = String(url).match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{6,})/);
    return m ? m[1] : null;
  }
  function mediaHtml(it, n) {
    var src = it.media || "";
    if (it.type === "video" && src) {
      var yt = youtubeId(src);
      if (yt) return '<div class="lb-frame"><iframe src="https://www.youtube-nocookie.com/embed/' + esc(yt) + '" title="' + esc(it.title) + '" allow="accelerometer; encrypted-media; picture-in-picture; fullscreen" allowfullscreen loading="lazy"></iframe></div>';
      if (/\.(mp4|webm|mov)(\?|$)/i.test(src)) return '<div class="lb-frame"><video src="' + esc(src) + '" controls playsinline preload="metadata"' + (it.thumbnail ? ' poster="' + esc(it.thumbnail) + '"' : "") + "></video></div>";
    }
    if (it.type === "text" && it.body) {
      var paras = String(it.body).split(/\n\s*\n/).map(function (p) { return "<p>" + esc(p.trim()) + "</p>"; }).join("");
      return '<div class="lb-text"><span class="lb-text-head">' + icon("doc") + esc(it.platform || "Written content") + "</span>" + paras + "</div>";
    }
    var img = src && !youtubeId(src) && !/\.(mp4|webm|mov)/i.test(src) ? src : it.thumbnail;
    if (img) return '<div class="lb-frame"><img src="' + esc(img) + '" alt="' + esc(it.title) + '"></div>';
    return '<div class="lb-frame"><div class="thumb-placeholder v' + (n % 3) + '">' + icon(typeIcon(it.type)) + "<span>Preview placeholder</span></div></div>";
  }
  function render(i) {
    var it = visible[i]; if (!it) return;
    openIdx = i;
    lbMedia.innerHTML = mediaHtml(it, it._i);
    lbMedia.className = "lb-media type-" + it.type;
    var chips = it._cats.map(function (c) { return '<span class="lb-chip">' + esc(c) + "</span>"; }).join("");
    var ext = /^https?:/.test(it.link || "") ? ' target="_blank" rel="noopener"' : "";
    lbInfo.innerHTML =
      '<div class="lb-chips">' + chips + "</div>" +
      '<h2 id="lb-title">' + esc(it.title) + "</h2>" +
      '<dl class="lb-facts">' +
        (it.platform ? "<div><dt>Platform</dt><dd>" + esc(it.platform) + "</dd></div>" : "") +
        "<div><dt>Format</dt><dd>" + esc(typeLabel(it.type)) + "</dd></div>" +
      "</dl>" +
      '<p class="lb-desc">' + esc(it.description) + "</p>" +
      (it.link ? '<a class="btn btn-primary" href="' + esc(it.link) + '"' + ext + ">View on " + esc(it.platform || "platform") + icon("external") + "</a>" : "");
    lbPos.textContent = (i + 1) + " / " + visible.length;
    lb.querySelector(".lb-nav").hidden = visible.length < 2;
  }
  function open(it) {
    var i = visible.indexOf(it); if (i < 0) return;
    lastFocus = document.activeElement;
    render(i);
    lb.hidden = false;
    document.body.classList.add("lb-open");
    requestAnimationFrame(function () { lb.classList.add("show"); lb.querySelector(".lb-close").focus(); });
  }
  function close() {
    lb.classList.remove("show");
    document.body.classList.remove("lb-open");
    setTimeout(function () { lb.hidden = true; lbMedia.innerHTML = ""; }, S.reduceMotion ? 0 : 300); // stops playing video
    openIdx = -1;
    if (lastFocus) lastFocus.focus();
  }
  function step(d) {
    if (openIdx < 0 || visible.length < 2) return;
    var n = (openIdx + d + visible.length) % visible.length;
    lb.querySelector(".lb-dialog").classList.add("swap");
    setTimeout(function () { render(n); lb.querySelector(".lb-dialog").classList.remove("swap"); }, S.reduceMotion ? 0 : 160);
  }

  root.addEventListener("click", function (e) {
    var card = e.target.closest(".pf-card"); if (!card) return;
    open(items[+card.getAttribute("data-index")]);
  });
  lb.addEventListener("click", function (e) { if (e.target.closest("[data-close]")) close(); });
  lb.querySelector(".lb-prev").addEventListener("click", function () { step(-1); });
  lb.querySelector(".lb-next").addEventListener("click", function () { step(1); });
  document.addEventListener("keydown", function (e) {
    if (lb.hidden) return;
    if (e.key === "Escape") close();
    else if (e.key === "ArrowRight") step(1);
    else if (e.key === "ArrowLeft") step(-1);
    else if (e.key === "Tab") {                      // keep focus inside the dialog
      var f = Array.prototype.slice.call(lb.querySelectorAll("button, a[href], iframe, video")).filter(function (x) { return !x.closest("[hidden]"); });
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  // swipe between items on touch screens
  var sx = null;
  lbMedia.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; }, { passive: true });
  lbMedia.addEventListener("touchend", function (e) {
    if (sx === null) return;
    var dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
    sx = null;
  });
};
