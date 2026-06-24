export interface LevelSave {
  completed: boolean;
  stars: number;
  bestTime: number;
  bestScore: number;
  collectiblesFound: number;
  totalCollectibles: number;
}

export interface SaveData {
  unlockedLevels: number;
  levels: LevelSave[];
  totalScore: number;
}

const SAVE_KEY = 'rewind_runner_v1';

export function loadSave(): SaveData {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) return JSON.parse(raw) as SaveData;
  } catch (_) { /* ignore */ }
  return {
    unlockedLevels: 1,
    levels: Array.from({ length: 3 }, () => ({
      completed: false, stars: 0, bestTime: 0, bestScore: 0,
      collectiblesFound: 0, totalCollectibles: 0,
    })),
    totalScore: 0,
  };
}

export function writeSave(data: SaveData): void {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  } catch (_) { /* ignore */ }
}

export function updateLevelSave(data: SaveData, levelIndex: number, result: {
  stars: number; time: number; score: number;
  collectibles: number; totalCollectibles: number;
}): SaveData {
  const lvl = data.levels[levelIndex];
  lvl.completed = true;
  lvl.stars = Math.max(lvl.stars, result.stars);
  if (lvl.bestTime === 0 || result.time < lvl.bestTime) lvl.bestTime = result.time;
  lvl.bestScore = Math.max(lvl.bestScore, result.score);
  lvl.collectiblesFound = Math.max(lvl.collectiblesFound, result.collectibles);
  lvl.totalCollectibles = result.totalCollectibles;
  data.unlockedLevels = Math.max(data.unlockedLevels, levelIndex + 2);
  data.totalScore = data.levels.reduce((s, l) => s + l.bestScore, 0);
  return data;
}

export function calculateStars(time: number, rewindsUsed: number, collectibles: number, totalCollectibles: number): number {
  let stars = 1;
  const allCollected = collectibles >= totalCollectibles;
  const fastEnough = time < 120;
  const fewRewinds = rewindsUsed <= 5;
  if ((allCollected || fewRewinds) && fastEnough) stars = 2;
  if (allCollected && fewRewinds && fastEnough) stars = 3;
  return stars;
}

export function calculateScore(time: number, rewindsUsed: number, collectibles: number, totalCollectibles: number): number {
  let score = 10000;
  score -= Math.floor(time) * 10;
  score -= rewindsUsed * 200;
  score += collectibles * 500;
  if (collectibles >= totalCollectibles) score += 2000;
  return Math.max(0, score);
}
