// fetch-games.js
// Refreshes games.json with the latest stats from BoardGameGeek's XML API
// (rank, rating, weight/complexity, playing time, player counts, thumbnail,
// description) for every game already in the collection.
//
// Fields NOT touched (preserved from the existing games.json, since BGG
// doesn't provide them): id, type (comp/coop/teams, curated by the cafe).
//
// Run with:  node scripts/fetch-games.js
// Requires env var BGG_TOKEN (a BoardGameGeek application API token).
// In GitHub Actions this comes from a repo secret; locally you can run:
//   BGG_TOKEN=your-token-here node scripts/fetch-games.js

const fs = require('fs');
const path = require('path');

const TOKEN = process.env.BGG_TOKEN;
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
      description: descMatch ? shorten(descMatch[1], MAX_DESC_LENGTH) : null
    };
  }
  return results;
}

async function fetchBatch(ids, attempt = 1) {
  const url = `https://boardgamegeek.com/xmlapi2/thing?id=${ids.join(",")}&stats=1`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${TOKEN}` } });

  if (res.status === 202) {
    console.log("  Got 202 (processing), retrying in 5s...");
    await sleep(5000);
    return fetchBatch(ids, attempt);
  }

  if (!res.ok) {
    if (res.status === 429 && attempt <= 3) {
      console.log(`  Got 429, backing off and retrying (attempt ${attempt})...`);
      await sleep(5000 * attempt);
      return fetchBatch(ids, attempt + 1);
    }
    console.error(`  Batch failed: HTTP ${res.status} for ids ${ids.join(",")}`);
    if (res.status === 401) console.error("  -> 401 means BGG_TOKEN is missing/invalid.");
    return {};
  }

  const xml = await res.text();
  return parseGames(xml);
}

async function main() {
  if (!TOKEN) {
    console.error("Missing BGG_TOKEN environment variable.");
    process.exit(1);
  }

  const games = JSON.parse(fs.readFileSync(GAMES_PATH, 'utf-8'));
  const ids = games.map(g => g.id);

  console.log(`Refreshing stats for ${ids.length} games...`);

  const batches = chunk(ids, BATCH_SIZE);
  const updates = {};

  for (let i = 0; i < batches.length; i++) {
    console.log(`Fetching batch ${i + 1} of ${batches.length} (${batches[i].length} games)...`);
    const result = await fetchBatch(batches[i]);
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
      description: fresh.description || g.description
      // id and type are intentionally never overwritten
    };
  });

  fs.writeFileSync(GAMES_PATH, JSON.stringify(merged, null, 2) + '\n');

  console.log(`\nDone. Updated ${updatedCount} of ${games.length} games (${missingCount} not returned by BGG, left unchanged).`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
