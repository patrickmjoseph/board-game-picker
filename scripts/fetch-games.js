// fetch-games.js
// Keeps games.json in sync with the cafe's "CarromBGC" collection on
// BoardGameGeek, and refreshes stats for every game in it.
//
// Two phases:
//   1. Sync membership: pull the current CarromBGC collection list from BGG
//      and diff it against games.json. Games newly added to the BGG
//      collection are added here; games removed from the BGG collection are
//      removed here too.
//   2. Refresh stats: for every game now in games.json, pull fresh rank,
//      rating, weight/complexity, playing time, player counts, thumbnail,
//      and description from BGG's "thing" endpoint.
//
// Fields NOT auto-overwritten for games that already existed: id, type.
// For brand-new games, type is best-effort guessed (see detectType below)
// since BGG's collection/thing data doesn't have a direct "comp/coop/teams"
// field the cafe uses; re-check it after a sync adds something new.
//
// Run with:  node scripts/fetch-games.js
// Requires env var BGG_TOKEN (a BoardGameGeek application API token).
// In GitHub Actions this comes from a repo secret; locally you can run:
//   BGG_TOKEN=your-token-here node scripts/fetch-games.js

const fs = require('fs');
const path = require('path');

const TOKEN = process.env.BGG_TOKEN;
const BGG_USERNAME = 'CarromBGC';
const GAMES_PATH = path.join(__dirname, '..', 'games.json');
const BATCH_SIZE = 20;
const DELAY_MS = 1500; // be polite between batches, per BGG's usage guidance
const MAX_DESC_LENGTH = 220;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

const ENTITY_MAP = {
  "&amp;": "&", "&quot;": '"', "&apos;": "'", "&#39;": "'",
  "&lt;": "<", "&gt;": ">", "&rsquo;": "’", "&lsquo;": "‘",
  "&rdquo;": "”", "&ldquo;": "“", "&ndash;": "–",
  "&mdash;": "—", "&nbsp;": " ", "&hellip;": "…"
};

function decodeEntities(str) {
  let out = str.replace(/&#(\d+);/g, (_, code) => String.fromCharCode(code));
  Object.entries(ENTITY_MAP).forEach(([entity, char]) => {
    out = out.split(entity).join(char);
  });
  return out;
}

function stripTags(str) {
  return str.replace(/<br\s*\/?>/gi, " ").replace(/<[^>]+>/g, "");
}

function shorten(text, maxLen) {
  const clean = decodeEntities(stripTags(text)).replace(/\s+/g, " ").trim();
  if (clean.length <= maxLen) return clean;
  const cut = clean.slice(0, maxLen);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > 0 ? cut.slice(0, lastSpace) : cut).trim() + "…";
}

function attr(itemBody, tag, attrName) {
  const re = new RegExp(`<${tag}[^>]*${attrName}="([^"]*)"[^>]*/?>`);
  const m = itemBody.match(re);
  return m ? m[1] : null;
}

// ---------- Phase 1: sync membership against the BGG collection ----------

