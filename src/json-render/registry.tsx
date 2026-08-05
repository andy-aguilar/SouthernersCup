import { defineRegistry } from "@json-render/react";
import type { CSSProperties } from "react";
import { useMemo, useState } from "react";
import { catalog } from "./catalog";

type RichTableCell = string | number | { title: string; description?: string };

type RichTableColumn = {
  key: string;
  label: string;
  align?: "left" | "right";
  type?: "text" | "number" | "record" | "percent";
};

type RichTable = {
  title?: string;
  caption?: string;
  sortable?: boolean | string[];
  className?: string;
  columns: RichTableColumn[];
  rows: Record<string, RichTableCell>[];
};

function signedClass(value: string | number) {
  const text = String(value);
  if (/^[+]\d/.test(text)) return "pos";
  if (/^[-−]\d/.test(text)) return "neg";
  return undefined;
}

function cellText(cell: RichTableCell) {
  return typeof cell === "object"
    ? [cell.title, cell.description].filter(Boolean).join(" ")
    : String(cell);
}

function sortKey(cell: RichTableCell, type?: RichTableColumn["type"]) {
  const text = cellText(cell).trim();
  const record = text.match(/^(\d+)\s*-\s*(\d+)/);

  if (type === "record" && record) {
    return Number(record[1]) - Number(record[2]) * 0.001;
  }

  const numeric = Number(text.replace(/[$,%\s,]/g, "").replace(/^\+/, ""));
  return Number.isFinite(numeric) && (type !== "text" || /\d/.test(text))
    ? numeric
    : text.toLowerCase();
}

function sortableColumn(sortable: RichTable["sortable"], key: string) {
  if (Array.isArray(sortable)) return sortable.includes(key);
  return Boolean(sortable);
}

function renderCell(cell: RichTableCell) {
  if (typeof cell !== "object") return cell;

  return (
    <>
      <strong>{cell.title}</strong>
      {cell.description ? <small>{cell.description}</small> : null}
    </>
  );
}

function normalizeInitials(value: string) {
  return value.replace(/[^a-z0-9]/gi, "").slice(0, 3).toUpperCase();
}

