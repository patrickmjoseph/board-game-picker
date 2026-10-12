/*
 * Exact-match switch: the "Exact matches only" toggle in the filter drawer.
 * On (default) = AND logic, off = OR logic.
 */

import { CSS_CLASS, ELEMENT_ID } from '../constants.js';
import { appState, DEFAULT_REQUIRE_ALL_FILTERS, resetVisibleMatchCount, setRequireAllFilters } from '../state.js';

function getSwitchElement() {
  return document.getElementById(ELEMENT_ID.EXACT_MATCH_SWITCH);
}

function showSwitchState(isOn) {
  const switchElement = getSwitchElement();

  switchElement.classList.toggle(CSS_CLASS.EXACT_MATCH_SWITCH_ON, isOn);
  switchElement.setAttribute('aria-checked', String(isOn));
}

// Back to the default (AND logic); does not re-render.
export function resetExactMatchSwitch() {
  setRequireAllFilters(DEFAULT_REQUIRE_ALL_FILTERS);
  showSwitchState(DEFAULT_REQUIRE_ALL_FILTERS);
}

export function initializeExactMatchSwitch({ requestRender }) {
  showSwitchState(appState.requireAllFilters);

  getSwitchElement().addEventListener('click', () => {
    const isNowOn = !appState.requireAllFilters;

    setRequireAllFilters(isNowOn);
    showSwitchState(isNowOn);
    resetVisibleMatchCount();
    requestRender();
  });
}
