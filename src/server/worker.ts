import { getAgentCatalog, CATALOG_VERSION, validateRenderSpec } from "../json-render/agentCatalog";
import { pages } from "../mock/content";

type Env = {
  ASSETS: Fetcher;
  DB: D1Database;
  API_TOKEN?: string;
};

type PostRow = {
  id: string;
  slug: string;
  title: string;
  status: "draft" | "published" | "archived";
  catalog_version: string;
  spec_json: string;
  author: string;
  current_revision: number;
  created_at: string;
  updated_at: string;
  published_at: string | null;
};

type FeatureRequestRow = {
  id: string;
  status: "open" | "accepted" | "rejected" | "shipped";
  requested_block: string;
  needed_for: string;
  reason: string;
  fallback: string | null;
  priority: "low" | "medium" | "high";
  source_post_id: string | null;
  created_at: string;
  created_by: string;
};

type PostInput = {
  slug?: unknown;
  title?: unknown;
  status?: unknown;
  author?: unknown;
  spec?: unknown;
  note?: unknown;
};

function json(body: unknown, init: ResponseInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("content-type", "application/json; charset=utf-8");
  return new Response(JSON.stringify(body, null, 2), {
    ...init,
    headers,
  });
}

function notFound() {
  return json({ error: "not_found" }, { status: 404 });
}

function badRequest(message: string, details?: unknown) {
  return json({ error: "bad_request", message, details }, { status: 400 });
}

function unauthorized() {
  return json({ error: "unauthorized" }, { status: 401 });
}

function serverError(message = "internal_error") {
  return json({ error: "internal_error", message }, { status: 500 });
}

function nowIso() {
  return new Date().toISOString();
}

function postFromRow(row: PostRow, includeSpec = true) {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    status: row.status,
    catalogVersion: row.catalog_version,
    author: row.author,
    currentRevision: row.current_revision,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    publishedAt: row.published_at,
    ...(includeSpec ? { spec: JSON.parse(row.spec_json) } : {}),
  };
}

function featureRequestFromRow(row: FeatureRequestRow) {
  return {
    id: row.id,
    status: row.status,
    requestedBlock: row.requested_block,
    neededFor: row.needed_for,
    reason: row.reason,
    fallback: row.fallback,
    priority: row.priority,
    sourcePostId: row.source_post_id,
    createdAt: row.created_at,
    createdBy: row.created_by,
  };
}

function isAuthorized(request: Request, env: Env) {
  if (!env.API_TOKEN) return false;
  const header = request.headers.get("authorization") ?? "";
  return header === `Bearer ${env.API_TOKEN}`;
}

async function readJson(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    throw new Error("Expected application/json");
  }
  return request.json();
}

async function ensureCatalogVersion(env: Env) {
  const catalog = getAgentCatalog();
  await env.DB.prepare(
    `INSERT OR REPLACE INTO catalog_versions
      (version, git_sha, catalog_json, created_at)
      VALUES (?, ?, ?, ?)`,
  )
    .bind(CATALOG_VERSION, null, JSON.stringify(catalog), nowIso())
    .run();
}

function builtInHistoryPost() {
  const page = pages.find((item) => item.path === "/published/league-history.html");
  if (!page) throw new Error("Built-in history article is missing");

  return {
    slug: "league-history",
    title: page.title,
    status: "published" as const,
    author: "seed",
    spec: page.spec,
  };
}

async function listPosts(request: Request, env: Env) {
  const url = new URL(request.url);
  const canReadDrafts = isAuthorized(request, env);
  const status = url.searchParams.get("status");

  const rows =
    canReadDrafts && status
      ? await env.DB.prepare(
          `SELECT * FROM posts WHERE status = ? ORDER BY updated_at DESC LIMIT 100`,
        )
          .bind(status)
          .all<PostRow>()
      : canReadDrafts
        ? await env.DB.prepare(
            `SELECT * FROM posts ORDER BY updated_at DESC LIMIT 100`,
          ).all<PostRow>()
        : await env.DB.prepare(
            `SELECT * FROM posts WHERE status = 'published' ORDER BY updated_at DESC LIMIT 100`,
          ).all<PostRow>();

  return json({
    posts: rows.results.map((row: PostRow) => postFromRow(row, false)),
  });
}

