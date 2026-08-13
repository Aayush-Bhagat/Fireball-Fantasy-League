# Match Odds & Win Probability Engine

This feature computes win probabilities and American moneyline odds for
matchups between teams, and shows them on the **Schedule** page. It was built
to be reused — a future league-wide power ranking page, a playoff-bracket
simulator, or a "who's favored this week" widget could all build on top of the
same pieces.

This doc is a plain-English overview for anyone adding to it later. The code
itself is the source of truth, but this should help you find your way around.

---

## What it does, in one paragraph

For any two teams, the engine estimates each team's overall strength from how
many runs it scores and allows per game this season, compares the two
strengths head-to-head, nudges the result slightly toward whoever has won more
of their past meetings, and turns that into a win percentage and a moneyline.
The math is a few well-known baseball formulas chained together.

---

## The math, in plain terms

There are four steps. You don't need to memorize the formulas — just
understand what each step is *for*.

### 1. Rate each team's strength (the "Pythagorean" idea)

A team that scores a lot and allows few is strong. We turn a team's average
runs scored (RS) and average runs allowed (RA) into a single **strength
rating** between 0 and 1:

```
strength = RS^x / (RS^x + RA^x)
```

- `x` is a number that makes the formula fit the league's scoring environment.
  Higher-scoring leagues need a slightly bigger `x`.
- We compute `x` **dynamically** from the league's average runs per game so it
  adapts to Mario Super Sluggers' run environment:
  `x = (2 × league runs per game) ^ 0.287`
- This is the "Pythagenpat" variant of Bill James's Pythagorean expectation.

### 2. Compare the two strengths head-to-head (the "Log5" idea)

Two teams each have a strength rating (say 0.60 and 0.45). You can't just
subtract them to get a win probability — that's not how odds work. Bill
James's **Log5** formula is the correct way to turn two independent strength
ratings into "probability A beats B":

```
P(A beats B) = (W_A − W_A·W_B) / (W_A + W_B − 2·W_A·W_B)
```

Equal teams come out at 50/50, as they should.

### 3. Blend in head-to-head history (the "Bayesian shrinkage" idea)

If these two teams have played each other before this season, that's useful
information — but in a 10-game season it's a very small sample, so we don't
let it overpower the season-wide strength ratings. We **blend** the Log5
probability with the head-to-head win rate, weighting the head-to-head by how
many games were played:

```
weight = N / (N + M)            # N = head-to-head games, M = 10 (a constant)
final = (1 − weight) × Log5 + weight × headToHeadRate
```

- With 0 head-to-head games: pure Log5 (weight = 0).
- With a lot of head-to-head games: head-to-head matters more.
- `M = 10` is the "prior weight" — it takes 10 head-to-head games for the
  head-to-head rate to outweigh the season averages. This lives in
  `DEFAULT_ODDS_CONFIG.priorM` if you ever want to tune it.

### 4. Turn the probability into a moneyline

