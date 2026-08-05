import { defineRegistry } from "@json-render/react";
import { catalog } from "./catalog";

function signedClass(value: string | number) {
  const text = String(value);
  if (/^[+]\d/.test(text)) return "pos";
  if (/^[-−]\d/.test(text)) return "neg";
  return undefined;
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
    LegacyHtml: ({ props }) => (
      <div
        className="legacy-article"
        dangerouslySetInnerHTML={{ __html: props.html }}
      />
    ),
  },
});
