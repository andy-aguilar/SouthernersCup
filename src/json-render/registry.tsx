import { defineRegistry } from "@json-render/react";
import type { CSSProperties } from "react";
import { catalog } from "./catalog";

function signedClass(value: string | number) {
  const text = String(value);
  if (/^[+]\d/.test(text)) return "pos";
  if (/^[-−]\d/.test(text)) return "neg";
  return undefined;
}

type NativeTable = {
  columns: string[];
  rows: string[][];
};

function TableView({
  className,
  table,
}: {
  className?: string;
  table: NativeTable;
}) {
  return (
    <div className="table-wrap">
      <table className={className}>
        <thead>
          <tr>
            {table.columns.map((column, index) => (
              <th className={index > 1 ? "num" : undefined} key={column}>
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td
                  className={[
                    cellIndex > 1 ? "num" : "",
                    signedClass(cell) ?? "",
                  ]
                    .join(" ")
                    .trim()}
                  key={`${rowIndex}-${cellIndex}`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export const { registry } = defineRegistry(catalog, {
  components: {
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
    SectionHeading: ({ props }) =>
      props.level === "h3" ? <h3>{props.title}</h3> : <h2>{props.title}</h2>,
    StatGrid: ({ props }) => (
      <div className="stats">
        {props.items.map((item) => (
          <div className={`stat ${item.tone ?? ""}`} key={item.label}>
            <p className="label">{item.label}</p>
            <p className="value">{item.value}</p>
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
      <>
        {props.title ? <h3>{props.title}</h3> : null}
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                {props.columns.map((column) => (
                  <th
                    className={column.align === "right" ? "num" : undefined}
                    key={column.key}
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {props.rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {props.columns.map((column) => {
                    const value = row[column.key] ?? "";
                    return (
                      <td
                        className={[
                          column.align === "right" ? "num" : "",
                          signedClass(value) ?? "",
                        ]
                          .join(" ")
                          .trim()}
                        key={column.key}
                      >
                        {value}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    ),
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
    HistoryArticle: ({ props }) => {
      const maxWins = Math.max(
        ...props.careerRows.map((row) => row.wins as number),
        1,
      );
      const titleTotals = props.careerRows.filter((row) => row.titles > 0);

      return (
        <article
          className="native-history-article"
          data-renderer="json-render"
          data-block="history-article"
          data-source="history-json"
        >
          <header className="article-header">
            <p className="kicker">{props.header.kicker}</p>
            <h1>{props.header.title}</h1>
            <p className="standfirst">{props.header.standfirst}</p>
            <div className="byline">
              <span className="who">{props.header.byline.author}</span>
              <span className="dot">/</span>
              <span>{props.header.byline.date}</span>
              <span className="byline-tags">
                {props.header.byline.tags.map((tag) => (
                  <span className="tag brand" key={tag}>
                    {tag}
                  </span>
                ))}
              </span>
            </div>
          </header>

          <nav className="toc" aria-label="Article sections">
            <h4>Contents</h4>
            <ol>
              {[
                ["Four eras, one long argument", "#four-eras"],
                ["The championship timeline", "#championship-timeline"],
                ["The career race", "#career-race"],
                ["The people who bent the timeline", "#timeline-benders"],
                ["Season by season", "#season-by-season"],
                ["The League Graveyard", "#league-graveyard"],
                ["What the numbers can and cannot say", "#methodology"],
              ].map(([label, href]) => (
                <li key={href}>
                  <a href={href}>{label}</a>
                </li>
              ))}
            </ol>
          </nav>

          <div className="stats">
            {props.stats.map((item) => (
              <div className={`stat ${item.tone ?? ""}`} key={item.label}>
                <p className="label">{item.label}</p>
                <p className="value name-value">{item.value}</p>
                {item.meta ? <p className="meta">{item.meta}</p> : null}
              </div>
            ))}
          </div>

          <div className="callout key">
            <span className="card-label">The whole story</span>
            <p>{props.intro}</p>
          </div>

          <h2 id="four-eras">Four eras, one long argument</h2>
          <div className="era-track">
            {props.eras.map((era) => (
              <article className="era" key={era.years}>
                <span className="card-label">{era.years}</span>
                <h3>{era.title}</h3>
                <p>{era.body}</p>
              </article>
            ))}
          </div>

          <h2 id="championship-timeline">The championship timeline</h2>
          <p>
            Hover or focus a node for the matchup. Tap one to jump directly to
            that season's expandable capsule.
          </p>
          <section className="card timeline-card">
            <div className="championship-timeline">
              {props.championships.map((season) => (
                <a
                  className="timeline-node"
                  href={`#season-${season.season}`}
                  key={season.season}
                  aria-label={season.popoverText}
                >
                  <span
                    className="timeline-dot"
                    style={{ backgroundColor: season.color }}
                  >
                    {season.initials.slice(0, 3)}
                  </span>
                  <span className="timeline-year">{season.season}</span>
                  <span className="timeline-popover" role="tooltip">
                    {season.popoverText}
                  </span>
                </a>
              ))}
            </div>
          </section>

          <h3>The title economy</h3>
          <p>
            Circle size follows championship count. Ramon's bubble is not a
            rendering error. It is the tax the rest of the league pays for
            remembering all sixteen seasons.
          </p>
          <section className="card title-bubbles">
            {titleTotals.map((row) => (
              <div className="title-bubble-item" key={row.manager}>
                <span
                  className="title-bubble"
                  style={{
                    backgroundColor: row.color,
                    "--titles": row.titles,
                  } as CSSProperties}
                  title={`${row.manager}: ${row.titles} title(s), ${row.championshipYears}`}
                >
                  {row.titles}
                </span>
                <span className="bubble-name">{row.manager.split(" ")[0]}</span>
                <span className="bubble-years">{row.championshipYears}</span>
              </div>
            ))}
          </section>

          <details>
            <summary>Every championship, season by season</summary>
            <TableView
              table={{
                columns: ["Season", "Champion", "Runner-up", "Platform"],
                rows: props.championships.map((season) => [
                  season.season,
                  season.champion,
                  season.runnerUp,
                  season.platform,
                ]),
              }}
            />
          </details>

          <h2 id="career-race">The career race</h2>
          <p>
            Hover or focus a bar for the full resume. Andy owns the raw-win
            lead; Ramon owns the trophy rebuttal.
          </p>
          <section className="card career-bars">
            {props.careerRows.map((row) => (
              <div
                className="career-row"
                key={row.manager}
                title={`${row.manager}: ${row.record} across ${row.seasons} seasons; ${row.titles} title(s); ${row.pointsFor} points`}
              >
                <span className="career-name">{row.manager}</span>
                <span className="career-track">
                  <span
                    className="career-fill"
                    style={{
                      backgroundColor: row.color,
                      width: `${(row.wins / maxWins) * 100}%`,
                    }}
                  />
                </span>
                <span className="career-wins">{row.wins}</span>
              </div>
            ))}
          </section>

          <h3>The career ledger</h3>
          <p>
            This is the manager-confirmed merge of ESPN and Sleeper identities.
            Sort any column to manufacture the argument you already wanted to
            make.
          </p>
          <TableView
            className="career-ledger"
            table={{
              columns: [
                "Manager",
                "Seasons",
                "Record",
                "Win%",
                "PF",
                "Titles",
                "Championship years",
              ],
              rows: props.careerRows.map((row) => [
                `${row.manager} / ${row.handle}`,
                row.seasons,
                row.record,
                row.winPct,
                row.pointsFor,
                String(row.titles),
                row.championshipYears,
              ]),
            }}
          />

          <h2 id="timeline-benders">The people who bent the timeline</h2>
          <div className="grid-2">
            {props.notablePeople.map((person) => (
              <div className="card" key={person.title}>
                <h3>{person.title}</h3>
                <p>{person.body}</p>
              </div>
            ))}
          </div>

          <h2 id="season-by-season">Season by season</h2>
          <p>
            Sixteen expandable capsules, for anyone who wants to remember
            exactly how the crime occurred.
          </p>
          {props.seasons.map((season) => (
            <details id={season.id} key={season.id}>
              <summary>{season.summary}</summary>
              <p>{season.overview}</p>
              <TableView table={season.standings} />
            </details>
          ))}

          <h2 id="league-graveyard">The League Graveyard</h2>
          <p>
            Not failures. Alumni. Men who entered the Cup, left behind records
            and team names, and departed before the Sleeper migration. Their
            games still count. Their identities are not forcibly merged into
            whoever happened to take the next open seat.
          </p>
          <div className="grid-2">
            {props.alumni.map((alum) => (
              <div className="card" key={alum.name}>
                <h3>{alum.name}</h3>
                <p>
                  <strong>{alum.record}</strong>
                </p>
                <p>{alum.teams}</p>
              </div>
            ))}
          </div>
          <div className="callout">
            <p>{props.identityNote}</p>
          </div>

          <h2 id="methodology">What the numbers can and cannot say</h2>
          <details>
            <summary>Methodology and provenance</summary>
            <p>{props.methodology}</p>
          </details>
        </article>
      );
    },
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
              <code>data-block="history-article"</code>
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
