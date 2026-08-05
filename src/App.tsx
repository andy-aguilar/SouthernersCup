import { Moon, Sun } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { JSONUIProvider, Renderer } from "@json-render/react";
import { registry } from "./json-render/registry";
import { findPageByPath, pages } from "./mock/content";

const THEME_KEY = "cup-theme";
const AUTH_KEY = "cup-auth-admin";
const ADMIN_PASSWORD = "tummysticks";

function getPath() {
  return window.location.pathname.replace(/\/$/, "") || "/";
}

function isAdminPath(path: string) {
  return path === "/admin" || path.startsWith("/admin/");
}

function getInitialTheme() {
  if (typeof window === "undefined") return "system";
  return localStorage.getItem(THEME_KEY) ?? "system";
}

function applyTheme(theme: string) {
  if (theme === "light" || theme === "dark") {
    document.documentElement.setAttribute("data-theme", theme);
    return;
  }
  document.documentElement.removeAttribute("data-theme");
}

export default function App() {
  const [path, setPath] = useState(getPath);
  const [theme, setTheme] = useState(getInitialTheme);
  const [adminUnlocked, setAdminUnlocked] = useState(
    () => sessionStorage.getItem(AUTH_KEY) === "1",
  );

  const page = useMemo(() => findPageByPath(path), [path]);
  const locked = isAdminPath(path) && !adminUnlocked;

  useEffect(() => {
    applyTheme(theme);
    if (theme === "light" || theme === "dark") {
      localStorage.setItem(THEME_KEY, theme);
    }
  }, [theme]);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      const link = (event.target as HTMLElement).closest("a[href]");
      if (!link) return;
      const anchor = link as HTMLAnchorElement;
      const url = new URL(anchor.href, window.location.href);
      if (
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        anchor.target ||
        url.origin !== window.location.origin
      ) {
        return;
      }
      event.preventDefault();
      window.history.pushState({}, "", url.pathname);
      setPath(getPath());
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }

    function onPopState() {
      setPath(getPath());
    }

    document.addEventListener("click", onClick);
    window.addEventListener("popstate", onPopState);
    return () => {
      document.removeEventListener("click", onClick);
      window.removeEventListener("popstate", onPopState);
    };
  }, []);

  useEffect(() => {
    document.title = page?.title
      ? `${page.title} - The Southerners Cup`
      : "The Southerners Cup";
  }, [page]);

  useEffect(() => {
    const id = window.setTimeout(() => {
      initRenderedDocument();
    }, 0);
    return () => window.clearTimeout(id);
  }, [path, page]);

  const currentIsDark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia?.("(prefers-color-scheme: dark)").matches);

  function unlock(password: string) {
    if (password !== ADMIN_PASSWORD) return false;
    sessionStorage.setItem(AUTH_KEY, "1");
    setAdminUnlocked(true);
    return true;
  }

  return (
    <>
      <header className="masthead">
        <div className="masthead-inner">
          <a className="wordmark" href="/">
            <span className="cup">SC</span>
            The Southerners Cup
          </a>
          <span className="spacer" />
          <span className="beta-pill">JSON beta</span>
          <button
            aria-label="Toggle theme"
            className="iconbtn"
            type="button"
            onClick={() => setTheme(currentIsDark ? "light" : "dark")}
          >
            {currentIsDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </header>

      <main className={locked ? "wrap locked-wrap" : "wrap"}>
        {page ? (
          <JSONUIProvider registry={registry}>
            <Renderer spec={page.spec} registry={registry} />
          </JSONUIProvider>
        ) : (
          <div className="empty">
            <p className="kicker">Missing page</p>
            <h1>Nothing published here yet.</h1>
            <p className="standfirst">
              This beta only has {pages.length} mock JSON-rendered pages wired
              up.
            </p>
            <a className="button-link primary" href="/">
              Back home
            </a>
          </div>
        )}

        <footer className="page-footer">
          <span className="sig">The Southerners Cup</span>
          <a href="/admin/">Commissioner's office</a>
        </footer>
      </main>

      {locked ? <AdminGate onUnlock={unlock} /> : null}
    </>
  );
}

