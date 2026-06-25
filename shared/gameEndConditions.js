export function checkGoalWin(score, winLimit) {
  return score >= winLimit;
}

export function checkTimeExpiry(score, opponentScore) {
  if (score > opponentScore) return 'win';
  if (score < opponentScore) return 'loss';
  return 'draw';
}