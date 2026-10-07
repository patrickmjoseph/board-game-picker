/*
 * Game card: builds the HTML for one game in the results list and handles
 * its interactive bits (details toggle, broken-thumbnail fallback).
 */

import {
  BADGE_MODIFIER,
  BEST_PLAYER_MESSAGE,
  BGG_RANK_TOOLTIP,
  BOARD_GAME_GEEK_GAME_URL_PREFIX,
  CSS_CLASS,
  DETAILS_TOGGLE_HIDE_LABEL,
  DETAILS_TOGGLE_SHOW_LABEL,
  FILTER_DIMENSION,
  GAME_DETAILS_ID_PREFIX,
  NO_DATA_YET_TEXT,
  NO_RANKING_YET_TEXT,
  PLAY_STYLE_BADGE_LABELS,
  THUMBNAIL_PLACEHOLDER_ICON,
  UNRANKED_GAME_RANK,
  WEIGHT_DECIMAL_PLACES,
} from '../constants.js';
import { appState } from '../state.js';
import { getWeightWord } from '../utils/difficulty.js';
import { dimensionPasses, getMatchPercentage, isBestPlayerMatch } from '../utils/matching.js';
import { createBadgeHtml } from './badge.js';
import { createMatchBarHtml } from './match-bar.js';

// ==================== Badge data ====================

// A badge is muted when its filter dimension is active and the game fails it.
function isBadgeUnmatched(game, badgeItem) {
  return Boolean(badgeItem.dimension) && dimensionPasses(game, badgeItem.dimension) === false;
}

function createBadgeItemHtml(game, badgeItem) {
  return createBadgeHtml(badgeItem.modifier, badgeItem.text, isBadgeUnmatched(game, badgeItem));
}

function formatPlayerRange(game) {
  const minimumPlayers = game.minPlayers;
  const maximumPlayers = game.maxPlayers;

  if (minimumPlayers && maximumPlayers && minimumPlayers !== maximumPlayers) {
    return `${minimumPlayers}–${maximumPlayers} players`;
  }

  return `${minimumPlayers || maximumPlayers} players`;
}

// Badges hidden inside the expandable details section.
function getDetailBadgeItems(game) {
  const detailBadgeItems = [];

  if (game.minPlayers != null || game.maxPlayers != null) {
    detailBadgeItems.push({
      dimension: FILTER_DIMENSION.PLAYERS,
      modifier: BADGE_MODIFIER.PLAYERS,
      text: formatPlayerRange(game),
    });
  }

  if (game.bestPlayers && game.bestPlayers.length) {
    detailBadgeItems.push({
      dimension: null,
      modifier: BADGE_MODIFIER.BEST_PLAYERS,
      text: `Best: ${game.bestPlayers.join(', ')}`,
    });
  }

  if (game.type) {
    detailBadgeItems.push({
      dimension: FILTER_DIMENSION.COOP,
      modifier: BADGE_MODIFIER.TYPE,
      text: PLAY_STYLE_BADGE_LABELS[game.type],
    });
  }

  return detailBadgeItems;
}

function formatLengthBadgeText(game) {
  if (game.length === 0) {
    return `Game length: ${NO_DATA_YET_TEXT}`;
  }

  return `Game length: ${Math.round(game.length)} min`;
}

function formatComplexityBadgeText(game) {
  if (game.weight === 0) {
    return `Complexity: ${NO_DATA_YET_TEXT}`;
  }

  return `${game.weight.toFixed(WEIGHT_DECIMAL_PLACES)} · ${getWeightWord(game.weight)}`;
}

// Badges always visible on the card (length + complexity).
function getVisibleBadgeItems(game) {
  const visibleBadgeItems = [];

  if (game.length != null) {
    visibleBadgeItems.push({
      dimension: FILTER_DIMENSION.LENGTH,
      modifier: BADGE_MODIFIER.LENGTH,
      text: formatLengthBadgeText(game),
    });
  }

  if (game.weight != null) {
    visibleBadgeItems.push({
      dimension: FILTER_DIMENSION.DIFFICULTY,
      modifier: BADGE_MODIFIER.DIFFICULTY,
      text: formatComplexityBadgeText(game),
    });
  }

  return visibleBadgeItems;
}

// ==================== HTML fragments ====================

// Matched badges come first, muted (unmatched) badges after them.
function createDetailBadgesHtml(game) {
  const detailBadgeItems = getDetailBadgeItems(game);
  const matchedBadgeItems = detailBadgeItems.filter((badgeItem) => !isBadgeUnmatched(game, badgeItem));
  const unmatchedBadgeItems = detailBadgeItems.filter((badgeItem) => isBadgeUnmatched(game, badgeItem));

  return [...matchedBadgeItems, ...unmatchedBadgeItems]
    .map((badgeItem) => createBadgeItemHtml(game, badgeItem))
    .join('');
}

function createVisibleBadgesHtml(game) {
  return getVisibleBadgeItems(game)
    .map((badgeItem) => createBadgeItemHtml(game, badgeItem))
    .join('');
}

function createThumbnailPlaceholderHtml() {
  return `<div class="${CSS_CLASS.GAME_CARD_THUMBNAIL_PLACEHOLDER}">${THUMBNAIL_PLACEHOLDER_ICON}</div>`;
}

function createThumbnailHtml(game) {
  if (!game.thumbnail) {
    return createThumbnailPlaceholderHtml();
  }

  return `<img class="${CSS_CLASS.GAME_CARD_THUMBNAIL}" src="${game.thumbnail}" alt="" loading="lazy">`;
}

