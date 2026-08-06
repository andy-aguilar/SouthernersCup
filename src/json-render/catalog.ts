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
  type: z.enum(["text", "number", "record", "percent"]).optional(),
});

const tableRow = z.record(z.string(), z.union([z.string(), z.number()]));
const richTableCell = z.union([
  z.string(),
  z.number(),
  z.object({
    title: z.string(),
    description: z.string().optional(),
  }),
]);

const richTable = z.object({
  title: z.string().optional(),
  caption: z.string().optional(),
  sortable: z.union([z.boolean(), z.array(z.string())]).optional(),
  className: z.string().optional(),
  columns: z.array(tableColumn),
  rows: z.array(z.record(z.string(), richTableCell)),
});

const cardGridItem = z.object({
  label: z.string().optional(),
  title: z.string(),
  body: z.string().optional(),
  meta: z.string().optional(),
});

const numberedListItem = z.object({
  number: z.number().optional(),
  title: z.string(),
  description: z.string().optional(),
  meta: z.string().optional(),
});

const bulletListItem = z.union([
  z.string(),
  z.object({
    title: z.string().optional(),
    body: z.string(),
  }),
]);

const markerItem = z.object({
  label: z.string(),
  initials: z.string(),
  hoverText: z.string(),
  href: z.string().optional(),
  color: z.string().optional(),
});

const chartItem = z.object({
  label: z.string(),
  value: z.number(),
  meta: z.string().optional(),
  color: z.string().optional(),
  hoverText: z.string().optional(),
});

export const catalog = defineCatalog(schema, {
  components: {
    Article: {
      props: z.object({
        className: z.string().optional(),
        marker: z
          .object({
            renderer: z.string().optional(),
            block: z.string().optional(),
            source: z.string().optional(),
          })
          .optional(),
      }),
      description: "Generic article/document wrapper for composed content blocks.",
    },
    ArticleHeader: {
      props: z.object({
        kicker: z.string().optional(),
        title: z.string(),
        standfirst: z.string().optional(),
        byline: z
          .object({
            author: z.string(),
            date: z.string(),
            tags: z.array(z.string()).optional(),
          })
          .optional(),
      }),
      description: "Editorial article header with optional byline metadata.",
    },
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
        id: z.string().optional(),
        level: z.enum(["h2", "h3"]).optional(),
      }),
      description: "Editorial section heading.",
    },
    Section: {
      props: z.object({
        id: z.string().optional(),
        kicker: z.string().optional(),
        title: z.string().optional(),
        standfirst: z.string().optional(),
        level: z.enum(["h2", "h3"]).optional(),
        layout: z.enum(["standard", "grid", "feature", "compact"]).optional(),
      }),
      description: "Generic article section with a heading and nested content.",
    },
    TableOfContents: {
      props: z.object({
        title: z.string().optional(),
        items: z.array(
          z.object({
            label: z.string(),
            href: z.string(),
          }),
        ),
      }),
      description: "Explicit navigation list for long documents.",
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
    RichDataTable: {
      props: richTable,
      description: "Reusable data table with sorting, alignment, and rich cells.",
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
    NumberedList: {
      props: z.object({
        title: z.string().optional(),
        caption: z.string().optional(),
        start: z.number().optional(),
        items: z.array(numberedListItem),
      }),
      description:
        "Generic numbered editorial list with optional item titles, descriptions, and explicit numbers.",
    },
    BulletList: {
      props: z.object({
        title: z.string().optional(),
        caption: z.string().optional(),
        items: z.array(bulletListItem),
      }),
      description:
        "Generic bulleted editorial list for requirements, checks, principles, and supporting points.",
    },
    QuoteBlock: {
      props: z.object({
        body: z.string(),
        cite: z.string().optional(),
      }),
      description: "Pull quote or quoted source text with optional citation.",
    },
    MarkdownProse: {
      props: z.object({
        markdown: z.string(),
      }),
      description: "Simple prose block; markdown support can expand over time.",
    },
    CardGrid: {
      props: z.object({
        columns: z.union([z.literal(2), z.literal(3), z.literal(4)]).optional(),
        items: z.array(cardGridItem),
      }),
      description: "Generic repeated editorial card grid.",
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
    MarkerStrip: {
      props: z.object({
        items: z.array(markerItem),
      }),
      description: "Responsive labeled marker strip with hover/focus text.",
    },
    BubbleChart: {
      props: z.object({
        title: z.string().optional(),
        caption: z.string().optional(),
        items: z.array(chartItem),
      }),
      description: "Proportional bubble chart sized by item value.",
    },
    DetailsSection: {
      props: z.object({
        summary: z.string(),
      }),
      description: "Expandable details section with nested content blocks.",
    },
    BarRace: {
      props: z.object({
        title: z.string().optional(),
        caption: z.string().optional(),
        valueLabel: z.string().optional(),
        max: z.number().optional(),
        sort: z
          .object({
            by: z.enum(["value", "label"]),
            direction: z.enum(["asc", "desc"]),
          })
          .optional(),
        items: z.array(
          z.object({
            label: z.string(),
            value: z.number(),
            color: z.string().optional(),
            description: z.string().optional(),
          }),
        ),
      }),
      description: "Horizontal bar comparison block that preserves JSON order by default.",
    },
    SeasonCapsules: {
      props: z.object({
        seasons: z.array(
          z.object({
            id: z.string(),
            summary: z.string(),
            overview: z.string().optional(),
            table: richTable.optional(),
          }),
        ),
      }),
      description: "Expandable repeated season recap sections.",
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