function initRenderedDocument() {
  initTables();
  initSigns();
  initToc();
}

function cellValue(row: HTMLTableRowElement, index: number) {
  const cell = row.children[index];
  if (!cell) return { s: "" };
  const raw = (cell.getAttribute("data-sort") || cell.textContent || "").trim();
  const record = raw.match(/^(\d+)\s*-\s*(\d+)/);
  const num = Number.parseFloat(raw.replace(/[$,%\s]/g, "").replace(/^\+/, ""));
  if (record) {
    return { n: Number.parseFloat(record[1]) - Number.parseFloat(record[2]) * 0.001, s: raw };
  }
  return Number.isNaN(num) || !/\d/.test(raw)
    ? { s: raw.toLowerCase() }
    : { n: num, s: raw };
}

function initTables() {
  document.querySelectorAll("table").forEach((table) => {
    if (!table.parentElement?.classList.contains("table-wrap")) {
      const wrapper = document.createElement("div");
      wrapper.className = "table-wrap";
      table.parentNode?.insertBefore(wrapper, table);
      wrapper.appendChild(table);
    }

    const head = table.tHead;
    const body = table.tBodies[0];
    if (!head || !head.rows.length || !body || body.rows.length < 2) return;

    const headerRow = head.rows[0];

    Array.from(headerRow.cells).forEach((th, index) => {
      if ((th as HTMLElement).dataset.sortBound) return;
      (th as HTMLElement).dataset.sortBound = "1";
      th.setAttribute("data-sortable", "");
      th.setAttribute("tabindex", "0");

      function sort() {
        const ascending = th.getAttribute("aria-sort") !== "ascending";
        Array.from(headerRow.cells).forEach((other) => {
          other.removeAttribute("aria-sort");
        });
        th.setAttribute("aria-sort", ascending ? "ascending" : "descending");
        Array.from(body.rows)
          .sort((a, b) => {
            const x = cellValue(a, index);
            const y = cellValue(b, index);
            const result =
              typeof x.n === "number" && typeof y.n === "number"
                ? x.n - y.n
                : String(x.s).localeCompare(String(y.s), undefined, {
                    numeric: true,
                  });
            return ascending ? result : -result;
          })
          .forEach((row) => body.appendChild(row));
      }

      th.addEventListener("click", sort);
      th.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          sort();
        }
      });
    });
  });
}

function initSigns() {
  document.querySelectorAll("td, .stat .value").forEach((element) => {
    if (element.querySelector("*")) return;
    const text = element.textContent?.trim() ?? "";
    if (/^[+]\d/.test(text)) element.classList.add("pos");
    else if (/^[-−]\d/.test(text)) element.classList.add("neg");
  });
}

function initToc() {
  document.querySelectorAll("[data-toc]").forEach((host) => {
    host.textContent = "";
    const headings = document.querySelectorAll(".wrap h2");
    if (headings.length < 3) {
      host.remove();
      return;
    }
    const title = document.createElement("h4");
    const list = document.createElement("ol");
    title.textContent = "Contents";
    headings.forEach((heading, index) => {
      if (!heading.id) {
        heading.id = `s${index}-${(heading.textContent || "")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "")
          .slice(0, 40)}`;
      }
      const item = document.createElement("li");
      const link = document.createElement("a");
      link.href = `#${heading.id}`;
      link.textContent = heading.textContent;
      item.appendChild(link);
      list.appendChild(item);
    });
    host.appendChild(title);
    host.appendChild(list);
  });
}

function AdminGate({ onUnlock }: { onUnlock: (password: string) => boolean }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  return (
    <div className="auth-gate">
      <form
        className="auth-box"
        onSubmit={(event) => {
          event.preventDefault();
          const ok = onUnlock(password);
          setError(!ok);
        }}
      >
        <div className="crest">SC</div>
        <h1>Commissioner access</h1>
        <p>Enter the admin password to continue.</p>
        <label htmlFor="site-password">Password</label>
        <input
          autoFocus
          id="site-password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <button type="submit">Continue</button>
        {error ? <p className="auth-error show">Wrong password.</p> : null}
      </form>
    </div>
  );
}
