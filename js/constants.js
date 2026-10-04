/*
 * Application-wide constants: every magic string and number lives here.
 */

// ==================== Data loading ====================

export const GAMES_DATA_URL = 'games.json';

export const GAMES_DATA_FETCH_OPTIONS = { cache: 'no-store' };

export const BOARD_GAME_GEEK_GAME_URL_PREFIX = 'https://boardgamegeek.com/boardgame/';

// ==================== Pagination ====================

export const INITIAL_VISIBLE_MATCH_COUNT = 10;

export const VISIBLE_MATCH_COUNT_INCREMENT = 10;

// ==================== Filter dimensions ====================

export const FILTER_DIMENSION = Object.freeze({
  PLAYERS: 'players',
  DIFFICULTY: 'difficulty',
  LENGTH: 'length',
  COOP: 'coop',
});

export const ALL_FILTER_DIMENSIONS = Object.freeze([
  FILTER_DIMENSION.PLAYERS,
  FILTER_DIMENSION.DIFFICULTY,
  FILTER_DIMENSION.LENGTH,
  FILTER_DIMENSION.COOP,
]);

export const ANY_OPTION_VALUE = 'any';

// ==================== Player counts ====================

export const SIX_PLUS_PLAYERS_OPTION_VALUE = '6+';

export const SIX_PLUS_PLAYERS_MINIMUM = 6;

// A game that plays exactly 2 (min 2, max 2) only matches a lone "2" filter.
export const TWO_PLAYER_ONLY_COUNT = 2;

export const TWO_PLAYER_ONLY_OPTION_VALUE = '2';

export const SINGLE_PLAYER_READOUT_SUFFIX = ' player';

export const MULTIPLE_PLAYERS_READOUT_SUFFIX = ' players';

// ==================== Difficulty (BGG weight) ====================

// Each weight strictly below `upperWeightLimit` falls into `bucket`.
export const DIFFICULTY_BUCKET_THRESHOLDS = Object.freeze([
  { upperWeightLimit: 2, bucket: 1 },
  { upperWeightLimit: 2.5, bucket: 2 },
  { upperWeightLimit: 3, bucket: 3 },
  { upperWeightLimit: 3.75, bucket: 4 },
]);

export const HEAVIEST_DIFFICULTY_BUCKET = 5;

export const DIFFICULTY_BUCKET_WORDS = Object.freeze({
  1: 'Light',
  2: 'Medium light',
  3: 'Medium',
  4: 'Medium heavy',
  5: 'Heavy',
});

export const WEIGHT_DECIMAL_PLACES = 2;

// ==================== Game length ====================

export const LENGTH_BUCKETS = Object.freeze([
  { id: 'quick', label: '<30 min', minimumMinutes: 0, maximumMinutes: 30 },
  { id: 'short', label: '30–60 min', minimumMinutes: 30, maximumMinutes: 60 },
  { id: 'medium', label: '60–90 min', minimumMinutes: 60, maximumMinutes: 90 },
  { id: 'long', label: '90–120 min', minimumMinutes: 90, maximumMinutes: 120 },
  { id: 'epic', label: '120+ min', minimumMinutes: 120, maximumMinutes: Infinity },
]);

// ==================== Play style (game type) ====================

// Labels used in the filter readout and filter chip.
export const PLAY_STYLE_FILTER_LABELS = Object.freeze({
  coop: 'Cooperative',
  semi: 'Semi-coop',
  teams: 'Teams',
  comp: 'Competitive',
});

// Labels used on a game card's type badge.
export const PLAY_STYLE_BADGE_LABELS = Object.freeze({
  coop: 'Co-op',
  teams: 'Teams',
  comp: 'Competitive',
});

// ==================== Sorting ====================

export const SORT_FIELD = Object.freeze({
  LENGTH: 'length',
  COMPLEXITY: 'complexity',
  RANK: 'rank',
  ALPHABETICAL: 'alpha',
});

export const SORT_DIRECTION = Object.freeze({
  ASCENDING: 'asc',
  DESCENDING: 'desc',
});

export const DEFAULT_SORT_FIELD = SORT_FIELD.RANK;

export const DEFAULT_SORT_DIRECTION = SORT_DIRECTION.ASCENDING;

export const SORT_FIELD_LABELS = Object.freeze({
  length: 'Game length',
  complexity: 'Complexity',
  rank: 'BoardGameGeek Rank',
  alpha: 'Alphabetical',
});

export const SORT_DIRECTION_ARROWS = Object.freeze({
  asc: '↑',
  desc: '↓',
});

