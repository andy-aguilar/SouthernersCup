import { legacyHistoryHtml } from "./legacyHistoryHtml";

type TableData = {
  columns: string[];
  rows: string[][];
};

function decodeHtml(value: string) {
  return value
    .replace(/&#x27;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&mdash;/g, "—");
}

function textFromHtml(value: string) {
  return decodeHtml(value)
    .replace(/<br\s*\/?>/g, " / ")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function parseTable(html: string): TableData {
  const columns = [...html.matchAll(/<th>([\s\S]*?)<\/th>/g)].map((match) =>
    textFromHtml(match[1]),
  );
  const rows = [...html.matchAll(/<tr>([\s\S]*?)<\/tr>/g)]
    .slice(1)
    .map((match) =>
      [...match[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map((cell) =>
        textFromHtml(cell[1]),
      ),
    );

  return { columns, rows };
}

const detailBlocks = [
  ...legacyHistoryHtml.matchAll(
    /<details(?: id="([^"]+)")?><summary>([\s\S]*?)<\/summary>([\s\S]*?)<\/details>/g,
  ),
];

const championshipTable = parseTable(
  detailBlocks[0]?.[3].match(/<table[^>]*>[\s\S]*?<\/table>/)?.[0] ?? "",
);

const careerLedgerTable = parseTable(
  legacyHistoryHtml.match(/<table class="history-table career-ledger">[\s\S]*?<\/table>/)?.[0] ??
    "",
);

const seasonCapsules = detailBlocks
  .filter((block) => block[1]?.startsWith("season-"))
  .map((block) => {
    const tableHtml = block[3].match(/<table[^>]*>[\s\S]*?<\/table>/)?.[0] ?? "";
    return {
      id: block[1],
      summary: textFromHtml(block[2]),
      overview: textFromHtml(block[3].match(/<p>([\s\S]*?)<\/p>/)?.[1] ?? ""),
      standings: parseTable(tableHtml),
    };
  });

const careerRows = careerLedgerTable.rows.map((row) => ({
  manager: row[0].split(" / ")[0],
  handle: row[0].split(" / ")[1] ?? "",
  seasons: row[1],
  record: row[2],
  winPct: row[3],
  pointsFor: row[4],
  titles: Number(row[5]),
  championshipYears: row[6],
}));

const managerColors: Record<string, string> = {
  "Adam Hansen": "#9c6644",
  "Andy Aguilar": "#e4572e",
  "Andrew Decker": "#6c757d",
  "Chris Bryan": "#2e86ab",
  "Chris Hilario": "#6c757d",
  "Greg Hill": "#f3a712",
  "Henry Hilario": "#f3a712",
  "Jacob Fredi": "#9c6644",
  "Jonathan Fredi": "#9c6644",
  "Jordan Stone": "#6c757d",
  "Kamal Fulani": "#9c6644",
  "Kyle Eason": "#e4572e",
  "Mike Esworthy": "#2e86ab",
  "Prashant Sastry": "#9c6644",
  "Ramon Bertucci": "#3a7d44",
  "Ravi Patel": "#e4572e",
  "Stephen Chandler": "#f3a712",
  "Wheeler Bryson": "#9c6644",
};

const championInitials: Record<string, string> = {
  "Adam Hansen": "AH",
  "Andy Aguilar": "AA",
  "Jordan Stone": "JS",
  "Kamal Fulani": "KF",
  "Kyle Eason": "KE",
  "Mike Esworthy": "ME",
  "Ramon Bertucci": "RB",
  "Stephen Chandler": "SC",
};

function timelineInitials(name: string) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("");

  return (initials || name).slice(0, 3).toUpperCase();
}

export const historyArticleContent = {
  header: {
    kicker: "League history",
    title: "The Southerners Cup: A History",
    standfirst:
      "Sixteen seasons, two platforms, nine champions, and one dynasty reset. This is how the league became itself.",
    byline: {
      author: "The Commissioner",
      date: "August 4, 2026",
      tags: ["History", "ESPN", "Sleeper"],
    },
  },
  stats: [
    { label: "Played seasons", value: "16", meta: "2010-2025", tone: "gold" },
    {
      label: "Most championships",
      value: "Ramon Bertucci",
      meta: "4 titles",
      tone: "good",
    },
    {
      label: "Most regular-season wins",
      value: "Andy Aguilar",
      meta: "129 wins",
    },
    {
      label: "Platform migrations survived",
      value: "1",
      meta: "ESPN to Sleeper",
      tone: "bad",
    },
  ],
  intro:
    "The Southerners Cup began in 2010 as a ten-team ESPN league, expanded, accumulated enough incriminating team names to qualify as a historical archive, moved to Sleeper in 2022, and is now preparing to become a dynasty league. Sixteen played seasons produced nine champions, several accidental eras, and one important conclusion: the platform changed; the grudges transferred cleanly.",
  eras: [
    {
      years: "2010-2014",
      title: "The Founding Chaos",
      body: "Ramon opened the book. Jordan answered with a 12-1 season. Kamal and Stephen joined the title trade while ten teams became twelve.",
    },
    {
      years: "2015-2021",
      title: "The ESPN Empire",
      body: "Andy and Ramon won twice each. The league acquired recurring brands, durable rivalries, and enough history to weaponize selectively.",
    },
    {
      years: "2022-2025",
      title: "The Sleeper Migration",
      body: "Ramon christened the platform, Adam repeated, and Mike closed the redraft era. The grudges survived the software update.",
    },
    {
      years: "2026 onward",
      title: "The Dynasty Reset",
      body: "Superflex, permanent assets, and mistakes that can no longer be quietly discarded in December. A clean slate with a very dirty archive.",
    },
  ],
  championships: championshipTable.rows.map((row) => ({
    season: row[0],
    champion: row[1],
    runnerUp: row[2],
    platform: row[3],
    color: managerColors[row[1]] ?? "#6c757d",
    initials: championInitials[row[1]] ?? timelineInitials(row[1]),
    popoverText: `${row[0]}: ${row[1]} defeated ${row[2]}`,
  })),
  careerRows: careerRows.map((row) => ({
    ...row,
    wins: Number(row.record.match(/^\d+/)?.[0] ?? 0),
    color: managerColors[row.manager] ?? "#6c757d",
  })),
  notablePeople: [
    {
      title: "Ramon: the institutional memory",
      body: "Four championships on two platforms: 2010, 2016, 2018, and 2022. Ramon won the first recorded Cup and the first Sleeper Cup, a deeply irritating form of historical symmetry. The league keeps changing the furniture and he keeps finding the trophy cabinet.",
    },
    {
      title: "Andy: the volume scorer",
      body: "Andy went 97-63-1 during the ESPN years, won in 2015 and 2021, and entered Sleeper as a perennial contender. \"Crushingly dominant\" is campaign language. \"Sustained excellence with two titles and an unusually committed press operation\" survives fact-checking.",
    },
    {
      title: "Adam: the repeat offender",
      body: "Adam arrived late in the ESPN era, then won Sleeper titles in 2023 and 2024. Nobody else in the recorded history has repeated. Four Sleeper seasons, two championships: less an era than a home invasion.",
    },
    {
      title: "The Chandler experience",
      body: "Stephen won in 2013 and 2017, survived multiple ESPN identities, and carried Bartlet For America across platforms. His history includes an 11-3 season, a 1-12 season, and two titles. Range matters.",
    },
  ],
  seasons: seasonCapsules,
  alumni: [
    {
      name: "Ravi Patel",
      record: "6 season(s), 38-42-1",
      teams: "Cutlery Corner, OH Xerxes, Rickshaw Rampage",
    },
    {
      name: "Chris Hilario",
      record: "3 season(s), 21-18",
      teams: "This Guy Fuchs",
    },
    {
      name: "Andrew Decker",
      record: "1 season(s), 6-8",
      teams: "Defense Wins Championships",
    },
    {
      name: "Prashant Sastry",
      record: "1 season(s), 4-9",
      teams: "The Huggernauts",
    },
    {
      name: "Chris Bryan",
      record: "1 season(s), 4-10",
      teams: "The Romosexuals",
    },
  ],
  identityNote:
    "Identity note: manager confirmation identifies the ESPN handle socrfan86 as Ravi Patel. Henry Hilario and Chris Hilario used different ESPN member accounts and remain separate alumni.",
  methodology:
    "ESPN records are recomputed from raw weekly matchup scores for 2010-2021. Empty 2022-2023 ESPN shell schedules are excluded. Sleeper records are recomputed from raw weekly matchups for 2022-2025. Playoff finishes come from each platform's final placement data. Identity merges use manager-confirmed mappings from the August 4, 2026 audit. Points are shown as recorded under each season's scoring system, so cross-era point totals measure volume, not a perfectly normalized scoring environment.",
};