function RichTableView({ table }: { table: RichTable }) {
  const [sortState, setSortState] = useState<{
    column: string;
    direction: "asc" | "desc";
  } | null>(null);

  const rows = useMemo(() => {
    if (!sortState) return table.rows;

    const column = table.columns.find((item) => item.key === sortState.column);
    if (!column) return table.rows;

    return [...table.rows].sort((a, b) => {
      const aValue = sortKey(a[column.key] ?? "", column.type);
      const bValue = sortKey(b[column.key] ?? "", column.type);
      const comparison =
        typeof aValue === "number" && typeof bValue === "number"
          ? aValue - bValue
          : String(aValue).localeCompare(String(bValue), undefined, {
              numeric: true,
            });

      return sortState.direction === "asc" ? comparison : -comparison;
    });
  }, [sortState, table.columns, table.rows]);

  function changeSort(column: RichTableColumn) {
    if (!sortableColumn(table.sortable, column.key)) return;

    setSortState((current) => {
      if (current?.column !== column.key) {
        return { column: column.key, direction: "asc" };
      }
      if (current.direction === "asc") {
        return { column: column.key, direction: "desc" };
      }
      return null;
    });
  }

  return (
    <>
      {table.title ? <h3>{table.title}</h3> : null}
      {table.caption ? <p>{table.caption}</p> : null}
      <div className="table-wrap">
        <table className={table.className}>
          <thead>
            <tr>
              {table.columns.map((column) => {
                const canSort = sortableColumn(table.sortable, column.key);
                const active = sortState?.column === column.key;

                return (
                  <th
                    aria-sort={
                      active
                        ? sortState.direction === "asc"
                          ? "ascending"
                          : "descending"
                        : undefined
                    }
                    className={column.align === "right" ? "num" : undefined}
                    key={column.key}
                  >
                    {canSort ? (
                      <button
                        className="sort-button"
                        onClick={() => changeSort(column)}
                        type="button"
                      >
                        <span>{column.label}</span>
                        <span
                          className={[
                            "sort-arrows",
                            active ? `is-${sortState.direction}` : "",
                          ]
                            .join(" ")
                            .trim()}
                          aria-hidden="true"
                        >
                          <span className="sort-arrow sort-arrow-up" />
                          <span className="sort-arrow sort-arrow-down" />
                        </span>
                      </button>
                    ) : (
                      column.label
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {table.columns.map((column) => {
                  const value = row[column.key] ?? "";

                  return (
                    <td
                      className={[
                        column.align === "right" ? "num" : "",
                        typeof value === "object" ? "manager-cell" : "",
                        signedClass(cellText(value)) ?? "",
                      ]
                        .join(" ")
                        .trim()}
                      key={column.key}
                    >
                      {renderCell(value)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export const { registry } = defineRegistry(catalog, {
  components: {
    Article: ({ props, children }) => (
      <article
        className={props.className ?? "native-history-article"}
        data-renderer={props.marker?.renderer}
        data-block={props.marker?.block}
        data-source={props.marker?.source}
      >
        {children}
      </article>
    ),
    ArticleHeader: ({ props }) => (
      <header className="article-header">
        {props.kicker ? <p className="kicker">{props.kicker}</p> : null}
        <h1>{props.title}</h1>
        {props.standfirst ? (
          <p className="standfirst">{props.standfirst}</p>
        ) : null}
        {props.byline ? (
          <div className="byline">
            <span className="who">{props.byline.author}</span>
            <span className="dot">/</span>
            <span>{props.byline.date}</span>
            {props.byline.tags?.length ? (
              <span className="byline-tags">
                {props.byline.tags.map((tag) => (
                  <span className="tag brand" key={tag}>
                    {tag}
                  </span>
                ))}
              </span>
            ) : null}
          </div>
        ) : null}
      </header>
    ),
    PageHeader: ({ props, children }) => (
      <header className="article-header">
        <p className="kicker">{props.kicker}</p>
        <h1>{props.title}</h1>
        {props.standfirst ? (
          <p className="standfirst">{props.standfirst}</p>
        ) : null}
        {children}
      </header>
    ),
    Byline: ({ props }) => (
      <div className="byline">
        <span className="who">{props.author}</span>
        <span className="dot">/</span>
        <span>{props.date}</span>
        {props.tags?.length ? (
          <span className="byline-tags">
            {props.tags.map((tag) => (
              <span className="tag brand" key={tag}>
                {tag}
              </span>
            ))}
          </span>
        ) : null}
      </div>
    ),
    Prose: ({ props }) => (
      <>
        {props.paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </>
    ),
    MarkdownProse: ({ props }) => (
      <>
        {props.markdown
          .split(/\n{2,}/)
          .map((paragraph) => paragraph.trim())
          .filter(Boolean)
          .map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
      </>
    ),
    SectionHeading: ({ props }) =>
      props.level === "h3" ? (
        <h3 id={props.id}>{props.title}</h3>
      ) : (
        <h2 id={props.id}>{props.title}</h2>
      ),
    Section: ({ props, children }) => {
      const Heading = props.level === "h3" ? "h3" : "h2";

      return (
        <section
          className={props.layout ? `section section-${props.layout}` : "section"}
          id={props.id}
        >
          {props.kicker ? <p className="section-label">{props.kicker}</p> : null}
          {props.title ? <Heading>{props.title}</Heading> : null}
          {props.standfirst ? <p>{props.standfirst}</p> : null}
          {children}
        </section>
      );
    },
    TableOfContents: ({ props }) => (
      <nav className="toc" aria-label="Article sections">
        <h4>{props.title ?? "Contents"}</h4>
        <ol>
          {props.items.map((item) => (
            <li key={item.href}>
              <a href={item.href}>{item.label}</a>
            </li>
          ))}
        </ol>
      </nav>
    ),
    StatGrid: ({ props }) => (
      <div className="stats">
        {props.items.map((item) => (
          <div className={`stat ${item.tone ?? ""}`} key={item.label}>
            <p className="label">{item.label}</p>
            <p className="value name-value">{item.value}</p>
            {item.meta ? <p className="meta">{item.meta}</p> : null}
          </div>
        ))}
      </div>
    ),
    Callout: ({ props }) => (
      <div className={`callout ${props.tone ?? ""}`}>
        {props.label ? <span className="card-label">{props.label}</span> : null}
        <p>{props.body}</p>
      </div>
    ),
    EntryGrid: ({ props }) => (
      <>
        {props.label ? <p className="section-label">{props.label}</p> : null}
        <div className="entry-grid">
          {props.entries.map((entry) => (
            <a className="entry" href={entry.href} key={entry.href}>
              <p className="t">{entry.title}</p>
              {entry.meta ? <p className="m">{entry.meta}</p> : null}
            </a>
          ))}
        </div>
      </>
    ),
    DataTable: ({ props }) => (
      <RichTableView
        table={{
          title: props.title,
          columns: props.columns,
          rows: props.rows,
        }}
      />
    ),
    RichDataTable: ({ props }) => <RichTableView table={props} />,
    RankList: ({ props }) => (
      <ol className="ranklist">
        {props.items.map((item) => (
          <li key={item.name}>
            <span className="name">{item.name}</span>
            <span className="detail">{item.detail}</span>
          </li>
        ))}
      </ol>
    ),
    CardGrid: ({ props }) => (
      <div className="grid-2" data-columns={props.columns}>
        {props.items.map((item) => (
          <div className="card" key={`${item.title}-${item.label ?? ""}`}>
            {item.label ? <span className="card-label">{item.label}</span> : null}
            <h3>{item.title}</h3>
            {item.meta ? (
              <p>
                <strong>{item.meta}</strong>
              </p>
            ) : null}
            {item.body ? <p>{item.body}</p> : null}
          </div>
        ))}
      </div>
    ),
    ChartBars: ({ props }) => {
      const max = Math.max(...props.items.map((item) => item.value), 1);

      return (
        <section className="card chart-card">
          <h3>{props.title}</h3>
          {props.caption ? <p className="m">{props.caption}</p> : null}
          <div className="bar-chart">
            {props.items.map((item) => (
              <div className="bar-row" key={item.label}>
                <span className="bar-label">{item.label}</span>
                <span className="bar-track">
                  <span
                    className={`bar-fill ${item.tone ?? "brand"}`}
                    style={{ width: `${(item.value / max) * 100}%` }}
                  />
                </span>
                <span className="bar-value">{item.value}</span>
              </div>
            ))}
          </div>
        </section>
      );
    },
    MarkerStrip: ({ props }) => (
      <section className="card timeline-card">
        <div className="championship-timeline">
          {props.items.map((item) => {
            const content = (
              <>
                <span
                  className="timeline-dot"
                  style={{ backgroundColor: item.color }}
                >
                  {normalizeInitials(item.initials)}
                </span>
                <span className="timeline-year">{item.label}</span>
                <span className="timeline-popover" role="tooltip">
                  {item.hoverText}
                </span>
              </>
            );

            return item.href ? (
              <a
                className="timeline-node"
                href={item.href}
                key={`${item.label}-${item.hoverText}`}
                aria-label={item.hoverText}
              >
                {content}
              </a>
            ) : (
              <span
                className="timeline-node"
                key={`${item.label}-${item.hoverText}`}
                aria-label={item.hoverText}
                tabIndex={0}
              >
                {content}
              </span>
            );
          })}
        </div>
      </section>
    ),
    BubbleChart: ({ props }) => (
      <>
        {props.title ? <h3>{props.title}</h3> : null}
        {props.caption ? <p>{props.caption}</p> : null}
        <section className="card title-bubbles">
          {props.items.map((item) => (
            <div className="title-bubble-item" key={item.label}>
              <span
                className="title-bubble"
                style={{
                  backgroundColor: item.color,
                  "--titles": item.value,
                } as CSSProperties}
                title={item.hoverText ?? `${item.label}: ${item.value}`}
              >
                {item.value}
              </span>
              <span className="bubble-name">{item.label}</span>
              {item.meta ? <span className="bubble-years">{item.meta}</span> : null}
            </div>
          ))}
        </section>
      </>
    ),
    DetailsSection: ({ props, children }) => (
      <details>
        <summary>{props.summary}</summary>
        {children}
      </details>
    ),
    BarRace: ({ props }) => {
      const max = props.max ?? Math.max(...props.items.map((item) => item.value), 1);
      const items = props.sort
        ? [...props.items].sort((a, b) => {
            const comparison =
              props.sort?.by === "label"
                ? a.label.localeCompare(b.label, undefined, { numeric: true })
                : a.value - b.value;

            return props.sort?.direction === "asc" ? comparison : -comparison;
          })
        : props.items;

      return (
        <>
          {props.title ? <h3>{props.title}</h3> : null}
          {props.caption ? <p>{props.caption}</p> : null}
          <section className="card career-bars">
            {items.map((item) => (
              <div
                className="career-row"
                key={item.label}
                title={item.description}
              >
                <span className="career-name">{item.label}</span>
                <span className="career-track">
                  <span
                    className="career-fill"
                    style={{
                      backgroundColor: item.color,
                      "--wins-pct": `${(item.value / max) * 94}%`,
                    } as CSSProperties}
                  />
                  <span className="career-wins">{item.value}</span>
                </span>
              </div>
            ))}
          </section>
        </>
      );
    },
    SeasonCapsules: ({ props }) => (
      <>
        {props.seasons.map((season) => (
          <details id={season.id} key={season.id}>
            <summary>{season.summary}</summary>
            {season.overview ? <p>{season.overview}</p> : null}
            {season.table ? <RichTableView table={season.table} /> : null}
          </details>
        ))}
      </>
    ),
    FeatureRequest: ({ props }) => (
      <section className="card feature-request">
        <span className={`tag ${props.priority === "high" ? "gold" : "brand"}`}>
          {props.priority} priority
        </span>
        <h3>{props.requestedBlock}</h3>
        <p>{props.reason}</p>
        <dl>
          <div>
            <dt>Needed for</dt>
            <dd>{props.neededFor}</dd>
          </div>
          <div>
            <dt>Fallback</dt>
            <dd>{props.fallback}</dd>
          </div>
        </dl>
      </section>
    ),
    ComparisonFrames: ({ props }) => (
      <section className="comparison-page">
        <div className="comparison-toolbar">
          <a href={props.nativeUrl}>Open native beta</a>
          <a href={props.legacyUrl}>Open legacy production</a>
        </div>
        <div className="comparison-grid">
          <section className="comparison-pane">
            <div className="comparison-label">
              <span>Native JSON Render beta</span>
              <code>generic JSON blocks</code>
            </div>
            <iframe
              src={props.nativeUrl}
              title="Native JSON Render history article"
            />
          </section>
          <section className="comparison-pane">
            <div className="comparison-label">
              <span>Legacy production article</span>
              <code>static HTML</code>
            </div>
            <iframe src={props.legacyUrl} title="Legacy history article" />
          </section>
        </div>
      </section>
    ),
  },
});
