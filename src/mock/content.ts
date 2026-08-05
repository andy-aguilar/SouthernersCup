import type { Spec } from "@json-render/react";

type Page = {
  path: string;
  title: string;
  spec: Spec;
};

function spec(root: string, elements: Spec["elements"]): Spec {
  return { root, elements };
}

export const pages: Page[] = [
  {
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
        children: ["home-stats", "home-callout", "home-entries"],
      },
      "home-stats": {
        type: "StatGrid",
        props: {
          items: [
            {
              label: "Archive",
              value: "16",
              meta: "seasons of grudges",
              tone: "gold",
            },
            {
              label: "Era",
              value: "Dynasty",
              meta: "new rules, old beef",
              tone: "brand",
            },
            {
              label: "Status",
              value: "Live",
              meta: "JSON-rendered beta",
              tone: "good",
            },
          ],
        },
      },
      "home-callout": {
        type: "Callout",
        props: {
          label: "A new era",
          tone: "key",
          body: "Welcome to the next chapter. As the league moves into dynasty, this archive keeps the champions, records, rivalries, rulings, and bad decisions in one place.",
        },
      },
      "home-entries": {
        type: "EntryGrid",
        props: {
          label: "Public archive",
          entries: [
            {
              title: "The Southerners Cup: A History",
              meta: "Sixteen seasons. Two platforms. One long argument.",
              href: "/published/league-history.html",
            },
          ],
        },
      },
    }),
  },
  {
    path: "/published/league-history.html",
    title: "The Southerners Cup: A History",
    spec: spec("history", {
      history: {
        type: "PageHeader",
        props: {
          kicker: "Public archive",
          title: "The Southerners Cup: A History",
          standfirst:
            "A beta remake of the current article, rendered from structured JSON blocks instead of hand-authored HTML.",
        },
        children: [
          "history-byline",
          "history-stats",
          "history-intro",
          "history-era-heading",
          "history-chart",
          "history-table",
          "history-rank-heading",
          "history-ranks",
          "history-callout",
        ],
      },
      "history-byline": {
        type: "Byline",
        props: {
          author: "Commissioner's office",
          date: "2026 beta",
          tags: ["history", "dynasty", "json"],
        },
      },
      "history-stats": {
        type: "StatGrid",
        props: {
          items: [
            { label: "Seasons", value: "16", meta: "2010s to now", tone: "gold" },
            { label: "Platforms", value: "2", meta: "Yahoo and ESPN" },
            { label: "Format", value: "Dynasty", meta: "starting 2026", tone: "good" },
          ],
        },
      },
      "history-intro": {
        type: "Prose",
        props: {
          paragraphs: [
            "The Southerners Cup has always been part fantasy league, part civic institution, and part group text with standings attached.",
            "This beta page proves the new publishing model: the article structure, tables, charts, callouts, and rankings are all declared as JSON and rendered by site-owned components.",
          ],
        },
      },
      "history-era-heading": {
        type: "SectionHeading",
        props: { title: "The Dynasty Pivot" },
      },
      "history-chart": {
        type: "ChartBars",
        props: {
          title: "Mock title ledger",
          caption:
            "Temporary sample data. The real backend can replace this with historical league records.",
          items: [
            { label: "Stone", value: 4, tone: "gold" },
            { label: "Andy", value: 3, tone: "brand" },
            { label: "Ramon", value: 2, tone: "good" },
            { label: "The Field", value: 7 },
          ],
        },
      },
      "history-table": {
        type: "DataTable",
        props: {
          title: "Sample era table",
          columns: [
            { key: "era", label: "Era" },
            { key: "format", label: "Format" },
            { key: "status", label: "Status" },
            { key: "chaos", label: "Chaos", align: "right" },
          ],
          rows: [
            {
              era: "Classic",
              format: "Redraft",
              status: "Archived",
              chaos: "+8",
            },
            {
              era: "Transition",
              format: "Keeper-ish arguments",
              status: "Under review",
              chaos: "+12",
            },
            {
              era: "Dynasty",
              format: "Long-term consequences",
              status: "Incoming",
              chaos: "+99",
            },
          ],
        },
      },
      "history-rank-heading": {
        type: "SectionHeading",
        props: { title: "What This Unlocks", level: "h3" },
      },
      "history-ranks": {
        type: "RankList",
        props: {
          items: [
            {
              name: "Bot-authored league posts",
              detail:
                "The agent can compose from approved rich blocks without touching raw CSS or deploy plumbing.",
            },
            {
              name: "Validated data components",
              detail:
                "Tables and charts stay consistent because the renderer owns the markup.",
            },
            {
              name: "Feature requests as content",
              detail:
                "When the bot wants a new block, it can write a structured request for us to approve and build.",
            },
          ],
        },
      },
      "history-callout": {
        type: "Callout",
        props: {
          label: "Implementation note",
          tone: "key",
          body: "This page is not backed by a server yet. The mock content file is standing in for the future API/content store.",
        },
      },
    }),
  },
  {
    path: "/admin",
    title: "Commissioner's Office",
    spec: spec("admin", {
      admin: {
        type: "PageHeader",
        props: {
          kicker: "Private workspace",
          title: "Commissioner's office",
          standfirst:
            "Drafts, launch plans, record updates, and bot-authored feature requests for league administration.",
        },
        children: ["admin-entries"],
      },
      "admin-entries": {
        type: "EntryGrid",
        props: {
          label: "Admin documents",
          entries: [
            {
              title: "The Record Book",
              meta: "Structured record-table mockup rendered from JSON.",
              href: "/admin/record-book.html",
            },
            {
              title: "Bot Feature Requests",
              meta: "Mock queue for new rich content blocks.",
              href: "/admin/feature-requests.html",
            },
            {
              title: "Public History Article",
              meta: "Published page rendered through the beta JSON pipeline.",
              href: "/published/league-history.html",
            },
          ],
        },
      },
    }),
  },
  {
    path: "/admin/record-book.html",
    title: "The Record Book",
    spec: spec("records", {
      records: {
        type: "PageHeader",
        props: {
          kicker: "Private workspace",
          title: "The Record Book",
          standfirst:
            "A representative record page using structured stats, tables, and ranked lists.",
        },
        children: [
          "records-stats",
          "records-table",
          "records-heading",
          "records-ranks",
        ],
      },
      "records-stats": {
        type: "StatGrid",
        props: {
          items: [
            { label: "Records", value: "42", meta: "mock rows", tone: "gold" },
            { label: "Needs Review", value: "7", meta: "admin queue", tone: "bad" },
            { label: "Renderer", value: "JSON", meta: "component-backed", tone: "good" },
          ],
        },
      },
      "records-table": {
        type: "DataTable",
        props: {
          title: "Mock record ledger",
          columns: [
            { key: "record", label: "Record" },
            { key: "manager", label: "Manager" },
            { key: "season", label: "Season", align: "right" },
            { key: "value", label: "Value", align: "right" },
          ],
          rows: [
            {
              record: "Highest single-week score",
              manager: "Stone",
              season: 2018,
              value: 184.3,
            },
            {
              record: "Most suspicious playoff escape",
              manager: "Andy",
              season: 2021,
              value: "+1",
            },
            {
              record: "Best schedule luck",
              manager: "Ramon",
              season: 2023,
              value: "+6",
            },
          ],
        },
      },
      "records-heading": {
        type: "SectionHeading",
        props: { title: "Who The Schedule Treated Best", level: "h3" },
      },
      "records-ranks": {
        type: "RankList",
        props: {
          items: [
            {
              name: "Ramon",
              detail: "Versus scoring expectation: +6 wins. Clean spacing check.",
            },
            {
              name: "Stone",
              detail: "Soft middle stretch, then immediate karmic correction.",
            },
            {
              name: "Andy",
              detail: "No comment from the commissioner's office.",
            },
          ],
        },
      },
    }),
  },
  {
    path: "/admin/feature-requests.html",
    title: "Bot Feature Requests",
    spec: spec("feature-requests", {
      "feature-requests": {
        type: "PageHeader",
        props: {
          kicker: "Private workspace",
          title: "Bot Feature Requests",
          standfirst:
            "A mock queue for blocks the league bot wanted but could not safely render yet.",
        },
        children: ["request-one", "request-two"],
      },
      "request-one": {
        type: "FeatureRequest",
        props: {
          requestedBlock: "ManagerComparisonMatrix",
          neededFor: "Dynasty launch article",
          reason:
            "The bot wants a compact way to compare managers across titles, playoff appearances, trade aggression, and rivalry heat.",
          fallback: "DataTable",
          priority: "medium",
        },
      },
      "request-two": {
        type: "FeatureRequest",
        props: {
          requestedBlock: "RivalryTimeline",
          neededFor: "League history feature",
          reason:
            "The current article can describe rivalries in prose, but a dated timeline would make long-running grudges easier to scan.",
          fallback: "RankList",
          priority: "high",
        },
      },
    }),
  },
];

export function findPageByPath(path: string) {
  const normalized = path.replace(/\/$/, "") || "/";
  return pages.find((page) => page.path === normalized);
}
