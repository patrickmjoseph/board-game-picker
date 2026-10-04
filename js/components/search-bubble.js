/*
 * Search bubble: the "Search within these games" pop-over opened from the toolbar.
 *
 * Typing filters the results by name. Pressing Enter with zero hits plays a
 * short wiggle + red-outline animation. Clicking anywhere outside closes it.
 */

import {
  CSS_CLASS,
  ELEMENT_ID,
  SEARCH_NO_MATCH_FEEDBACK_DURATION_MS,
  SEARCH_SUBMIT_KEY,
} from '../constants.js';
import { appState } from '../state.js';
import { gameMatchesFilters } from '../utils/matching.js';
import { filterGamesByName, normalizeSearchQuery } from '../utils/search.js';

const NO_MATCH_FEEDBACK_CLASSES = [CSS_CLASS.SEARCH_BUBBLE_WIGGLE, CSS_CLASS.SEARCH_BUBBLE_NO_MATCH];

function getSearchBubbleElement() {
  return document.getElementById(ELEMENT_ID.SEARCH_BUBBLE);
}

function getSearchToggleButton() {
  return document.getElementById(ELEMENT_ID.SEARCH_TOGGLE_BUTTON);
}

function getSearchInputElement() {
  return document.getElementById(ELEMENT_ID.SEARCH_INPUT);
}

function getClearSearchButton() {
  return document.getElementById(ELEMENT_ID.CLEAR_SEARCH_BUTTON);
}

// ==================== Open / close ====================

function openSearchBubble() {
  const searchToggleButton = getSearchToggleButton();

  getSearchBubbleElement().hidden = false;
  searchToggleButton.classList.add(CSS_CLASS.TOOLBAR_BUTTON_ACTIVE);
  searchToggleButton.setAttribute('aria-expanded', 'true');
  getSearchInputElement().focus();
}

function closeSearchBubble() {
  const searchToggleButton = getSearchToggleButton();

  getSearchBubbleElement().hidden = true;
  searchToggleButton.classList.remove(CSS_CLASS.TOOLBAR_BUTTON_ACTIVE);
  searchToggleButton.setAttribute('aria-expanded', 'false');
}

function handleSearchToggleClick(clickEvent) {
  clickEvent.stopPropagation();

  if (getSearchBubbleElement().hidden) {
    openSearchBubble();
  } else {
    closeSearchBubble();
  }
}

function handleOutsideClick() {
  if (!getSearchBubbleElement().hidden) {
    closeSearchBubble();
  }
}

// ==================== Typing / clearing ====================

function handleSearchInput(inputEvent, requestRender) {
  appState.searchQuery = inputEvent.target.value;
  getClearSearchButton().hidden = !appState.searchQuery;
  requestRender();
}

function handleClearSearchClick(requestRender) {
  const searchInputElement = getSearchInputElement();

  appState.searchQuery = '';
  searchInputElement.value = '';
  getClearSearchButton().hidden = true;
  searchInputElement.focus();
  requestRender();
}

// ==================== "No match" feedback on Enter ====================

function countSearchMatches(normalizedSearchQuery) {
  const filterMatchedGames = appState.games.filter(gameMatchesFilters);

  return filterGamesByName(filterMatchedGames, normalizedSearchQuery).length;
}

// Restarts the wiggle animation (forcing a reflow in between), then removes it.
function playNoMatchFeedback() {
  const searchBubbleElement = getSearchBubbleElement();

  searchBubbleElement.classList.remove(...NO_MATCH_FEEDBACK_CLASSES);
  void searchBubbleElement.offsetWidth;
  searchBubbleElement.classList.add(...NO_MATCH_FEEDBACK_CLASSES);

  setTimeout(() => {
    searchBubbleElement.classList.remove(...NO_MATCH_FEEDBACK_CLASSES);
  }, SEARCH_NO_MATCH_FEEDBACK_DURATION_MS);
}

function handleSearchKeydown(keyboardEvent) {
  if (keyboardEvent.key !== SEARCH_SUBMIT_KEY) {
    return;
  }

  const normalizedSearchQuery = normalizeSearchQuery(appState.searchQuery);

  if (!normalizedSearchQuery) {
    return;
  }

  if (countSearchMatches(normalizedSearchQuery) === 0) {
    playNoMatchFeedback();
  }
}

// ==================== Public API ====================

export function initializeSearchBubble({ requestRender }) {
  const searchInputElement = getSearchInputElement();

  getSearchToggleButton().addEventListener('click', handleSearchToggleClick);

  getSearchBubbleElement().addEventListener('click', (clickEvent) => {
    clickEvent.stopPropagation();
  });

  document.addEventListener('click', handleOutsideClick);

  searchInputElement.addEventListener('input', (inputEvent) => {
    handleSearchInput(inputEvent, requestRender);
  });

  searchInputElement.addEventListener('keydown', handleSearchKeydown);

  getClearSearchButton().addEventListener('click', () => {
    handleClearSearchClick(requestRender);
  });
}
