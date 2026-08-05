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

function arrayTableToRichTable(
  columns: string[],
  rows: string[][],
  keyPrefix: string,
) {
  const keys = columns.map((_, index) => `${keyPrefix}-${index}`);

  return {
    columns: columns.map((column, index) => ({
      key: keys[index],
      label: column,
      align: index > 1 ? "right" : "left",
      type: index > 1 ? "number" : "text",
    })),
    rows: rows.map((row) =>
      Object.fromEntries(keys.map((key, index) => [key, row[index] ?? ""])),
    ),
  };
}

function historyArticleElements(): Spec["elements"] {
  const content = historyArticleContent;
  const titleTotals = content.careerRows.filter((row) => row.titles > 0);

  return {
    history: {
      type: "Article",
      props: {
        className: "native-history-article",
        marker: {
          renderer: "json-render",
          block: "generic-article",
          source: "history-json",
        },
      },
      children: [
        "history-header",
        "history-toc",
        "history-stats",
        "history-intro",
        "history-eras",
        "history-championships",
        "history-title-economy",
        "history-championship-details",
        "history-career",
        "history-timeline-benders",
        "history-seasons",
        "history-graveyard",
        "history-methodology",
      ],
    },
    "history-header": {
      type: "ArticleHeader",
      props: content.header,
    },
    "history-toc": {
      type: "TableOfContents",
      props: {
        items: [
          { label: "Four eras, one long argument", href: "#four-eras" },
          { label: "The championship timeline", href: "#championship-timeline" },
          { label: "The career race", href: "#career-race" },
          { label: "The people who bent the timeline", href: "#timeline-benders" },
          { label: "Season by season", href: "#season-by-season" },
          { label: "The League Graveyard", href: "#league-graveyard" },
          {
            label: "What the numbers can and cannot say",
            href: "#methodology",
          },
        ],
      },
    },
    "history-stats": {
      type: "StatGrid",
      props: {
        items: content.stats,
      },
    },
    "history-intro": {
      type: "Callout",
      props: {
        label: "The whole story",
        tone: "key",
        body: content.intro,
      },
    },
    "history-eras": {
      type: "Section",
      props: {
        id: "four-eras",
        title: "Four eras, one long argument",
      },
      children: ["history-era-cards"],
    },
    "history-era-cards": {
      type: "CardGrid",
      props: {
        items: content.eras.map((era) => ({
          label: era.years,
          title: era.title,
          body: era.body,
        })),
      },
    },
    "history-championships": {
      type: "Section",
      props: {
        id: "championship-timeline",
        title: "The championship timeline",
        standfirst:
          "Hover or focus a node for the matchup. Tap one to jump directly to that season's expandable capsule.",
      },
      children: ["history-marker-strip"],
    },
    "history-marker-strip": {
      type: "MarkerStrip",
      props: {
        items: content.championships.map((season) => ({
          label: season.season,
          initials: season.initials,
          hoverText: season.popoverText,
          href: `#season-${season.season}`,
          color: season.color,
        })),
      },
    },
    "history-title-economy": {
      type: "BubbleChart",
      props: {
        title: "The title economy",
        caption:
          "Circle size follows championship count. Ramon's bubble is not a rendering error. It is the tax the rest of the league pays for remembering all sixteen seasons.",
        items: titleTotals.map((row) => ({
          label: row.manager.split(" ")[0],
          value: row.titles,
          meta: row.championshipYears,
          color: row.color,
          hoverText: `${row.manager}: ${row.titles} title(s), ${row.championshipYears}`,
        })),
      },
    },
    "history-championship-details": {
      type: "DetailsSection",
      props: {
        summary: "Every championship, season by season",
      },
      children: ["history-championship-table"],
    },
    "history-championship-table": {
      type: "RichDataTable",
      props: {
        columns: [
          { key: "season", label: "Season" },
          { key: "champion", label: "Champion" },
          { key: "runnerUp", label: "Runner-up" },
          { key: "platform", label: "Platform" },
        ],
        rows: content.championships.map((season) => ({
          season: season.season,
          champion: season.champion,
          runnerUp: season.runnerUp,
          platform: season.platform,
        })),
      },
    },
    "history-career": {
      type: "Section",
      props: {
        id: "career-race",
        title: "The career race",
        standfirst:
          "Hover or focus a bar for the full resume. Andy owns the raw-win lead; Ramon owns the trophy rebuttal.",
      },
      children: ["history-career-bars", "history-career-ledger"],
    },
    "history-career-bars": {
      type: "BarRace",
      props: {
        items: content.careerRows.map((row) => ({
          label: row.manager,
          value: row.wins,
          color: row.color,
          description: `${row.manager}: ${row.record} across ${row.seasons} seasons; ${row.titles} title(s); ${row.pointsFor} points`,
        })),
      },
    },
    "history-career-ledger": {
      type: "RichDataTable",
      props: {
        title: "The career ledger",
        caption:
          "This is the manager-confirmed merge of ESPN and Sleeper identities. Sort any column to manufacture the argument you already wanted to make.",
        className: "career-ledger",
        sortable: true,
        columns: [
          { key: "manager", label: "Manager" },
          { key: "seasons", label: "Seasons" },
          { key: "record", label: "Record", align: "right", type: "record" },
          { key: "winPct", label: "Win%", align: "right", type: "percent" },
          { key: "pointsFor", label: "PF", align: "right", type: "number" },
          { key: "titles", label: "Titles", align: "right", type: "number" },
          {
            key: "championshipYears",
            label: "Championship years",
            align: "right",
          },
        ],
        rows: content.careerRows.map((row) => ({
          manager: { title: row.manager, description: row.handle },
          seasons: row.seasons,
          record: row.record,
          winPct: row.winPct,
          pointsFor: row.pointsFor,
          titles: row.titles,
          championshipYears: row.championshipYears,
        })),
      },
    },
    "history-timeline-benders": {
      type: "Section",
      props: {
        id: "timeline-benders",
        title: "The people who bent the timeline",
      },
      children: ["history-timeline-bender-cards"],
    },
    "history-timeline-bender-cards": {
      type: "CardGrid",
      props: {
        items: content.notablePeople,
      },
    },
    "history-seasons": {
      type: "Section",
      props: {
        id: "season-by-season",
        title: "Season by season",
        standfirst:
          "Sixteen expandable capsules, for anyone who wants to remember exactly how the crime occurred.",
      },
      children: ["history-season-capsules"],
    },
    "history-season-capsules": {
      type: "SeasonCapsules",
      props: {
        seasons: content.seasons.map((season) => ({
          id: season.id,
          summary: season.summary,
          overview: season.overview,
          table: arrayTableToRichTable(
            season.standings.columns,
            season.standings.rows,
            season.id,
          ),
        })),
      },
    },
    "history-graveyard": {
      type: "Section",
      props: {
        id: "league-graveyard",
        title: "The League Graveyard",
        standfirst:
          "Not failures. Alumni. Men who entered the Cup, left behind records and team names, and departed before the Sleeper migration. Their games still count. Their identities are not forcibly merged into whoever happened to take the next open seat.",
      },
      children: ["history-alumni-cards", "history-identity-note"],
    },
    "history-alumni-cards": {
      type: "CardGrid",
      props: {
        items: content.alumni.map((alum) => ({
          title: alum.name,
          meta: alum.record,
          body: alum.teams,
        })),
      },
    },
    "history-identity-note": {
      type: "Callout",
      props: {
        body: content.identityNote,
      },
    },
    "history-methodology": {
      type: "Section",
      props: {
        id: "methodology",
        title: "What the numbers can and cannot say",
      },
      children: ["history-methodology-details"],
    },
    "history-methodology-details": {
      type: "DetailsSection",
      props: {
        summary: "Methodology and provenance",
      },
      children: ["history-methodology-prose"],
    },
    "history-methodology-prose": {
      type: "MarkdownProse",
      props: {
        markdown: content.methodology,
      },
    },
  };
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
    spec: spec("history", historyArticleElements()),
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
        type: "NumberedList",
        props: {
          title: "Who The Schedule Treated Best",
          caption:
            "A generic numbered list block for ranked or ordered editorial callouts.",
          items: [
            {
              title: "Ramon",
              description: "Versus scoring expectation: +6 wins. Clean spacing check.",
            },
            {
              title: "Stone",
              description: "Soft middle stretch, then immediate karmic correction.",
            },
            {
              title: "Andy",
              description: "No comment from the commissioner's office.",
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
