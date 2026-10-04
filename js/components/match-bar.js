/*
 * Match bar: builds the HTML for the colored "NN%" filter-match progress bar.
 */

import {
  CSS_CLASS,
  MINIMUM_MATCH_BAR_WIDTH_PERCENT,
  MODERATE_MATCH_BAR_COLOR,
  MODERATE_MATCH_PERCENTAGE_THRESHOLD,
  STRONG_MATCH_BAR_COLOR,
  STRONG_MATCH_PERCENTAGE_THRESHOLD,
  WEAK_MATCH_BAR_COLOR,
} from '../constants.js';

function getMatchBarColor(matchPercentage) {
  if (matchPercentage >= STRONG_MATCH_PERCENTAGE_THRESHOLD) {
    return STRONG_MATCH_BAR_COLOR;
  }

  if (matchPercentage >= MODERATE_MATCH_PERCENTAGE_THRESHOLD) {
    return MODERATE_MATCH_BAR_COLOR;
  }

  return WEAK_MATCH_BAR_COLOR;
}

// Returns an empty string when no filters are active (matchPercentage is null).
export function createMatchBarHtml(matchPercentage) {
  if (matchPercentage === null) {
    return '';
  }

  const fillWidthPercent = Math.max(matchPercentage, MINIMUM_MATCH_BAR_WIDTH_PERCENT);
  const fillColor = getMatchBarColor(matchPercentage);

  return `
        <div class="${CSS_CLASS.MATCH_BAR}">
          <div class="${CSS_CLASS.MATCH_BAR_FILL}" style="width:${fillWidthPercent}%; background:${fillColor}">${matchPercentage}%</div>
        </div>
      `;
}
