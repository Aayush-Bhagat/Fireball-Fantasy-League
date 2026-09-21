# Roster Projections

For a given team and roster, this module takes the historical player-game
stats from the `player_games_stats` table and produces a projected runs
scored (RS) and runs allowed (RA) per game for the upcoming season. The
projections are then available as inputs to the odds engine — either as
a strong Bayesian prior that the engine shrinks observed stats toward,
or as the sole source for pre-season / early-season predictions before
enough games have been played to trust observed data.

This doc covers the current schema (all 10 columns of
`player_games_stats` are populated for seasons 1–4 with consistent but
non-canonical stat-tracking), the upcoming data-quality change at
season 5, and the calibration script that produces the league-specific
constants from historical data.

---

## The data, and the noise it carries

The `player_games_stats` table has 10 columns that are relevant to
projection:

| Column | What it tracks | Notes |
| --- | --- | --- |
| `atBats` | Plate appearances that count as ABs | Reliable across all seasons. |
| `hits` | Times on base via a batted ball | **Contaminated by fielding errors** — see below. |
| `runs` | Runs scored by the player | Reliable. |
| `rbis` | Runs batted in | Reliable. |
| `walks` | Bases on balls | **Tracked but rare** in Sluggers — treated as ~0 for projection purposes (see caveats). |
| `strikeouts` | Batter strikeouts (also used as the pitcher's K total by attribution) | Reliable. |
| `homeRuns` | Home runs hit | Reliable. |
| `outsPitched` | Outs recorded as a pitcher | Reliable; `IP = outsPitched / 3`. |
| `runsAllowed` | Runs allowed as a pitcher | Reliable. |
| `outs` | Fielding outs (best guess — see notes) | Used in some places but not core to the projection. |

**All 10 columns have been populated for the four historical seasons
(seasons 1–4),** and the stat-keepers have been consistent in their
methodology across those seasons. That consistency is what makes
calibration possible.

### The data quality caveats

Two biases are baked into seasons 1–4 data and affect the projection
math:

1. **Fielding errors are counted as hits.** The `hits` column is
   really `(H + E) / AB`. This inflates `hits` by 5–15 points
   depending on the fielder, and contaminates AVG and any regression
   that uses `hits` as input. We can't fully correct for this
   without separating `H` from `E`, so the projection's offensive
   rating is more accurate as a "did this player reach base"
   measure than as a pure contact rate.
2. **Pitcher K is approximated from batter K.** The `strikeouts`
   column tracks *batter* strikeouts. A pitcher's strikeout total
   is whatever batter Ks happened while that pitcher was on the
   mound, which is a close approximation but not exact (a pitcher
   can strike out a batter whose at-bat started against a different
   pitcher). For projection purposes this is fine; for pitcher
   evaluation it introduces a small noise term.

A third assumption worth calling out: **walks and HBPs are rare in
Sluggers**, so the projection treats them as ~0 for projection
purposes. OBP effectively equals AVG, BB% effectively equals 0,
and the regression collapses to AVG + SLG terms. The `walks`
column is still populated in the data when they do happen — it's
just not a meaningful input to the projection.

### The data version boundary

**Stat-tracking methodology is changing after season 4.** Season 5+
will use a more MLB-canonical approach, which presumably means
proper PA tracking, separated `H` vs `E`, and so on. The projection
must handle this:

- **Pre-season-5 (legacy) data:** Uses the projection math described
  in this doc, with calibration constants derived from seasons 1–4.
- **Post-season-5 (new) data:** Same shape, but constants are
  re-derived from the cleaner data and the "contamination"
  adjustments in the math are no longer needed.

Concretely: every historical player-season stat row gets a derived
`dataVersion` flag. The projector picks a code path based on the
flag — old data uses the "with contamination correction" branch, new
data uses the cleaner branch. The output DTO is identical either
way; consumers don't change.

The calibration script (described below) is run twice: once
initially against seasons 1–4 for the v1 constants, then again
after enough post-change data accumulates to produce v2 constants.

---

## What it takes in, what it gives back

**Inputs:**

- A `team` (id, name)
- A `roster` (list of players with their per-season aggregated stats)
- The historical league run environment (average RS/RA per game,
  league AVG, league K rate, league HR rate)
- Tunable config (regression constants, time weights, calibration
  outputs, etc.)

**Output:** A `TeamProjection` DTO:

- `projectedRS` — expected runs scored per game
- `projectedRA` — expected runs allowed per game
- `projectedWinPct` — pre-season Pythagorean win expectancy (uses
  the same Pythagenpat exponent as the odds engine)
- `offensiveRating`, `defensiveRating` — sub-component strengths
  on a 0–1 scale (handy for a power ranking)
- `sampleSize` — total player-games used in the projection
- `reliability` — a categorical flag (`high` / `medium` / `low`)
  reflecting how much weight the projection should get vs. observed
  data later in the season
- `dataVersion` — `"legacy"` or `"new"` — which math branch produced
  this projection, useful for debugging and UI disclaimers

The projection never returns just one number — it returns the number
plus enough metadata that the odds engine (or any consumer) can
decide how much to trust it.

---

## The math

There are two halves: projecting how many runs the team's lineup will
score, and projecting how many runs its pitching staff will allow.
They share the same overall pattern — for each player, project their
per-AB or per-9 rate, then aggregate to team level using projected
playing time. The final step blends the projection with whatever
observed data exists so the engine has a clean prior to consume.

### Part 1: Projecting team offense (RS)

For each batter on the roster:

**Step 1a — Weighted historical rate stats.**

Combine the player's per-season rate stats with more weight on recent
seasons, and weight by AB so a 200-AB season counts for more than a
30-AB one. Compute this for each of: AVG, K%, HR/AB, and RBI/AB.
(OBP is computed but collapses to AVG since walks are rare — see
the data caveats section. BB% is also tracked but treated as ~0
in the projection math.)

```
weightedRate = Σ (seasonRate × seasonWeight × seasonAB)
               / Σ (seasonWeight × seasonAB)
```

Time weights default to `[0.5, 0.75, 1.0, 1.5]` from oldest to most
recent season (a moderate exponential; tune to taste).

**Step 1b — Regression to the mean.**

A player with 30 ABs who hit .350 is much more likely a .270 hitter
than a .350 hitter. Shrink each rate stat toward the league mean
using sample size:

```
regressionWeight = totalAB / (totalAB + kAB)
projectedRate = regressionWeight × weightedRate
                + (1 − regressionWeight) × leagueRate
```

`kAB` defaults to `100` (ABs) for rate stats expressed as a fraction
of ABs (AVG, K%, HR/AB, RBI/AB).

**Step 1c — Estimate a per-AB run-production rate.**

With AVG, K%, HR/AB, and RBI/AB (and OBP ≈ AVG), we can build a
real run-production estimate. The cleanest approach is a
linear-weights model:

```
runRate = wAVG × projectedAVG
          + wSLG × projectedSLG
          + constant
```

where `projectedSLG` is approximated as `AVG + HR/AB ×
slgPerHRBonus` because we don't have a 2B/3B/HR breakdown. The
`slgPerHRBonus` default is `2.0` (a HR is worth roughly 1 base
beyond a single, plus a base for the home run ball, plus the run
that scores — about 2.0 total bases of "extra" value over AVG).
K% and RBI/AB can be added to the regression as additional
predictors once enough historical data exists for them to
contribute meaningfully.

The weights `wAVG`, `wSLG`, and the constant are the **calibration
outputs** — they are derived from a regression of team RS against
team AVG and team SLG across the historical seasons. See the
"Calibration" section below.

**For legacy data (seasons 1–4),** the AVG and SLG inputs are
slightly biased (hits inflated by errors). The calibration script
handles this by including a `dataVersion` column in the regression
dataset; the legacy regression absorbs the bias into its own
coefficients, and we use those legacy coefficients only for legacy
projections.

**Step 1d — Project playing time.**

A returning starter might get 150 AB this season; a bench player,
30. Without an explicit playing-time projection, the simplest
assumption is to weight players by their most-recent season's AB
(or a recency-weighted average of the last two seasons). This
implicitly assumes similar playing time to the past, which is
wrong for rookies and trades but fine as a starting point.

**Step 1e — Aggregate to team level.**

```
teamRunRate = Σ (playerRunRate × projectedAB)
              / Σ projectedAB
projectedRS = teamRunRate × leagueABperGame
```

`leagueABperGame` is calibrated from historical data — for a
9-inning game in your league it's typically around 28–32.

### Part 2: Projecting team pitching (RA)

Mirrors the offense flow, with one important caveat: the
`player_games_stats` table is keyed on the *batter* (each row is
a (game, player) pair regardless of which side they played on).
So a pitcher's stats live in the same row as their batting stats,
distinguished by which fields are nonzero. The projection needs
to handle this gracefully — see step 2f.

**Step 2a — Weighted historical pitching rates.**

For each pitcher:

```
weightedRA9 = Σ (seasonRA × seasonWeight)
              / Σ (seasonIP × seasonWeight) × 9
```

(That is: weight the per-season RA/9 by both recency and IP. `IP =
outsPitched / 3`.)

For pitcher strikeouts, use the same `strikeouts` column from the
batter side, attributed to the pitcher. This is the "batter K is
approximately pitcher K" approximation noted in the data caveats.

```
weightedKper9 = Σ (seasonK × seasonWeight)
                / Σ (seasonIP × seasonWeight) × 9
```

**Step 2b — Regression to the mean.**

Same shape as batting:

```
regressionWeight = totalIP / (totalIP + kIP)
projectedRA9 = regressionWeight × weightedRA9
               + (1 − regressionWeight) × leagueRA9
```

`kIP` defaults to `30` (innings pitched). The right value here
depends a lot on how stable pitcher performance is in your league
— Sluggers may be stickier or chattier than MLB, and the
calibration script will refine this.

**Step 2c — Strikeout rate as a secondary signal.**

A pitcher with a high K rate is likely better than their RA/9
suggests — K rate is one of the most predictive single stats in
pitching, more so than RA itself.

```
kAdjustment = (pitcherKper9 − leagueKper9) × kCoefficient
projectedRA9 += kAdjustment
```

`kCoefficient` is another calibration output. Defaults to a small
value (e.g., `0.15`) so the K-rate adjustment is informative but
doesn't dominate. Once we have walks and HR allowed in a future
schema addition, this step gets replaced by a proper FIP
calculation.

**Step 2d — Project IP share.**

For each pitcher, project their share of the team's total IP this
season. Without role data, the simplest approach is to use each
pitcher's most-recent-season IP share of the team total. If roles
are known, weight starters more heavily (they eat more innings).

```
projectedIPShare = pitcherIP / teamIP (most recent season)
```

**Step 2e — Aggregate to team level.**

```
teamRA9 = Σ (projectedRA9 × projectedIPShare)
projectedRA = teamRA9
```

(RA/9 is per 9 innings, which is also per game for our purposes —
adjust if your league plays different-length games.)

**Step 2f — Handling non-pitchers.**

Players who didn't pitch in their most recent season have
`outsPitched = 0` and `runsAllowed = 0`. The projection should
skip them when aggregating team pitching, *not* include them with
`projectedRA9 = leagueRA9`. The simplest check: only consider
rows where `projectedIP > 0`.

### Part 3: Blending with observed data

The projection is the **pre-season** view. As the season progresses
and observed RS/RA accumulate, the odds engine should weight the
projection less and the observed numbers more. This is the same
Bayesian shape used elsewhere in the engine:

```
observedWeight = gamesPlayed / (gamesPlayed + priorWeight)
finalRS = observedWeight × observedRS
          + (1 − observedWeight) × projectedRS
finalRA = observedWeight × observedRA
          + (1 − observedRA) × projectedRA
```

`priorWeight` defaults to `40` (i.e., 40 games of equivalent
weight on the projection). Early in the season the projection
dominates; by the playoffs the observed numbers dominate. The same
shape works for the Pythagenpat win-expectancy denominator once
the team has enough games for the exponent to mean something.

A nice side effect: this also fixes the cold-start problem in the
existing odds engine cleanly. A team with zero games played no
longer falls back to the league baseline — it falls back to its
projection, which is a much more informative prior.

---

## Where it lives

```
src/
├── lib/
│   ├── rosterProjector.ts        # Pure projection math (the steps above)
│   ├── projectionCalibration.ts  # Calibration script helpers (offline)
│   └── oddsEngine.ts             # Existing engine — extended to consume projections
├── services/
│   ├── rosterProjectionService.ts  # Loads roster + stats, calls the projector
│   └── oddsService.ts              # Extended to blend observed with projected
├── repositories/
│   ├── rosterProjectionRepository.ts  # Drizzle queries: per-season player aggregates
│   └── oddsRepository.ts              # Existing — unchanged
├── models/players.ts                 # Existing Drizzle schema (no changes needed)
├── db/
│   └── migrations/                   # No new migrations — schema is sufficient
└── dtos/
    └── projectionDtos.ts          # TeamProjection, PlayerProjection, ProjectionConfig
```

### The projector (`src/lib/rosterProjector.ts`)

Pure TypeScript, no DB. Single entry point:
`projectRoster(roster: RosterStats, config: ProjectionConfig): TeamProjection`.

The individual steps (`projectBattingRates`, `regressToMean`,
`estimateRunProduction`, `aggregateTeamOffense`, `projectRA9`,
`aggregateTeamDefense`) are also exported for testing and for any
partial use — for example, a "team outlook" widget might want just
the offensive rating.

**Data-version awareness:** the projector inspects each
historical player-season row's `dataVersion` field and selects the
appropriate math branch. Old rows use the "legacy" branch (with
contamination-correction adjustments); new rows use the "new"
branch (no correction). The branches differ in the regression
constants they use, not in the shape of the math.

### The service (`src/services/rosterProjectionService.ts`)

Pulls the roster with player-season aggregates from
`rosterProjectionRepository`, computes any derived league-wide
stats (current league AVG, league K rate, league HR rate), and
calls the projector. The output is then either:

- Returned directly to a UI (e.g., a pre-season "team outlook"
  widget), or
- Passed to the odds service as a prior for live game
  predictions.

### The repository (`src/repositories/rosterProjectionRepository.ts`)

All queries use Drizzle ORM (the rest of the codebase does — see
`playerRepository.ts` and `oddsRepository.ts` for the convention).
The shape, roughly:

```ts
import { db } from "@/db";
import { eq, and, inArray, sql, sum } from "drizzle-orm";
import { players, playerGamesStats } from "@/models/players";

const seasons = [season1, season2, season3, season4]; // active seasons

const rows = await db
  .select({
    playerId: players.id,
    seasonId: playerGamesStats.seasonId,
    ab: sum(playerGamesStats.atBats),
    h: sum(playerGamesStats.hits),
    r: sum(playerGamesStats.runs),
    rbi: sum(playerGamesStats.rbis),
    bb: sum(playerGamesStats.walks),
    k: sum(playerGamesStats.strikeouts),
    hr: sum(playerGamesStats.homeRuns),
    outsPitched: sum(playerGamesStats.outsPitched),
    ra: sum(playerGamesStats.runsAllowed),
    // Data version flag: legacy for seasons 1-4, new from season 5 onwards.
    dataVersion: sql<string>`
      CASE
        WHEN ${playerGamesStats.seasonId} <= 4 THEN 'legacy'
        ELSE 'new'
      END
    `.as("data_version"),
  })
  .from(players)
  .leftJoin(
    playerGamesStats,
    eq(playerGamesStats.playerId, players.id),
  )
  .where(
    and(
      eq(players.teamId, teamId),
      inArray(playerGamesStats.seasonId, seasons),
    ),
  )
  .groupBy(players.id, playerGamesStats.seasonId)
  .orderBy(players.id, playerGamesStats.seasonId);
```

League averages come from a separate query that sums across all
players (not just the team's roster) for each season. (`leagueObp`
is included for completeness even though it equals `leagueAvg`
under current data — keeps the query in place for the day walks
become non-negligible.)

```ts
const rows = await db
  .select({
    seasonId: playerGamesStats.seasonId,
    leagueAvg: sql<number>`
      SUM(${playerGamesStats.hits})::float
      / NULLIF(SUM(${playerGamesStats.atBats}), 0)
    `,
    leagueObp: sql<number>`
      (SUM(${playerGamesStats.hits}) + SUM(${playerGamesStats.walks}))::float
      / NULLIF(
        SUM(${playerGamesStats.atBats}) + SUM(${playerGamesStats.walks}),
        0
      )
    `,
    leagueRbiPerAb: sql<number>`
      SUM(${playerGamesStats.rbis})::float
      / NULLIF(SUM(${playerGamesStats.atBats}), 0)
    `,
    leagueKRate: sql<number>`
      SUM(${playerGamesStats.strikeouts})::float
      / NULLIF(SUM(${playerGamesStats.atBats}), 0)
    `,
    leagueHrPerAb: sql<number>`
      SUM(${playerGamesStats.homeRuns})::float
      / NULLIF(SUM(${playerGamesStats.atBats}), 0)
    `,
    leagueRa9: sql<number>`
      SUM(${playerGamesStats.runsAllowed}) * 9.0
      / NULLIF(SUM(${playerGamesStats.outsPitched}) / 3.0, 0)
    `,
    leagueKPer9: sql<number>`
      SUM(${playerGamesStats.strikeouts}) * 9.0
      / NULLIF(SUM(${playerGamesStats.outsPitched}) / 3.0, 0)
    `,
  })
  .from(playerGamesStats)
  .where(eq(playerGamesStats.seasonId, seasonId))
  .groupBy(playerGamesStats.seasonId);
```

---

## Tunable constants

All live in `DEFAULT_PROJECTION_CONFIG` (`src/lib/rosterProjector.ts`)
and can be overridden per-call. The table is split into
"calibration-derived" constants (regression coefficients that come
from the calibration script) and "hand-tuned" constants (subjective
choices that the calibration script doesn't produce).

### Hand-tuned constants

| Setting | Default | What it means |
| --- | --- | --- |
| `seasonWeights` | `[0.5, 0.75, 1.0, 1.5]` | Recency weights from oldest to most recent season. |
| `kAB` | `100` | ABs of "prior weight" toward the league mean for rate stats (AVG, K%, HR/AB, RBI/AB). Higher = more regression. |
| `kIP` | `30` | Innings of prior weight for pitcher RA/9. |
| `slgPerHRBonus` | `2.0` | Extra SLG added per HR/AB to approximate SLG without 2B/3B data. Calibrate against observed data once available. |
| `priorWeight` | `40` | Games of equivalent weight given to the projection when blending with observed stats. |
| `lowSampleThreshold` | `100` | Total ABs below this triggers `reliability: "low"`. |
| `highSampleThreshold` | `400` | Total ABs above this triggers `reliability: "high"`. |
| `legacySeasonCutoff` | `4` | Seasons with `id <= legacySeasonCutoff` are flagged `dataVersion: "legacy"`. Bump this when methodology changes. |

### Calibration-derived constants

These come from the calibration script (see below) and are stored
in a separate config file (`projectionCalibration.json` or similar)
that's loaded at projector startup. They have sensible defaults
but should be replaced with the script's output as soon as it's
run.

| Setting | Default | What it means |
| --- | --- | --- |
| `wAVG` | `1.0` | Linear weight on AVG in the run-production formula. |
| `wSLG` | `1.5` | Linear weight on SLG in the run-production formula. |
| `runRateConstant` | `-0.3` | Intercept in the run-production formula. |
| `kCoefficient` | `0.15` | How much the pitcher's K-rate nudges their RA/9. |
| `eraConstant` | `0` | Calibration constant for team RA/9 if needed. |

---

## Calibration

The projection's accuracy depends on `wAVG`, `wSLG`, `runRateConstant`,
`kCoefficient`, and a few other constants being right for *your*
league. The defaults in the doc are placeholders tuned to general
baseball data; the calibration script derives better values from your
own historical seasons.

### When to run it

- **Now (v1):** Run against seasons 1–4 to produce v1 constants.
  The script will absorb the data biases (errors in hits,
  undercounted PAs) into the coefficients, so v1 constants are
  tuned to the legacy data and produce good projections for
  legacy data.
- **After season 5+ has data (v2):** Re-run with seasons 5+ added
  (and the `dataVersion` flag distinguishing them). The script
  will produce two sets of constants — one for legacy, one for
  new — and the projector picks the right set automatically.
- **Quarterly / annually** is fine; the constants don't drift
  quickly. More often is wasted effort unless something material
  changes.

### How it works

The script has two stages: extract a regression dataset, then
fit the coefficients.

**Stage 1 — Extract.** One Drizzle query that returns, for each
team in the historical seasons: their observed RS/RA, and their
roster-aggregated AVG, SLG, K rate, HR rate, RBI rate, and the
pitchers' K/9 and RA/9. The dataset is one row per (team, season).

```ts
import { db } from "@/db";
import {
  eq, and, ne, inArray, isNotNull, sql, sum, avg,
} from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { teamGames, games } from "@/models/games";
import { playerGamesStats } from "@/models/players";

const opponent = alias(teamGames, "opponent");

const rows = await db
  .select({
    teamId: teamGames.teamId,
    seasonId: games.seasonId,
    teamRunsScored: avg(teamGames.score),
    teamRunsAllowed: avg(opponent.score),
    teamAvg: sql<number>`
      SUM(${playerGamesStats.hits})::float
      / NULLIF(SUM(${playerGamesStats.atBats}), 0)
    `,
    // ... team SLG, K rate, HR rate, RBI rate ...
    // ... team K/9, RA/9 ...
  })
  .from(teamGames)
  .innerJoin(games, eq(teamGames.gameId, games.id))
  .innerJoin(
    opponent,
    and(
      eq(opponent.gameId, teamGames.gameId),
      ne(opponent.teamId, teamGames.teamId),
    ),
  )
  .leftJoin(
    playerGamesStats,
    and(
      eq(playerGamesStats.gameId, teamGames.gameId),
      eq(playerGamesStats.teamId, teamGames.teamId),
    ),
  )
  .where(
    and(
      inArray(games.seasonId, [season1, season2, season3, season4]),
      isNotNull(teamGames.outcome),
    ),
  )
  .groupBy(teamGames.teamId, games.seasonId);
```

This follows the same alias-join pattern used in
`oddsRepository.findTeamRunAverages` (the opponent team is joined
via `alias(teamGames, "opponent")` to avoid double-counting the
same row). When a player appears on both a batting and a pitching
row in the same game, the projection service dedupes via
`outsPitched > 0` in the query or post-processing, same as the
existing team-aggregates path in `teamRepository.ts`.

**Stage 2 — Fit.** A small linear regression (in plain
TypeScript, or run it in a Jupyter notebook, or pipe the dataset
into `python -c "import sklearn.linear_model; ..."` — any
approach works) produces the coefficients:

```ts
// Pseudocode for the offensive half:
const model = fitLinearModel({
  X: dataset.map(d => [d.team_avg, d.team_slg_approx, 1]),
  y: dataset.map(d => d.team_runs_scored / d.league_ab_per_game),
});
// model.coefficients → [wAVG, wSLG, runRateConstant]
```

The pitching half fits `team_ra9 = kCoefficient × team_k_per_9 +
eraConstant` (a one-variable regression is usually enough given
the limited signal in legacy data).

**Stage 3 — Emit.** Write the coefficients to
`src/lib/projectionCalibration.ts` as a typed config object, or
to a JSON file loaded at startup. The projector reads from there
instead of from `DEFAULT_PROJECTION_CONFIG`.

### Implementation location

`src/lib/projectionCalibration.ts` should expose:

- `extractCalibrationDataset()` — runs the Drizzle queries,
  returns a `CalibrationDataset[]` (one entry per team-season)
- `fitCalibration(dataset)` — runs the regressions, returns
  `CalibrationCoefficients`
- `DEFAULT_LEGACY_CALIBRATION` and `DEFAULT_NEW_CALIBRATION` —
  the hand-typed fallbacks the projector uses if no fitted
  constants are present

This module is the only "offline" piece of the projector. It can
be invoked manually (`npx tsx src/lib/projectionCalibration.ts`)
or wired into a script. The projector itself never calls into it
at runtime.

---

## Things the data team might consider adding later

The current schema and data are enough to ship the projection
with calibration — nothing here is blocking. The additions
below would each improve accuracy further, but they all require
work from the people who track stats (not just from this
codebase). They're listed as tradeoffs so the data team can
review and decide what, if anything, makes sense to take on.
Each item is independent — picking one doesn't obligate picking
the others.

- **Track singles, doubles, and triples separately from home
  runs** (instead of just `hits` and `home_runs`).
  - *What it gets you:* Real slugging percentage (SLG) instead
    of the `AVG + HR × bonus` approximation. Likely the biggest
    single improvement to offensive projection accuracy.
  - *What it costs:* A change to how stat-keepers record hits —
    one more split per at-bat.

- **Track errors separately from hits.**
  - *What it gets you:* Real batting average. Today, fielding
    errors get lumped into `hits`, which inflates AVG by 5–15
    points depending on the fielder.
  - *What it costs:* One more field-level entry per plate
    appearance.

- **Track hit-by-pitches, sacrifice flies, and sacrifice
  bunts.**
  - *What it gets you:* True plate appearance count. Today, PAs
    are approximated as `AB + BB`, which undercounts by 1–3 per
    game. Mostly matters for any rate stat with PA in the
    denominator (rare in the current projection, but a
    prerequisite for meaningful OBP if walks ever become
    non-negligible).
  - *What it costs:* Three more event types to record per plate
    appearance.

- **Track walks and home runs allowed for pitchers** (today
  only batter-side K is recorded, which we approximate as
  pitcher K).
  - *What it gets you:* A real FIP calculation instead of the
    K-only adjustment. Significantly better pitcher projections,
    especially for distinguishing high-K / low-BB pitcher types
    from low-K / high-BB types.
  - *What it costs:* Per-at-bat attribution to the pitcher on
    the mound — likely the most invasive change since it
    requires tracking which pitcher is responsible for each
    event.

- **Track pitcher role** (starter / reliever / closer).
  - *What it gets you:* Lets the model separate the bullpen
    from the starting rotation and weight them by expected
    innings. Most useful for playoff / manager-quality
    simulation than for regular-season predictions.
  - *What it costs:* A per-game roster-position entry.

- **Track which stadium each game was played at.**
  - *What it gets you:* Park factors can adjust RS and RA per
    game (Sluggers has multiple stadiums with different scoring
    environments).
  - *What it costs:* One extra field on the `games` table.

### How new data flows into the projection

Nothing on this list requires code changes to the projection
to *start* being useful. The projection is written so that once
a new column is populated for new seasons, it can start using
it (the `dataVersion` mechanism handles the transition — old
seasons keep using the approximation, new seasons use the real
data). The data team's only obligation is to populate the new
columns going forward; the codebase picks them up
automatically.

---

## Showing the projection in the match win probability card

When the expanded match win probability card (the expandable
breakdown drawer in `src/components/OddsBadge.tsx`) renders its
detail view, it should display the projection alongside the
existing breakdown so users can see how much the player-aggregate
projection is influencing the final probability.

### What to show

The drawer should show **two win probabilities** side by side:

1. **With player-aggregate projection** — the probability the
   engine produces after this feature ships. The projection's
   `projectedRS` and `projectedRA` are factored in as a Bayesian
   prior and shrink toward observed RS/RA as the season
   progresses.

2. **Without projection (baseline)** — the probability the
   engine would have produced using only observed team-level
   RS/RA. This is what users see today, before this feature
   ships.

The drawer should also display the projection's underlying RS
and RA values, so users can see what the projection is
contributing.

### What the DTO needs to expose

Extend `MatchOddsDto` (in `src/dtos/gameDtos.ts`) with:

- `teamProb` / `opponentProb` — the final probability **with**
  the projection factored in (current behavior).
- `teamProbWithoutProjection` /
  `opponentProbWithoutProjection` — the probability the engine
  would produce with only observed RS/RA. The simplest way to
  compute this: call `computeMatchOdds` with a "projection
  weight = 0" override, or pass the observed RS/RA as both the
  observed *and* projected values.
- `teamProjectedRS` / `opponentProjectedRS` — the projection's
  expected runs scored per game.
- `teamProjectedRA` / `opponentProjectedRA` — the projection's
  expected runs allowed per game.

### Where to render

In `src/components/OddsBadge.tsx`'s expandable drawer. The
drawer already shows the RS / RA / win-expectancy breakdown;
add the new fields as additional rows. A clean layout:

```
With player-aggregate projection:  62%  (−150)
Without projection (baseline):     58%  (−140)

Projected RS: 4.8 / game    Observed RS so far: 5.2
Projected RA: 3.9 / game    Observed RA so far: 4.1
```

### Why show both

The projection's job is to give pre-season and early-season
predictions a stronger prior than the bare league average.
Showing both probabilities makes that visible: users can see
*how much* the projection is shifting the prediction.

Late in the season the two probabilities converge (observed
data dominates). Early in the season or after big roster moves
they can diverge meaningfully. Showing both builds trust when
the shift is large and corrects misperception when the shift is
small.

---

## Sanity checks

When tuning the projection, these should hold:

- A team of all-league-average players → projectedRS ≈ leagueRS,
  projectedRA ≈ leagueRA, win expectancy ≈ 0.500.
- A team of players 1.5σ above average → projectedRS meaningfully
  above leagueRS, projected win expectancy well above 0.500.
- A returning starter with 400+ AB → minimal regression;
  projection close to recent average.
- A rookie with 0 AB → fully regressed to league mean; no
  information contributed.
- For the same team, late-season projections (high observed
  games) should be close to observed RS/RA; early-season
  projections should be close to the off-season projection.
- Projection stability: a small change in input (one extra
  game of data, one extra roster move) should produce a small
  change in output. If it doesn't, a regression constant is
  probably too low.
- The calibrated `wAVG` and `wSLG` coefficients should be
  positive and have a ratio close to the known baseball
  relationship (`wSLG ≈ 1.5–2.0 × wAVG`). If they don't, the
  regression dataset is probably noisy.
- The calibrated `kCoefficient` should be positive and small
  (≤ 0.5). A larger value means the K-rate is doing too much
  work in the projection, which usually means RA/9 sample
  sizes are too small.

---

## Caveats

- **This is not a true simulation.** It produces an expected
  RS/RA per game from roster talent, not a play-by-play
  distribution. It's the right input for the odds engine's
  existing math, not a replacement for the engine itself.
- **Sluggers is not MLB.** Mario Super Sluggers has different
  scoring distributions, more variance per at-bat, and likely
  a strong "chemistry" / "star" effect. All calibration
  constants should be tuned against your own data, not
  borrowed from baseball. The math *structure* is portable;
  the numbers are not.
- **The "errors counted as hits" contamination is the biggest
  single source of legacy-data bias.** The `dataVersion`
  mechanism handles this for the projection as a whole, but
  individual player projections from seasons 1–4 will still
  carry the bias. Once we have a season of post-change data,
  the calibration script can quantify the bias directly and
  the constants will improve.
- **Walks and HBPs are treated as ~0 in the projection.** This
  simplifies the math substantially (OBP collapses to AVG) and
  is correct for current Sluggers data, but it means the
  projection has no signal for plate-discipline changes. If the
  game or the league ever starts rewarding walks meaningfully,
  this assumption needs to be revisited.
- **The math is only as good as the data we record going
  forward.** The single highest-leverage thing to do in
  season 5+ is to track stats in the new (presumably
  MLB-canonical) way. The schema doesn't need to change; the
  tracking methodology does.
- **Without a 2B/3B/HR breakdown, the SLG approximation is
  the second-biggest source of error in the projection.** It
  works fine for projecting a team's RS in aggregate, but it
  can't distinguish a 30-HR .250 hitter from a 10-HR .290
  hitter as well as real SLG could. Worth adding the breakdown
  if/when the data collection can support it.

---

## Implementation TODO list

A staged plan to ship the feature. Phases are roughly ordered by
dependency — later phases need earlier ones — but the calibration
work (phase 3) is offline-only and can be deferred until after
the runtime feature is live.

### Phase 1 — DTOs and shared types

1.1. Create `src/dtos/projectionDtos.ts` with:
    - `DataVersion = "legacy" | "new"`
    - `PlayerSeasonStats` — one (player, season) row: per-season
      aggregated AB / H / R / RBI / BB / K / HR / outsPitched /
      RA / outs, plus the derived `dataVersion` flag.
    - `LeagueAverages` — one row per season: `leagueAvg`,
      `leagueObp`, `leagueRbiPerAb`, `leagueKRate`,
      `leagueHrPerAb`, `leagueRa9`, `leagueKPer9`,
      `leagueAbPerGame`.
    - `RosterStats` — the assembled input the projector consumes
      (players with their `PlayerSeasonStats[]`, plus the
      `LeagueAverages` for each season).
    - `PlayerProjection` — per-player projected outputs
      (projected AVG / K% / HR/AB / RBI/AB / runRate /
      projectedAB / projectedIP for pitchers).
    - `Reliability = "high" | "medium" | "low"`.
    - `TeamProjection` — the DTO from "What it gives back": RS,
      RA, win expectancy, offensive / defensive ratings,
      sampleSize, reliability, dataVersion, plus the per-player
      `PlayerProjection[]` for any UI that wants the breakdown.
    - `ProjectionConfig` — split into `HandTunedConfig` and
      `CalibrationConfig` per the "Tunable constants" section.
    - `CalibrationDataset` — one entry per (team, season) from
      the regression extraction step.
    - `CalibrationCoefficients` — `wAVG`, `wSLG`,
      `runRateConstant`, `kCoefficient`, `eraConstant`, keyed
      by `DataVersion`.

1.2. Extend `MatchOddsDto` (`src/dtos/gameDtos.ts`) with the new
    fields described in "Showing the projection in the match win
    probability card":
    - `teamProb` / `opponentProb` (already present) — **with**
      projection factored in.
    - `teamProbWithoutProjection` /
      `opponentProbWithoutProjection`.
    - `teamProjectedRS` / `opponentProjectedRS`.
    - `teamProjectedRA` / `opponentProjectedRA`.

1.3. Export `DEFAULT_PROJECTION_CONFIG` (`rosterProjector.ts`)
    with the hand-tuned defaults from the "Hand-tuned constants"
    table (seasonWeights, kAB, kIP, slgPerHRBonus, priorWeight,
    lowSampleThreshold, highSampleThreshold, legacySeasonCutoff)
    and the calibration-derived defaults (`wAVG=1.0`, `wSLG=1.5`,
    `runRateConstant=-0.3`, `kCoefficient=0.15`, `eraConstant=0`).

### Phase 2 — Pure projector (`src/lib/rosterProjector.ts`)

Pure TS, no DB. Single entry point `projectRoster(roster,
config) → TeamProjection`. Each step is exported separately for
testing and partial-use cases.

2.1. `projectBattingRates(playerStats, leagueAverages, config)` —
    implements steps 1a–1c. Weighted historical AVG / K% /
    HR/AB / RBI/AB, regression to league mean, linear-weights
    run-production formula with SLG ≈ AVG + HR/AB ×
    slgPerHRBonus. The `dataVersion` of the most recent
    player-season row picks which set of calibration constants
    (legacy vs new) is used.

2.2. `regressToMean(observed, sampleSize, league, k)` — generic
    helper used by both batting and pitching steps. Lives next
    to the math so it's easy to unit-test.

2.3. `projectRA9(pitcherStats, leagueAverages, config)` — steps
    2a–2c. Weighted RA/9, regression, K-rate adjustment.

2.4. `projectIPShare(pitcherStats, config)` — step 2d.
    Most-recent-season IP share; falls back to league share
    when no recent pitching data exists.

2.5. `aggregateTeamOffense(playerProjections, config)` and
    `aggregateTeamDefense(pitcherProjections, config)` — steps
    1e / 2e. Include the step 2f guard: only consider pitchers
    with `projectedIP > 0`.

2.6. `computeReliability(totalSampleSize, config)` — returns
    the `high` / `medium` / `low` flag using the
    `lowSampleThreshold` / `highSampleThreshold` constants.

2.7. `projectRoster(roster, config)` — orchestration: call the
    offense / defense pipelines, compute Pythagenpat-based
    `projectedWinPct` (reuse `pythagenpatExponent` from
    `oddsEngine.ts`), pick the canonical `dataVersion` (latest
    season on the roster; fall back to `legacy` if no seasons),
    and return the `TeamProjection`.

2.8. Unit tests for the projector (sanity checks from the
    "Sanity checks" section):
    - All-league-average roster → projectedRS ≈ leagueRS,
      projectedRA ≈ leagueRA, projectedWinPct ≈ 0.500.
    - 1.5σ-above roster → meaningfully positive projection.
    - Returning starter with 400+ AB → minimal regression.
    - Rookie with 0 AB → fully regressed to league mean.
    - Projection stability: small input change → small output
      change.
    - Hand-tuned `wSLG / wAVG` ratio holds after the v1
      calibration script runs.

### Phase 3 — Calibration script (`src/lib/projectionCalibration.ts`)

Offline helpers — not called by the projector at runtime. Run
manually via `npx tsx src/lib/projectionCalibration.ts` to
refresh `DEFAULT_LEGACY_CALIBRATION` / `DEFAULT_NEW_CALIBRATION`.

3.1. `extractCalibrationDataset(seasonIds)` — runs the spec's
    regression-dataset Drizzle query: one row per (team, season)
    with `teamRunsScored`, `teamRunsAllowed`, team AVG / SLG /
    K rate / HR rate / RBI rate / K/9 / RA/9, and the
    `dataVersion` flag. Uses the same `alias(teamGames,
    "opponent")` pattern as
    `oddsRepository.findTeamRunAverages` so the convention is
    consistent.

3.2. `fitCalibration(dataset)` — runs two small linear
    regressions:
    - Offensive: `teamRunsScored / leagueAbPerGame = wAVG·AVG
      + wSLG·SLG_approx + runRateConstant`, fit per
      `dataVersion`.
    - Pitching: `teamRA9 = kCoefficient·teamKPer9 +
      eraConstant`, fit per `dataVersion`.
    Implement the solver in plain TS (normal equations on the
    design matrix is enough; no need for an external lib).

3.3. Export `DEFAULT_LEGACY_CALIBRATION` and
    `DEFAULT_NEW_CALIBRATION` as typed fallbacks (start with
    the hand-tuned defaults from the spec; replace once the
    script is run against real data).

3.4. `writeCalibration(coeffs)` — small helper that formats
    the fitted coefficients as a TS source string for pasting
    into the constants file. The script is intentionally not
    wired into any build step.

### Phase 4 — Repository (`src/repositories/rosterProjectionRepository.ts`)

4.1. `findRosterStats(teamId, seasonIds)` — the spec's roster
    query, adapted: per-(player, season) aggregated stats from
    `playerGamesStats`, with the SQL `CASE WHEN seasonId <= 4
    THEN 'legacy' ELSE 'new' END` `dataVersion` column derived
    from `legacySeasonCutoff`. Joins `players` on `teamId` and
    filters by `inArray(playerGamesStats.seasonId, seasonIds)`.

4.2. `findLeagueAverages(seasonId)` — the spec's
    league-averages query. One row per season with `leagueAvg`,
    `leagueObp` (kept for forward-compatibility),
    `leagueRbiPerAb`, `leagueKRate`, `leagueHrPerAb`,
    `leagueRa9`, `leagueKPer9`. Compute `leagueAbPerGame` from
    a small follow-up query against `teamGames` (sum of AB
    across all games in the season divided by number of games)
    or — if simpler — derive it from the `playerGamesStats`
    totals.

4.3. `findActiveSeasonIds()` — convenience helper that returns
    the last 4 season ids for "current" projection runs
    (mirrors the convention in `oddsRepository.seasonRef`).

### Phase 5 — Service (`src/services/rosterProjectionService.ts`)

5.1. `projectTeamRoster(teamId, configOverride?)` — loads the
    roster + league averages via the repository, assembles a
    `RosterStats`, calls `projectRoster`. Returns the
    `TeamProjection`.

5.2. `projectMultipleTeamRosters(teamIds, configOverride?)` —
    parallel `Promise.all` wrapper. Used by the odds service
    so it can compute both teams' projections in one call.

5.3. (Optional, behind a feature flag / env check)
    `loadCalibrationCoefficients()` — reads
    `projectionCalibration.json` from disk if it exists; falls
    back to `DEFAULT_LEGACY_CALIBRATION` /
    `DEFAULT_NEW_CALIBRATION`. Keeps the option open to use
    fitted constants at runtime once the calibration script
    has been run, without changing the projector's API.

### Phase 6 — Odds engine integration (`src/lib/oddsEngine.ts` + `src/services/oddsService.ts`)

6.1. Extend `MatchOddsInput` (`oddsEngine.ts`) with optional
    `teamProjectedRS` / `teamProjectedRA` /
    `opponentProjectedRS` / `opponentProjectedRA` /
    `projectionWeight` (defaults to `priorWeight /
    (gamesPlayed + priorWeight)` — same Bayesian shape as the
    H2H shrinkage, but applied to RS/RA before the Pythagorean
    rating is computed).

6.2. Add a helper `blendObservedWithProjection(observedRS,
    observedRA, gamesPlayed, projectedRS, projectedRA, config)`
    in `oddsEngine.ts` that implements the "Part 3: Blending
    with observed data" math from the spec. Apply the blend
    before the Pythagorean rating so the existing `coldStart`
    logic stays intact.

6.3. Extend `computeMatchOdds` to:
    - Compute `teamProbWithoutProjection` /
      `opponentProbWithoutProjection` from the un-blended
      observed RS/RA (use `projectionWeight = 0`).
    - Return both sets of probabilities in `MatchOddsResult`,
      plus the projected RS/RA values.
    - Default behavior (no projection passed) is unchanged —
      the engine falls back to the existing cold-start
      shrinkage path.

6.4. Update `MatchOddsResult` with the new fields
    `teamProbWithoutProjection`, `opponentProbWithoutProjection`,
    `teamProjectedRS`, `opponentProjectedRS`,
    `teamProjectedRA`, `opponentProjectedRA`.

6.5. In `oddsService.computeSeasonOdds`, accept (or fetch)
    each team's projection at the start of the season and pass
    it into every `computeMatchOdds` call. Fetches happen
    once per `computeSeasonOdds` invocation (one batch of
    projections for all teams), not once per game.

6.6. In `oddsService.computePairOdds`, accept (or fetch) each
    team's projection and pass it in.

### Phase 7 — UI updates (`src/components/OddsBadge.tsx`)

7.1. Add the "with projection" vs "without projection
    (baseline)" comparison row at the top of the expandable
    drawer, matching the spec's mock layout:

    ```
    With player-aggregate projection:  62%  (-150)
    Without projection (baseline):     58%  (-140)
    ```

7.2. Add the "Projected RS / RA" rows underneath the existing
    RS / RA rows:

    ```
    Projected RS: 4.8 / game    Observed RS so far: 5.2
    Projected RA: 3.9 / game    Observed RA so far: 4.1
    ```

7.3. If `teamProb === teamProbWithoutProjection` (i.e. the
    projection wasn't available for one or both teams),
    suppress the comparison row so the drawer degrades
    cleanly.

7.4. Add a small `dataVersion` indicator ("Projection uses
    legacy data" / "Projection uses new data") at the bottom
    of the drawer — useful for the post-season-5 transition.

### Phase 8 — Wiring & verification

8.1. Verify `computeSeasonOdds` still works without
    projections (no DB schema changes → all existing call
    sites must keep passing). The projection lookup should be
    opt-in / non-throwing: if `rosterProjectionRepository`
    throws (empty team roster, etc.), the service should fall
    back to the pre-projection behavior and log a warning.

8.2. Add an integration smoke check: for at least one team
    in the seeded data, verify `projectTeamRoster` returns a
    `TeamProjection` with `reliability` other than `"low"`.
    (No new automated test infrastructure — a `console.log`
    check in dev is fine for v1.)

8.3. Run through the spec's "Sanity checks" section by hand
    against the live DB once the projector is wired in:
    - Two identical teams → 50/50.
    - All-league-mean roster → RS ≈ leagueRS.
    - Roster with 0 AB on every batter → full regression.
    - Late-season vs. early-season for the same team →
      numbers move smoothly toward observed RS/RA.

### Phase 9 — Documentation

9.1. Add a short note to `ODDS_ENGINE.md` under "Things the
    model does not account for (yet)" — flip the
    roster-changes / player-level-adjustments bullets to "now
    partially handled via the projection prior" and link to
    this doc.

9.2. Update the README (if relevant) with a one-line note
    that the matchup odds now blend in a pre-season roster
    projection.

### Out of scope for v1 (intentionally deferred)

- **The calibration script's first real run.** Phase 3 ships
  the scaffolding and defaults; running it against seasons
  1–4 happens in a follow-up once the projection output
  looks sane against the dev DB. Until then, the doc
  defaults (`wAVG = 1.0`, `wSLG = 1.5`, etc.) are what the
  projector uses.
- **v2 calibration constants for season-5+ data.** Same
  reason: there's no season-5 data yet, so the regression
  only fits against legacy data. The `dataVersion` plumbing
  is in place to make the v2 update a config swap.
- **Any of the "Things the data team might consider adding
  later" items.** Pure projection work; blocked on data
  tracking changes.
- **A "team outlook" widget** that consumes the projection
  directly outside the odds engine. The `TeamProjection` DTO
  is designed to support one, but the widget itself is a
  separate ticket.
