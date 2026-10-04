/*
 * Segmented controls: the multi-select option groups inside each filter category.
 *
 * Picking "Any" clears the dimension. Picking any other option toggles it,
 * and "Any" is highlighted again whenever nothing else remains selected.
 */

import {
  ALL_FILTER_DIMENSIONS,
  ANY_OPTION_VALUE,
  CSS_CLASS,
  SEGMENTED_CONTROL_ID_BY_DIMENSION,
} from '../constants.js';
import { clearFilterSelection, getFilterSelection, resetVisibleMatchCount } from '../state.js';
import { clearFilterReadout, updateFilterReadout } from './filter-readouts.js';

const ANY_OPTION_SELECTOR = `[data-val="${ANY_OPTION_VALUE}"]`;

function getSegmentedControlElement(dimension) {
  return document.getElementById(SEGMENTED_CONTROL_ID_BY_DIMENSION[dimension]);
}

function setOptionActive(optionElement, isActive) {
  optionElement.classList.toggle(CSS_CLASS.SEGMENTED_CONTROL_OPTION_ACTIVE, isActive);
}

function deactivateAllOptions(segmentedControlElement) {
  [...segmentedControlElement.children].forEach((childElement) => {
    childElement.classList.remove(CSS_CLASS.SEGMENTED_CONTROL_OPTION_ACTIVE);
  });
}

// ==================== Selection handling ====================

function selectAnyOption(dimension, segmentedControlElement, anyOptionElement) {
  clearFilterSelection(dimension);
  deactivateAllOptions(segmentedControlElement);
  setOptionActive(anyOptionElement, true);
}

function toggleSpecificOption(dimension, optionElement, anyOptionElement) {
  const selectedValues = getFilterSelection(dimension);
  const optionValue = optionElement.dataset.val;
  const selectedIndex = selectedValues.indexOf(optionValue);

  if (selectedIndex === -1) {
    selectedValues.push(optionValue);
    setOptionActive(optionElement, true);
  } else {
    selectedValues.splice(selectedIndex, 1);
    setOptionActive(optionElement, false);
  }

  setOptionActive(anyOptionElement, selectedValues.length === 0);
}

function handleSegmentedControlClick(clickEvent, dimension, segmentedControlElement, requestRender) {
  const optionElement = clickEvent.target.closest('button');

  if (!optionElement) {
    return;
  }

  const anyOptionElement = segmentedControlElement.querySelector(ANY_OPTION_SELECTOR);

  if (optionElement.dataset.val === ANY_OPTION_VALUE) {
    selectAnyOption(dimension, segmentedControlElement, anyOptionElement);
  } else {
    toggleSpecificOption(dimension, optionElement, anyOptionElement);
  }

  updateFilterReadout(dimension);
  resetVisibleMatchCount();
  requestRender();
}

// ==================== Public API ====================

// Clears one dimension's selection, option highlights and readout (does not re-render).
export function resetFilterDimension(dimension) {
  clearFilterSelection(dimension);
  deactivateAllOptions(getSegmentedControlElement(dimension));
  clearFilterReadout(dimension);
}

export function resetAllFilterDimensions() {
  ALL_FILTER_DIMENSIONS.forEach((dimension) => {
    resetFilterDimension(dimension);
  });
}

export function initializeSegmentedControls({ requestRender }) {
  ALL_FILTER_DIMENSIONS.forEach((dimension) => {
    const segmentedControlElement = getSegmentedControlElement(dimension);

    segmentedControlElement.addEventListener('click', (clickEvent) => {
      handleSegmentedControlClick(clickEvent, dimension, segmentedControlElement, requestRender);
    });
  });
}