Standard American odds conversion: a 64% chance is roughly −178 (you'd bet
$178 to win $100); a 36% chance is roughly +150 (you'd bet $100 to win $150).

---

## Two kinds of odds — important distinction

The engine itself is pure math; it doesn't know or care where the numbers come
from. The **same engine** powers two different views, which feed it numbers
from different slices of the season:

| Where | What "RS / RA / H2H" means | Code |
| --- | --- | --- |
| **Schedule cards** (going-in odds) | Only games played **before** that matchup. A week-3 game's odds reflect weeks 1–2 only, so a game's own result never leaks into its own odds. Built in-memory from the schedule array. | `computeSeasonOdds` in `services/oddsService.ts` |
| **Odds Calculator** (pair odds) | **Season-to-date** aggregates — all completed games count. This is the right model for "who's favored in a hypothetical next matchup." Uses SQL `avg()` queries. | `computePairOdds` in `services/oddsService.ts` |

If you build a power-ranking page, you almost certainly want the
**season-to-date** approach (like the calculator), not the going-in one.

---

## Where things live

```
src/
├── lib/
│   └── oddsEngine.ts            # PURE math. No DB. Start here.
├── services/
│   └── oddsService.ts           # Assembles inputs and calls the engine.
│                                 #   computeSeasonOdds  → schedule cards
│                                 #   computePairOdds    → calculator / future reuse
├── repositories/
│   └── oddsRepository.ts        # SQL aggregates for the pair-odds path
│                                 #   (league RPG, per-team RS/RA, H2H records)
├── dtos/
│   └── gameDtos.ts              # MatchOddsDto, TeamPairOddsDto (what the UI/JSON sees)
├── components/
│   ├── OddsBadge.tsx            # The % badge + the expandable breakdown drawer
│   └── OddsCalculator.tsx       # Pick-two-teams widget at the bottom of /schedule
└── app/
    ├── schedule/page.tsx        # Renders ScheduleList + OddsCalculator
    └── api/seasons/[season]/odds/route.ts   # GET ?teamA=&teamB= (used by the calculator)
```

### The engine (`src/lib/oddsEngine.ts`)

- **Pure TypeScript, no database access.** You give it numbers, it gives you a
  `MatchOddsResult`. This makes it trivial to unit-test and to reuse anywhere.
- Single entry point: `computeMatchOdds(input: MatchOddsInput)`.
- Also exports the individual steps (`pythagenpatExponent`,
  `pythagoreanWinExpectancy`, `log5Probability`, `bayesianShrinkage`,
  `toAmericanOdds`) in case you want to build something that only uses part of
  the pipeline — for example, a power ranking might just use each team's
  `pythagoreanWinExpectancy` as its rating and skip Log5/H2H entirely.

### The service (`src/services/oddsService.ts`)

This is the "glue" that fetches data and hands it to the engine:

- `computeSeasonOdds(games)` — walks the schedule week-by-week, keeping
  running totals of each team's runs and head-to-head record, and snapshots
  odds for each game using only prior weeks. **Zero extra DB queries** — it
  works off the `games` array the schedule page already loaded.
- `computePairOdds(seasonId, teamAId, teamBId)` — fetches season-to-date
  aggregates via `oddsRepository` and runs the engine for one pair.

---

## The DTO — what the UI and API see

`MatchOddsDto` (in `src/dtos/gameDtos.ts`) is the engine's output, serialized
for the frontend. Notable fields:

- `teamProb` / `opponentProb` — the final win percentages (0–1).
- `teamAmerican` / `opponentAmerican` — moneylines.
- `teamWinExpectancy` / `opponentWinExpectancy` — each team's raw strength
  rating from step 1 (great material for a power ranking).
- `teamRunsScored` / `teamRunsAllowed` (and opponent equivalents) — the per-game
  averages fed into the engine.
- `leagueRpg`, `pythagenpatExponent` — the run environment and resulting `x`.
- `h2hGamesPlayed`, `h2hProbability`, `h2hWeight` — the head-to-head slice and
  how much it influenced the final number.
- `coldStart` — true when a team has very few games played (its rating is
  regressed toward the league baseline, so don't trust it yet).

---

## Configuration

All tunable constants live in `DEFAULT_ODDS_CONFIG` (`src/lib/oddsEngine.ts`)
and can be overridden per-call via `MatchOddsInput.config`:

| Setting | Default | What it means |
| --- | --- | --- |
| `priorM` | `10` | How many head-to-head games it takes for H2H to match the weight of the season averages. Bigger = trust season averages more. |
| `defaultRunsPerGame` | `4.5` | Fallback RS/RA for a team with no games played. |
| `defaultLeagueRpg` | `9.0` | Fallback league runs/game when no games are completed yet. |
| `coldStartThreshold` | `3` | Teams with fewer than this many games are flagged `coldStart`. |
| `sparseH2HThreshold` | `3` | H2H samples at or below this are flagged `sparseSample`. (Currently not surfaced in the UI — we removed the indicator because a 10-game season always trips it.) |
| `epsilon` | `1e-5` | Tiny number to avoid divide-by-zero. Leave alone. |

---

## Reusing this for new features

A few common scenarios:

- **League power rankings:** Call `computeMatchOdds` (or just
  `pythagoreanWinExpectancy` directly) once per team using season-to-date
  RS/RA from `oddsRepository`. Sort by `teamWinExpectancy`. You may want to
  reweight by strength of schedule — that's not currently in the model.
- **"Who's favored this week" widget:** Use `computePairOdds` for each
  upcoming game on the schedule. (The schedule cards already do something
  similar with going-in odds; pair-odds would give a cleaner season-to-date
  number if you prefer that framing.)
- **Playoff bracket simulation:** Run `computeMatchOdds` per series and use
  `teamProb` as the series win probability (caveat: it's a single-game
  probability, not a true series probability — you'd want to extend it for
  best-of-N).
- **Different run environment (e.g. exhibition games):** The engine takes
  `leagueRpg` as an input, so you can compute a separate exponent for a
  different pool of games without touching the engine.

### Things the model does **not** account for (yet)

- Home-field advantage (the schema has no home/away fields).
- Stadium-specific scoring environments.
- Roster changes over time (older games count the same as recent ones).
- Player-level adjustments (it's purely team-level run totals).

If you need any of these, the cleanest extension point is the *data assembly*
in `oddsService` / `oddsRepository` — feed different or weighted numbers into
the same engine. The math itself rarely needs to change.

---

## Quick sanity checks

When tweaking the engine, these should hold:

- Two identical teams (same RS/RA, no H2H) → 50/50, moneylines ±100.
- A team that scores way more and allows way less → high probability, large
  negative moneyline (big favorite).
- A team with 0 games played → `coldStart: true`, rating falls back to the
  league baseline (~0.500 strength).
- Adding head-to-head games should pull the final probability toward the H2H
  win rate, but never violently (the `M = 10` prior dampens small samples).
