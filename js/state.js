/*
 * Shared, mutable application state plus small helpers that read or update it.
 */

import {
  ALL_FILTER_DIMENSIONS,
  DEFAULT_SORT_DIRECTION,
  DEFAULT_SORT_FIELD,
  INITIAL_VISIBLE_MATCH_COUNT,
  SORT_DIRECTION,
  SORT_DIRECTION_ARROWS,
  VISIBLE_MATCH_COUNT_INCREMENT,
} from './constants.js';

export const appState = {
  games: [],
  visibleMatchCount: INITIAL_VISIBLE_MATCH_COUNT,
  sortField: DEFAULT_SORT_FIELD,
  sortDirection: DEFAULT_SORT_DIRECTION,
  isSortChosenByUser: false,
  searchQuery: '',

  // false = OR logic (a game may match any active filter); true = AND logic (must match all).
  requireAllFilters: false,

  // Selected option values per filter dimension; an empty array means "Any".
  filterSelections: {
    players: [],
    difficulty: [],
    length: [],
    coop: [],
  },
};

// ==================== Pagination ====================

export function resetVisibleMatchCount() {
  appState.visibleMatchCount = INITIAL_VISIBLE_MATCH_COUNT;
}

export function increaseVisibleMatchCount() {
  appState.visibleMatchCount += VISIBLE_MATCH_COUNT_INCREMENT;
}

export function showAllMatches() {
  appState.visibleMatchCount = Infinity;
}

// ==================== Filters ====================

export function getFilterSelection(dimension) {
  return appState.filterSelections[dimension];
}

export function clearFilterSelection(dimension) {
  appState.filterSelections[dimension] = [];
}

export function clearAllFilterSelections() {
  ALL_FILTER_DIMENSIONS.forEach((dimension) => {
    clearFilterSelection(dimension);
  });
}

export function countActiveFilterDimensions() {
  return ALL_FILTER_DIMENSIONS
    .filter((dimension) => getFilterSelection(dimension).length > 0)
    .length;
}

export function hasAnyActiveFilter() {
  return countActiveFilterDimensions() > 0;
}

export function setRequireAllFilters(shouldRequireAll) {
  appState.requireAllFilters = shouldRequireAll;
}

// ==================== Sorting ====================

export function chooseSortField(sortField) {
  appState.sortField = sortField;
  appState.sortDirection = SORT_DIRECTION.ASCENDING;
  appState.isSortChosenByUser = true;
}

export function toggleSortDirection() {
  const isCurrentlyDescending = appState.sortDirection === SORT_DIRECTION.DESCENDING;

  appState.sortDirection = isCurrentlyDescending
    ? SORT_DIRECTION.ASCENDING
    : SORT_DIRECTION.DESCENDING;

  appState.isSortChosenByUser = true;
}

export function resetSortToDefault() {
  appState.sortField = DEFAULT_SORT_FIELD;
  appState.sortDirection = DEFAULT_SORT_DIRECTION;
  appState.isSortChosenByUser = false;
}

export function getSortDirectionArrow() {
  if (appState.sortDirection === SORT_DIRECTION.DESCENDING) {
    return SORT_DIRECTION_ARROWS.desc;
  }

  return SORT_DIRECTION_ARROWS.asc;
}
