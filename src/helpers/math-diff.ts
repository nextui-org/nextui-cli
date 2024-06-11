import { Logger } from './logger';

function matchTextScore(text: string, pattern: string) {
  let score = 0;
  const textLength = text.length;
  const patternLength = pattern.length;
  let i = 0;
  let j = 0;

  while (i < textLength && j < patternLength) {
    if (text[i] === pattern[j]) {
      score++;
      j++;
    }

    i++;
  }

  return score;
}

export function findMostMatchText(list: string[], pattern: string) {
  let maxScore = 0;
  let result = '';

  for (const text of list) {
    const score = matchTextScore(text, pattern);

    if (score > maxScore) {
      maxScore = score;
      result = text;
    }
  }

  return result !== '' ? result : null;
}

export function printMostMatchText(list: string[], pattern: string) {
  const mathOption = findMostMatchText(list, pattern);

  if (mathOption) {
    Logger.error(`Unknown option '${pattern}', Did you mean '${mathOption}'?`);
  } else {
    Logger.error(`Unknown option '${pattern}'`);
  }
  process.exit(1);
}