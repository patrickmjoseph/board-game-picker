/*
 * Formatters that turn selected filter values into human-readable labels,
 * shared by the filter drawer readouts and the active filter chips.
 */

import {
  LENGTH_BUCKETS,
  MULTIPLE_PLAYERS_READOUT_SUFFIX,
  PLAY_STYLE_FILTER_LABELS,
  SINGLE_PLAYER_READOUT_SUFFIX,
  SIX_PLUS_PLAYERS_OPTION_VALUE,
} from '../constants.js';
import { getWeightWord } from './difficulty.js';

const LABEL_SEPARATOR = ', ';

export function findLengthBucketById(lengthBucketId) {
  return LENGTH_BUCKETS.find((lengthBucket) => lengthBucket.id === lengthBucketId);
}

export function formatPlayerCountList(selectedPlayerCounts) {
  return selectedPlayerCounts.join(LABEL_SEPARATOR);
}

export function formatDifficultyList(selectedDifficultyValues) {
  return selectedDifficultyValues
    .map((difficultyValue) => getWeightWord(parseInt(difficultyValue, 10)))
    .join(LABEL_SEPARATOR);
}

export function formatLengthList(selectedLengthBucketIds) {
  return selectedLengthBucketIds
    .map((lengthBucketId) => findLengthBucketById(lengthBucketId).label)
    .join(LABEL_SEPARATOR);
}

export function formatPlayStyleList(selectedPlayStyles) {
  return selectedPlayStyles
    .map((playStyle) => PLAY_STYLE_FILTER_LABELS[playStyle])
    .join(LABEL_SEPARATOR);
}

// e.g. "2 player", "6+ players", "2, 3 players"
export function formatPlayerReadout(selectedPlayerCounts) {
  const isSingleExactCount =
    selectedPlayerCounts.length === 1 &&
    selectedPlayerCounts[0] !== SIX_PLUS_PLAYERS_OPTION_VALUE;

  const suffix = isSingleExactCount
    ? SINGLE_PLAYER_READOUT_SUFFIX
    : MULTIPLE_PLAYERS_READOUT_SUFFIX;

  return formatPlayerCountList(selectedPlayerCounts) + suffix;
}