export const UNRANKED_GAME_RANK = 0;

export const CURRENT_SORT_CHOSEN_PREFIX = 'Currently sorting by:';

export const CURRENT_SORT_DEFAULT_PREFIX = 'Default:';

// ==================== Active filter + sort chips ====================

export const FILTER_CHIP_PREFIX_BY_DIMENSION = Object.freeze({
  players: 'Players',
  difficulty: 'Complexity',
  length: 'Length',
  coop: 'Type',
});

export const SORT_CHIP_PREFIX = 'Sort:';

export const SORT_CHIP_TOGGLE_TITLE = 'Click to reverse sort direction';

export const SORT_CHIP_REMOVE_LABEL = 'Reset to default sort';

// ==================== Match percentage bar ====================

export const STRONG_MATCH_PERCENTAGE_THRESHOLD = 75;

export const MODERATE_MATCH_PERCENTAGE_THRESHOLD = 50;

export const STRONG_MATCH_BAR_COLOR = 'var(--sage)';

export const MODERATE_MATCH_BAR_COLOR = 'var(--gold-dark)';

export const WEAK_MATCH_BAR_COLOR = 'var(--rust)';

// Keeps the percentage label legible on very low matches.
export const MINIMUM_MATCH_BAR_WIDTH_PERCENT = 14;

export const FULL_PERCENTAGE = 100;

// ==================== Search ====================

export const SEARCH_SUBMIT_KEY = 'Enter';

export const SEARCH_NO_MATCH_FEEDBACK_DURATION_MS = 600;

// ==================== Back-to-top button ====================

export const BACK_TO_TOP_SCROLL_THRESHOLD_PIXELS = 400;

export const SCROLL_TO_TOP_OPTIONS = { top: 0, behavior: 'smooth' };

// ==================== Copy text ====================

export const THUMBNAIL_PLACEHOLDER_ICON = '🎲';

export const DETAILS_TOGGLE_SHOW_LABEL = '+ Show details';

export const DETAILS_TOGGLE_HIDE_LABEL = '− Hide details';

export const BEST_PLAYER_MESSAGE = 'Best played at your player count!';

export const BGG_RANK_TOOLTIP =
  'A community-voted all-time ranking of this board game on the website BoardGameGeek.com';

export const NO_RANKING_YET_TEXT = 'No ranking yet';

export const NO_DATA_YET_TEXT = 'No data yet';

export const NO_MATCHES_TITLE = 'No games match these filters';

export const NO_MATCHES_MESSAGE =
  "Loosen a filter — maybe widen the length of time or drop the player count — and Carrom's collection will show up here.";

export const LOAD_FAILURE_TITLE = "Couldn't load the game collection";

export const LOAD_FAILURE_MESSAGE =
  'There was a problem loading games.json. Please refresh the page, or check your connection.';

export const LOAD_FAILURE_CONSOLE_PREFIX = 'Failed to load games.json:';

// ==================== Element IDs ====================

export const ELEMENT_ID = Object.freeze({
  SEARCH_TOGGLE_BUTTON: 'findGameBtn',
  OPEN_SORT_BUTTON: 'openSortBtn',
  OPEN_FILTER_BUTTON: 'openFilterBtn',
  FILTER_COUNT_BADGE: 'filterCountBadge',

  SEARCH_BUBBLE: 'searchBubble',
  SEARCH_INPUT: 'resultsSearchInput',
  CLEAR_SEARCH_BUTTON: 'clearResultsSearchBtn',

  ACTIVE_FILTERS_ROW: 'activeFiltersRow',
  SORT_CHIP_TOGGLE: 'sortChipToggle',
  SORT_CHIP_REMOVE: 'sortChipRemove',

  RESULTS_COUNT: 'resultsCount',
  RESULTS_AREA: 'resultsArea',
  SHOW_MORE_MATCHES_BUTTON: 'showMoreMatchesBtn',
  SHOW_ALL_MATCHES_LINK: 'showAllMatchesLink',

  BACK_TO_TOP_BUTTON: 'backToTopBtn',

  FILTER_DRAWER: 'filterDrawer',
  FILTER_BACKDROP: 'filterBackdrop',
  CLOSE_FILTER_BUTTON: 'closeFilterBtn',
  CLEAR_FILTERS_BUTTON: 'drawerClearBtn',
  APPLY_FILTERS_BUTTON: 'drawerApplyBtn',
  FILTER_DRAWER_RESULT_COUNT: 'drawerResultCount',

  SORT_DRAWER: 'sortDrawer',
  SORT_BACKDROP: 'sortBackdrop',
  CLOSE_SORT_BUTTON: 'closeSortBtn',
  SORT_CURRENT_LABEL: 'sortCurrentLabel',
  SORT_OPTION_LIST: 'sortOptionList',
  SORT_DIRECTION_BUTTON: 'sortDirBtn',
});

