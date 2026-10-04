/*
 * Sorting of the matched games list. Exactly two tiers:
 *   1. Match percentage, best match first (always wins).
 *   2. The user's chosen sort field and direction, applied within each tier.
 * Games that are still tied fall back to alphabetical order for a stable listing.
 */

import { SORT_DIRECTION, SORT_FIELD, UNRANKED_GAME_RANK } from '../constants.js';
import { appState } from '../state.js';
import { getMatchPercentage } from './matching.js';

const ASCENDING_MULTIPLIER = 1;
const DESCENDING_MULTIPLIER = -1;

// Missing lengths/weights sort as if infinitely large.
const NUMERIC_SORT_VALUE_GETTERS = Object.freeze({
  [SORT_FIELD.LENGTH]: (game) => (game.length != null ? game.length : Infinity),
  [SORT_FIELD.COMPLEXITY]: (game) => (game.weight != null ? game.weight : Infinity),
});

function getDirectionMultiplier() {
  if (appState.sortDirection === SORT_DIRECTION.ASCENDING) {
    return ASCENDING_MULTIPLIER;
  }

  return DESCENDING_MULTIPLIER;
}

function compareAlphabetically(firstGame, secondGame) {
  return firstGame.name.localeCompare(secondGame.name);
}

// ==================== Tier 1: match percentage ====================

function compareByMatchPercentage(firstGame, secondGame) {
  const firstPercentage = getMatchPercentage(firstGame);
  const secondPercentage = getMatchPercentage(secondGame);

  if (firstPercentage == null && secondPercentage == null) {
    return 0;
  }

  const firstPercentageOrZero = firstPercentage == null ? 0 : firstPercentage;
  const secondPercentageOrZero = secondPercentage == null ? 0 : secondPercentage;

  return secondPercentageOrZero - firstPercentageOrZero;
}

// ==================== Tier 2: chosen sort field ====================

function isUnranked(game) {
  return game.rank === UNRANKED_GAME_RANK;
}

// Unranked games always go last, regardless of direction.
function compareByRank(firstGame, secondGame, directionMultiplier) {
  const firstUnrankedFlag = isUnranked(firstGame) ? 1 : 0;
  const secondUnrankedFlag = isUnranked(secondGame) ? 1 : 0;

  if (firstUnrankedFlag !== secondUnrankedFlag) {
    return firstUnrankedFlag - secondUnrankedFlag;
  }

  if (firstUnrankedFlag === 1) {
    return 0;
  }

  return (firstGame.rank - secondGame.rank) * directionMultiplier;
}

function compareByNumericField(firstGame, secondGame, directionMultiplier, getSortValue) {
  return (getSortValue(firstGame) - getSortValue(secondGame)) * directionMultiplier;
}

function compareByChosenSortField(firstGame, secondGame) {
  const directionMultiplier = getDirectionMultiplier();

  if (appState.sortField === SORT_FIELD.RANK) {
    return compareByRank(firstGame, secondGame, directionMultiplier);
  }

  const getSortValue = NUMERIC_SORT_VALUE_GETTERS[appState.sortField];

  if (getSortValue) {
    return compareByNumericField(firstGame, secondGame, directionMultiplier, getSortValue);
  }

  return compareAlphabetically(firstGame, secondGame) * directionMultiplier;
}

// ==================== Combined comparator ====================

function compareMatchedGames(firstGame, secondGame) {
  const matchPercentageDifference = compareByMatchPercentage(firstGame, secondGame);

  if (matchPercentageDifference !== 0) {
    return matchPercentageDifference;
  }

  const chosenSortDifference = compareByChosenSortField(firstGame, secondGame);

  if (chosenSortDifference !== 0) {
    return chosenSortDifference;
  }

  return compareAlphabetically(firstGame, secondGame);
}

// Sorts the given array in place.
export function sortMatchedGames(matchedGames) {
  matchedGames.sort(compareMatchedGames);
}