async function fetchCollectionIds(attempt = 1) {
  const url = `https://boardgamegeek.com/xmlapi2/collection?username=${encodeURIComponent(BGG_USERNAME)}&own=1&subtype=boardgame`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${TOKEN}` } });

  if (res.status === 202) {
    console.log("Collection request queued by BGG (202), retrying in 5s...");
    await sleep(5000);
    return fetchCollectionIds(attempt);
  }

  if (!res.ok) {
    if ((res.status === 429 || res.status === 502 || res.status === 503) && attempt <= 5) {
      console.log(`Collection fetch got HTTP ${res.status}, retrying (attempt ${attempt})...`);
      await sleep(5000 * attempt);
      return fetchCollectionIds(attempt + 1);
    }
    throw new Error(`Failed to fetch BGG collection for "${BGG_USERNAME}": HTTP ${res.status}`);
  }

  const xml = await res.text();
  const items = [];
  const itemRegex = /<item[^>]*objectid="(\d+)"[^>]*>([\s\S]*?)<\/item>/g;
  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const id = match[1];
    const nameMatch = match[2].match(/<name[^>]*>([^<]*)<\/name>/);
    items.push({ id, name: nameMatch ? decodeEntities(nameMatch[1]) : null });
  }
  return items;
}

// ---------- Phase 2: refresh/populate stats from the "thing" endpoint ----------

function parseGames(xml) {
  const results = {};
  const itemRegex = /<item[^>]*id="(\d+)"[^>]*>([\s\S]*?)<\/item>/g;
  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const id = match[1];
    const body = match[2];

    const nameMatch = body.match(/<name[^>]*type="primary"[^>]*value="([^"]*)"/);
    const thumbMatch = body.match(/<thumbnail>([\s\S]*?)<\/thumbnail>/);
    const descMatch = body.match(/<description>([\s\S]*?)<\/description>/);

    // Best-player-count votes: look at each <results numplayers="N"> poll block
    const bestPlayers = [];
    const pollBlocks = [...body.matchAll(/<results numplayers="([^"]+)">([\s\S]*?)<\/results>/g)];
    pollBlocks.forEach(([, numplayers, block]) => {
      const bestVotes = (block.match(/<result value="Best"[^>]*numvotes="(\d+)"/) || [])[1];
      const recVotes = (block.match(/<result value="Recommended"[^>]*numvotes="(\d+)"/) || [])[1];
      const best = parseInt(bestVotes || "0", 10);
      const rec = parseInt(recVotes || "0", 10);
      if (best > rec && best > 0) bestPlayers.push(parseInt(numplayers, 10));
    });

    // BGG board game rank specifically (not family/subtype ranks)
    const rankMatch = body.match(/<rank[^>]*name="boardgame"[^>]*value="([^"]*)"/);
    const rankVal = rankMatch ? rankMatch[1] : null;
    const rank = (rankVal === 'Not Ranked' || rankVal == null) ? 0 : parseInt(rankVal, 10);

    // Best-effort play-style guess for brand-new games: BGG tags cooperative
    // games with a "Cooperative Game" category link. Nothing reliably marks
    // "Teams" games, so that always needs a manual check.
    const isCoop = /<link[^>]*type="boardgamecategory"[^>]*value="Cooperative Game"/.test(body);

    results[id] = {
      name: nameMatch ? decodeEntities(nameMatch[1]) : null,
      year: parseFloat(attr(body, "yearpublished", "value")) || null,
      minPlayers: parseFloat(attr(body, "minplayers", "value")) || null,
      maxPlayers: parseFloat(attr(body, "maxplayers", "value")) || null,
      length: parseFloat(attr(body, "playingtime", "value")) || null,
      weight: (() => {
        const m = body.match(/<averageweight value="([^"]*)"/);
        return m ? parseFloat(m[1]) : null;
      })(),
      rating: (() => {
        const m = body.match(/<average value="([^"]*)"/);
        return m ? parseFloat(m[1]) : null;
      })(),
      rank,
      bestPlayers: bestPlayers.length ? bestPlayers : null,
      thumbnail: thumbMatch ? thumbMatch[1].trim() : null,
      description: descMatch ? shorten(descMatch[1], MAX_DESC_LENGTH) : null,
      detectedType: isCoop ? 'coop' : 'comp'
    };
  }
  return results;
}

async function fetchStatsBatch(ids, attempt = 1) {
  const url = `https://boardgamegeek.com/xmlapi2/thing?id=${ids.join(",")}&stats=1`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${TOKEN}` } });

  if (res.status === 202) {
    console.log("  Got 202 (processing), retrying in 5s...");
    await sleep(5000);
    return fetchStatsBatch(ids, attempt);
  }

  if (!res.ok) {
    if (res.status === 429 && attempt <= 3) {
      console.log(`  Got 429, backing off and retrying (attempt ${attempt})...`);
      await sleep(5000 * attempt);
      return fetchStatsBatch(ids, attempt + 1);
    }
    console.error(`  Batch failed: HTTP ${res.status} for ids ${ids.join(",")}`);
    if (res.status === 401) console.error("  -> 401 means BGG_TOKEN is missing/invalid.");
    return {};
  }

  const xml = await res.text();
  return parseGames(xml);
}

