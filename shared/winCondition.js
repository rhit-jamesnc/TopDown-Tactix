export function checkWin(score, winLimit = 1) {
  if (typeof score !== 'number' || score < 0) {
    return false;
  }
  return score >= winLimit;
}