async function getPost(slug: string, request: Request, env: Env) {
  const row = await env.DB.prepare(`SELECT * FROM posts WHERE slug = ?`)
    .bind(slug)
    .first<PostRow>();

  if (!row) return notFound();
  if (row.status !== "published" && !isAuthorized(request, env)) {
    return unauthorized();
  }

  return json({ post: postFromRow(row) });
}

async function upsertPost(request: Request, env: Env, slugOverride?: string) {
  if (!isAuthorized(request, env)) return unauthorized();

  let body: PostInput;
  try {
    body = (await readJson(request)) as PostInput;
  } catch {
    return badRequest("Expected application/json request body");
  }

  const slug = String(slugOverride ?? body.slug ?? "").trim();
  const title = String(body.title ?? "").trim();
  const status = body.status === "published" ? "published" : "draft";
  const author = String(body.author ?? "agent").trim() || "agent";
  const note = typeof body.note === "string" ? body.note : null;

  if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return badRequest("slug must be lowercase kebab-case");
  }
  if (!title) return badRequest("title is required");

  const validation = validateRenderSpec(body.spec);
  if (!validation.success) {
    return badRequest("spec failed catalog validation", validation.errors);
  }

  await ensureCatalogVersion(env);

  const existing = await env.DB.prepare(`SELECT * FROM posts WHERE slug = ?`)
    .bind(slug)
    .first<PostRow>();

  const id = existing?.id ?? crypto.randomUUID();
  const revision = existing ? existing.current_revision + 1 : 1;
  const timestamp = nowIso();
  const specJson = JSON.stringify(body.spec);
  const publishedAt =
    status === "published" ? (existing?.published_at ?? timestamp) : existing?.published_at;

  await env.DB.batch([
    env.DB.prepare(
      existing
        ? `UPDATE posts
            SET title = ?, status = ?, catalog_version = ?, spec_json = ?,
                author = ?, current_revision = ?, updated_at = ?, published_at = ?
            WHERE id = ?`
        : `INSERT INTO posts
            (title, status, catalog_version, spec_json, author, current_revision,
             updated_at, published_at, id, slug)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).bind(
      title,
      status,
      CATALOG_VERSION,
      specJson,
      author,
      revision,
      timestamp,
      publishedAt ?? null,
      id,
      ...(existing ? [] : [slug]),
    ),
    env.DB.prepare(
      `INSERT INTO post_revisions
        (id, post_id, revision, catalog_version, spec_json, created_at, created_by, note)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    ).bind(
      crypto.randomUUID(),
      id,
      revision,
      CATALOG_VERSION,
      specJson,
      timestamp,
      author,
      note,
    ),
  ]);

  const row = await env.DB.prepare(`SELECT * FROM posts WHERE id = ?`)
    .bind(id)
    .first<PostRow>();

  return json({ post: row ? postFromRow(row) : null }, { status: existing ? 200 : 201 });
}

async function publishPost(slug: string, request: Request, env: Env) {
  if (!isAuthorized(request, env)) return unauthorized();

  const timestamp = nowIso();
  const result = await env.DB.prepare(
    `UPDATE posts
      SET status = 'published', updated_at = ?, published_at = COALESCE(published_at, ?)
      WHERE slug = ?`,
  )
    .bind(timestamp, timestamp, slug)
    .run();

  if (!result.meta.changes) return notFound();
  return getPost(slug, request, env);
}

