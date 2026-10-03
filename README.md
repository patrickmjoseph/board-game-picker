# Carrom Board Game Cafe — Board Game Picker

A self-contained web app for browsing and filtering the cafe's board game collection, hosted via GitHub Pages.

## How the live data works

- `index.html` is the app. On load, it fetches `games.json` for the current collection (name, player count, length, complexity, BGG rank, thumbnail, description, etc.) rather than embedding the data in the page.
- `games.json` is kept up to date automatically by the **"Refresh game data from BoardGameGeek"** GitHub Action (`.github/workflows/update-games.yml`), which runs daily and does two things:
  1. **Syncs membership** against the cafe's `CarromBGC` collection on BGG — any game newly marked "own" in that collection is added to `games.json`, and any game removed from the collection is removed from `games.json`.
  2. **Refreshes stats** for every game now in `games.json` (rank movements, rating changes, updated thumbnails/descriptions, etc.).
- Because GitHub Pages serves whatever is on the default branch, a refreshed `games.json` goes live automatically — no manual steps.

## Adding or removing games

Just add or remove the game in the `CarromBGC` collection on BoardGameGeek (marked "own"). The next scheduled run (or a manual one, see below) picks up the change automatically — no spreadsheet upload, no manual edit needed.

One caveat: BGG doesn't have a field for the cafe's own Competitive/Coop/Teams tagging, so for a **brand-new** game the Action best-effort guesses it — `coop` if BGG tags the game with its "Cooperative Game" category, `comp` otherwise. It can't detect "Teams" at all. After a sync adds something, it's worth a quick check of that game's `type` field in `games.json` (and a manual edit + push if it's wrong) — the Action will never overwrite `type` again once a value is set, so the fix sticks.

## One-time setup

1. **Add your BGG API token as a repo secret**: Settings → Secrets and variables → Actions → New repository secret → name it `BGG_TOKEN`, value is your BoardGameGeek application token.
2. **Enable GitHub Pages**: Settings → Pages → Build and deployment → Source: "Deploy from a branch" → Branch: `main` (or your default branch) → `/ (root)`. Your live URL will be `https://<username>.github.io/<repo-name>/`.
3. The Action is scheduled to run daily at 09:00 UTC. You can also trigger it manually any time from the **Actions** tab → "Refresh game data from BoardGameGeek" → **Run workflow** — useful right after adding a new game to BGG if you don't want to wait for the schedule.

## Note on manual overrides

Because every field except `id` and `type` is overwritten by whatever BGG reports on each refresh, any one-off manual corrections (e.g. a hand-set rank or best-player-count) will be replaced the next time the Action runs. If a particular field needs a permanent manual override regardless of what BGG says, that needs to be special-cased in `scripts/fetch-games.js`.
