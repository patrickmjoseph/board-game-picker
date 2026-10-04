// fetch-mechanics.js
// One-off script: populates a "mechanics" field (array of BGG mechanism
// names, e.g. "Area Majority / Influence", "Variable Set-up") on every game
// already in games.json, pulled from BGG's "thing" endpoint.
//
// This does not touch any other field, and is not part of the daily
// scheduled sync (see .github/workflows/update-games.yml / fetch-games.js)
// — it's meant to be run once to backfill the new field.
//
// Run with:  node scripts/fetch-mechanics.js
// Requires env var BGG_TOKEN (a BoardGameGeek application API token).

const fs = require('fs');
const path = require('path');

const TOKEN = process.env.BGG_TOKEN;
const GAMES_PATH = path.join(__dirname, '..', 'games.json');
const BATCH_SIZE = 20;
const DELAY_MS = 1500; // be polite between batches, per BGG's usage guidance

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

function parseMechanicsByGameId(xml) {
  const results = {};
  const itemRegex = /<item[^>]*id="(\d+)"[^>]*>([\s\S]*?)<\/item>/g;
  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const id = match[1];
    const body = match[2];

    const mechanicLinkRegex = /<link[^>]*type="boardgamemechanic"[^>]*value="([^"]*)"[^>]*\/?>/g;
    const mechanics = [];
    let linkMatch;
    while ((linkMatch = mechanicLinkRegex.exec(body)) !== null) {
      mechanics.push(decodeEntities(linkMatch[1]));
    }
    results[id] = mechanics.sort((a, b) => a.localeCompare(b));
  }
  return results;
}

async function fetchMechanicsBatch(ids, attempt = 1) {
  const url = `https://boardgamegeek.com/xmlapi2/thing?id=${ids.join(",")}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${TOKEN}` } });

  if (res.status === 202) {
    console.log("  Got 202 (processing), retrying in 5s...");
    await sleep(5000);
    return fetchMechanicsBatch(ids, attempt);
  }

  if (!res.ok) {
    if (res.status === 429 && attempt <= 3) {
      console.log(`  Got 429, backing off and retrying (attempt ${attempt})...`);
      await sleep(5000 * attempt);
      return fetchMechanicsBatch(ids, attempt + 1);
    }
    console.error(`  Batch failed: HTTP ${res.status} for ids ${ids.join(",")}`);
    if (res.status === 401) console.error("  -> 401 means BGG_TOKEN is missing/invalid.");
    return {};
  }

  const xml = await res.text();
  return parseMechanicsByGameId(xml);
}

async function main() {
  if (!TOKEN) {
    console.error("Missing BGG_TOKEN environment variable.");
    process.exit(1);
  }

  const games = JSON.parse(fs.readFileSync(GAMES_PATH, 'utf-8'));
  const ids = games.map(g => g.id);
  console.log(`Fetching mechanics for ${ids.length} games...`);

  const batches = chunk(ids, BATCH_SIZE);
  const mechanicsById = {};

  for (let i = 0; i < batches.length; i++) {
    console.log(`Fetching batch ${i + 1} of ${batches.length} (${batches[i].length} games)...`);
    const result = await fetchMechanicsBatch(batches[i]);
    Object.assign(mechanicsById, result);
    if (i < batches.length - 1) await sleep(DELAY_MS);
  }

  let updatedCount = 0;
  let missingCount = 0;

  const merged = games.map(g => {
    const mechanics = mechanicsById[g.id];
    if (!mechanics) {
      missingCount++;
      return g;
    }
    updatedCount++;
    return { ...g, mechanics };
  });

  fs.writeFileSync(GAMES_PATH, JSON.stringify(merged, null, 2) + '\n');
  console.log(`\nDone. Set mechanics on ${updatedCount} of ${games.length} games (${missingCount} not returned by BGG, left unchanged).`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
