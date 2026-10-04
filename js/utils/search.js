/*
 * Free-text search helpers for the "Search within these games" bubble.
 */

export function normalizeSearchQuery(searchQuery) {
  return searchQuery.trim().toLowerCase();
}

export function gameNameIncludesQuery(game, normalizedSearchQuery) {
  return game.name.toLowerCase().includes(normalizedSearchQuery);
}

export function filterGamesByName(games, normalizedSearchQuery) {
  return games.filter((game) => gameNameIncludesQuery(game, normalizedSearchQuery));
}
