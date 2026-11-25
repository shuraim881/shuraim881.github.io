/* SHUXBROH — tiny Supabase client (Auth, Database, Storage) using Supabase's REST APIs.
   No external library needed. Only the public anon / publishable key is ever used here. */
(function () {
  "use strict";
  var cfg = window.SHUX_CONFIG || {};
  var URL_ = String(cfg.supabaseUrl || "").trim().replace(/\/+$/, "");
  var KEY = String(cfg.supabaseAnonKey || "").trim();
  var SESSION_KEY = "shux_admin_session";
  var BUCKET = "media";

  function configured() { return !!(URL_ && KEY); }

  function store(k, v) { try { if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function load(k) { try { return JSON.parse(localStorage.getItem(k) || "null"); } catch (e) { return null; } }

  /* ---------- low-level request ---------- */
  function request(path, opts) {
    opts = opts || {};
    var headers = Object.assign({ apikey: KEY }, opts.headers || {});
    if (opts.token) headers.Authorization = "Bearer " + opts.token;
    if (opts.json !== undefined) { headers["Content-Type"] = "application/json"; }
    var ctrl = typeof AbortController !== "undefined" ? new AbortController() : null;
    var timer = ctrl && opts.timeout ? setTimeout(function () { ctrl.abort(); }, opts.timeout) : null;
    return fetch(URL_ + path, {
      method: opts.method || "GET",
      headers: headers,
      body: opts.json !== undefined ? JSON.stringify(opts.json) : opts.body,
      signal: ctrl ? ctrl.signal : undefined
    }).then(function (res) {
      if (timer) clearTimeout(timer);
      return res.text().then(function (txt) {
        var data = null;
        if (txt) { try { data = JSON.parse(txt); } catch (e) { data = txt; } }
        if (!res.ok) {
          var msg = (data && (data.msg || data.message || data.error_description || data.error)) || ("Request failed (" + res.status + ")");
          var err = new Error(typeof msg === "string" ? msg : JSON.stringify(msg));
          err.status = res.status; err.data = data;
          throw err;
        }
        return data;
      });
    });
  }

  /* ---------- Auth (GoTrue) ---------- */
  var session = load(SESSION_KEY);
  var listeners = [];
  function setSession(s) {
    if (s && s.access_token && !s.expires_at) s.expires_at = Math.floor(Date.now() / 1000) + (s.expires_in || 3600);
    session = s; store(SESSION_KEY, s);
    listeners.forEach(function (fn) { try { fn(s); } catch (e) {} });
  }
  var refreshing = null;
  function getToken() {
    if (!session) return Promise.reject(Object.assign(new Error("Not signed in"), { status: 401 }));
    var now = Math.floor(Date.now() / 1000);
    if (session.expires_at && session.expires_at - now > 60) return Promise.resolve(session.access_token);
    if (!refreshing) {
      refreshing = request("/auth/v1/token?grant_type=refresh_token", { method: "POST", json: { refresh_token: session.refresh_token } })
        .then(function (s) { setSession(s); return s.access_token; })
        .catch(function (e) { setSession(null); throw e; })
        .then(function (t) { refreshing = null; return t; }, function (e) { refreshing = null; throw e; });
    }
    return refreshing;
  }
  function authed(path, opts) {
    return getToken().then(function (t) { return request(path, Object.assign({}, opts, { token: t })); })
      .catch(function (e) {
        if (e.status === 401 && session) setSession(null);
        throw e;
      });
  }

  var auth = {
    session: function () { return session; },
    onChange: function (fn) { listeners.push(fn); },
    signIn: function (email, password) {
      return request("/auth/v1/token?grant_type=password", { method: "POST", json: { email: email, password: password } })
        .then(function (s) { setSession(s); return s; });
    },
    signOut: function () {
      var t = session && session.access_token;
      setSession(null);
      if (!t) return Promise.resolve();
      return request("/auth/v1/logout", { method: "POST", token: t }).catch(function () {});
    },
    user: function () { return authed("/auth/v1/user"); },
    sendReset: function (email, redirectTo) {
      return request("/auth/v1/recover?redirect_to=" + encodeURIComponent(redirectTo), { method: "POST", json: { email: email } });
    },
    updatePassword: function (password) { return authed("/auth/v1/user", { method: "PUT", json: { password: password } }); },
    // Reads tokens Supabase puts in the URL after a password-reset email link.
    fromUrl: function () {
      var h = location.hash.replace(/^#/, "");
      if (h.indexOf("access_token=") < 0 && h.indexOf("error") < 0) return null;
      var p = {}; h.split("&").forEach(function (kv) { var i = kv.indexOf("="); if (i > 0) p[decodeURIComponent(kv.slice(0, i))] = decodeURIComponent(kv.slice(i + 1).replace(/\+/g, " ")); });
      history.replaceState(null, "", location.pathname + location.search);
      if (p.error || p.error_description) return { error: p.error_description || p.error };
      setSession({ access_token: p.access_token, refresh_token: p.refresh_token, expires_in: +p.expires_in || 3600, token_type: "bearer" });
      return { type: p.type || "" };
    },
    isAdmin: function () { return authed("/rest/v1/rpc/is_admin", { method: "POST", json: {} }).then(function (r) { return r === true; }); }
  };

  /* ---------- Database (PostgREST) ---------- */
  var db = {
    // Public: read website content (anonymous)
    getContent: function (timeout) {
      return request("/rest/v1/site_content?id=eq.main&select=data,updated_at", { timeout: timeout || 0 })
        .then(function (rows) { return rows && rows[0] ? rows[0] : null; });
    },
    // Admin: save website content
    saveContent: function (data) {
      var me = session && session.user ? session.user.id : null;
      return authed("/rest/v1/site_content?on_conflict=id", {
        method: "POST",
        headers: { Prefer: "resolution=merge-duplicates,return=representation" },
        json: { id: "main", data: data, updated_at: new Date().toISOString(), updated_by: me }
      }).then(function (rows) { return rows && rows[0]; });
    },
    // Public: send contact form inquiry (cannot read anything back)
    sendInquiry: function (row) {
      return request("/rest/v1/inquiries", { method: "POST", headers: { Prefer: "return=minimal" }, json: row, timeout: 15000 });
    },
    listInquiries: function () { return authed("/rest/v1/inquiries?select=*&order=created_at.desc&limit=500"); },
    markInquiry: function (id, read) { return authed("/rest/v1/inquiries?id=eq." + encodeURIComponent(id), { method: "PATCH", headers: { Prefer: "return=minimal" }, json: { is_read: !!read } }); },
    deleteInquiry: function (id) { return authed("/rest/v1/inquiries?id=eq." + encodeURIComponent(id), { method: "DELETE", headers: { Prefer: "return=minimal" } }); }
  };

  /* ---------- Storage ---------- */
  function encPath(p) { return p.split("/").map(encodeURIComponent).join("/"); }
  var storage = {
    publicUrl: function (path) { return URL_ + "/storage/v1/object/public/" + BUCKET + "/" + encPath(path); },
    upload: function (file, onProgress) {
      var clean = String(file.name || "file").toLowerCase().replace(/[^a-z0-9.\-_]+/g, "-").replace(/-+/g, "-").slice(-60);
      var path = Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 6) + "-" + clean;
      return getToken().then(function (token) {
        return new Promise(function (resolve, reject) {
          var xhr = new XMLHttpRequest();
          xhr.open("POST", URL_ + "/storage/v1/object/" + BUCKET + "/" + encPath(path));
          xhr.setRequestHeader("apikey", KEY);
          xhr.setRequestHeader("Authorization", "Bearer " + token);
          xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
          xhr.setRequestHeader("x-upsert", "false");
          xhr.setRequestHeader("cache-control", "max-age=31536000");
          if (xhr.upload && onProgress) xhr.upload.onprogress = function (e) { if (e.lengthComputable) onProgress(e.loaded / e.total); };
          xhr.onload = function () {
            if (xhr.status >= 200 && xhr.status < 300) resolve({ path: path, url: storage.publicUrl(path) });
            else {
              var m = "Upload failed (" + xhr.status + ")";
              try { var d = JSON.parse(xhr.responseText); m = d.message || d.error || m; } catch (e) {}
              reject(new Error(m));
            }
          };
          xhr.onerror = function () { reject(new Error("Upload failed — check your connection.")); };
          xhr.send(file);
        });
      });
    },
    list: function () {
      return authed("/storage/v1/object/list/" + BUCKET, {
        method: "POST",
        json: { prefix: "", limit: 1000, offset: 0, sortBy: { column: "created_at", order: "desc" } }
      }).then(function (items) {
        return (items || []).filter(function (f) { return f.id; }).map(function (f) {
          return { name: f.name, url: storage.publicUrl(f.name), size: f.metadata && f.metadata.size, type: (f.metadata && f.metadata.mimetype) || "", created_at: f.created_at };
        });
      });
    },
    remove: function (path) { return authed("/storage/v1/object/" + BUCKET, { method: "DELETE", json: { prefixes: [path] } }); }
  };

  window.SHUX_DB = { configured: configured, url: URL_, auth: auth, db: db, storage: storage };
})();