function writeGithubOutput(fields) {
  const outPath = process.env.GITHUB_OUTPUT;
  if (!outPath) return;
  const lines = Object.entries(fields).map(([k, v]) => `${k}=${v}`).join('\n') + '\n';
  fs.appendFileSync(outPath, lines);
}

async function main() {
  if (!TOKEN) {
    console.error("Missing BGG_TOKEN environment variable.");
    process.exit(1);
  }

  let games = JSON.parse(fs.readFileSync(GAMES_PATH, 'utf-8'));
  const existingIds = new Set(games.map(g => g.id));

  console.log(`Checking the "${BGG_USERNAME}" BGG collection for membership changes...`);
  const collection = await fetchCollectionIds();
  const collectionIds = new Set(collection.map(c => c.id));

  const added = collection.filter(c => !existingIds.has(c.id));
  const removed = games.filter(g => !collectionIds.has(g.id));

  if (added.length) {
    console.log(`Adding ${added.length} new game(s) from the BGG collection: ${added.map(g => g.name).join(', ')}`);
    added.forEach(({ id, name }) => {
      games.push({
        id, name,
        year: null, minPlayers: null, maxPlayers: null, length: null,
        weight: null, rating: null, bestPlayers: null,
        thumbnail: null, type: null, description: null, rank: 0
      });
    });
  }

  if (removed.length) {
    console.log(`Removing ${removed.length} game(s) no longer in the BGG collection: ${removed.map(g => g.name).join(', ')}`);
    const removedIds = new Set(removed.map(g => g.id));
    games = games.filter(g => !removedIds.has(g.id));
  }

  if (!added.length && !removed.length) {
    console.log("No membership changes.");
  }

  const ids = games.map(g => g.id);
  console.log(`\nRefreshing stats for ${ids.length} games...`);

  const batches = chunk(ids, BATCH_SIZE);
  const updates = {};

  for (let i = 0; i < batches.length; i++) {
    console.log(`Fetching batch ${i + 1} of ${batches.length} (${batches[i].length} games)...`);
    const result = await fetchStatsBatch(batches[i]);
    Object.assign(updates, result);
    if (i < batches.length - 1) await sleep(DELAY_MS);
  }

  let updatedCount = 0;
  let missingCount = 0;

  const merged = games.map(g => {
    const fresh = updates[g.id];
    if (!fresh) {
      missingCount++;
      return g; // keep as-is if BGG didn't return data for this id
    }
    updatedCount++;
    return {
      ...g,
      name: fresh.name || g.name,
      year: fresh.year != null ? fresh.year : g.year,
      minPlayers: fresh.minPlayers != null ? fresh.minPlayers : g.minPlayers,
      maxPlayers: fresh.maxPlayers != null ? fresh.maxPlayers : g.maxPlayers,
      length: fresh.length != null ? fresh.length : g.length,
      weight: fresh.weight != null ? fresh.weight : g.weight,
      rating: fresh.rating != null ? fresh.rating : g.rating,
      rank: fresh.rank != null ? fresh.rank : g.rank,
      bestPlayers: fresh.bestPlayers || g.bestPlayers,
      thumbnail: fresh.thumbnail || g.thumbnail,
      description: fresh.description || g.description,
      // type is preserved as-is for existing games; only ever set here when
      // it's still null, i.e. a brand-new game this run just added
      type: g.type != null ? g.type : fresh.detectedType
      // id is never overwritten
    };
  });

  fs.writeFileSync(GAMES_PATH, JSON.stringify(merged, null, 2) + '\n');

  console.log(`\nDone. Updated ${updatedCount} of ${games.length} games (${missingCount} not returned by BGG, left unchanged).`);
  if (added.length) console.log(`Added: ${added.map(g => g.name).join(', ')}`);
  if (removed.length) console.log(`Removed: ${removed.map(g => g.name).join(', ')}`);

  writeGithubOutput({
    added_count: added.length,
    removed_count: removed.length,
    added_names: added.map(g => g.name).join(', ').slice(0, 500),
    removed_names: removed.map(g => g.name).join(', ').slice(0, 500)
  });
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
