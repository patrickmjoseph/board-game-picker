/*
 * Filter readouts: the small grey summaries ("2, 3 players") shown next to
 * each category name in the Filter drawer.
 */

import { FILTER_DIMENSION, FILTER_READOUT_ID_BY_DIMENSION } from '../constants.js';
import { getFilterSelection } from '../state.js';
import {
  formatDifficultyList,
  formatLengthList,
  formatPlayerReadout,
  formatPlayStyleList,
} from '../utils/filter-labels.js';

const READOUT_FORMATTER_BY_DIMENSION = Object.freeze({
  [FILTER_DIMENSION.PLAYERS]: formatPlayerReadout,
  [FILTER_DIMENSION.DIFFICULTY]: formatDifficultyList,
  [FILTER_DIMENSION.LENGTH]: formatLengthList,
  [FILTER_DIMENSION.COOP]: formatPlayStyleList,
});

function getReadoutElement(dimension) {
  return document.getElementById(FILTER_READOUT_ID_BY_DIMENSION[dimension]);
}

export function clearFilterReadout(dimension) {
  getReadoutElement(dimension).textContent = '';
}

export function updateFilterReadout(dimension) {
  const selectedValues = getFilterSelection(dimension);

  if (selectedValues.length === 0) {
    clearFilterReadout(dimension);
    return;
  }

  const formatReadout = READOUT_FORMATTER_BY_DIMENSION[dimension];

  getReadoutElement(dimension).textContent = formatReadout(selectedValues);
}