function createTitleHtml(game) {
  const yearHtml = game.year
    ? ` <span class="${CSS_CLASS.GAME_CARD_YEAR}">(${game.year})</span>`
    : '';

  return `<h3 class="${CSS_CLASS.GAME_CARD_TITLE}"><a class="${CSS_CLASS.GAME_CARD_TITLE_LINK}" href="${BOARD_GAME_GEEK_GAME_URL_PREFIX}${game.id}" target="_blank" rel="noopener">${game.name}</a>${yearHtml}</h3>`;
}

function createRankLineHtml(game) {
  const rankText = game.rank === UNRANKED_GAME_RANK ? NO_RANKING_YET_TEXT : game.rank;

  return `<p class="${CSS_CLASS.GAME_CARD_RANK_LINE}">BGG rank: ${rankText} <span class="${CSS_CLASS.GAME_CARD_RANK_HELP}" data-tooltip="${BGG_RANK_TOOLTIP}">?</span></p>`;
}

function createDescriptionHtml(game) {
  if (!game.description) {
    return '';
  }

  return `<p class="${CSS_CLASS.GAME_CARD_DESCRIPTION}">${game.description}</p>`;
}

function createBestPlayerStarHtml(isBestFit) {
  if (!isBestFit) {
    return '';
  }

  return `<span class="${CSS_CLASS.GAME_CARD_BEST_PLAYER_STAR}" title="${BEST_PLAYER_MESSAGE}">&#9733;</span>`;
}

function createBestPlayerCalloutHtml(isBestFit) {
  if (!isBestFit) {
    return '';
  }

  return `<p class="${CSS_CLASS.GAME_CARD_BEST_PLAYER_CALLOUT}">&#9733; ${BEST_PLAYER_MESSAGE}</p>`;
}

function createCardClassNames(isNoMatch, isBestFit) {
  const classNames = [CSS_CLASS.GAME_CARD];

  if (isNoMatch) {
    classNames.push(CSS_CLASS.GAME_CARD_NO_MATCH);
  }

  if (isBestFit) {
    classNames.push(CSS_CLASS.GAME_CARD_BEST_PLAYER_MATCH);
  }

  return classNames.join(' ');
}

// ==================== Public API ====================

export function createGameCardHtml(game, isNoMatch) {
  const isBestFit = isBestPlayerMatch(game);
  const detailsId = GAME_DETAILS_ID_PREFIX + game.id;

  return `
      <div class="${createCardClassNames(isNoMatch, isBestFit)}">
        ${createBestPlayerStarHtml(isBestFit)}
        ${createThumbnailHtml(game)}
        <div class="${CSS_CLASS.GAME_CARD_MAIN}">
          ${createTitleHtml(game)}
          ${createRankLineHtml(game)}
          <div class="${CSS_CLASS.GAME_CARD_VISIBLE_BADGES}">${createVisibleBadgesHtml(game)}</div>
          ${createBestPlayerCalloutHtml(isBestFit)}
          <button class="${CSS_CLASS.GAME_CARD_DETAILS_TOGGLE}" data-target="${detailsId}" aria-expanded="false">${DETAILS_TOGGLE_SHOW_LABEL}</button>
          <div class="${CSS_CLASS.GAME_CARD_DETAILS}" id="${detailsId}" hidden>
            ${createDescriptionHtml(game)}
            <div class="${CSS_CLASS.GAME_CARD_BADGES}">${createDetailBadgesHtml(game)}</div>
          </div>
        </div>
        <div class="${CSS_CLASS.GAME_CARD_MATCH_COLUMN}">${createMatchColumnHtml(game)}</div>
      </div>
    `;
}

// With "exact matches only" on, every listed game is a 100% match, so the bar is hidden.
function createMatchColumnHtml(game) {
  if (appState.requireAllFilters) {
    return '';
  }

  return createMatchBarHtml(getMatchPercentage(game));
}

// Expands or collapses a card's details section. Returns true if the click was handled.
export function handleDetailsToggleClick(clickEvent) {
  const detailsToggleElement = clickEvent.target.closest(`.${CSS_CLASS.GAME_CARD_DETAILS_TOGGLE}`);

  if (!detailsToggleElement) {
    return false;
  }

  const detailsElement = document.getElementById(detailsToggleElement.dataset.target);
  const wasHidden = detailsElement.hidden;

  detailsElement.hidden = !wasHidden;
  detailsToggleElement.textContent = wasHidden ? DETAILS_TOGGLE_HIDE_LABEL : DETAILS_TOGGLE_SHOW_LABEL;
  detailsToggleElement.setAttribute('aria-expanded', wasHidden ? 'true' : 'false');

  return true;
}

// Swaps a thumbnail that fails to load for the dice placeholder.
// Image "error" events do not bubble, so this must be registered in the capture phase.
export function handleThumbnailLoadError(errorEvent) {
  const failedElement = errorEvent.target;

  if (!(failedElement instanceof HTMLImageElement)) {
    return;
  }

  if (!failedElement.classList.contains(CSS_CLASS.GAME_CARD_THUMBNAIL)) {
    return;
  }

  const placeholderElement = document.createElement('div');

  placeholderElement.className = CSS_CLASS.GAME_CARD_THUMBNAIL_PLACEHOLDER;
  placeholderElement.textContent = THUMBNAIL_PLACEHOLDER_ICON;

  failedElement.replaceWith(placeholderElement);
}
