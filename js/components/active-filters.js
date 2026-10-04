/*
 * Active filters row: one removable chip per active filter dimension, plus a
 * sort chip (only when the user picked a sort) that reverses or resets the sort.
 */

import {
  ALL_FILTER_DIMENSIONS,
  CSS_CLASS,
  ELEMENT_ID,
  FILTER_CHIP_PREFIX_BY_DIMENSION,
  FILTER_DIMENSION,
  SORT_CHIP_PREFIX,
  SORT_CHIP_REMOVE_LABEL,
  SORT_CHIP_TOGGLE_TITLE,
} from '../constants.js';
import {
  appState,
  getFilterSelection,
  resetSortToDefault,
  resetVisibleMatchCount,
  toggleSortDirection,
} from '../state.js';
import {
  formatDifficultyList,
  formatLengthList,
  formatPlayerCountList,
  formatPlayStyleList,
} from '../utils/filter-labels.js';
import { resetFilterDimension } from './segmented-controls.js';
import { getSortDescription, updateSortDisplay } from './sort-drawer.js';

const CHIP_VALUE_FORMATTER_BY_DIMENSION = Object.freeze({
  [FILTER_DIMENSION.PLAYERS]: formatPlayerCountList,
  [FILTER_DIMENSION.DIFFICULTY]: formatDifficultyList,
  [FILTER_DIMENSION.LENGTH]: formatLengthList,
  [FILTER_DIMENSION.COOP]: formatPlayStyleList,
});

// ==================== Rendering ====================

function createFilterChipLabel(dimension) {
  const formatChipValue = CHIP_VALUE_FORMATTER_BY_DIMENSION[dimension];
  const formattedValues = formatChipValue(getFilterSelection(dimension));

  return `${FILTER_CHIP_PREFIX_BY_DIMENSION[dimension]}: ${formattedValues}`;
}

function createFilterChipHtml(dimension) {
  return `
      <button class="${CSS_CLASS.FILTER_CHIP}" data-filter="${dimension}">${createFilterChipLabel(dimension)} <span class="${CSS_CLASS.FILTER_CHIP_REMOVE_ICON}">&times;</span></button>
    `;
}

function createAllFilterChipsHtml() {
  return ALL_FILTER_DIMENSIONS
    .filter((dimension) => getFilterSelection(dimension).length > 0)
    .map(createFilterChipHtml)
    .join('');
}

function createSortChipHtml() {
  if (!appState.isSortChosenByUser) {
    return '';
  }

  return `
      <span class="${CSS_CLASS.SORT_CHIP}">
        <button class="${CSS_CLASS.SORT_CHIP_TOGGLE}" id="${ELEMENT_ID.SORT_CHIP_TOGGLE}" title="${SORT_CHIP_TOGGLE_TITLE}">${SORT_CHIP_PREFIX} ${getSortDescription()}</button>
        <button class="${CSS_CLASS.SORT_CHIP_REMOVE_BUTTON}" id="${ELEMENT_ID.SORT_CHIP_REMOVE}" aria-label="${SORT_CHIP_REMOVE_LABEL}" title="${SORT_CHIP_REMOVE_LABEL}">&times;</button>
      </span>
    `;
}

export function renderActiveFilters() {
  const activeFiltersElement = document.getElementById(ELEMENT_ID.ACTIVE_FILTERS_ROW);

  activeFiltersElement.innerHTML = createAllFilterChipsHtml() + createSortChipHtml();
}

// ==================== Event handlers ====================

function handleSortChipRemove(requestRender) {
  resetSortToDefault();
  updateSortDisplay();
  requestRender();
}

function handleSortChipToggle(requestRender) {
  toggleSortDirection();
  updateSortDisplay();
  requestRender();
}

function handleFilterChipRemove(filterChipElement, requestRender) {
  resetFilterDimension(filterChipElement.dataset.filter);
  resetVisibleMatchCount();
  requestRender();
}

function handleActiveFiltersClick(clickEvent, requestRender) {
  if (clickEvent.target.closest(`#${ELEMENT_ID.SORT_CHIP_REMOVE}`)) {
    handleSortChipRemove(requestRender);
    return;
  }

  if (clickEvent.target.closest(`#${ELEMENT_ID.SORT_CHIP_TOGGLE}`)) {
    handleSortChipToggle(requestRender);
    return;
  }

  const filterChipElement = clickEvent.target.closest(`.${CSS_CLASS.FILTER_CHIP}`);

  if (filterChipElement) {
    handleFilterChipRemove(filterChipElement, requestRender);
  }
}

// ==================== Public API ====================

export function initializeActiveFilters({ requestRender }) {
  document.getElementById(ELEMENT_ID.ACTIVE_FILTERS_ROW).addEventListener('click', (clickEvent) => {
    handleActiveFiltersClick(clickEvent, requestRender);
  });
}
