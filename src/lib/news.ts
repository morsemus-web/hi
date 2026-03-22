export interface NewsArticle {
  slug: string;
  title: string;
  description: string;
  content: string;
  category: "cricket" | "football" | "basketball" | "f1" | "general";
  author: string;
  publishedAt: string; // ISO date
  updatedAt?: string;
  image?: string;
  tags: string[];
}

export const articles: NewsArticle[] = [
  {
    slug: "ipl-2026-season-preview-key-players-to-watch",
    title: "IPL 2026 Season Preview: Key Players to Watch This Year",
    description:
      "A comprehensive preview of the IPL 2026 season — top batsmen, emerging bowlers, and the teams most likely to lift the trophy. Ball-by-ball coverage coming to ScoreDeck.",
    content: `The Indian Premier League 2026 is set to kick off with one of the most competitive fields in tournament history. With new auction dynamics, overseas player pools deepening, and young Indian talent emerging from domestic circuits, this season promises to be a blockbuster.

## Key Batsmen to Watch

The run rate battles will be fierce this season. Several franchises have invested heavily in power-hitters who can change the course of an innings in a single over. Strike rates above 160 are becoming the norm rather than the exception, and teams without at least two such players in their top order will struggle in the powerplay overs.

## Bowling Attacks That Could Dominate

Economy rates in the death overs will be the decisive factor. Teams with reliable yorker specialists and variations bowlers hold a significant advantage. The fall of wickets in the middle overs — traditionally the quietest phase — has increased by 23% compared to three seasons ago, reflecting a shift in batting approach.

## What This Means for Fans

With matches happening across multiple time zones and overlapping with work hours, keeping track of every boundary, wicket, and partnership can be challenging. That's exactly why tools like ScoreDeck exist — delivering ball-by-ball updates, run rates, and key moments directly to your desktop without requiring you to leave your workflow.

Whether you're tracking net run rate implications, DLS calculations in rain-affected matches, or simply want to know when a century is on the cards, real-time desktop notifications ensure you never miss a moment.`,
    category: "cricket",
    author: "ScoreDeck Sports Desk",
    publishedAt: "2026-03-20T10:00:00Z",
    tags: ["IPL", "cricket", "T20", "preview", "run rate", "wickets", "powerplay"],
  },
  {
    slug: "champions-league-quarter-finals-2026-tactical-analysis",
    title: "Champions League Quarter-Finals 2026: Tactical Breakdown & Predictions",
    description:
      "Deep tactical analysis of the UEFA Champions League quarter-final matchups — expected goals (xG), possession stats, and which teams have the edge on aggregate.",
    content: `The UEFA Champions League quarter-finals are upon us, and this year's draw has produced some mouth-watering ties. Let's break down each matchup with the data that matters.

## Possession vs. Counter-Attack

The expected goals (xG) data tells a compelling story this season. Teams that dominate possession above 60% have actually underperformed their xG by 0.3 goals per match in knockout stages. Meanwhile, counter-attacking sides have overperformed, converting chances at a rate 15% above their expected output.

## Set Pieces: The Great Equalizer

Corner kicks and free kicks have accounted for 34% of goals in this season's Champions League — the highest percentage in a decade. Teams with tall, physical players and well-rehearsed routines from dead-ball situations hold a significant advantage, particularly in away legs where defensive solidity is paramount.

## Key Stats to Watch

- **Shots on target** ratio in the first 15 minutes correlates strongly with match outcomes
- **Clean sheet** probability drops by 40% when the away team scores first
- **Yellow card** accumulation in first legs affects tactical approach in return fixtures
- **Aggregate score** dynamics change dramatically when VAR interventions occur

## Substitution Patterns

Managers are increasingly using their five substitution windows strategically. The data shows that goals scored after the 70th minute have increased by 28% since the five-sub rule was introduced, with fresh legs making a measurable difference to pressing intensity and shot accuracy.

## Following the Action

With matches on Tuesday and Wednesday evenings, many fans are still at work or commuting. ScoreDeck delivers live goals, assists, and key match events straight to your desktop — including VAR decisions, penalty shootout updates, and half-time scores — so you never have to choose between focus and fandom.`,
    category: "football",
    author: "ScoreDeck Sports Desk",
    publishedAt: "2026-03-18T14:00:00Z",
    tags: ["Champions League", "football", "xG", "tactics", "UEFA", "goals", "clean sheet"],
  },
  {
    slug: "nba-playoff-race-2026-western-conference-breakdown",
    title: "NBA Playoff Race 2026: Western Conference Seeding Battle Heats Up",
    description:
      "Breaking down the NBA Western Conference playoff picture — points per game, defensive ratings, and the play-in tournament implications.",
    content: `The NBA Western Conference playoff race is reaching its climax, with just two weeks of regular season remaining. The battle for seeding has never been tighter, with only 4.5 games separating the 1st and 8th seeds.

## Offensive Powerhouses

Points per game (PTS) leaders in the West are putting up historic numbers. Three teams are averaging over 118 PTS per game, while field goal percentages (FG%) across the conference have reached an all-time high of 47.8%. The three-pointer revolution continues — teams are attempting an average of 38.4 three-pointers per game (3PA), with the top shooting teams converting at rates above 38%.

## Defensive Metrics That Matter

Rebounds (REB), steals (STL), and blocks (BLK) tell the defensive story. The teams currently in playoff position average 2.3 more defensive rebounds per game than those outside. Turnover (TO) differential has proven to be the single strongest predictor of playoff success — teams with a positive TO differential are 73% more likely to win their first-round series.

## The Double-Double and Triple-Double Era

This season has seen a record 847 double-doubles and 52 triple-doubles across the league. The versatility demanded by modern basketball means players contributing across points, rebounds, and assists simultaneously has become the baseline expectation rather than an exceptional achievement.

## Play-In Tournament Preview

The 7th through 10th seeds are separated by just 2 games. Personal fouls per game, free throw percentage (FT%), and fast break points will likely determine which teams secure the final playoff spots. Bench points have become a crucial differentiator, with deeper rosters proving their worth during the grueling late-season schedule.

## Quarter-by-Quarter Patterns

Analysis of 4th quarter scoring shows that paint points and shot clock management become significantly more important in clutch situations. Teams that maintain their offensive efficiency in the final 5 minutes of close games have a winning percentage 23 points higher than those who don't.

## Stay Updated Without Missing a Play

With games tipping off at various times across the evening, ScoreDeck gives you buzzer beater alerts, quarter scores, and live box scores right on your desktop. Track playoff seed changes in real-time without opening a single browser tab.`,
    category: "basketball",
    author: "ScoreDeck Sports Desk",
    publishedAt: "2026-03-15T18:00:00Z",
    tags: ["NBA", "basketball", "playoffs", "Western Conference", "points", "rebounds", "triple-double"],
  },
  {
    slug: "f1-2026-bahrain-gp-preview-new-regulations",
    title: "F1 2026 Bahrain GP Preview: New Regulations Shake Up the Grid",
    description:
      "Preview of the 2026 Formula 1 season opener in Bahrain — new power unit regulations, grid position predictions, and which constructors have the edge.",
    content: `The 2026 Formula 1 season launches in Bahrain with the most significant regulation change in a decade. New power unit specifications, revised aerodynamic rules, and updated tire compounds are set to reshape the competitive order.

## Pre-Season Testing Takeaways

Lap times from Barcelona testing suggest the field has compressed significantly. The gap between the fastest and slowest cars in qualifying simulations was just 1.2 seconds — the tightest spread since 2014. Sector times (S1, S2, S3) reveal that the new aero regulations have shifted performance gains from high-speed corners to traction zones.

## Grid Position Predictions

Pole position will be fiercely contested. Based on long-run pace analysis, pit stop strategies, and tire degradation data from testing:

- **Front Row:** The usual suspects, but with a challenger from the midfield showing genuine qualifying pace
- **Top 5:** At least one team that finished outside the top 4 in the Constructors' Championship last year looks set to be a regular podium contender
- **Midfield Battle:** Six cars within three-tenths in Q2 simulations — the gap between Q2 and Q3 elimination will be razor-thin

## DRS and the New Overtaking Dynamic

The Drag Reduction System (DRS) zones have been revised at several circuits. Combined with reduced dirty air from the new aero package, overtaking opportunities should increase. Data from simulations suggests the interval between cars needed to attempt a pass has dropped from 0.8s to 0.5s.

## Pit Stop Strategy Revolution

New tire compounds (soft, medium, hard) have different performance windows than before. The optimal pit stop window has shifted, and teams running aggressive two-stop strategies in testing showed competitive race pace. Pit stop execution times remain crucial — the difference between a 2.1s and 2.5s stop can mean positions gained or lost.

## Safety Car Probability

Bahrain historically has a 45% Safety Car (SC) deployment rate, with Virtual Safety Cars (VSC) appearing in 60% of races. This significantly impacts strategy, particularly for teams on offset strategies. DNF rates at the venue have been declining, suggesting improved reliability, but the new regulations introduce uncertainty.

## Qualifying Format Reminder

The three-stage qualifying format (Q1, Q2, Q3) remains unchanged. After qualifying, cars enter parc fermé conditions, limiting setup changes. The outlap and inlap tire management has become an art form, with drivers needing to balance tire temperature preparation against track position.

## Track Every Lap Live

Formula 1 sessions span Friday practice through Sunday race, often during work hours depending on your timezone. ScoreDeck delivers live lap times, grid positions, pit stop alerts, fastest lap updates, and safety car notifications right to your system tray. Watch the constructors' championship and drivers' championship unfold in real-time.`,
    category: "f1",
    author: "ScoreDeck Sports Desk",
    publishedAt: "2026-03-10T09:00:00Z",
    tags: ["F1", "Formula 1", "Bahrain GP", "lap time", "pit stop", "grid position", "qualifying"],
  },
  {
    slug: "how-scoredeck-keeps-you-updated-without-breaking-focus",
    title: "How ScoreDeck Keeps You Updated Without Breaking Focus",
    description:
      "Learn how ScoreDeck's desktop overlay delivers live scores for Cricket, Football, Basketball, and F1 — without interrupting your workflow.",
    content: `In the modern work environment, sports fans face a constant dilemma: stay focused on work, or keep checking scores. ScoreDeck eliminates this trade-off entirely.

## The Problem with Current Solutions

Traditional score-checking methods — opening ESPN, Cricbuzz, or the F1 app — require a full context switch. Research shows it takes an average of 15 minutes to regain deep focus after an interruption. For fans following multiple sports across different time zones, this adds up to significant lost productivity.

## How ScoreDeck Works

ScoreDeck sits quietly in your system tray, delivering live updates without demanding your attention:

- **Cricket:** Ball-by-ball updates with run rate, wickets, partnerships, and powerplay status. Get notified on centuries, half-centuries, and fall of wicket events.
- **Football:** Real-time goals, assists, yellow and red cards, VAR decisions, and half-time/full-time scores. Expected goals (xG) data included.
- **Basketball:** Live points, rebounds, assists, steals, and blocks. Quarter scores, buzzer beater alerts, and box score summaries.
- **Formula 1:** Lap-by-lap timing, pit stop notifications, grid position changes, DRS activations, and safety car alerts. Full qualifying and race coverage.

## Built for Work, Not Distraction

Unlike mobile notifications that interrupt meetings, or browser tabs that tempt you to scroll, ScoreDeck is designed to be glanced at — not stared at. The toolbar sits at the edge of your screen, showing exactly what you need in a format you can process in under 2 seconds.

## Founding Access

ScoreDeck is currently available for founding access at $29 — a one-time payment for lifetime access. Limited to the first 1,000 users. Join the waitlist for free, or back the project today to secure your spot.`,
    category: "general",
    author: "ScoreDeck Team",
    publishedAt: "2026-03-08T12:00:00Z",
    tags: ["ScoreDeck", "live scores", "desktop overlay", "productivity", "sports app"],
  },
];

export function getArticle(slug: string): NewsArticle | undefined {
  return articles.find((a) => a.slug === slug);
}

export function getArticlesByCategory(category: string): NewsArticle[] {
  if (category === "all") return articles;
  return articles.filter((a) => a.category === category);
}

const categoryColors: Record<string, string> = {
  cricket: "bg-sport-cricket/15 text-sport-cricket",
  football: "bg-sport-football/15 text-sport-football",
  basketball: "bg-sport-basketball/15 text-sport-basketball",
  f1: "bg-sport-f1/15 text-sport-f1",
  general: "bg-accent/15 text-accent",
};

export function getCategoryStyle(category: string): string {
  return categoryColors[category] || categoryColors.general;
}
