/*
 * Badge: builds the HTML for a small colored attribute pill on a game card.
 */

import { CSS_CLASS } from '../constants.js';

// `badgeModifier` is one of BADGE_MODIFIER (e.g. "players" -> "badge--players").
export function createBadgeHtml(badgeModifier, badgeText, isMuted) {
  const classNames = [CSS_CLASS.BADGE, `${CSS_CLASS.BADGE}--${badgeModifier}`];

  if (isMuted) {
    classNames.push(CSS_CLASS.BADGE_MUTED);
  }

  return `<span class="${classNames.join(' ')}">${badgeText}</span>`;
}
