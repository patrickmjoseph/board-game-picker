/*
 * Back-to-top button: appears once the page is scrolled down, and smoothly
 * scrolls back to the top when clicked.
 */

import {
  BACK_TO_TOP_SCROLL_THRESHOLD_PIXELS,
  ELEMENT_ID,
  SCROLL_TO_TOP_OPTIONS,
} from '../constants.js';

function getBackToTopButton() {
  return document.getElementById(ELEMENT_ID.BACK_TO_TOP_BUTTON);
}

function updateBackToTopVisibility() {
  getBackToTopButton().hidden = window.scrollY < BACK_TO_TOP_SCROLL_THRESHOLD_PIXELS;
}

export function initializeBackToTopButton() {
  getBackToTopButton().addEventListener('click', () => {
    window.scrollTo(SCROLL_TO_TOP_OPTIONS);
  });

  window.addEventListener('scroll', updateBackToTopVisibility);
}
