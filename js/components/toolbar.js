/*
 * Toolbar: keeps the Filter button's active-filter count badge in sync.
 */

import { ELEMENT_ID } from '../constants.js';
import { countActiveFilterDimensions } from '../state.js';

export function updateFilterCountBadge() {
  const filterCountBadgeElement = document.getElementById(ELEMENT_ID.FILTER_COUNT_BADGE);
  const activeFilterCount = countActiveFilterDimensions();

  filterCountBadgeElement.textContent = activeFilterCount;
  filterCountBadgeElement.hidden = activeFilterCount === 0;
}
