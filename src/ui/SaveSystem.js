const SAVE_KEY = 'rewind_runner_v1';
export function loadSave() {
    try {
        const raw = localStorage.getItem(SAVE_KEY);
        if (raw)
            return JSON.parse(raw);
    }
    catch (_) { /* ignore */ }
    return {
        unlockedLevels: 1,
        levels: Array.from({ length: 3 }, () => ({
            completed: false, stars: 0, bestTime: 0, bestScore: 0,
            collectiblesFound: 0, totalCollectibles: 0,
        })),
        totalScore: 0,
    };
}
export function writeSave(data) {
    try {
        localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    }
    catch (_) { /* ignore */ }
}
export function updateLevelSave(data, levelIndex, result) {
    const lvl = data.levels[levelIndex];
    lvl.completed = true;
    lvl.stars = Math.max(lvl.stars, result.stars);
    if (lvl.bestTime === 0 || result.time < lvl.bestTime)
        lvl.bestTime = result.time;
    lvl.bestScore = Math.max(lvl.bestScore, result.score);
    lvl.collectiblesFound = Math.max(lvl.collectiblesFound, result.collectibles);
    lvl.totalCollectibles = result.totalCollectibles;
    data.unlockedLevels = Math.max(data.unlockedLevels, levelIndex + 2);
    data.totalScore = data.levels.reduce((s, l) => s + l.bestScore, 0);
    return data;
}
export function calculateStars(time, rewindsUsed, collectibles, totalCollectibles) {
    let stars = 1;
    const allCollected = collectibles >= totalCollectibles;
    const fastEnough = time < 120;
    const fewRewinds = rewindsUsed <= 5;
    if ((allCollected || fewRewinds) && fastEnough)
        stars = 2;
    if (allCollected && fewRewinds && fastEnough)
        stars = 3;
    return stars;
}
export function calculateScore(time, rewindsUsed, collectibles, totalCollectibles) {
    let score = 10000;
    score -= Math.floor(time) * 10;
    score -= rewindsUsed * 200;
    score += collectibles * 500;
    if (collectibles >= totalCollectibles)
        score += 2000;
    return Math.max(0, score);
}
