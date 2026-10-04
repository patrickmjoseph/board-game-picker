/*
 * Helpers that translate a BoardGameGeek weight (1–5) into difficulty buckets and words.
 */

import {
  DIFFICULTY_BUCKET_THRESHOLDS,
  DIFFICULTY_BUCKET_WORDS,
  HEAVIEST_DIFFICULTY_BUCKET,
} from '../constants.js';

export function getDifficultyBucket(weight) {
  const matchingThreshold = DIFFICULTY_BUCKET_THRESHOLDS.find(
    (threshold) => weight < threshold.upperWeightLimit
  );

  if (matchingThreshold) {
    return matchingThreshold.bucket;
  }

  return HEAVIEST_DIFFICULTY_BUCKET;
}

export function getWeightWord(weight) {
  return DIFFICULTY_BUCKET_WORDS[getDifficultyBucket(weight)];
}
