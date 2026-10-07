/*
 * Exact-match switch: the "Exact matches only" toggle in the filter drawer.
 * Off (default) = OR logic, on = AND logic.
 */

import { CSS_CLASS, ELEMENT_ID } from '../constants.js';
import { appState, resetVisibleMatchCount, setRequireAllFilters } from '../state.js';

function getSwitchElement() {
  return document.getElementById(ELEMENT_ID.EXACT_MATCH_SWITCH);
}

function showSwitchState(isOn) {
  const switchElement = getSwitchElement();

  switchElement.classList.toggle(CSS_CLASS.EXACT_MATCH_SWITCH_ON, isOn);
  switchElement.setAttribute('aria-checked', String(isOn));
}

// Back to the default (OR logic); does not re-render.
export function resetExactMatchSwitch() {
  setRequireAllFilters(false);
  showSwitchState(false);
}

export function initializeExactMatchSwitch({ requestRender }) {
  getSwitchElement().addEventListener('click', () => {
    const isNowOn = !appState.requireAllFilters;

    setRequireAllFilters(isNowOn);
    showSwitchState(isNowOn);
    resetVisibleMatchCount();
    requestRender();
  });
}
