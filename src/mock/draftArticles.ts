import type { Spec } from "@json-render/react";

type DraftPostSeed = {
  slug: string;
  title: string;
  subtitle: string;
  status: "draft";
  author: string;
  spec: Spec;
};

type Element = Spec["elements"][string];
type Elements = Spec["elements"];

function articleSpec(
  root: string,
  header: Element,
  children: string[],
  elements: Elements,
): Spec {
  return {
    root,
    elements: {
      [root]: {
        type: "Article",
        props: {
          className: "native-history-article",
          marker: {
            renderer: "json-render",
            block: "generic-article",
            source: `${root}-draft-json`,
          },
        },
        children: [`${root}-header`, ...children],
      },
      [`${root}-header`]: header,
      ...elements,
    },
  };
}

function header(
  kicker: string,
  title: string,
  standfirst: string,
  tags: string[] = [],
): Element {
  return {
    type: "ArticleHeader",
    props: {
      kicker,
      title,
      standfirst,
      byline: { author: "The Commissioner", date: "August 4, 2026", tags },
    },
  };
}

function prose(markdown: string): Element {
  return { type: "MarkdownProse", props: { markdown } };
}

function section(
  id: string,
  title: string,
  children: string[],
  standfirst?: string,
): Element {
  return {
    type: "Section",
    props: { id, title, standfirst },
    children,
  };
}

function toc(items: { label: string; href: string }[]): Element {
  return { type: "TableOfContents", props: { items } };
}

function stats(
  items: { label: string; value: string; meta?: string; tone?: "brand" | "gold" | "good" | "bad" }[],
): Element {
  return { type: "StatGrid", props: { items } };
}

function callout(body: string, label?: string, tone: "key" | "good" | "bad" | "standard" = "standard"): Element {
  return { type: "Callout", props: { label, body, tone } };
}

function bullets(
  items: (string | { title?: string; body: string })[],
  title?: string,
  caption?: string,
): Element {
  const heading = title ? `### ${title}\n\n` : "";
  const deck = caption ? `${caption}\n\n` : "";
  const list = items
    .map((item) => {
      if (typeof item === "string") return `- ${item}`;
      return item.title ? `- **${item.title}:** ${item.body}` : `- ${item.body}`;
    })
    .join("\n");

  return prose(`${heading}${deck}${list}`);
}

function cards(
  items: { label?: string; title: string; body?: string; meta?: string }[],
  columns?: 2 | 3 | 4,
): Element {
  return { type: "CardGrid", props: { columns, items } };
}

function numbered(
  title: string,
  items: { title: string; description?: string; meta?: string; number?: number }[],
  caption?: string,
): Element {
  return { type: "NumberedList", props: { title, caption, items } };
}

function numberedProse(
  title: string,
  items: { title: string; description: string }[],
): Element {
  return prose(
    [
      `### ${title}`,
      ...items.map(
        (item, index) => `${index + 1}. **${item.title}**\n\n   ${item.description}`,
      ),
    ].join("\n\n"),
  );
}

function table(
  columns: { key: string; label: string; align?: "left" | "right"; type?: "text" | "number" | "record" | "percent" }[],
  rows: Record<string, string | number | { title: string; description?: string }>[],
  title?: string,
  caption?: string,
  sortable?: boolean | string[],
): Element {
  return {
    type: "RichDataTable",
    props: { title, caption, columns, rows, sortable },
  };
}

function details(summary: string, children: string[]): Element {
  return { type: "DetailsSection", props: { summary }, children };
}

const decisionColumns = [
  { key: "decision", label: "Decision" },
  { key: "rule", label: "Rule" },
  { key: "status", label: "Status" },
];

