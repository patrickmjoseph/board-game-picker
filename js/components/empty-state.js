/*
 * Empty state: builds the cream message card used for "no matches" and load errors.
 */

import { CSS_CLASS } from '../constants.js';

export function createEmptyStateHtml(titleText, messageText) {
  return `
        <div class="${CSS_CLASS.EMPTY_STATE}">
          <h3 class="${CSS_CLASS.EMPTY_STATE_TITLE}">${titleText}</h3>
          <p class="${CSS_CLASS.EMPTY_STATE_MESSAGE}">${messageText}</p>
        </div>
      `;
}
