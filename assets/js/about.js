/* SHUXBROH — About page */
window.SHUX_PAGE = function () {
  "use strict";
  var S = window.SHUX, esc = S.esc, icon = S.icon, A = (S.C && S.C.about) || {};
  function el(id) { return document.getElementById(id); }
  function num(n) { return (n < 9 ? "0" : "") + (n + 1); }

  /* 1. Introduction */
  var intro = el("about-intro");
  if (intro && A.intro) {
    var I = A.intro;
    var photo = I.photo
      ? '<img src="' + esc(I.photo) + '" alt="' + esc(I.photoAlt) + '">'
      : '<div class="photo-placeholder"><span class="ph-initials">' + S.initials(I.name) + "</span>" +
        '<span class="ph-label">' + icon("user") + "Profile photo placeholder</span></div>";
    intro.innerHTML = S.panel(
      S.sparks(["s1", "s2", "s3"]) +
      '<div class="about-intro-grid">' +
        '<div class="hero-media reveal">' +
          '<span class="doodle-heart">' + icon("heart") + "</span>" +
          '<div class="arch">' + photo + "</div>" +
        "</div>" +
        '<div class="about-intro-copy">' +
          '<div class="hero-top reveal"><span class="label">' + esc(I.label) + "<i></i></span></div>" +
          '<h1 class="about-name reveal d1">' + esc(I.name) + '<span class="about-handle">aka <span class="grad">' + esc(I.handle) + "</span></span></h1>" +
          '<p class="hero-title reveal d2">' + esc(I.role) + "</p>" +
          '<div class="intro-card reveal d3">' + S.paras(I.text) + "</div>" +
          /* social links removed from About intro (kept in footer + Contact page) */
        "</div>" +
      "</div>", "hero-panel"
    );
  }

  /* Creator stats (hidden until a value is entered in the Admin Panel) */
  var st = el("about-stats");
  if (st) {
    var T = A.stats || {};
    var stats = (T.items || []).filter(function (it) { return it.visible !== false && String(it.value || "").trim() !== ""; });
    var hasProofs = !T.proofs || T.proofs.length > 0 || !!(T.analytics && T.analytics.src); /* Kaito + Wallchain images keep the section visible even with no stat tiles */
    st.hidden = !stats.length && !hasProofs;
    if (stats.length || hasProofs) {
      var tiles = stats.map(function (it, i) {
        return '<article class="stat-card reveal" style="--i:' + (i % 5) + '">' +
          '<span class="stat-icon">' + icon(it.icon || "chart") + "</span>" +
          '<strong class="stat-value" data-value="' + esc(String(it.value).trim()) + '">' + esc(String(it.value).trim()) + "</strong>" +
          (it.suffix ? '<span class="stat-suffix">' + esc(it.suffix) + "</span>" : "") +
          '<span class="stat-label">' + esc(it.label) + "</span></article>";
      }).join("");
      /* Score screenshots (Kaito + Wallchain) with their key line as separate text */
      var proofs = T.proofs || [
        { src: "assets/img/stats/kaito-card.jpg", alt: "Shux's Kaito social card", title: "Kaito", line: "Mindshare Rank: #3,561 (Top 0.89%)" },
        { src: "assets/img/stats/wallchain-score.jpg", alt: "Shux's Wallchain score of 113", title: "Wallchain", line: "Score 113, Top 1.29%" }
      ];
      var proofHtml = proofs.length ? '<div class="stats-proofs">' + proofs.map(function (pf, i) {
        return '<figure class="stat-proof reveal" style="--i:' + i + '">' +
          '<img src="' + esc(pf.src) + '" alt="' + esc(pf.alt || pf.title) + '" loading="lazy">' +
          '<figcaption><span class="stat-proof-title">' + esc(pf.title) + '</span>' +
          '<span class="stat-proof-line">' + esc(pf.line) + "</span></figcaption></figure>";
      }).join("") + "</div>" : "";
      /* X analytics screenshot: its own full-width block below Kaito + Wallchain */
      var XA = T.analytics;
      if (XA && XA.src) proofHtml += '<figure class="stat-proof stat-proof-wide reveal">' +
        '<img src="' + esc(XA.src) + '" alt="' + esc(XA.alt || XA.title || "") + '" loading="lazy">' +
        '<figcaption><span class="stat-proof-title">' + esc(XA.title || "") + '</span>' +
        (XA.line ? '<span class="stat-proof-line">' + esc(XA.line) + "</span>" : "") + "</figcaption></figure>";
      st.innerHTML = S.panel(S.sparks(["s1"]) + S.sectionHead(T, true) + proofHtml + (tiles ? '<div class="stats-grid">' + tiles + "</div>" : ""), "stats-panel"); /* no empty grid when all stat tiles are hidden */
      animateCounters(st);
    }
  }

  function animateCounters(scope) {
    var nodes = Array.prototype.slice.call(scope.querySelectorAll(".stat-value"));
    function run(node) {
      var raw = node.getAttribute("data-value");
      var m = raw.match(/^([^0-9]*)([0-9][0-9,]*\.?[0-9]*)(.*)$/);      // prefix, number, rest (e.g. "12.5K")
      if (!m || S.reduceMotion) { node.textContent = raw; return; }
      var target = parseFloat(m[2].replace(/,/g, "")), decimals = (m[2].split(".")[1] || "").length, commas = m[2].indexOf(",") > -1;
      var start = null, dur = 1600;
      function fmt(v) {
        var t = v.toFixed(decimals);
        if (commas) { var p = t.split("."); p[0] = p[0].replace(/\B(?=(\d{3})+(?!\d))/g, ","); t = p.join("."); }
        return m[1] + t + m[3];
      }
      function frame(ts) {
        if (!start) start = ts;
        var k = Math.min(1, (ts - start) / dur), e = 1 - Math.pow(1 - k, 3);
        node.textContent = fmt(target * e);
        if (k < 1) requestAnimationFrame(frame); else node.textContent = raw;
      }
      node.textContent = fmt(0);
      requestAnimationFrame(frame);
    }
    if (!("IntersectionObserver" in window)) { nodes.forEach(function (n) { n.textContent = n.getAttribute("data-value"); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { run(en.target); io.unobserve(en.target); } });
    }, { threshold: 0.4 });
    nodes.forEach(function (n) { io.observe(n); });
  }

  /* 2. Journey */
  var jr = el("about-journey");
  if (jr && A.journey) {
    var J = A.journey;
    var chapters = (J.chapters || []).map(function (c, i) {
      return '<li class="chapter reveal" style="--i:' + (i % 3) + '"><span class="chapter-dot">' + num(i) + "</span>" +
        '<div class="chapter-body"><h3>' + esc(c.title) + "</h3>" + S.paras(c.text) + "</div></li>";
    }).join("");
    jr.innerHTML = S.panel(
      S.sparks(["s2"]) +
      '<div class="journey-grid">' +
        '<div class="journey-side">' + S.sectionHead(J, false) +
          (J.quote ? '<blockquote class="journey-quote reveal d1"><span class="jq-mark">' + icon("quote") + "</span>" + esc(J.quote) + "</blockquote>" : "") +
        "</div>" +
        '<ol class="chapters">' + chapters + "</ol>" +
      "</div>"
    );
  }

  /* 3. What I do (bento grid) */
  var wd = el("about-what");
  if (wd && A.whatIDo) {
    var W = A.whatIDo;
    var list = W.items || [];
    var rem = (list.length + 1) % 3;                       // first card spans 2 columns
    var cards = list.map(function (it, i) {
      var cls = i === 0 ? " wide" : (i === list.length - 1 && list.length > 1 ? (rem === 2 ? " span2" : rem === 1 ? " span3" : "") : "");
      return '<article class="focus-card' + cls + ' reveal" style="--i:' + (i % 3) + '">' +
        '<span class="focus-icon">' + icon(it.icon) + "</span>" +
        "<div><h3>" + esc(it.title) + "</h3><p>" + esc(it.text) + "</p></div></article>";
    }).join("");
    wd.innerHTML = S.panel(S.sparks(["s1"]) + S.sectionHead(W, false) + '<div class="focus-grid">' + cards + "</div>");
  }

  /* 4. Skills */
  var sk = el("about-skills");
  if (sk && A.skills) {
    var K = A.skills;
    var tiles = (K.items || []).map(function (it, i) {
      return '<article class="skill-card reveal" style="--i:' + (i % 4) + '">' +
        '<div class="skill-top"><span class="svc-icon">' + icon(it.icon) + '</span><span class="skill-num">' + num(i) + "</span></div>" +
        "<h3>" + esc(it.title) + "</h3><p>" + esc(it.text) + "</p></article>";
    }).join("");
    sk.innerHTML = S.panel(S.sparks(["s2", "s3"]) + S.sectionHead(K, true) + '<div class="skills-grid">' + tiles + "</div>");
  }

  /* 5. Approach */
  var ap = el("about-approach");
  if (ap && A.approach) {
    var P = A.approach;
    var steps = (P.steps || []).map(function (st, i) {
      return '<li class="step reveal" style="--i:' + i + '"><span class="step-num">' + num(i) + "</span>" +
        "<h3>" + esc(st.title) + "</h3>" + S.paras(st.text) + "</li>";
    }).join("");
    ap.innerHTML = S.panel(S.sparks(["s1", "s2"]) + S.sectionHead(P, false) + '<ol class="steps">' + steps + "</ol>");
  }
};
