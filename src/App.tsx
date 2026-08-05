import { Moon, Sun } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { JSONUIProvider, Renderer } from "@json-render/react";
import type { Spec } from "@json-render/react";
import { registry } from "./json-render/registry";

const THEME_KEY = "cup-theme";
const AUTH_KEY = "cup-auth-admin";
const ADMIN_PASSWORD = "tummysticks";

type Page = {
  path: string;
  title: string;
  spec: Spec;
};

type PostSummary = {
  slug: string;
  title: string;
  subtitle?: string | null;
  status: "draft" | "published" | "archived";
};

function getPath() {
  return window.location.pathname.replace(/\/$/, "") || "/";
}

function isAdminPath(path: string) {
  return path === "/admin" || path.startsWith("/admin/");
}

function slugForPostPath(path: string) {
  const match = path.match(/^\/p\/([a-z0-9]+(?:-[a-z0-9]+)*)$/);
  return match?.[1] ?? null;
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

function spec(root: string, elements: Spec["elements"]): Spec {
  return { root, elements };
}

function buildHomePage(posts: PostSummary[]): Page {
  return {
    path: "/",
    title: "The Southerners Cup",
    spec: spec("home", {
      home: {
        type: "PageHeader",
        props: {
          kicker: "Commissioner's desk",
          title: "The Southerners Cup",
          standfirst:
            "League history, dynasty documents, and commissioner notes for one long-running fantasy football argument.",
        },
        children: ["home-callout", "home-entries"],
      },
      "home-callout": {
        type: "Callout",
        props: {
          label: "A new era",
          tone: "key",
          body: "Welcome to the next chapter. Published posts below are loaded from the content API and rendered through the JSON block registry.",
        },
      },
      "home-entries": {
        type: "EntryGrid",
        props: {
          label: "Published posts",
          entries: posts.map((post) => ({
            title: post.title,
            meta: post.subtitle ?? "Published article",
            href: `/p/${post.slug}`,
          })),
        },
      },
    }),
  };
}

function buildAdminPage(): Page {
  return {
    path: "/admin",
    title: "Commissioner's Office",
    spec: spec("admin", {
      admin: {
        type: "PageHeader",
        props: {
          kicker: "Private workspace",
          title: "Commissioner's office",
          standfirst:
            "Non-published beta documents live here until we migrate them into real post records.",
        },
        children: ["admin-documents"],
      },
      "admin-documents": {
        type: "CardGrid",
        props: {
          items: [
            {
              label: "Draft",
              title: "The Record Book",
              meta: "Not migrated yet",
              body: "Structured record-table mockup from the JSON Render prototype.",
            },
            {
              label: "Draft",
              title: "Bot Feature Requests",
              meta: "Not migrated yet",
              body: "Mock queue for future renderer blocks requested by the league bot.",
            },
          ],
        },
      },
    }),
  };
}

export default function App() {
  const [path, setPath] = useState(getPath);
  const [theme, setTheme] = useState(getInitialTheme);
  const [adminUnlocked, setAdminUnlocked] = useState(
    () => sessionStorage.getItem(AUTH_KEY) === "1",
  );
  const [postIndex, setPostIndex] = useState<PostSummary[]>([]);
  const [remotePost, setRemotePost] = useState<{
    path: string;
    title: string;
    spec: Spec;
  } | null>(null);
  const [postLoading, setPostLoading] = useState(false);

  const postSlug = slugForPostPath(path);
  const homePage = useMemo(() => buildHomePage(postIndex), [postIndex]);
  const adminPage = useMemo(() => buildAdminPage(), []);
  const page = postSlug
    ? remotePost?.path === path
      ? remotePost
      : null
    : path === "/"
      ? homePage
      : isAdminPath(path)
        ? adminPage
        : null;
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
    const controller = new AbortController();

    fetch("/api/posts", {
      headers: { Accept: "application/json" },
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) throw new Error(`Post index failed: ${response.status}`);
        return response.json() as Promise<{ posts?: PostSummary[] }>;
      })
      .then((payload) => {
        setPostIndex(payload.posts ?? []);
      })
      .catch((error) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setPostIndex([]);
      });

    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!postSlug) {
      setRemotePost(null);
      setPostLoading(false);
      return;
    }

    const controller = new AbortController();
    setPostLoading(true);
    setRemotePost(null);

    fetch(`/api/posts/${postSlug}`, {
      headers: { Accept: "application/json" },
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) throw new Error(`Post request failed: ${response.status}`);
        return response.json() as Promise<{
          post?: { title?: string; spec?: Spec };
        }>;
      })
      .then((payload) => {
        if (!payload.post?.spec) {
          setPostLoading(false);
          return;
        }
        setRemotePost({
          path,
          title: payload.post.title ?? "Published post",
          spec: payload.post.spec,
        });
        setPostLoading(false);
      })
      .catch((error) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setRemotePost(null);
        setPostLoading(false);
      });

    return () => controller.abort();
  }, [path, postSlug]);

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
        ) : postSlug && postLoading ? (
          <div className="empty">
            <p className="kicker">Loading post</p>
            <h1>Fetching the article JSON.</h1>
            <p className="standfirst">
              The page shell is live; the post body is coming from the content API.
            </p>
          </div>
        ) : (
          <div className="empty">
            <p className="kicker">Missing page</p>
            <h1>Nothing published here yet.</h1>
            <p className="standfirst">
              Published articles now live under /p/:slug.
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
  initSigns();
  initToc();
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
