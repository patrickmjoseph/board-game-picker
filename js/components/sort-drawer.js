/*
 * Sort drawer: the list of sort fields, the direction toggle and the current-sort label.
 */

import {
  CSS_CLASS,
  CURRENT_SORT_CHOSEN_PREFIX,
  CURRENT_SORT_DEFAULT_PREFIX,
  ELEMENT_ID,
  SORT_FIELD_LABELS,
} from '../constants.js';
import { appState, chooseSortField, getSortDirectionArrow, toggleSortDirection } from '../state.js';
import { createDrawerController } from './drawer.js';

// e.g. "BoardGameGeek Rank ↑"
export function getSortDescription() {
  return `${SORT_FIELD_LABELS[appState.sortField]} ${getSortDirectionArrow()}`;
}

function highlightActiveSortOption() {
  document.querySelectorAll(`.${CSS_CLASS.SORT_OPTION}`).forEach((sortOptionElement) => {
    const isActive = sortOptionElement.dataset.val === appState.sortField;

    sortOptionElement.classList.toggle(CSS_CLASS.SORT_OPTION_ACTIVE, isActive);
  });
}

function updateCurrentSortLabel() {
  const labelPrefix = appState.isSortChosenByUser
    ? CURRENT_SORT_CHOSEN_PREFIX
    : CURRENT_SORT_DEFAULT_PREFIX;

  document.getElementById(ELEMENT_ID.SORT_CURRENT_LABEL).textContent = `${labelPrefix} ${getSortDescription()}`;
}

// Syncs every piece of sort UI in the drawer with the current sort state.
export function updateSortDisplay() {
  highlightActiveSortOption();

  document.getElementById(ELEMENT_ID.SORT_DIRECTION_BUTTON).textContent = getSortDirectionArrow();

  updateCurrentSortLabel();
}

// ==================== Event handlers ====================

function handleSortOptionClick(clickEvent, closeDrawer, requestRender) {
  const sortOptionElement = clickEvent.target.closest(`.${CSS_CLASS.SORT_OPTION}`);

  if (!sortOptionElement) {
    return;
  }

  chooseSortField(sortOptionElement.dataset.val);
  updateSortDisplay();
  requestRender();
  closeDrawer();
}

function handleSortDirectionClick(requestRender) {
  toggleSortDirection();
  updateSortDisplay();
  requestRender();
}

// ==================== Public API ====================

export function initializeSortDrawer({ requestRender }) {
  const { closeDrawer } = createDrawerController({
    drawerId: ELEMENT_ID.SORT_DRAWER,
    backdropId: ELEMENT_ID.SORT_BACKDROP,
    openButtonId: ELEMENT_ID.OPEN_SORT_BUTTON,
    closeButtonId: ELEMENT_ID.CLOSE_SORT_BUTTON,
  });

  document.getElementById(ELEMENT_ID.SORT_OPTION_LIST).addEventListener('click', (clickEvent) => {
    handleSortOptionClick(clickEvent, closeDrawer, requestRender);
  });

  document.getElementById(ELEMENT_ID.SORT_DIRECTION_BUTTON).addEventListener('click', () => {
    handleSortDirectionClick(requestRender);
  });
}
