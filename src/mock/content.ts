import type { Spec } from "@json-render/react";
import { historyArticleContent } from "./historyArticle";

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
              title: "Native History Article",
              meta: "The converted JSON Render version.",
              href: "/published/league-history.html",
            },
            {
              title: "History Migration Compare",
              meta: "Native beta and legacy production side by side.",
              href: "/published/league-history-compare.html",
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
        type: "HistoryArticle",
        props: historyArticleContent,
      },
    }),
  },
  {
    path: "/published/league-history-compare.html",
    title: "History Migration Compare",
    spec: spec("history-compare", {
      "history-compare": {
        type: "PageHeader",
        props: {
          kicker: "Migration QA",
          title: "History Migration Compare",
          standfirst:
            "Native JSON Render beta on the left, current production legacy article on the right.",
        },
        children: ["history-compare-frames"],
      },
      "history-compare-frames": {
        type: "ComparisonFrames",
        props: {
          nativeUrl: "/published/league-history.html?native-history=1",
          legacyUrl: "https://southernerscup.com/published/league-history",
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
            {
              title: "History Migration Compare",
              meta: "Native beta and legacy production side by side.",
              href: "/published/league-history-compare.html",
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
