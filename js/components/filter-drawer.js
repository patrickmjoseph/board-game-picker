/*
 * Filter drawer: the accordion of filter categories plus the Clear / "See N results" footer.
 */

import {
  APPLY_FILTERS_ALL_GAMES_LABEL,
  APPLY_FILTERS_LABEL_PREFIX,
  APPLY_FILTERS_LABEL_SUFFIX,
  CATEGORY_OPTIONS_ID_PREFIX,
  CSS_CLASS,
  ELEMENT_ID,
} from '../constants.js';
import { resetSortToDefault, resetVisibleMatchCount } from '../state.js';
import { createDrawerController } from './drawer.js';
import { resetAllFilterDimensions } from './segmented-controls.js';
import { updateSortDisplay } from './sort-drawer.js';

// ==================== Category accordion ====================

function collapseAllCategories() {
  document.querySelectorAll(`.${CSS_CLASS.FILTER_CATEGORY_OPTIONS}`).forEach((categoryOptionsElement) => {
    categoryOptionsElement.hidden = true;
  });

  document.querySelectorAll(`.${CSS_CLASS.FILTER_CATEGORY}`).forEach((categoryElement) => {
    categoryElement.classList.remove(CSS_CLASS.FILTER_CATEGORY_OPEN);
  });
}

// Only one category is expanded at a time; clicking the open one collapses it.
function handleCategoryToggleClick(categoryToggleElement) {
  const categoryElement = categoryToggleElement.closest(`.${CSS_CLASS.FILTER_CATEGORY}`);
  const categoryOptionsId = CATEGORY_OPTIONS_ID_PREFIX + categoryToggleElement.dataset.target;
  const categoryOptionsElement = document.getElementById(categoryOptionsId);
  const wasOpen = !categoryOptionsElement.hidden;

  collapseAllCategories();

  if (!wasOpen) {
    categoryOptionsElement.hidden = false;
    categoryElement.classList.add(CSS_CLASS.FILTER_CATEGORY_OPEN);
  }
}

function initializeCategoryAccordion() {
  document.querySelectorAll(`.${CSS_CLASS.FILTER_CATEGORY_TOGGLE}`).forEach((categoryToggleElement) => {
    categoryToggleElement.addEventListener('click', () => {
      handleCategoryToggleClick(categoryToggleElement);
    });
  });
}

// ==================== Footer ====================

// "Clear" resets every filter and also restores the default sort.
function handleClearButtonClick(requestRender) {
  resetAllFilterDimensions();
  resetSortToDefault();
  updateSortDisplay();
  resetVisibleMatchCount();
  requestRender();
}

// ==================== Public API ====================

// With no filters applied the button reads "See all games"; otherwise "See N results".
export function updateFilterDrawerResultCount(matchingGameCount, isAnyFilterActive) {
  const applyButtonLabel = isAnyFilterActive
    ? APPLY_FILTERS_LABEL_PREFIX + matchingGameCount + APPLY_FILTERS_LABEL_SUFFIX
    : APPLY_FILTERS_ALL_GAMES_LABEL;

  document.getElementById(ELEMENT_ID.APPLY_FILTERS_BUTTON).textContent = applyButtonLabel;
}

export function initializeFilterDrawer({ requestRender }) {
  const { openDrawer, closeDrawer } = createDrawerController({
    drawerId: ELEMENT_ID.FILTER_DRAWER,
    backdropId: ELEMENT_ID.FILTER_BACKDROP,
    openButtonId: ELEMENT_ID.OPEN_FILTER_BUTTON,
    closeButtonId: ELEMENT_ID.CLOSE_FILTER_BUTTON,
  });

  initializeCategoryAccordion();

  document.getElementById(ELEMENT_ID.CLEAR_FILTERS_BUTTON).addEventListener('click', () => {
    handleClearButtonClick(requestRender);
  });

  document.getElementById(ELEMENT_ID.APPLY_FILTERS_BUTTON).addEventListener('click', closeDrawer);

  return { openDrawer };
}