async function seedBuiltIns(request: Request, env: Env) {
  if (!isAuthorized(request, env)) return unauthorized();
  const builtIn = builtInHistoryPost();

  const seedRequest = new Request(request.url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: request.headers.get("authorization") ?? "",
    },
    body: JSON.stringify({
      ...builtIn,
      note: "Seeded from built-in beta JSON article",
    }),
  });

  return upsertPost(seedRequest, env);
}

async function listFeatureRequests(env: Env) {
  const rows = await env.DB.prepare(
    `SELECT * FROM feature_requests ORDER BY created_at DESC LIMIT 100`,
  ).all<FeatureRequestRow>();

  return json({
    featureRequests: rows.results.map(featureRequestFromRow),
  });
}

async function createFeatureRequest(request: Request, env: Env) {
  if (!isAuthorized(request, env)) return unauthorized();

  let body: Record<string, unknown>;
  try {
    body = (await readJson(request)) as Record<string, unknown>;
  } catch {
    return badRequest("Expected application/json request body");
  }

  const requestedBlock = String(body.requestedBlock ?? "").trim();
  const neededFor = String(body.neededFor ?? "").trim();
  const reason = String(body.reason ?? "").trim();
  const fallback = typeof body.fallback === "string" ? body.fallback : null;
  const priority =
    body.priority === "high" || body.priority === "low" ? body.priority : "medium";
  const createdBy = String(body.createdBy ?? "agent").trim() || "agent";
  const sourcePostId =
    typeof body.sourcePostId === "string" && body.sourcePostId
      ? body.sourcePostId
      : null;

  if (!requestedBlock || !neededFor || !reason) {
    return badRequest("requestedBlock, neededFor, and reason are required");
  }

  const id = crypto.randomUUID();
  await env.DB.prepare(
    `INSERT INTO feature_requests
      (id, status, requested_block, needed_for, reason, fallback, priority,
       source_post_id, created_by)
      VALUES (?, 'open', ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(id, requestedBlock, neededFor, reason, fallback, priority, sourcePostId, createdBy)
    .run();

  const row = await env.DB.prepare(`SELECT * FROM feature_requests WHERE id = ?`)
    .bind(id)
    .first<FeatureRequestRow>();

  return json(
    { featureRequest: row ? featureRequestFromRow(row) : null },
    { status: 201 },
  );
}

async function handleApi(request: Request, env: Env) {
  const url = new URL(request.url);
  const method = request.method.toUpperCase();
  const path = url.pathname.replace(/\/+$/, "") || "/";

  if (method === "OPTIONS") {
    return new Response(null, { status: 204 });
  }

  if (path === "/api/health" && method === "GET") {
    return json({ ok: true, catalogVersion: CATALOG_VERSION });
  }

  if (path === "/api/catalog" && method === "GET") {
    await ensureCatalogVersion(env);
    return json(getAgentCatalog());
  }

  if (path === "/api/posts" && method === "GET") {
    return listPosts(request, env);
  }

  if (path === "/api/posts" && method === "POST") {
    return upsertPost(request, env);
  }

  const postMatch = path.match(/^\/api\/posts\/([^/]+)$/);
  if (postMatch && method === "GET") {
    return getPost(postMatch[1], request, env);
  }
  if (postMatch && method === "PATCH") {
    return upsertPost(request, env, postMatch[1]);
  }

  const publishMatch = path.match(/^\/api\/posts\/([^/]+)\/publish$/);
  if (publishMatch && method === "POST") {
    return publishPost(publishMatch[1], request, env);
  }

  if (path === "/api/admin/seed" && method === "POST") {
    return seedBuiltIns(request, env);
  }

  if (path === "/api/feature-requests" && method === "GET") {
    return listFeatureRequests(env);
  }
  if (path === "/api/feature-requests" && method === "POST") {
    return createFeatureRequest(request, env);
  }

  return notFound();
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/api/")) {
      try {
        return await handleApi(request, env);
      } catch (error) {
        console.error(JSON.stringify({ message: "api_error", error: String(error) }));
        return serverError();
      }
    }

    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