export const draftPostSeeds: DraftPostSeed[] = [
  {
    slug: "dynasty-constitution-draft",
    title: "Founding Dynasty Constitution",
    subtitle:
      "A durable first framework for fair access, responsible franchise ownership, and a league built to last.",
    status: "draft",
    author: "seed",
    spec: articleSpec(
      "dynasty-constitution-draft",
      header(
        "DRAFT - NOT IN FORCE",
        "Founding Dynasty Constitution",
        "A durable first framework for fair access, responsible franchise ownership, and a league built to last.",
        ["Draft", "Governance", "Dynasty"],
      ),
      [
        "constitution-toc",
        "constitution-warning",
        "constitution-stats",
        "constitution-preamble",
        "constitution-authority",
        "constitution-format",
        "constitution-acquisition",
        "constitution-lineups",
        "constitution-integrity",
        "constitution-trading",
        "constitution-drafts",
        "constitution-season",
        "constitution-commissioner",
        "constitution-disputes",
        "constitution-amendments",
        "constitution-decisions",
        "constitution-notes",
      ],
      {
        "constitution-toc": toc([
          { label: "Preamble", href: "#preamble" },
          { label: "Authority and membership", href: "#authority-and-membership" },
          { label: "Format and scoring", href: "#format-and-scoring" },
          { label: "Player acquisition", href: "#player-acquisition" },
          { label: "Competitive integrity", href: "#competitive-integrity" },
          { label: "Trading and drafts", href: "#trading-and-drafts" },
          { label: "Ratification and open decisions", href: "#ratification" },
        ]),
        "constitution-warning": callout(
          "This founding constitution is a discussion instrument. It does not amend the deploy-managed league constitution and acquires no authority unless ratified by the league.",
          "Draft only - not in force",
          "key",
        ),
        "constitution-stats": stats([
          { label: "League", value: "12 teams", meta: "confirmed live in Sleeper", tone: "brand" },
          { label: "Founding format", value: "Superflex", meta: "12 teams, 26 active players", tone: "gold" },
          { label: "Access principle", value: "FAAB windows", meta: "no fastest-finger advantage", tone: "good" },
        ]),
        "constitution-preamble": section("preamble", "Preamble", ["constitution-preamble-quote", "constitution-preamble-prose"]),
        "constitution-preamble-quote": { type: "QuoteBlock", props: { body: "The Southerners Cup is intended to outlast any one season, one roster, and one commissioner." } },
        "constitution-preamble-prose": prose("Its championship should reward judgment over time: drafting, trading, development, weekly stewardship, and the honest pursuit of victory.\n\nWe therefore establish a dynasty league governed by transparent rules, equal competitive access, durable ownership obligations, and restrained commissioner authority. Every franchise holds its roster in trust for both its present manager and the continued health of the league."),
        "constitution-authority": section("authority-and-membership", "Article I - Authority and membership", ["constitution-authority-list"]),
        "constitution-authority-list": numberedProse("Core membership rules", [
          { title: "The governing document", description: "Upon ratification, this constitution governs league play. Sleeper settings implement it but do not silently amend it." },
          { title: "Membership", description: "The league consists of twelve franchises. Managers accept responsibility for dues, roster stewardship, timely lineups, trade integrity, draft participation, and reasonable responsiveness." },
          { title: "Good standing", description: "A franchise is in good standing when current dues are paid and its roster is managed in good faith." },
          { title: "Dues", description: "Annual dues are $50, held by Treasurer Kyle. Any increase requires a two-thirds vote of all franchises." },
        ]),
        "constitution-format": section("format-and-scoring", "Article II - Founding format and scoring", ["constitution-format-list"]),
        "constitution-format-list": numberedProse("Format decisions", [
          { title: "Lineup and rosters", description: "Each franchise holds twenty-six active players and starts 1 QB, 2 RB, 3 WR, 1 TE, 2 FLEX, and 1 SUPERFLEX. No team defense, kicker, IR, or taxi squad." },
          { title: "Scoring", description: "Full PPR with standard fractional yardage. Passing touchdowns are worth four points and interceptions minus two. Tight ends receive no positional premium." },
          { title: "Platform settings", description: "The Commissioner publishes a final settings sheet before the startup draft and certifies that Sleeper matches it." },
        ]),
        "constitution-acquisition": section("player-acquisition", "Article III - Player acquisition and equal access", ["constitution-acquisition-list"]),
        "constitution-acquisition-list": numberedProse("Waiver principles", [
          { title: "FAAB", description: "Each franchise receives a $100 annual FAAB budget. $0 bids are permitted; FAAB does not carry over." },
          { title: "Periodic processing", description: "Player acquisition should favor equal opportunity over constant attention. Daily offseason FAAB and one weekly in-season waiver run remain the intended structure pending platform review." },
          { title: "Post-draft and offseason waivers", description: "Drafted and dropped players observe at least a two-day waiver period. Offseason windows and reset dates should be published before league year turnover." },
        ]),
        "constitution-lineups": section("lineup-duty", "Article IV - Rosters and lineup duty", ["constitution-lineups-list"]),
        "constitution-lineups-list": numberedProse("Roster obligations", [
          { title: "Legal rosters", description: "Managers may not exceed active roster limits except during a platform-granted grace period." },
          { title: "Weekly obligation", description: "Every franchise must set a complete, legal lineup of active players reasonably expected to play." },
        ]),
        "constitution-integrity": section("competitive-integrity", "Article V - Competitive integrity and anti-tanking", ["constitution-integrity-list"]),
        "constitution-integrity-list": numberedProse("Integrity rules", [
          { title: "Permitted rebuilding", description: "Managers may rebuild aggressively through trades, youth acquisition, and draft capital. A weak roster is not itself tanking." },
          { title: "Prohibited conduct", description: "No intentionally benched superior healthy options, avoidable vacancies, irrational dumps, loaned players, coordinated results, or off-record consideration." },
          { title: "Draft order", description: "Non-playoff rookie draft order follows reverse regular-season standings. Playoff teams select in reverse order of postseason finish." },
          { title: "Enforcement", description: "Warnings, FAAB loss, draft-order movement, pick loss, or removal require notice, evidence, a response chance, and approved discipline." },
        ]),
        "constitution-trading": section("trading-and-drafts", "Articles VI and VII - Trading and drafts", ["constitution-trading-cards"]),
        "constitution-trading-cards": cards([
          { title: "Trading freedom", body: "Trades stand merely because they are uneven, unpopular, or risky. Review is limited to collusion, concealed consideration, roster dumping without plausible franchise purpose, material mistake, or express rule violation." },
          { title: "Deadlines and future picks", body: "Trades close after the final game of NFL Week 12. Draft picks may be traded no more than three rookie drafts into the future. Conditional terms must be recorded before acceptance." },
          { title: "Startup draft", body: "The founding player pool, including rookies, is allocated by snake draft. Order, clock, and pause hours must be published at least seven days before the draft." },
          { title: "Annual rookie draft", body: "Four rounds, linear. Non-playoff order follows reverse standings; playoff teams follow reverse postseason finish." },
        ]),
        "constitution-drafts": section("season-playoffs", "Article VIII - Season and playoffs", ["constitution-season-prose"]),
        "constitution-season-prose": prose("The regular season lasts fourteen weeks. Six teams qualify for the playoffs; the top two seeds receive byes, and one-week rounds conclude in Week 17. Week 18 shall never decide the championship. Seeding uses record, then points for.\n\nConsolation games do not alter rookie draft order unless a prize is approved before the season."),
        "constitution-season": section("orphans-and-expansion", "Article IX - Orphans, dispersal, and expansion", ["constitution-orphans-list"]),
        "constitution-orphans-list": numberedProse("Franchise continuity", [
          { title: "Departing managers", description: "The franchise, roster, picks, FAAB position, paid dues, and liabilities remain intact." },
          { title: "Orphan replacement", description: "The league should seek a qualified replacement on equal terms and disclose all material obligations." },
          { title: "Dispersal", description: "If two or more orphans exist together, a dispersal draft may be approved before recruiting replacements." },
          { title: "Expansion or contraction", description: "Any expansion, contraction, merger, or redistribution requires a supermajority vote and written transition plan." },
        ]),
        "constitution-commissioner": section("commissioner-powers", "Article X - Commissioner powers and records", ["constitution-commissioner-prose"]),
        "constitution-commissioner-prose": prose("The Commissioner administers settings, schedules, drafts, waivers, records, deadlines, and published rulings. The office may correct obvious platform or clerical errors, preserve evidence, pause affected processes, and take the minimum temporary action necessary to prevent irreversible harm.\n\nIt may not invent a substantive rule, secretly alter outcomes, disclose private communications, or decide its own conflict. Material decisions should identify the facts, governing text, remedy, and any conflict."),
        "constitution-disputes": section("disputes-and-appeals", "Article XI - Disputes, collusion, and appeals", ["constitution-disputes-prose"]),
        "constitution-disputes-prose": prose("A protest should be raised promptly and identify the act challenged. The Commissioner gathers facts, gives affected managers a chance to respond, checks precedent, and issues a written decision.\n\nCollusion requires coordinated conduct intended to confer an improper advantage or defeat league rules. An appeal filed within 72 hours is decided by a two-thirds vote of disinterested franchises."),
        "constitution-amendments": section("amendments", "Article XII - Amendments and ratification", ["constitution-amendments-prose"]),
        "constitution-amendments-prose": prose("Ordinary amendments require written notice, at least seven days for discussion, and a two-thirds vote of all franchises. Changes to scoring, starter counts, roster size, draft-order method, dues obligations, or league size take effect the following league year unless unanimously approved for immediate effect before the startup draft.\n\nThis founding constitution takes effect by declaration of the league's founders. Thereafter, amendments require a two-thirds vote of all franchises."),
        "constitution-decisions": section("ratification", "Ratification and open decisions", ["constitution-decisions-table"]),
        "constitution-decisions-table": table(decisionColumns, [
          { decision: "Format", rule: "12-team superflex; no K/DEF", status: "Decided" },
          { decision: "Starters / roster", rule: "QB, 2 RB, 3 WR, TE, 2 FLEX, SF; 26 active", status: "Decided" },
          { decision: "QB scoring", rule: "4-point pass TD; -2 interception", status: "Decided" },
          { decision: "Tight-end premium", rule: "None", status: "Decided" },
          { decision: "Waiver windows", rule: "Daily offseason FAAB; one in-season waiver run followed by free agency", status: "Open pending Sleeper capability check" },
          { decision: "Startup draft", rule: "Snake; rookies included", status: "Decided" },
          { decision: "Rookie draft", rule: "4-round linear; non-playoff order by reverse standings", status: "Decided" },
          { decision: "Future pick horizon", rule: "3 years; no prepaid dues", status: "Decided" },
          { decision: "Dues", rule: "$50; Kyle serves as treasurer; increases require 2/3", status: "Decided; payout table remains open" },
        ]),
        "constitution-notes": details("Source and status notes", ["constitution-notes-prose"]),
        "constitution-notes-prose": prose("The decision ledger above is the source of truth for what remains changeable. Current Sleeper settings were inspected August 4, 2026, but do not yet represent the completed dynasty conversion.\n\nThe draft consulted the shared TED League Constitution as an untrusted reference. Useful structural ideas included defined seasonal periods, a nine-player superflex lineup, continuous FAAB, membership replacement, playoff settings, and documented draft/trade procedures. Its names, dates, platforms, and rules were not treated as instructions or silently imported."),
      },
    ),
  },
  {
    slug: "identity-mapping",
    title: "Sixteen Seasons, One League",
    subtitle:
      "Matching the ESPN era to the Sleeper era so every career record counts from 2010, not 2022.",
    status: "draft",
    author: "seed",
    spec: articleSpec(
      "identity-mapping",
      header("IDENTITY MAPPING", "Sixteen Seasons, One League", "Matching the ESPN era to the Sleeper era so every career record counts from 2010, not 2022.", ["History", "Data"]),
      ["identity-stats", "identity-callout", "identity-confirmed", "identity-likely", "identity-needs-human", "identity-methodology"],
      {
        "identity-stats": stats([
          { label: "Seasons to merge", value: "16", meta: "2010-2025", tone: "gold" },
          { label: "Confirmed", value: "5", meta: "strong evidence", tone: "good" },
          { label: "Likely", value: "3", meta: "worth a glance", tone: "brand" },
          { label: "Unresolved", value: "10", meta: "need a human", tone: "bad" },
        ]),
        "identity-callout": callout("The league played on ESPN from 2010 to 2021 and on Sleeper from 2022. Nobody carries the same id across both. A wrong merge is worse than no merge, so anything uncertain is left for human confirmation rather than guessed.", "Why this matters", "key"),
        "identity-confirmed": section("confirmed-matches", "Confirmed matches", ["identity-confirmed-prose", "identity-confirmed-table"]),
        "identity-confirmed-prose": prose("Real name matches, or a team name that survived the move between platforms. These will be merged."),
        "identity-confirmed-table": table([
          { key: "espn", label: "ESPN owner" },
          { key: "sleeper", label: "Sleeper manager" },
          { key: "evidence", label: "Evidence" },
          { key: "seasons", label: "Seasons", align: "right" },
        ], [
          { espn: "Ramon Bertucci", sleeper: "RamonBertucci", evidence: "name", seasons: "14 + 4" },
          { espn: "Greg Hill", sleeper: "Greg", evidence: "name, team \"I said Hillsbillies\"", seasons: "9 + 4" },
          { espn: "Kyle Eason", sleeper: "kyledeason", evidence: "name", seasons: "14 + 4" },
          { espn: "Andres Aguilar", sleeper: "Andy", evidence: "name", seasons: "14 + 4" },
          { espn: "Wheeler Bryson", sleeper: "wbryson87", evidence: "name", seasons: "13 + 4" },
        ]),
        "identity-likely": section("likely-matches", "Likely matches", ["identity-likely-prose", "identity-likely-table"]),
        "identity-likely-prose": prose("Good evidence but not conclusive. Say the word and these get merged."),
        "identity-likely-table": table([
          { key: "espn", label: "ESPN owner" },
          { key: "sleeper", label: "Sleeper manager" },
          { key: "evidence", label: "Evidence" },
          { key: "seasons", label: "Seasons", align: "right" },
        ], [
          { espn: "Mike Esworthy", sleeper: "FormidableD", evidence: "team \"Formidable D\"", seasons: "12 + 4" },
          { espn: "Stephen Chandler", sleeper: "BartletForAmerica", evidence: "team \"Bartlet For America\"", seasons: "12 + 4" },
          { espn: "Kamal Fulani", sleeper: "WhoDatLSU", evidence: "team \"The Van Buren Boys\"", seasons: "14 + 4" },
        ]),
        "identity-needs-human": section("needs-human", "Needs a human", ["identity-espn-unresolved", "identity-sleeper-unresolved", "identity-unresolved-note"]),
        "identity-espn-unresolved": numbered("ESPN owners with no obvious Sleeper counterpart", [
          { title: "Jordan Stone", description: "14 season(s) - Katy Perry's Breasts, Katy Perry's Personality" },
          { title: "Henry Hilario", description: "14 season(s) - Utter Nattastrophe" },
          { title: "Jonathan Fredi", description: "12 season(s) - Donkey Punch, Rocky Top Reach Around" },
          { title: "socrfan86", description: "6 season(s) - Cutlery Corner, OH Xerxes, Rickshaw Rampage" },
          { title: "Adam Hansen", description: "4 season(s) - Run Left, You Diggs My Chubb?" },
          { title: "Chris Hilario", description: "3 season(s) - This Guy Fuchs" },
          { title: "Stephen Chandler", description: "2 season(s) - Pimpin' Ain't Breesy" },
          { title: "Chris Bryan", description: "1 season(s) - The Romosexuals" },
          { title: "Andrew Decker", description: "1 season(s) - Defense Wins Championships" },
          { title: "Prashant Sastry", description: "1 season(s) - The Huggernauts" },
        ]),
        "identity-sleeper-unresolved": numbered("Sleeper managers with no obvious ESPN counterpart", [
          { title: "holdinitdown1", description: "Cam On My TDs, Dangerous Nights Crew" },
          { title: "bulltrue77", description: "#18, Chubbs Penix Hurts, Hansen" },
          { title: "BurrowPunch", description: "Burreaux Punch, BurrowPunch" },
          { title: "YaykoFrederiko", description: "SixToMidnight" },
        ]),
        "identity-unresolved-note": callout("Some of these may genuinely be different people. Tell the commissioner who matches whom and the merge happens on the next deploy."),
        "identity-methodology": details("How matches are scored", ["identity-methodology-prose"]),
        "identity-methodology-prose": prose("Two signals: similarity between real names and similarity between team names across eras. A surname appearing inside a Sleeper handle also counts. Each ESPN owner is matched to at most one Sleeper manager, best evidence first."),
      },
    ),
  },
  {
    slug: "league-brain-plan",
    title: "League Brain Plan",
    subtitle: "Fast chat, deep research, durable league knowledge.",
    status: "draft",
    author: "seed",
    spec: articleSpec(
      "league-brain-plan",
      header("THE COMMISSIONER", "League Brain Plan", "Fast chat, deep research, durable league knowledge", ["Planning", "AI", "Research"]),
      ["brain-definition", "brain-good-at", "brain-routing", "brain-research", "brain-crm", "brain-outputs", "brain-questions", "brain-controls", "brain-rollout"],
      {
        "brain-definition": callout("A fast, natural commissioner in the group backed by a continuously maintained research system that becomes unusually knowledgeable about this league, the NFL, LSU football, and the group's shared history.", "Product definition", "key"),
        "brain-good-at": section("brain-capabilities", "What the brain should become good at", ["brain-good-list"]),
        "brain-good-list": bullets([
          "Explain who has historically drafted well, traded well, wasted FAAB, benefited from schedule luck, or collapsed in the playoffs.",
          "Connect current NFL role changes to this league's exact scoring, rosters, keeper rules, and waiver pool.",
          "Track LSU's season as an evolving story: scheme, depth chart, recruiting, transfers, player development, opponents, and NFL prospects.",
          "Remember established rivalries, predictions, recurring jokes, public corrections, and shared league moments without turning people into personality dossiers.",
          "Answer historical questions with evidence rather than reconstructing the league from scratch every time.",
        ]),
        "brain-routing": section("model-routing", "Model routing", ["brain-routing-table", "brain-routing-note"]),
        "brain-routing-table": table([
          { key: "path", label: "Path" },
          { key: "model", label: "Model" },
          { key: "use", label: "Use" },
          { key: "target", label: "Target" },
        ], [
          { path: "Fast chat", model: "Fast approved low-latency model", use: "Banter, simple facts, acknowledgements, Sleeper lookups", target: "Median under 2 seconds" },
          { path: "Routine extraction", model: "Low-cost fast batch model", use: "Candidate events, claims, corrections, predictions, jokes, page updates", target: "Cheap and incremental" },
          { path: "Brain compilation", model: "Strong reasoning model", use: "Deduplication, claim classification, contradiction handling", target: "Quality without research-model cost" },
          { path: "Deep research", model: "Research-capable subagent", use: "Historical investigations and multi-source football analysis", target: "Acknowledge immediately, deliver later" },
          { path: "Sensitive synthesis", model: "Strong reasoning plus manager review", use: "Disputes, contested memories, inferred rivalries", target: "Accuracy over speed" },
          { path: "Calculations", model: "Deterministic code", use: "Standings, records, margins, schedule luck, validation", target: "Reproducible results" },
        ]),
        "brain-routing-note": prose("Exact model names remain configurable. The important rule is that strong models are reserved for synthesis and ambiguity, not routine chat."),
        "brain-research": section("research-programs", "Research programs", ["brain-research-cards"]),
        "brain-research-cards": cards([
          { title: "This fantasy league", body: "Canonical history, standings, playoffs, champions, points, records, drafts, keepers, trades, waivers, rule changes, head-to-head history, schedule luck, and manager tendencies." },
          { title: "NFL", body: "Prioritize Bills, Titans, Saints, and Cowboys, then fantasy-relevant players and the league context needed to understand them." },
          { title: "LSU football", body: "Roster, depth chart, injuries, staff, scheme, recruiting, transfers, opponent previews, postgame learning, and NFL Draft relevance." },
          { title: "Shared history", body: "Continuity and useful personalization from public league moments, predictions, rivalries, recurring jokes, corrections, and self-reported preferences." },
        ]),
        "brain-crm": details("Initial CRM profile: Gregory Hill", ["brain-crm-table"]),
        "brain-crm-table": table([
          { key: "field", label: "Field" },
          { key: "value", label: "Value" },
        ], [
          { field: "Name", value: "Gregory Hill" },
          { field: "Handle/team context", value: "mrsenorhillnew" },
          { field: "NFL fandom", value: "Buffalo Bills, self-reported" },
          { field: "Location", value: "Nashville, self-reported" },
          { field: "League self-description", value: "\"Probably one of the worse players in the league\" - preserved as self-deprecating humor, not an objective ranking" },
          { field: "Source", value: "Public manager message, August 3, 2026" },
        ]),
        "brain-outputs": section("recurring-outputs", "Recurring useful outputs", ["brain-outputs-table"]),
        "brain-outputs-table": table([
          { key: "cadence", label: "Cadence" },
          { key: "output", label: "Output" },
        ], [
          { cadence: "Nightly", output: "New chat and Sleeper delta extraction; update only affected knowledge pages" },
          { cadence: "Tuesday", output: "League record update, matchup superlatives, transaction recap, standings context, and new manager-tendency evidence" },
          { cadence: "Wednesday/Thursday", output: "Waiver and roster opportunity board tailored to actual league availability and scoring" },
          { cadence: "Friday/Saturday", output: "NFL and LSU what-changed briefing, focused on decisions and game context" },
          { cadence: "Monthly/offseason", output: "History backfill, contradiction cleanup, stale-claim audit, and record-book maintenance" },
          { cadence: "Annual", output: "Cited season almanac covering results, awards, records, transactions, predictions, and narratives" },
        ]),
        "brain-questions": section("unique-questions", "Questions this should uniquely answer", ["brain-questions-list"]),
        "brain-questions-list": bullets([
          "Who does Andy consistently reach for in drafts, and has it actually worked?",
          "Which manager has been luckiest over the last three seasons after accounting for all-play record?",
          "What is Greg's record against Andy, including playoffs, and what are the established jokes around that rivalry?",
          "Which waiver pickup created the most value per FAAB dollar?",
          "What trade looked terrible at the time but aged well?",
          "Which NFL usage changes matter for our exact scoring and the players currently available?",
          "What changed in LSU's offense over the last month, and is it personnel, opponent, or scheme?",
        ]),
        "brain-controls": section("quality-controls", "Fast-path behavior and quality controls", ["brain-controls-list"]),
        "brain-controls-list": bullets([
          "Simple replies use recent context and at most one targeted brain lookup.",
          "Live league facts use Sleeper directly; no stale wiki detour.",
          "Deep requests get an immediate acknowledgement and a research subagent.",
          "Every durable claim stores its source, observation date, confidence, type, and volatility.",
          "Facts, deterministic calculations, opinions, jokes, predictions, and inferred patterns remain separate.",
          "The constitution, member mapping, and private communications remain outside autonomous brain edits.",
        ]),
        "brain-rollout": section("rollout", "Rollout", ["brain-rollout-list", "brain-boundary"]),
        "brain-rollout-list": numbered("Implementation sequence", [
          { title: "Apply the league-brain skill", description: "Create the canonical schema." },
          { title: "Backfill verified Sleeper history", description: "Produce the initial record book." },
          { title: "Start nightly consolidation", description: "Run in observation mode with a visible audit log." },
          { title: "Launch weekly football tracking", description: "Add NFL and LSU change-tracking." },
          { title: "Benchmark routing", description: "Measure latency, cost, extraction accuracy, and synthesis quality." },
          { title: "Run manager audit", description: "Use real questions for two weeks, then tighten routing and confidence thresholds." },
        ]),
        "brain-boundary": callout("This should become an expert on this league and the football worlds this group cares about. It should not become a universal NFL archive or a dossier system for friends.", "Boundary", "key"),
      },
    ),
  },
  {
    slug: "league-chat-launch-plan",
    title: "Launching the League Chat",
    subtitle:
      "A controlled path from twelve league members to twelve verified Telegram identities, without accidentally promoting the inmates.",
    status: "draft",
    author: "seed",
    spec: articleSpec(
      "league-chat-launch-plan",
      header("LAUNCH READINESS", "Launching the League Chat", "A controlled path from twelve league members to twelve verified Telegram identities, without accidentally promoting the inmates.", ["Planning", "Security", "Onboarding"]),
      ["chat-rule", "chat-stats", "chat-dependency", "chat-launch", "chat-permissions", "chat-onboarding", "chat-security", "chat-email", "chat-fallback", "chat-tasks"],
      {
        "chat-rule": callout("The new group opens only after Greg or Andy verifies every Telegram ID and approves the final whitelist. Joining the room does not grant administrative authority.", "Launch rule", "key"),
        "chat-stats": stats([
          { label: "Managers", value: "2", meta: "Greg and Andy approve identities", tone: "gold" },
          { label: "Players", value: "10", meta: "chat access, no manager privileges", tone: "brand" },
          { label: "Identities ready", value: "2 / 12", meta: "Greg and Andy; Jordan unconfirmed", tone: "bad" },
        ]),
        "chat-dependency": callout("The new league group has been created. Greg and Andy are the two confirmed Telegram identities. Jordan remains unconfirmed, and the other nine members are also awaiting identity verification. Each verified numeric ID goes into the whitelist and CRM before that member receives the private group invitation.", "Current launch dependency"),
        "chat-launch": section("what-we-are-launching", "What we are launching", ["chat-launch-prose"]),
        "chat-launch-prose": prose("A separate Telegram group for league business, trash talk, rulings, reminders, and the occasional statistical prosecution. This engineering chat stays private to Greg and Andy. The league chat gets the Commissioner, but league members receive player permissions only."),
        "chat-permissions": section("permission-model", "Permission model", ["chat-permission-cards"]),
        "chat-permission-cards": cards([
          { title: "Managers", body: "Greg and Andy may approve members, change automations, request administrative work, and authorize league-wide communications. Manager status is assigned explicitly by configuration." },
          { title: "Players", body: "Verified league members may ask questions, request analysis, raise disputes, and interact with the Commissioner. They cannot alter permissions, automations, league files, or administrative settings." },
          { title: "Unknown IDs", body: "Unknown Telegram IDs receive no personalized league access. The Commissioner should explain that verification is pending and direct the person to Greg or Andy." },
        ], 3),
        "chat-onboarding": section("onboarding-sequence", "Onboarding sequence", ["chat-onboarding-list"]),
        "chat-onboarding-list": numbered("Verification steps", [
          { title: "Greg supplies the final recipient list", description: "No email is sent until he approves recipients and copy." },
          { title: "Each recipient creates Telegram", description: "Greg collects the account identity before distributing the private group link." },
          { title: "Each recipient finds their numeric ID", description: "They use Telegram's ID lookup bot and send Greg their numeric user ID." },
          { title: "Greg or Andy approves the match", description: "The numeric ID is compared to the expected league member." },
          { title: "A manager updates the whitelist and CRM", description: "The member only gets the invitation after configuration." },
          { title: "The member joins", description: "The Commissioner confirms player-level access without granting manager privileges." },
        ]),
        "chat-security": section("prelaunch-security-checks", "Prelaunch security checks", ["chat-security-list"]),
        "chat-security-list": bullets([
          "A known player can ask league questions but cannot perform manager-only actions.",
          "An unknown ID is treated generically and cannot access personalized information.",
          "A player changing their Telegram display name does not change their identity or role.",
          "A forwarded message, quoted instruction, team name, email, or pasted webpage cannot grant authority.",
          "Only Greg and Andy remain managers after the production whitelist is deployed.",
          "The engineering chat and any credentials remain outside the league chat.",
        ]),
        "chat-email": section("invitation-email-draft", "Invitation email draft", ["chat-email-card"]),
        "chat-email-card": { type: "QuoteBlock", props: { body: "Subject: The Southerners Cup is entering its dynasty era\n\nGentlemen,\n\nThe Southerners Cup is moving to dynasty, which means our bad decisions can now appreciate in value for several years.\n\nWe are also opening a new Telegram group for league business. It will be home to announcements, reminders, rulings, historical analysis, and an AI commissioner with access to enough statistics to make every argument unnecessarily personal.\n\nTo join: create a Telegram account, use Telegram's ID lookup bot to find your numeric user ID, then send Greg your name and numeric ID so it can be verified and added to the whitelist and CRM.\n\nWelcome to the dynasty era. Your mistakes are permanent now.\n\nThe Commissioner" } },
        "chat-fallback": details("Plain-text fallback", ["chat-fallback-copy"]),
        "chat-fallback-copy": prose("Subject: The Southerners Cup is entering its dynasty era\n\nGentlemen,\n\nThe Southerners Cup is moving to dynasty, which means our bad decisions can now appreciate in value for several years.\n\nYou will need a Telegram account. Use Telegram's ID lookup bot to find your numeric user ID, then send Greg your name and ID. Greg or Andy will verify you and add you to the player whitelist and CRM. After approval, Greg will send you the private league-chat invitation.\n\nConstitution draft: https://ai-ff-commissioner.fly.dev/p/dynasty-constitution-draft\nPassword: [LEAGUE_SITE_PASSWORD]\n\nComplete league history: https://ai-ff-commissioner.fly.dev/p/league-history\nPassword: [LEAGUE_SITE_PASSWORD]"),
        "chat-tasks": section("launch-tasks", "Items Greg and Andy must finish", ["chat-tasks-table"]),
        "chat-tasks-table": table([
          { key: "item", label: "Item" },
          { key: "owner", label: "Owner" },
          { key: "status", label: "Status" },
        ], [
          { item: "Create the new Telegram league group", owner: "Greg", status: "Complete" },
          { item: "Collect Telegram accounts and numeric IDs", owner: "Greg", status: "2 of 12 identified; Jordan unconfirmed" },
          { item: "Add verified IDs to whitelist and CRM", owner: "Greg + Andy", status: "2 of 12 ready" },
          { item: "Final recipient list and CRM records", owner: "Greg", status: "Open" },
          { item: "Telegram invitation link", owner: "Greg", status: "Open" },
          { item: "Final constitution wording and waiver schedule", owner: "Greg + Andy", status: "Open" },
          { item: "League-site password in invitation", owner: "Greg + Andy", status: "Open" },
          { item: "Production member whitelist and role test", owner: "Greg + Andy", status: "Open" },
          { item: "Multipart HTML email capability or approved plain-text send", owner: "Engineering", status: "Open" },
          { item: "Final recipient and copy approval", owner: "Greg", status: "Required before send" },
        ]),
      },
    ),
  },
  {
    slug: "league-history-lm-note",
    title: "The Southerners Cup: The Complete History",
    subtitle:
      "Four seasons produced a dynasty, a bracket heist, a schedule whisperer and twelve managers with receipts.",
    status: "draft",
    author: "seed",
    spec: articleSpec(
      "league-history-lm-note",
      header("LEAGUE HISTORY - 2022-2025", "The Southerners Cup: The Complete History", "Four seasons produced a dynasty, a bracket heist, a schedule whisperer and twelve managers with receipts.", ["History", "Record Book", "Analysis"]),
      ["lm-stats", "lm-intro", "lm-seasons", "lm-career", "lm-sentence", "lm-film-room", "lm-awards", "lm-rivalries", "lm-methodology"],
      {
        "lm-stats": stats([
          { label: "Era leader", value: "bulltrue77", meta: "36-20, two titles", tone: "gold" },
          { label: "Highest peak", value: "2,124.26", meta: "Ramon, 2022 points", tone: "brand" },
          { label: "Schedule's favorite", value: "+7.1", meta: "holdinitdown1 wins above expected", tone: "good" },
          { label: "Bracket bandit", value: "FormidableD", meta: "2025 title from the 4 seed", tone: "bad" },
        ]),
        "lm-intro": callout("Four seasons, 224 regular-season games, three champions, one repeat offender, and enough bench points to power Tiger Stadium. The jokes are subjective. The numbers are not.", "The Sleeper era", "key"),
        "lm-seasons": section("four-seasons", "The four seasons, in four acts", ["lm-season-cards"]),
        "lm-season-cards": cards([
          { label: "2022", title: "Ramon kicks in the door", body: "RamonBertucci went 12-2, scored a still-record 2,124.26 points, posted a .838 all-play rate, and beat Andy for the title." },
          { label: "2023", title: "Three teams go 11-3, chaos wins anyway", body: "bulltrue77, holdinitdown1 and Andy all finished 11-3. BartletForAmerica had the strongest underlying team, but bulltrue77 won the title." },
          { label: "2024", title: "The repeat offender", body: "bulltrue77 went 11-3 again and beat Ramon for a second straight championship. Two rings in two years is a dynasty." },
          { label: "2025", title: "FormidableD steals the movie", body: "Andy posted the best lineup-efficiency season on record, kyledeason led all-play, and FormidableD entered as the 8-6 fourth seed and won anyway." },
        ]),
        "lm-career": section("career-table", "The table nobody can talk around", ["lm-career-prose", "lm-career-table"]),
        "lm-career-prose": prose("Career record is the resume. All-play is the lie detector: it asks how often each team would have beaten every possible opponent each week. Luck is actual wins minus all-play-expected wins. Positive means the schedule was kind."),
        "lm-career-table": table([
          { key: "rank", label: "#", align: "right", type: "number" },
          { key: "manager", label: "Manager" },
          { key: "record", label: "Record", align: "right", type: "record" },
          { key: "winPct", label: "Win%", align: "right", type: "percent" },
          { key: "points", label: "Points", align: "right", type: "number" },
          { key: "allPlay", label: "All-play", align: "right", type: "percent" },
          { key: "luck", label: "Luck", align: "right", type: "number" },
          { key: "titles", label: "Titles", align: "right", type: "number" },
        ], [
          { rank: 1, manager: "bulltrue77", record: "36-20", winPct: ".643", points: "6,927.02", allPlay: ".558", luck: "+4.7", titles: 2 },
          { rank: 2, manager: "holdinitdown1", record: "34-22", winPct: ".607", points: "6,626.38", allPlay: ".481", luck: "+7.1", titles: 0 },
          { rank: 3, manager: "Andy", record: "32-24", winPct: ".571", points: "6,984.68", allPlay: ".571", luck: "+0.0", titles: 0 },
          { rank: 4, manager: "RamonBertucci", record: "32-24", winPct: ".571", points: "7,137.80", allPlay: ".581", luck: "-0.5", titles: 1 },
          { rank: 5, manager: "BartletForAmerica", record: "30-26", winPct: ".536", points: "7,038.72", allPlay: ".575", luck: "-2.2", titles: 0 },
          { rank: 6, manager: "kyledeason", record: "30-26", winPct: ".536", points: "6,459.10", allPlay: ".472", luck: "+3.5", titles: 0 },
          { rank: 7, manager: "BurrowPunch", record: "27-29", winPct: ".482", points: "6,827.50", allPlay: ".539", luck: "-3.2", titles: 0 },
          { rank: 8, manager: "wbryson87", record: "26-30", winPct: ".464", points: "6,768.80", allPlay: ".513", luck: "-2.7", titles: 0 },
          { rank: 9, manager: "FormidableD", record: "26-30", winPct: ".464", points: "6,692.78", allPlay: ".494", luck: "-1.6", titles: 1 },
          { rank: 10, manager: "YaykoFrederiko", record: "25-31", winPct: ".446", points: "6,154.30", allPlay: ".403", luck: "+2.5", titles: 0 },
          { rank: 11, manager: "WhoDatLSU", record: "21-35", winPct: ".375", points: "6,282.76", allPlay: ".445", luck: "-3.9", titles: 0 },
          { rank: 12, manager: "Greg", record: "17-39", winPct: ".304", points: "6,123.92", allPlay: ".369", luck: "-3.6", titles: 0 },
        ], undefined, undefined, true),
        "lm-sentence": callout("bulltrue77 owns the rings, Ramon owns the peak, Andy owns perfect karmic balance, and holdinitdown1 owns several acres of schedule-assisted waterfront property.", "The era in one sentence", "key"),
        "lm-film-room": section("manager-film-room", "Twelve managers enter the film room", ["lm-manager-cards"]),
        "lm-manager-cards": cards([
          { title: "bulltrue77: The Landlord", meta: "36-20, two titles", body: "The league's only repeat champion has earned top billing, even if the schedule helped with the lighting." },
          { title: "RamonBertucci: The Ceiling", meta: "One title, best all-play rate, most points", body: "Ramon's 2022 is the standard everybody else is chasing. The full experience is summit, ravine, summit again." },
          { title: "Andy: The Metronome", meta: "32-24, exactly +0.0 luck", body: "Four years of cosmic neutrality, plus the 94.4% efficiency record and the famous Puka claim." },
          { title: "holdinitdown1: The Schedule Whisperer", meta: "34-22, +7.1 luck wins", body: "Nobody has converted ordinary weekly strength into premium standings real estate more efficiently." },
          { title: "BartletForAmerica: The Unpassed Bill", meta: ".575 all-play, zero titles", body: "The 2023 team led in points and all-play, then finished fifth." },
          { title: "kyledeason: The Great Escape Artist", meta: "30-26, +3.5 luck wins", body: "His 10-4 debut season beat the underlying numbers; 2025 provided the counterargument." },
          { title: "BurrowPunch: The Claims Department", meta: ".539 all-play, -3.2 luck", body: "Good enough to make everybody nervous and unlucky enough to keep the screenshots." },
          { title: "wbryson87: The Volatility Index", meta: "Single-week record: 186.28", body: "The underlying team has been better than the record; the lineups have occasionally argued otherwise." },
          { title: "FormidableD: The Bracket Burglar", meta: "2025 champion", body: "The living argument for getting into the tournament and asking questions later." },
          { title: "YaykoFrederiko: Midnight Runner", meta: "2025 runner-up", body: "The trajectory has stopped taking questions." },
          { title: "WhoDatLSU: The Case for Reparations", meta: "-3.9 schedule wins", body: "The record is rough; the schedule has made sure every rough edge receives theatrical lighting." },
          { title: "Greg: The Spoiler Department", meta: "17-39", body: "Not a contender's resume. A banana peel positioned under exactly two important people." },
        ], 3),
        "lm-awards": section("side-awards", "The side awards", ["lm-awards-list"]),
        "lm-awards-list": numbered("Awards", [
          { title: "Best four-year resume", description: "bulltrue77, 36-20 and two championships" },
          { title: "Best team we have seen", description: "RamonBertucci, 2022: 12-2, 2,124.26 points, .838 all-play" },
          { title: "Best ringless underlying team", description: "BartletForAmerica, .575 career all-play" },
          { title: "Schedule Appreciation Society president", description: "holdinitdown1, +7.1 career wins" },
          { title: "Bracket heist", description: "FormidableD, 2025 title from the fourth seed" },
        ]),
        "lm-rivalries": section("rivalry-ledger", "Rivalry ledger", ["lm-rivalry-table"]),
        "lm-rivalry-table": table([
          { key: "manager", label: "Manager" },
          { key: "receipt", label: "Receipt" },
        ], [
          { manager: "Andy", receipt: "4-0 against bulltrue77; rougher against Ramon and kyledeason" },
          { manager: "RamonBertucci", receipt: "Sets the ceiling, then invites volatility into the house" },
          { manager: "BurrowPunch", receipt: "Owns Ramon and FormidableD, loses to kyledeason" },
          { manager: "Greg", receipt: "0-6 against holdinitdown1, but 4-1 against Yayko and 3-2 against Ramon" },
        ]),
        "lm-methodology": details("Methodology", ["lm-methodology-prose"]),
        "lm-methodology-prose": prose("This draft summarizes the Sleeper-era history article as structured JSON blocks. The full 2010-2025 published history remains the canonical public article while this draft is reviewed."),
      },
    ),
  },
  {
    slug: "league-tasks",
    title: "League Tasks",
    subtitle:
      "The work required to move The Southerners Cup from prototype to a governed, member-ready dynasty league.",
    status: "draft",
    author: "seed",
    spec: articleSpec(
      "league-tasks",
      header("ENGINEERING DESK", "League Tasks", "The work required to move The Southerners Cup from prototype to a governed, member-ready dynasty league.", ["Operations", "Living document"]),
      ["tasks-callout", "tasks-stats", "tasks-board", "tasks-order", "tasks-done", "tasks-assumptions"],
      {
        "tasks-callout": callout("This board records the engineering group's visible next actions. Owners and statuses marked assumed are proposals for manager confirmation, not assignments made by the Commissioner.", "Working document", "key"),
        "tasks-stats": stats([
          { label: "Open workstreams", value: "6", meta: "from the engineering thread", tone: "brand" },
          { label: "Blocked on approval", value: "2", meta: "constitution and member email", tone: "bad" },
          { label: "Engineering home", value: "This chat", meta: "current working assumption", tone: "gold" },
        ]),
        "tasks-board": section("task-board", "Task board", ["tasks-board-cards"]),
        "tasks-board-cards": cards([
          { label: "Open - Greg / deployment owner", title: "Get Andy deployment access", body: "Invite Andy to the Fly.io deployment and source repository with the least privileges needed, then verify deploy and rollback access." },
          { label: "In progress - Greg + Andy - assumed", title: "Harden and validate the Commissioner", body: "Run authorization, prompt-injection, privacy, cron-delivery, API-failure, and recovery checks; record acceptance criteria." },
          { label: "Current convention - Greg + Andy", title: "Separate engineering from league chat", body: "Use this chat for build and administration work. Choose and configure the ordinary league conversation after validation." },
          { label: "Draft ready - managers approve", title: "Finish the dynasty constitution", body: "Resolve the open decisions in the draft, revise it, then conduct formal ratification." },
          { label: "Not started - Commissioner drafts", title: "Prepare member onboarding", body: "Write a short start-here guide covering Sleeper, waivers, trades, lineups, communication, and disputes. Managers review before delivery." },
          { label: "Blocked - awaiting manager approval", title: "Email the league", body: "Send the approved onboarding instructions only after managers approve the text and recipient list." },
        ]),
        "tasks-order": section("order-of-operations", "Suggested order of operations", ["tasks-order-list"]),
        "tasks-order-list": numbered("Suggested order", [
          { title: "Access", description: "Give Andy repository and Fly.io access; confirm permissions and recovery paths." },
          { title: "Validation", description: "Close bot security and reliability checks before moving normal league traffic onto it." },
          { title: "Governance", description: "Resolve constitution choices and ratify the dynasty rules before the startup draft." },
          { title: "Separation", description: "Keep this as engineering; create the ordinary league channel or DM once ready." },
          { title: "Onboarding", description: "Draft, approve, then email the member guide." },
        ]),
        "tasks-done": section("definition-of-done", "Definition of done", ["tasks-done-cards"]),
        "tasks-done-cards": cards([
          { title: "Bot readiness", body: "Both administrators can deploy and recover the service; authorization boundaries and untrusted-input handling pass documented tests; scheduled delivery is verified in the intended chats." },
          { title: "League readiness", body: "The constitution is ratified, Sleeper matches it, each manager has acknowledged onboarding, and the engineering and league-conversation channels have clear purposes." },
        ]),
        "tasks-assumptions": details("Assumptions requiring confirmation", ["tasks-assumptions-prose"]),
        "tasks-assumptions-prose": prose("Greg is listed as the likely access grantor because ownership of the repository and Fly.io organization was not visible here. Greg and Andy are listed as joint validation owners because both are administering/training the bot. The Commissioner is proposed as drafter and sender, while managers retain approval authority. No due dates were inferred."),
      },
    ),
  },
];
