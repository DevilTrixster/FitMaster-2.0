const ROOT_PATTERN_CATEGORIES = new Map([
    ['22222222-2222-4222-8222-222222222222', 'Грудь'],
    ['33333333-3333-4333-8333-333333333333', 'Спина'],
    ['44444444-4444-4444-8444-444444444444', 'Ноги']
]);

const CATEGORY_BY_TEXT = [
    { category: 'Грудь', words: ['chest', 'груд'] },
    { category: 'Спина', words: ['back', 'спин'] },
    { category: 'Ноги', words: ['legs', 'leg', 'ног'] }
];

function normalize(value) {
    return String(value ?? '').trim().toLowerCase();
}

function categoryFromText(pattern) {
    const text = normalize(pattern?.name);

    return CATEGORY_BY_TEXT.find(({ words }) =>
        words.some((word) => text.includes(word))
    )?.category ?? null;
}

export function getWorkoutCategory(patterns, workout) {
    const patternMap = new Map((patterns ?? []).map((pattern) => [pattern.id, pattern]));
    let pattern = patternMap.get(workout?.patternId);
    const visited = new Set();

    while (pattern && !visited.has(pattern.id)) {
        visited.add(pattern.id);

        const rootCategory = ROOT_PATTERN_CATEGORIES.get(pattern.id);
        if (rootCategory) {
            return rootCategory;
        }

        const textCategory = categoryFromText(pattern);
        if (textCategory) {
            return textCategory;
        }

        pattern = pattern.parentPatternId
            ? patternMap.get(pattern.parentPatternId)
            : null;
    }

    return 'Тренировка';
}
