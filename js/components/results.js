/*
 * Results: filters, searches, sorts and paginates the game list, then renders
 * the results count, the game cards and the "Show more" / "Show all" buttons.
 */

import {
  CSS_CLASS,
  ELEMENT_ID,
  NO_MATCHES_MESSAGE,
  NO_MATCHES_TITLE,
  VISIBLE_MATCH_COUNT_INCREMENT,
} from '../constants.js';
import { appState, hasAnyActiveFilter, increaseVisibleMatchCount, showAllMatches } from '../state.js';
import { gameMatchesFilters } from '../utils/matching.js';
import { filterGamesByName, normalizeSearchQuery } from '../utils/search.js';
import { sortMatchedGames } from '../utils/sorting.js';
import { createEmptyStateHtml } from './empty-state.js';
import { updateFilterDrawerResultCount } from './filter-drawer.js';
import { createGameCardHtml, handleDetailsToggleClick, handleThumbnailLoadError } from './game-card.js';

// ==================== Building the visible list ====================

// Games matching the filters (and search query, if any), sorted and cut to the visible page.
function buildResultsPage() {
  const filterMatchedGames = appState.games.filter(gameMatchesFilters);
  const normalizedSearchQuery = normalizeSearchQuery(appState.searchQuery);

  const searchedGames = normalizedSearchQuery
    ? filterGamesByName(filterMatchedGames, normalizedSearchQuery)
    : filterMatchedGames.slice();

  sortMatchedGames(searchedGames);

  const isTruncated = searchedGames.length > appState.visibleMatchCount;

  return {
    filterMatchedCount: filterMatchedGames.length,
    totalResultCount: searchedGames.length,
    visibleGames: isTruncated ? searchedGames.slice(0, appState.visibleMatchCount) : searchedGames,
    hiddenResultCount: isTruncated ? searchedGames.length - appState.visibleMatchCount : 0,
    isTruncated,
  };
}

// ==================== Rendering ====================

function formatResultsCountText(resultsPage) {
  if (!resultsPage.isTruncated) {
    return `${resultsPage.totalResultCount} of ${appState.games.length} games`;
  }

  if (hasAnyActiveFilter()) {
    return `Showing top ${appState.visibleMatchCount} of ${resultsPage.totalResultCount} matches`;
  }

  return `Showing ${appState.visibleMatchCount} of ${resultsPage.totalResultCount} games`;
}

function createPaginationButtonsHtml(resultsPage) {
  if (!resultsPage.isTruncated) {
    return '';
  }

  const nextBatchSize = Math.min(VISIBLE_MATCH_COUNT_INCREMENT, resultsPage.hiddenResultCount);
  const showAllSuffix = hasAnyActiveFilter() ? ' matches' : '';

  return `
          <button class="${CSS_CLASS.SHOW_MORE_BUTTON}" id="${ELEMENT_ID.SHOW_MORE_MATCHES_BUTTON}">Show ${nextBatchSize} more games</button>
          <button class="${CSS_CLASS.SHOW_ALL_MATCHES_LINK}" id="${ELEMENT_ID.SHOW_ALL_MATCHES_LINK}">Show all${showAllSuffix}</button>
        `;
}

function createResultsListHtml(resultsPage) {
  if (!resultsPage.visibleGames.length) {
    return createEmptyStateHtml(NO_MATCHES_TITLE, NO_MATCHES_MESSAGE);
  }

  const gameCardsHtml = resultsPage.visibleGames
    .map((game) => createGameCardHtml(game, false))
    .join('');

  return `<div class="${CSS_CLASS.RESULTS_LIST}">${gameCardsHtml}</div>${createPaginationButtonsHtml(resultsPage)}`;
}

export function renderResults() {
  const resultsCountElement = document.getElementById(ELEMENT_ID.RESULTS_COUNT);

  if (!appState.games.length) {
    resultsCountElement.textContent = '';
    return;
  }

  const resultsPage = buildResultsPage();

  resultsCountElement.textContent = formatResultsCountText(resultsPage);
  updateFilterDrawerResultCount(resultsPage.filterMatchedCount, hasAnyActiveFilter());

  document.getElementById(ELEMENT_ID.RESULTS_AREA).innerHTML = createResultsListHtml(resultsPage);
}

export function renderResultsMessage(resultsMessageHtml) {
  document.getElementById(ELEMENT_ID.RESULTS_AREA).innerHTML = resultsMessageHtml;
}

// ==================== Event handlers ====================

function handleResultsAreaClick(clickEvent, requestRender) {
  if (handleDetailsToggleClick(clickEvent)) {
    return;
  }

  if (clickEvent.target.closest(`#${ELEMENT_ID.SHOW_MORE_MATCHES_BUTTON}`)) {
    increaseVisibleMatchCount();
    requestRender();
    return;
  }

  if (clickEvent.target.closest(`#${ELEMENT_ID.SHOW_ALL_MATCHES_LINK}`)) {
    showAllMatches();
    requestRender();
  }
}

// ==================== Public API ====================

export function initializeResults({ requestRender }) {
  const resultsAreaElement = document.getElementById(ELEMENT_ID.RESULTS_AREA);

  resultsAreaElement.addEventListener('click', (clickEvent) => {
    handleResultsAreaClick(clickEvent, requestRender);
  });

  resultsAreaElement.addEventListener('error', handleThumbnailLoadError, true);
}
