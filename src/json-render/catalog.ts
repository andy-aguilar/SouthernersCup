import { defineCatalog } from "@json-render/core";
import { schema } from "@json-render/react/schema";
import { z } from "zod";

const statItem = z.object({
  label: z.string(),
  value: z.string(),
  meta: z.string().optional(),
  tone: z.enum(["brand", "gold", "good", "bad"]).optional(),
});

const entryItem = z.object({
  title: z.string(),
  meta: z.string().optional(),
  href: z.string(),
});

const tableColumn = z.object({
  key: z.string(),
  label: z.string(),
  align: z.enum(["left", "right"]).optional(),
});

const tableRow = z.record(z.string(), z.union([z.string(), z.number()]));
const historyTable = z.object({
  columns: z.array(z.string()),
  rows: z.array(z.array(z.string())),
});

export const catalog = defineCatalog(schema, {
  components: {
    PageHeader: {
      props: z.object({
        kicker: z.string(),
        title: z.string(),
        standfirst: z.string().optional(),
      }),
      description: "Editorial page header for Southerners Cup pages.",
    },
    Byline: {
      props: z.object({
        author: z.string(),
        date: z.string(),
        tags: z.array(z.string()).optional(),
      }),
      description: "Article metadata row.",
    },
    Prose: {
      props: z.object({
        paragraphs: z.array(z.string()),
      }),
      description: "Article prose paragraphs.",
    },
    SectionHeading: {
      props: z.object({
        title: z.string(),
        level: z.enum(["h2", "h3"]).optional(),
      }),
      description: "Editorial section heading.",
    },
    StatGrid: {
      props: z.object({
        items: z.array(statItem),
      }),
      description: "Responsive row of league stat tiles.",
    },
    Callout: {
      props: z.object({
        label: z.string().optional(),
        body: z.string(),
        tone: z.enum(["key", "good", "bad", "standard"]).optional(),
      }),
      description: "Highlighted commissioner note or editorial callout.",
    },
    EntryGrid: {
      props: z.object({
        label: z.string().optional(),
        entries: z.array(entryItem),
      }),
      description: "Grid of linked documents or articles.",
    },
    DataTable: {
      props: z.object({
        title: z.string().optional(),
        columns: z.array(tableColumn),
        rows: z.array(tableRow),
      }),
      description: "Sortable-looking league data table with structured rows.",
    },
    RankList: {
      props: z.object({
        items: z.array(
          z.object({
            name: z.string(),
            detail: z.string(),
          }),
        ),
      }),
      description: "Ranked editorial list.",
    },
    ChartBars: {
      props: z.object({
        title: z.string(),
        caption: z.string().optional(),
        items: z.array(
          z.object({
            label: z.string(),
            value: z.number(),
            tone: z.enum(["brand", "gold", "good", "bad"]).optional(),
          }),
        ),
      }),
      description: "Simple bar chart for mock league history data.",
    },
    FeatureRequest: {
      props: z.object({
        requestedBlock: z.string(),
        neededFor: z.string(),
        reason: z.string(),
        fallback: z.string(),
        priority: z.enum(["low", "medium", "high"]),
      }),
      description: "Bot-authored request for a future renderer block.",
    },
    HistoryArticle: {
      props: z.object({
        header: z.object({
          kicker: z.string(),
          title: z.string(),
          standfirst: z.string(),
          byline: z.object({
            author: z.string(),
            date: z.string(),
            tags: z.array(z.string()),
          }),
        }),
        stats: z.array(statItem),
        intro: z.string(),
        eras: z.array(
          z.object({
            years: z.string(),
            title: z.string(),
            body: z.string(),
          }),
        ),
        championships: z.array(
          z.object({
            season: z.string(),
            champion: z.string(),
            runnerUp: z.string(),
            platform: z.string(),
            color: z.string(),
            initials: z.string(),
            popoverText: z.string(),
          }),
        ),
        careerRows: z.array(
          z.object({
            manager: z.string(),
            handle: z.string(),
            seasons: z.string(),
            record: z.string(),
            winPct: z.string(),
            pointsFor: z.string(),
            titles: z.number(),
            championshipYears: z.string(),
            wins: z.number(),
            color: z.string(),
          }),
        ),
        notablePeople: z.array(
          z.object({
            title: z.string(),
            body: z.string(),
          }),
        ),
        seasons: z.array(
          z.object({
            id: z.string(),
            summary: z.string(),
            overview: z.string(),
            standings: historyTable,
          }),
        ),
        alumni: z.array(
          z.object({
            name: z.string(),
            record: z.string(),
            teams: z.string(),
          }),
        ),
        identityNote: z.string(),
        methodology: z.string(),
      }),
      description:
        "Native structured renderer for the Southerners Cup history article.",
    },
    ComparisonFrames: {
      props: z.object({
        nativeUrl: z.string(),
        legacyUrl: z.string(),
      }),
      description: "Side-by-side article comparison frame for migration QA.",
    },
  },
  actions: {},
});
