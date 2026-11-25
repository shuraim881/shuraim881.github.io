/* SHUXBROH — Contact page: details + inquiry form */
window.SHUX_PAGE = function () {
  "use strict";
  var S = window.SHUX, esc = S.esc, icon = S.icon, C = S.C || {};
  var K = C.contact || {}, F = K.form || {};
  var root = document.getElementById("contact-page");
  if (!root) return;

  var emailEntry = (C.socials || []).filter(function (s) { return s.platform === "mail" && s.url; })[0];
  var email = emailEntry ? emailEntry.url.replace(/^mailto:/, "") : "";

  /* ---------- Contact details ---------- */
  var details = (C.socials || []).map(function (s, i) {
    var inner = '<span class="ci">' + icon(s.platform) + "</span>" +
      '<span class="cd-text"><small>' + esc(s.label) + "</small><strong>" + esc(s.url ? (s.display || s.url) : K.emptyLink) + "</strong></span>";
    if (!s.url) return '<li class="cd-item is-empty reveal" style="--i:' + i + '">' + inner + "</li>";
    var ext = /^https?:/.test(s.url) ? ' target="_blank" rel="noopener"' : "";
    return '<li class="cd-item reveal" style="--i:' + i + '"><a href="' + esc(s.url) + '"' + ext + ">" + inner +
      '<span class="cd-go">' + icon("external") + "</span></a></li>";
  }).join("");

  /* ---------- Form ---------- */
  var services = ((C.servicesPage && C.servicesPage.items) || []).filter(function (s) { return !s.hidden; }).map(function (s) { return s.title; });
  var options = '<option value="" disabled selected>' + esc(F.servicePlaceholder) + "</option>" +
    services.concat([F.otherService]).filter(Boolean).map(function (t) { return '<option value="' + esc(t) + '">' + esc(t) + "</option>"; }).join("");

  root.innerHTML = S.panel(
    S.sparks(["s1", "s2"]) + S.sectionHead(K, false) +
    '<div class="contact-grid">' +
      '<aside class="contact-side">' +
        '<h3 class="reveal">' + esc(K.detailsHeading) + "</h3>" +
        '<ul class="cd-list">' + details + "</ul>" +
        (K.availability ? '<p class="cd-note reveal">' + icon("clock") + "<span>" + esc(K.availability) + "</span></p>" : "") +
      "</aside>" +
      '<div class="form-card reveal d1" id="inquiry">' +
        "<h3>" + esc(F.heading) + "</h3>" +
        (F.enabled === false ? '<div class="form-closed">' + icon("mail") + "<p>" + esc(F.disabledText) + "</p>" +
          (email ? '<a class="btn btn-primary btn-sm" href="mailto:' + esc(email) + '">' + esc(email) + "</a>" : "") + "</div>" : "") +
        '<form class="inquiry-form" name="inquiry" novalidate' + (F.enabled === false ? " hidden" : "") + ">" +
          '<input type="hidden" name="form-name" value="inquiry">' +
          '<p class="hp" aria-hidden="true"><label>Leave empty <input name="bot-field" tabindex="-1" autocomplete="off"></label></p>' +
          '<div class="field-row">' +
            field("name", F.nameLabel, '<input id="f-name" name="name" type="text" autocomplete="name" required maxlength="100">') +
            field("email", F.emailLabel, '<input id="f-email" name="email" type="email" autocomplete="email" required maxlength="150">') +
          "</div>" +
          '<div class="field-row">' +
            field("company", F.companyLabel, '<input id="f-company" name="company" type="text" autocomplete="organization" maxlength="120">') +
            field("service", F.serviceLabel, '<div class="select-wrap"><select id="f-service" name="service" required>' + options + "</select>" + icon("chev") + "</div>") +
          "</div>" +
          field("message", F.messageLabel, '<textarea id="f-message" name="message" rows="6" required maxlength="3000" placeholder="' + esc(F.messagePlaceholder) + '"></textarea>') +
          '<button class="btn btn-primary form-submit" type="submit"><span>' + esc(F.submitLabel) + "</span>" + icon("send") + "</button>" +
          '<div class="form-status" role="status" aria-live="polite"></div>' +
        "</form>" +
        '<div class="form-success" hidden><span class="fs-icon">' + icon("check") + "</span><h3>" + esc(F.successTitle) + "</h3><p>" + esc(F.successText) + "</p></div>" +
      "</div>" +
    "</div>",
    "contact-panel"
  );

  function field(id, label, control) {
    var opt = /optional/i.test(label || "") ? "" : '<span class="req" aria-hidden="true">*</span>';
    return '<div class="field" data-field="' + id + '"><label for="f-' + id + '">' + esc(label) + opt + "</label>" + control +
      '<small class="field-error" id="err-' + id + '"></small></div>';
  }

  var form = root.querySelector(".inquiry-form");
  var status = root.querySelector(".form-status");
  var btn = root.querySelector(".form-submit");
  var success = root.querySelector(".form-success");

  // pre-select the service chosen on the Services page
  try {
    var chosen = sessionStorage.getItem("shux_service");
    if (chosen) {
      var sel = form.querySelector("#f-service");
      for (var i = 0; i < sel.options.length; i++) if (sel.options[i].value === chosen) sel.selectedIndex = i;
      sessionStorage.removeItem("shux_service");
    }
  } catch (err) { /* storage unavailable */ }

  /* ---------- Validation ---------- */
  var messages = {
    name: "Please enter your name.",
    email: "Please enter a valid email address.",
    service: "Please choose a service.",
    message: "Please write a short message (at least 10 characters)."
  };
  function check(el) {
    var ok = true, v = (el.value || "").trim();
    if (el.name === "email") ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
    else if (el.name === "message") ok = v.length >= 10;
    else if (el.required) ok = v.length > 0;
    var wrap = el.closest(".field");
    wrap.classList.toggle("has-error", !ok);
    el.setAttribute("aria-invalid", !ok);
    var err = wrap.querySelector(".field-error");
    err.textContent = ok ? "" : (messages[el.name] || "");
    if (!ok) el.setAttribute("aria-describedby", err.id); else el.removeAttribute("aria-describedby");
    return ok;
  }
  var controls = Array.prototype.slice.call(form.querySelectorAll("input[required], select[required], textarea[required]"));
  controls.forEach(function (el) {
    el.addEventListener("blur", function () { if (el.value) check(el); });
    el.addEventListener("input", function () { if (el.closest(".field").classList.contains("has-error")) check(el); });
    el.addEventListener("change", function () { if (el.tagName === "SELECT") check(el); });
  });

  /* ---------- Submit ---------- */
  function mailtoHref(data) {
    var body = "Name: " + data.name + "\nEmail: " + data.email + (data.company ? "\nBrand/Project: " + data.company : "") +
      "\nService: " + data.service + "\n\n" + data.message;
    return "mailto:" + email + "?subject=" + encodeURIComponent("Inquiry: " + data.service) + "&body=" + encodeURIComponent(body);
  }
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    status.className = "form-status"; status.innerHTML = "";
    var valid = controls.map(check).every(Boolean);
    if (!valid) { var first = form.querySelector(".has-error input, .has-error select, .has-error textarea"); if (first) first.focus(); return; }
    if (form.querySelector('[name="bot-field"]').value) return;      // spam bot

    var fd = new FormData(form), data = {};
    fd.forEach(function (v, k) { data[k] = String(v).trim(); });
    btn.disabled = true; btn.classList.add("is-loading");

    var DB = window.SHUX_DB, req;
    if (DB && DB.configured()) {
      // Saved to Supabase → visible in Admin Panel → Inquiries
      req = DB.db.sendInquiry({ name: data.name, email: data.email, company: data.company || null, service: data.service || null, message: data.message })
        .then(function () { return { ok: true }; });
    } else if (F.endpoint) {
      req = fetch(F.endpoint, { method: "POST", headers: { "Accept": "application/json" }, body: fd });
    } else {
      // Netlify Forms fallback when Supabase isn't connected
      req = fetch("/", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams(fd).toString() });
    }

    req.then(function (res) {
      if (!res.ok) throw new Error("HTTP " + res.status);
      form.hidden = true; success.hidden = false;
      success.querySelector("h3").setAttribute("tabindex", "-1"); success.querySelector("h3").focus();
    }).catch(function () {
      status.className = "form-status is-error";
      status.innerHTML = "<p>" + esc(F.errorText) + "</p>" +
        (email ? '<a class="btn btn-ghost btn-sm" href="' + esc(mailtoHref(data)) + '">' + icon("mail") + esc(email) + "</a>" : "");
    }).then(function () { btn.disabled = false; btn.classList.remove("is-loading"); });
  });
};
