/* SHUXBROH — Services page */
window.SHUX_PAGE = function () {
  "use strict";
  var S = window.SHUX, esc = S.esc, icon = S.icon, P = (S.C && S.C.servicesPage) || {};
  var root = document.getElementById("services-page");
  if (!root) return;

  var cards = (P.items || []).filter(function (it) { return !it.hidden; }).map(function (it, i) {
    var feats = (it.features || []).filter(Boolean).map(function (f) {
      return "<li>" + icon("check") + "<span>" + esc(f) + "</span></li>";
    }).join("");
    var price = ""; /* Shux asked to remove prices from the Services page; price fields stay in the data/admin but are not rendered */
    return '<article class="sv-card reveal" style="--i:' + (i % 3) + '">' +
      '<div class="sv-head"><span class="svc-icon">' + icon(it.icon) + '</span><span class="skill-num">' + (i < 9 ? "0" : "") + (i + 1) + "</span></div>" +
      "<h3>" + esc(it.title) + "</h3>" +
      '<p class="sv-desc">' + esc(it.description) + "</p>" +
      (feats ? '<ul class="sv-features">' + feats + "</ul>" : "") +
      '<div class="sv-foot">' + price +
        '<a class="btn btn-primary btn-sm sv-cta" href="contact.html#inquiry" data-service="' + esc(it.title) + '">' + esc(P.ctaLabel) + icon("arrow") + "</a>" +
      "</div></article>";
  }).join("");

  root.innerHTML = S.panel(
    S.sparks(["s1", "s2"]) + S.sectionHead(P, false) + '<div class="sv-grid">' + cards + "</div>",
    "sv-panel"
  );

  // remember which service was chosen so the contact form can pre-select it
  root.addEventListener("click", function (e) {
    var a = e.target.closest(".sv-cta"); if (!a) return;
    try { sessionStorage.setItem("shux_service", a.getAttribute("data-service")); } catch (err) { /* storage unavailable */ }
  });
};