export const SEGMENTED_CONTROL_ID_BY_DIMENSION = Object.freeze({
  players: 'playersSegmented',
  difficulty: 'difficultySegmented',
  length: 'lengthSegmented',
  coop: 'coopSegmented',
});

export const FILTER_READOUT_ID_BY_DIMENSION = Object.freeze({
  players: 'playerReadout',
  difficulty: 'difficultyReadout',
  length: 'lengthReadout',
  coop: 'coopReadout',
});

export const CATEGORY_OPTIONS_ID_PREFIX = 'catPanel-';

export const GAME_DETAILS_ID_PREFIX = 'details-';

// ==================== CSS classes (BEM) ====================

export const CSS_CLASS = Object.freeze({
  TOOLBAR_BUTTON_ACTIVE: 'toolbar__button--active',

  SEARCH_BUBBLE_WIGGLE: 'search-bubble--wiggle',
  SEARCH_BUBBLE_NO_MATCH: 'search-bubble--no-match',

  DRAWER_OPEN: 'drawer--open',
  DRAWER_BACKDROP_OPEN: 'drawer-backdrop--open',

  FILTER_CATEGORY: 'filter-panel__category',
  FILTER_CATEGORY_OPEN: 'filter-panel__category--open',
  FILTER_CATEGORY_TOGGLE: 'filter-panel__category-toggle',
  FILTER_CATEGORY_OPTIONS: 'filter-panel__category-options',

  SEGMENTED_CONTROL_OPTION_ACTIVE: 'segmented-control__option--active',

  SORT_OPTION: 'sort-panel__option',
  SORT_OPTION_ACTIVE: 'sort-panel__option--active',

  FILTER_CHIP: 'filter-chip',
  FILTER_CHIP_REMOVE_ICON: 'filter-chip__remove-icon',

  SORT_CHIP: 'sort-chip',
  SORT_CHIP_TOGGLE: 'sort-chip__toggle',
  SORT_CHIP_REMOVE_BUTTON: 'sort-chip__remove-button',

  EMPTY_STATE: 'empty-state',
  EMPTY_STATE_TITLE: 'empty-state__title',
  EMPTY_STATE_MESSAGE: 'empty-state__message',

  RESULTS_LIST: 'results-list',
  SHOW_MORE_BUTTON: 'show-more-button',
  SHOW_ALL_MATCHES_LINK: 'show-all-matches-link',

  GAME_CARD: 'game-card',
  GAME_CARD_NO_MATCH: 'game-card--no-match',
  GAME_CARD_BEST_PLAYER_MATCH: 'game-card--best-player-match',
  GAME_CARD_BEST_PLAYER_STAR: 'game-card__best-player-star',
  GAME_CARD_BEST_PLAYER_CALLOUT: 'game-card__best-player-callout',
  GAME_CARD_THUMBNAIL: 'game-card__thumbnail',
  GAME_CARD_THUMBNAIL_PLACEHOLDER: 'game-card__thumbnail-placeholder',
  GAME_CARD_MAIN: 'game-card__main',
  GAME_CARD_TITLE: 'game-card__title',
  GAME_CARD_TITLE_LINK: 'game-card__title-link',
  GAME_CARD_YEAR: 'game-card__year',
  GAME_CARD_RANK_LINE: 'game-card__rank-line',
  GAME_CARD_RANK_HELP: 'game-card__rank-help',
  GAME_CARD_VISIBLE_BADGES: 'game-card__visible-badges',
  GAME_CARD_DETAILS_TOGGLE: 'game-card__details-toggle',
  GAME_CARD_DETAILS: 'game-card__details',
  GAME_CARD_DESCRIPTION: 'game-card__description',
  GAME_CARD_BADGES: 'game-card__badges',
  GAME_CARD_MATCH_COLUMN: 'game-card__match-column',

  BADGE: 'badge',
  BADGE_MUTED: 'badge--muted',

  MATCH_BAR: 'match-bar',
  MATCH_BAR_FILL: 'match-bar__fill',
});

// Modifier suffixes appended to `badge--`.
export const BADGE_MODIFIER = Object.freeze({
  PLAYERS: 'players',
  BEST_PLAYERS: 'best-players',
  TYPE: 'type',
  LENGTH: 'length',
  DIFFICULTY: 'difficulty',
});
