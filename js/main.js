/*
 * Entry point: wires every component together, then loads games.json and
 * performs the first render.
 */

import {
  GAMES_DATA_FETCH_OPTIONS,
  GAMES_DATA_URL,
  LOAD_FAILURE_CONSOLE_PREFIX,
  LOAD_FAILURE_MESSAGE,
  LOAD_FAILURE_TITLE,
} from './constants.js';
import { appState } from './state.js';
import { initializeActiveFilters, renderActiveFilters } from './components/active-filters.js';
import { initializeBackToTopButton } from './components/back-to-top-button.js';
import { createEmptyStateHtml } from './components/empty-state.js';
import { initializeFilterDrawer } from './components/filter-drawer.js';
import { initializeResults, renderResults, renderResultsMessage } from './components/results.js';
import { initializeSearchBubble } from './components/search-bubble.js';
import { initializeSegmentedControls } from './components/segmented-controls.js';
import { initializeSortDrawer, updateSortDisplay } from './components/sort-drawer.js';
import { updateFilterCountBadge } from './components/toolbar.js';

// ==================== Rendering ====================

// Re-renders everything that depends on app state. Passed to components as `requestRender`.
function renderApplication() {
  renderActiveFilters();
  updateFilterCountBadge();
  renderResults();
}

// ==================== Data loading ====================

async function fetchGames() {
  const response = await fetch(GAMES_DATA_URL, GAMES_DATA_FETCH_OPTIONS);

  if (!response.ok) {
    throw new Error('HTTP ' + response.status);
  }

  return response.json();
}

function showLoadFailure(loadError) {
  console.error(LOAD_FAILURE_CONSOLE_PREFIX, loadError);

  renderResultsMessage(createEmptyStateHtml(LOAD_FAILURE_TITLE, LOAD_FAILURE_MESSAGE));
}

async function loadGamesAndRender() {
  try {
    appState.games = await fetchGames();
    renderApplication();
  } catch (loadError) {
    showLoadFailure(loadError);
  }
}

// ==================== Bootstrap ====================

function initializeComponents() {
  const componentOptions = { requestRender: renderApplication };

  initializeSegmentedControls(componentOptions);
  const { openDrawer: openFilterDrawer } = initializeFilterDrawer(componentOptions);
  initializeSortDrawer(componentOptions);
  initializeResults(componentOptions);
  initializeActiveFilters(componentOptions);
  initializeSearchBubble(componentOptions);
  initializeBackToTopButton();

  return { openFilterDrawer };
}

const { openFilterDrawer } = initializeComponents();
updateSortDisplay();
loadGamesAndRender();
openFilterDrawer();
