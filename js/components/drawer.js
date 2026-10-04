/*
 * Drawer: shared open/close behavior for the slide-in Filter and Sort drawers.
 */

import { CSS_CLASS } from '../constants.js';

// Wires a drawer's open, close and backdrop controls; returns { openDrawer, closeDrawer }.
export function createDrawerController({ drawerId, backdropId, openButtonId, closeButtonId }) {
  const drawerElement = document.getElementById(drawerId);
  const backdropElement = document.getElementById(backdropId);

  function openDrawer() {
    drawerElement.classList.add(CSS_CLASS.DRAWER_OPEN);
    backdropElement.classList.add(CSS_CLASS.DRAWER_BACKDROP_OPEN);
  }

  function closeDrawer() {
    drawerElement.classList.remove(CSS_CLASS.DRAWER_OPEN);
    backdropElement.classList.remove(CSS_CLASS.DRAWER_BACKDROP_OPEN);
  }

  document.getElementById(openButtonId).addEventListener('click', openDrawer);
  document.getElementById(closeButtonId).addEventListener('click', closeDrawer);
  backdropElement.addEventListener('click', closeDrawer);

  return { openDrawer, closeDrawer };
}
