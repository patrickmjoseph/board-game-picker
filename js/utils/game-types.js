/*
 * A game's `type` in games.json is one play style ("coop", "teams", "comp"),
 * or a list of them for games that play more than one way.
 */

// Always returns an array of play styles (empty when the game has none).
export function getGameTypes(game) {
  if (Array.isArray(game.type)) {
    return game.type;
  }

  return game.type ? [game.type] : [];
}
