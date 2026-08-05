(function () {
  "use strict";

  var THEME_KEY = "cup-theme";
  var AUTH_PREFIX = "cup-auth-";
  var PASSWORDS = {
    admin: "tummysticks"
  };

  function injectShellStyles() {
    if (document.getElementById("site-shell-styles")) return;
    var style = document.createElement("style");
    style.id = "site-shell-styles";
    style.textContent = [
      ".route-loading{cursor:progress}",
      ".auth-locked main,.auth-locked .masthead{filter:blur(6px);pointer-events:none;user-select:none}",
      ".auth-gate{position:fixed;inset:0;z-index:9999;display:grid;place-items:center;padding:1.15rem;background:color-mix(in srgb,var(--paper,#FBFAF7) 86%,transparent);backdrop-filter:blur(12px)}",
      ".auth-box{width:min(100%,23rem);background:var(--panel,#fff);border:1px solid var(--rule,#E3E0D8);border-radius:18px;padding:1.6rem;box-shadow:var(--shadow,0 10px 30px -14px rgba(0,0,0,.2));color:var(--ink,#15171C);font-family:var(--sans,system-ui,sans-serif)}",
      ".auth-box .crest{width:3rem;height:3rem;border-radius:12px;display:grid;place-items:center;background:linear-gradient(140deg,var(--brand,#4E1F87),var(--brand-2,#6D3BB0));color:#fff;font-weight:800;margin:0 0 1rem}",
      ".auth-box h1{font-size:1.35rem;line-height:1.15;margin:0 0 .45rem;letter-spacing:-.02em}",
      ".auth-box p{margin:0 0 1rem;color:var(--muted,#6B7280);font-size:.92rem;line-height:1.45}",
      ".auth-box label{display:block;font-weight:700;margin:0 0 .45rem;font-size:.86rem}",
      ".auth-box input{width:100%;padding:.8rem .9rem;font:inherit;color:var(--ink,#15171C);background:var(--paper,#FBFAF7);border:1px solid var(--rule,#E3E0D8);border-radius:10px}",
      ".auth-box input:focus{outline:2px solid var(--brand,#4E1F87);outline-offset:1px;border-color:transparent}",
      ".auth-box button{width:100%;margin-top:.9rem;padding:.82rem 1rem;font:700 .98rem/1 var(--sans,system-ui,sans-serif);color:#fff;background:var(--brand,#4E1F87);border:0;border-radius:10px;cursor:pointer}",
      ".auth-box button:hover{background:var(--brand-2,#6D3BB0)}",
      ".auth-error{display:none;color:var(--bad,#B3261E)!important;margin:.8rem 0 0!important;font-size:.87rem!important}",
      ".auth-error.show{display:block}"
    ].join("");
    document.head.appendChild(style);
  }

  function applyTheme(theme) {
    if (theme === "light" || theme === "dark") document.documentElement.setAttribute("data-theme", theme);
    else document.documentElement.removeAttribute("data-theme");
  }

  function currentIsDark() {
    var set = document.documentElement.getAttribute("data-theme");
    if (set) return set === "dark";
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  function initTheme() {
    try { applyTheme(localStorage.getItem(THEME_KEY)); } catch (e) {}
    document.querySelectorAll("[data-theme-toggle]").forEach(function (button) {
      if (button.dataset.siteBound) return;
      button.dataset.siteBound = "1";
      function label() {
        button.textContent = currentIsDark() ? "☀" : "☾";
        button.setAttribute("aria-label", "Toggle theme");
      }
      label();
      button.addEventListener("click", function () {
        var next = currentIsDark() ? "light" : "dark";
        applyTheme(next);
        try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
        label();
      });
    });
  }

  function cellValue(row, index) {
    var cell = row.children[index];
    if (!cell) return "";
    var raw = (cell.getAttribute("data-sort") || cell.textContent || "").trim();
    var record = raw.match(/^(\d+)\s*-\s*(\d+)/);
    var num = parseFloat(raw.replace(/[$,%\s]/g, "").replace(/^\+/, ""));
    if (record) return { n: parseFloat(record[1]) - parseFloat(record[2]) * 0.001, s: raw };
    return isNaN(num) || !/\d/.test(raw) ? { s: raw.toLowerCase() } : { n: num, s: raw };
  }

  function initTables() {
    document.querySelectorAll("table").forEach(function (table) {
      if (!(table.parentElement && table.parentElement.classList.contains("table-wrap"))) {
        var wrapper = document.createElement("div");
        wrapper.className = "table-wrap";
        table.parentNode.insertBefore(wrapper, table);
        wrapper.appendChild(table);
      }

      var head = table.tHead;
      var body = table.tBodies[0];
      if (!head || !head.rows.length || !body || body.rows.length < 2) return;

      Array.prototype.forEach.call(head.rows[0].cells, function (th, index) {
        if (th.dataset.sortBound) return;
        th.dataset.sortBound = "1";
        th.setAttribute("data-sortable", "");
        th.setAttribute("tabindex", "0");
        function sort() {
          var ascending = th.getAttribute("aria-sort") !== "ascending";
          Array.prototype.forEach.call(head.rows[0].cells, function (other) {
            other.removeAttribute("aria-sort");
          });
          th.setAttribute("aria-sort", ascending ? "ascending" : "descending");
          Array.prototype.slice.call(body.rows).sort(function (a, b) {
            var x = cellValue(a, index);
            var y = cellValue(b, index);
            var result = "n" in x && "n" in y
              ? x.n - y.n
              : String(x.s).localeCompare(String(y.s), undefined, { numeric: true });
            return ascending ? result : -result;
          }).forEach(function (row) {
            body.appendChild(row);
          });
        }
        th.addEventListener("click", sort);
        th.addEventListener("keydown", function (event) {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            sort();
          }
        });
      });
    });
  }

  function initSigns() {
    document.querySelectorAll("td, .stat .value").forEach(function (element) {
      if (element.querySelector("*")) return;
      var text = element.textContent.trim();
      if (/^[+]\d/.test(text)) element.classList.add("pos");
      else if (/^[-−]\d/.test(text)) element.classList.add("neg");
    });
  }

  function initToc() {
    document.querySelectorAll("[data-toc]").forEach(function (host) {
      host.textContent = "";
      var headings = document.querySelectorAll(".wrap h2");
      if (headings.length < 3) {
        host.remove();
        return;
      }
      var title = document.createElement("h4");
      var list = document.createElement("ol");
      title.textContent = "Contents";
      headings.forEach(function (heading, index) {
        if (!heading.id) {
          heading.id = "s" + index + "-" + (heading.textContent || "").toLowerCase()
            .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);
        }
        var item = document.createElement("li");
        var link = document.createElement("a");
        link.href = "#" + heading.id;
        link.textContent = heading.textContent;
        item.appendChild(link);
        list.appendChild(item);
      });
      host.appendChild(title);
      host.appendChild(list);
    });
  }

  function isAdminPath(pathname) {
    return pathname === "/admin" || pathname.indexOf("/admin/") === 0;
  }

  function isUnlocked(kind) {
    try { return sessionStorage.getItem(AUTH_PREFIX + kind) === "1"; } catch (e) { return false; }
  }

  function unlock(kind) {
    try { sessionStorage.setItem(AUTH_PREFIX + kind, "1"); } catch (e) {}
  }

  function ensureGate() {
    var existing = document.querySelector(".auth-gate");
    if (existing) existing.remove();

    if (!isAdminPath(window.location.pathname)) {
      document.body.classList.remove("auth-locked");
      return;
    }

    injectShellStyles();
    if (isUnlocked("admin")) {
      document.body.classList.remove("auth-locked");
      return;
    }

    document.body.classList.add("auth-locked");
    var gate = document.createElement("div");
    gate.className = "auth-gate";
    gate.innerHTML = [
      '<form class="auth-box" autocomplete="off">',
      '<div class="crest">SC</div>',
      '<h1>Commissioner access</h1>',
      '<p>Enter the admin password to continue.</p>',
      '<label for="site-password">Password</label>',
      '<input id="site-password" type="password" autocomplete="current-password">',
      '<button type="submit">Continue</button>',
      '<p class="auth-error">Wrong password.</p>',
      '</form>'
    ].join("");
    document.body.appendChild(gate);

    var form = gate.querySelector("form");
    var input = gate.querySelector("input");
    var error = gate.querySelector(".auth-error");
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (input.value === PASSWORDS.admin) {
        unlock("admin");
        gate.remove();
        document.body.classList.remove("auth-locked");
      } else {
        error.classList.add("show");
        input.select();
      }
    });
    setTimeout(function () { input.focus(); }, 0);
  }

  function bootPage() {
    initTheme();
    initTables();
    initSigns();
    initToc();
    ensureGate();
  }

  function shouldRoute(event, link) {
    if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;
    if (link.target && link.target !== "_self") return false;
    if (link.hasAttribute("download")) return false;
    var url = new URL(link.href, window.location.href);
    if (url.origin !== window.location.origin) return false;
    if (url.hash && url.pathname === window.location.pathname && url.search === window.location.search) return false;
    return true;
  }

  function swapPage(html, url, shouldPush) {
    var doc = new DOMParser().parseFromString(html, "text/html");
    var nextMain = doc.querySelector("main");
    var currentMain = document.querySelector("main");
    if (!nextMain || !currentMain) {
      window.location.href = url.href;
      return;
    }
    document.title = doc.title || document.title;
    currentMain.replaceWith(document.importNode(nextMain, true));
    if (shouldPush) history.pushState({}, "", url.href);
    window.scrollTo({ top: 0, left: 0, behavior: "instant" in document.documentElement.style ? "instant" : "auto" });
    bootPage();
  }

  function navigate(url, shouldPush) {
    document.documentElement.classList.add("route-loading");
    fetch(url.href, { credentials: "same-origin" })
      .then(function (response) {
        if (!response.ok) throw new Error("HTTP " + response.status);
        return response.text();
      })
      .then(function (html) {
        swapPage(html, url, shouldPush);
      })
      .catch(function () {
        window.location.href = url.href;
      })
      .finally(function () {
        document.documentElement.classList.remove("route-loading");
      });
  }

  document.addEventListener("click", function (event) {
    var link = event.target.closest && event.target.closest("a[href]");
    if (!link || !shouldRoute(event, link)) return;
    event.preventDefault();
    navigate(new URL(link.href, window.location.href), true);
  });

  window.addEventListener("popstate", function () {
    navigate(new URL(window.location.href), false);
  });

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bootPage);
  else bootPage();
})();
