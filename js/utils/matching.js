/*
 * Filter matching: decides whether (and how well) a game matches the active filters.
 *
 * Each filter dimension evaluates to:
 *   - null  -> the dimension has no active selection (ignored)
 *   - true  -> the game matches at least one selected option (OR logic)
 *   - false -> the game matches none, or its value is 0 / missing
 */

import {
  ALL_FILTER_DIMENSIONS,
  FILTER_DIMENSION,
  FULL_PERCENTAGE,
  SIX_PLUS_PLAYERS_MINIMUM,
  SIX_PLUS_PLAYERS_OPTION_VALUE,
  TWO_PLAYER_ONLY_COUNT,
  TWO_PLAYER_ONLY_OPTION_VALUE,
} from '../constants.js';
import { appState, getFilterSelection } from '../state.js';
import { getDifficultyBucket } from './difficulty.js';
import { findLengthBucketById } from './filter-labels.js';

// ==================== Per-dimension checks ====================

function isTwoPlayerOnlyGame(game) {
  return game.minPlayers === TWO_PLAYER_ONLY_COUNT && game.maxPlayers === TWO_PLAYER_ONLY_COUNT;
}

function playerCountOptionFitsGame(playerCountOption, game) {
  if (playerCountOption === SIX_PLUS_PLAYERS_OPTION_VALUE) {
    return game.maxPlayers >= SIX_PLUS_PLAYERS_MINIMUM;
  }

  const playerCount = parseInt(playerCountOption, 10);

  return playerCount >= game.minPlayers && playerCount <= game.maxPlayers;
}

function playersDimensionPasses(game) {
  const selectedPlayerCounts = getFilterSelection(FILTER_DIMENSION.PLAYERS);

  if (!selectedPlayerCounts.length) {
    return null;
  }

  if (!game.minPlayers || !game.maxPlayers) {
    return false;
  }

  if (isTwoPlayerOnlyGame(game)) {
    return selectedPlayerCounts.length === 1 && selectedPlayerCounts[0] === TWO_PLAYER_ONLY_OPTION_VALUE;
  }

  return selectedPlayerCounts.some((playerCountOption) => playerCountOptionFitsGame(playerCountOption, game));
}

function difficultyDimensionPasses(game) {
  const selectedDifficultyValues = getFilterSelection(FILTER_DIMENSION.DIFFICULTY);

  if (!selectedDifficultyValues.length) {
    return null;
  }

  if (!game.weight) {
    return false;
  }

  const gameDifficultyBucket = getDifficultyBucket(game.weight);

  return selectedDifficultyValues.some(
    (difficultyValue) => parseInt(difficultyValue, 10) === gameDifficultyBucket
  );
}

function lengthBucketContainsGame(lengthBucketId, game) {
  const lengthBucket = findLengthBucketById(lengthBucketId);

  return Boolean(lengthBucket) &&
    game.length >= lengthBucket.minimumMinutes &&
    game.length < lengthBucket.maximumMinutes;
}

function lengthDimensionPasses(game) {
  const selectedLengthBucketIds = getFilterSelection(FILTER_DIMENSION.LENGTH);

  if (!selectedLengthBucketIds.length) {
    return null;
  }

  if (!game.length) {
    return false;
  }

  return selectedLengthBucketIds.some((lengthBucketId) => lengthBucketContainsGame(lengthBucketId, game));
}

function playStyleDimensionPasses(game) {
  const selectedPlayStyles = getFilterSelection(FILTER_DIMENSION.COOP);

  if (!selectedPlayStyles.length) {
    return null;
  }

  if (!game.type) {
    return false;
  }

  return selectedPlayStyles.includes(game.type);
}

const DIMENSION_CHECK_BY_DIMENSION = Object.freeze({
  [FILTER_DIMENSION.PLAYERS]: playersDimensionPasses,
  [FILTER_DIMENSION.DIFFICULTY]: difficultyDimensionPasses,
  [FILTER_DIMENSION.LENGTH]: lengthDimensionPasses,
  [FILTER_DIMENSION.COOP]: playStyleDimensionPasses,
});

// ==================== Public API ====================

export function dimensionPasses(game, dimension) {
  const dimensionCheck = DIMENSION_CHECK_BY_DIMENSION[dimension];

  if (!dimensionCheck) {
    return null;
  }

  return dimensionCheck(game);
}

function getActiveDimensionResults(game) {
  return ALL_FILTER_DIMENSIONS
    .map((dimension) => dimensionPasses(game, dimension))
    .filter((dimensionResult) => dimensionResult !== null);
}

// A game is listed when no filters are active, or when it passes at least one active dimension
// (OR logic) — or every active dimension when "exact matches only" is on (AND logic).
export function gameMatchesFilters(game) {
  const activeDimensionResults = getActiveDimensionResults(game);

  if (activeDimensionResults.length === 0) {
    return true;
  }

  if (appState.requireAllFilters) {
    return activeDimensionResults.every((dimensionResult) => dimensionResult === true);
  }

  return activeDimensionResults.some((dimensionResult) => dimensionResult === true);
}

// Share of active dimensions the game passes, rounded to a whole percent (null when none are active).
export function getMatchPercentage(game) {
  const activeDimensionResults = getActiveDimensionResults(game);

  if (activeDimensionResults.length === 0) {
    return null;
  }

  const passedDimensionCount = activeDimensionResults.filter(Boolean).length;

  return Math.round((passedDimensionCount / activeDimensionResults.length) * FULL_PERCENTAGE);
}

// True when one of the selected exact player counts is in the game's "best at" list.
export function isBestPlayerMatch(game) {
  const selectedPlayerCounts = getFilterSelection(FILTER_DIMENSION.PLAYERS);

  if (!selectedPlayerCounts.length || !game.bestPlayers) {
    return false;
  }

  return selectedPlayerCounts.some(
    (playerCountOption) =>
      playerCountOption !== SIX_PLUS_PLAYERS_OPTION_VALUE &&
      game.bestPlayers.includes(parseInt(playerCountOption, 10))
  );
}
