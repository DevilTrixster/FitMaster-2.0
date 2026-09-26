import { Navbar } from '/components/navbar/Navbar.js';
import { apiJson, requireAuth } from '/common/api.js';
import { getWorkoutCategory } from '/common/workoutCategory.js';

if (!requireAuth()) {
    throw new Error('Authentication required.');
}

const navbarRoot = document.getElementById('navbar');
const historyCount = document.getElementById('historyCount');
const historyList = document.getElementById('historyList');
const dateFromInput = document.getElementById('dateFrom');
const dateToInput = document.getElementById('dateTo');
const workoutTypeSelect = document.getElementById('workoutType');
const exerciseSearchInput = document.getElementById('exerciseSearch');
const exerciseSuggestions = document.getElementById('exerciseSuggestions');
const exerciseIdInput = document.getElementById('exerciseId');
const resetFiltersButton = document.getElementById('resetFiltersBtn');
const activeFiltersLabel = document.getElementById('activeFiltersLabel');

if (!navbarRoot || !historyList || !dateFromInput || !dateToInput || !workoutTypeSelect || !exerciseSearchInput || !exerciseSuggestions || !exerciseIdInput || !resetFiltersButton || !activeFiltersLabel) {
    throw new Error('History page elements not found.');
}

new Navbar(navbarRoot, { authenticated: true }).render();

const workoutTypes = [
    { id: 'chest', name: 'Грудь' },
    { id: 'back', name: 'Спина' },
    { id: 'legs', name: 'Ноги' }
];

const state = {
    workouts: [],
    patterns: [],
    exercises: [],
    filters: {
        dateFrom: '',
        dateTo: '',
        workoutType: '',
        exerciseId: ''
    }
};

function rangeStart(date) {
    return new Date(`${date}T00:00:00`);
}

function rangeEnd(date) {
    return new Date(`${date}T00:00:00`);
}

function formatDate(value) {
    return new Intl.DateTimeFormat('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }).format(new Date(`${value}T00:00:00`));
}

function dateOnly(value) {
    const parsed = new Date(value);
    const pad = (number) => String(number).padStart(2, '0');
    return `${parsed.getFullYear()}-${pad(parsed.getMonth() + 1)}-${pad(parsed.getDate())}`;
}

function formatCompletedDate(value) {
    return new Intl.DateTimeFormat('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(new Date(value));
}

function formatSetValue(value) {
    if (!value) return '—';

    switch (value.type) {
        case 'weight':
            return `${new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 }).format(value.value)} кг`;
        case 'reps':
            return `${value.value} повт.`;
        case 'duration':
            return value.value;
        case 'distance':
            return `${new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 }).format(value.value)} м`;
        default:
            return '—';
    }
}

function normalizeSetValues(value) {
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
}

function toHistoryItem(workout, result) {
    const actual = result?.actualData;
    if (!actual) return null;

    const category = getWorkoutCategory(state.patterns, workout);
    const categoryId = {
        Грудь: 'chest',
        Спина: 'back',
        Ноги: 'legs'
    }[category] ?? '';

    return {
        id: workout.id,
        date: workout.completedAt,
        type: {
            id: categoryId,
            name: category
        },
        duration: workout.startedAt && workout.completedAt
            ? Math.max(
                0,
                Math.round(
                    (new Date(workout.completedAt) - new Date(workout.startedAt)) / 60000
                )
            )
            : null,
        wellness: actual.wellness ?? null,
        fatigue: actual.fatigue ?? null,
        exercises: (actual.exercises ?? []).map((exercise) => ({
            exerciseId: exercise.exerciseId,
            exerciseName: exercise.exerciseName,
            actualSets: exercise.actualValues ?? []
        }))
    };
}

async function loadHistory() {
    const from = dateFromInput.value
        ? rangeStart(dateFromInput.value)
        : new Date(2000, 0, 1);
    const to = dateToInput.value
        ? new Date(rangeEnd(dateToInput.value).getTime() + 24 * 60 * 60 * 1000)
        : new Date(Date.now() + 24 * 60 * 60 * 1000);

    if (from >= to) {
        historyList.innerHTML = '<div class="history-empty"><div class="history-empty-icon">⚠️</div><p>Дата начала должна быть раньше даты окончания.</p></div>';
        return;
    }

    const params = new URLSearchParams({
        from: from.toISOString(),
        to: to.toISOString()
    });

    // История строится из завершённых тренировок и actualData результата.
    const workouts = await apiJson(`/api/workouts/history?${params.toString()}`) ?? [];
    state.patterns = await apiJson('/api/workout-patterns') ?? [];
    state.exercises = await apiJson('/api/exercises') ?? [];

    const ids = workouts.map((workout) => workout.id).filter(Boolean);
    const results = ids.length
        ? await apiJson(`/api/workouts/results?workoutIds=${encodeURIComponent(ids.join(','))}`)
        : [];
    const resultMap = new Map((results ?? []).map((result) => [result.userWorkoutId, result]));

    state.workouts = workouts
        .map((workout) => toHistoryItem(workout, resultMap.get(workout.id)))
        .filter(Boolean);

    renderFilteredHistory();
}

function renderWorkoutTypes() {
    workoutTypeSelect.innerHTML = '<option value="">Все тренировки</option>';

    workoutTypes.forEach((type) => {
        const option = document.createElement('option');
        option.value = type.id;
        option.textContent = type.name;
        workoutTypeSelect.appendChild(option);
    });
}

function matchesFilters(workout) {
    const { dateFrom, dateTo, workoutType, exerciseId } = state.filters;
    const workoutDate = dateOnly(workout.date);

    if (dateFrom && workoutDate < dateFrom) return false;
    if (dateTo && workoutDate > dateTo) return false;
    if (workoutType && workout.type.id !== workoutType) return false;
    if (
        exerciseId &&
        !workout.exercises.some(
            (exercise) => String(exercise.exerciseId) === String(exerciseId)
        )
    ) {
        return false;
    }

    return true;
}

function renderFilteredHistory() {
    const filtered = state.workouts.filter(matchesFilters);
    renderHistory(filtered);
}

function renderHistory(workouts) {
    if (historyCount) historyCount.textContent = String(workouts.length);
    activeFiltersLabel.textContent = buildActiveFiltersLabel();
    historyList.innerHTML = '';

    if (!workouts.length) {
        historyList.innerHTML = '<div class="history-empty"><div class="history-empty-icon">📭</div><p>История тренировок пока пуста.</p></div>';
        return;
    }

    workouts.forEach((workout) => historyList.appendChild(createWorkoutCard(workout)));
}

function buildActiveFiltersLabel() {
    const active = [];

    if (state.filters.dateFrom) active.push(`от ${formatDate(state.filters.dateFrom)}`);
    if (state.filters.dateTo) active.push(`до ${formatDate(state.filters.dateTo)}`);
    if (state.filters.workoutType) {
        active.push(
            workoutTypes.find((type) => type.id === state.filters.workoutType)?.name ?? 'Тренировка'
        );
    }
    if (state.filters.exerciseId) {
        active.push(
            state.exercises.find(
                (exercise) => String(exercise.id) === String(state.filters.exerciseId)
            )?.name ?? 'Упражнение'
        );
    }

    return active.length ? active.join(' · ') : 'Все тренировки';
}

function createWorkoutCard(workout) {
    const article = document.createElement('article');
    article.className = 'history-card';

    const header = document.createElement('button');
    header.type = 'button';
    header.className = 'history-card-header';
    header.setAttribute('aria-expanded', 'false');

    const main = document.createElement('div');
    main.className = 'history-main-info';

    const type = document.createElement('span');
    type.className = 'history-card-type';
    type.textContent = workout.type.name;

    const title = document.createElement('h3');
    title.className = 'history-card-title';
    title.textContent = workout.type.name;

    const meta = document.createElement('div');
    meta.className = 'history-meta';
    meta.append(
        createMetaItem('📅', formatCompletedDate(workout.date)),
        createMetaItem('⏱', workout.duration === null ? '—' : `${workout.duration} мин`),
        createMetaItem('▦', `${workout.exercises.length} ${exerciseWord(workout.exercises.length)}`)
    );

    main.append(type, title, meta);

    const side = document.createElement('div');
    side.className = 'history-card-side';

    const status = document.createElement('span');
    status.className = 'status-badge status-completed';
    status.textContent = 'Завершена';

    const expand = document.createElement('span');
    expand.className = 'history-expand';
    expand.textContent = '+';
    expand.setAttribute('aria-hidden', 'true');

    side.append(status, expand);
    header.append(main, side);

    const content = document.createElement('div');
    content.className = 'history-card-content';

    const inner = document.createElement('div');
    inner.className = 'history-card-content-inner';

    if (workout.wellness !== null || workout.fatigue !== null) {
        const survey = document.createElement('div');
        survey.className = 'history-survey-summary';
        survey.textContent = [
            workout.wellness !== null ? `Самочувствие: ${workout.wellness}/5` : null,
            workout.fatigue !== null ? `Усталость: ${workout.fatigue}/5` : null
        ].filter(Boolean).join(' · ');
        inner.appendChild(survey);
    }

    const exerciseList = document.createElement('div');
    exerciseList.className = 'history-exercise-list';
    workout.exercises.forEach((exercise) => {
        exerciseList.appendChild(createExerciseHistory(exercise));
    });

    inner.appendChild(exerciseList);
    content.appendChild(inner);

    header.addEventListener('click', () => {
        const expanded = article.classList.toggle('expanded');
        header.setAttribute('aria-expanded', String(expanded));
    });

    article.append(header, content);
    return article;
}

function createExerciseHistory(exercise) {
    const wrapper = document.createElement('div');
    wrapper.className = 'history-exercise';

    const header = document.createElement('div');
    header.className = 'history-exercise-header';

    const name = document.createElement('h4');
    name.className = 'history-exercise-name';
    name.textContent = exercise.exerciseName;

    const count = document.createElement('span');
    count.className = 'history-exercise-sets-count';
    count.textContent = `${exercise.actualSets.length} ${setWord(exercise.actualSets.length)}`;

    header.append(name, count);

    const sets = document.createElement('div');
    sets.className = 'actual-sets';

    exercise.actualSets.forEach((value, index) => {
        const set = document.createElement('div');
        set.className = 'actual-set';

        const indexElement = document.createElement('span');
        indexElement.className = 'actual-set-index';
        indexElement.textContent = `Подход ${index + 1}`;

        const valueList = document.createElement('div');
        valueList.className = 'actual-set-values';

        const values = normalizeSetValues(value);
        if (!values.length) {
            const empty = document.createElement('span');
            empty.className = 'actual-set-value muted';
            empty.textContent = 'Нет данных';
            valueList.appendChild(empty);
        } else {
            values.forEach((metric) => {
                const valueElement = document.createElement('span');
                valueElement.className = 'actual-set-value';
                valueElement.textContent = formatSetValue(metric);
                valueList.appendChild(valueElement);
            });
        }

        set.append(indexElement, valueList);
        sets.appendChild(set);
    });

    wrapper.append(header, sets);
    return wrapper;
}

function createMetaItem(icon, text) {
    const element = document.createElement('span');
    element.className = 'history-meta-item';

    const iconElement = document.createElement('span');
    iconElement.setAttribute('aria-hidden', 'true');
    iconElement.textContent = icon;

    const textElement = document.createElement('span');
    textElement.textContent = text;

    element.append(iconElement, textElement);
    return element;
}

function renderExerciseSuggestions(search) {
    exerciseSuggestions.innerHTML = '';
    if (!search) return;

    const matches = state.exercises
        .filter((exercise) => exercise.name.toLowerCase().includes(search.toLowerCase()))
        .slice(0, 8);

    if (!matches.length) {
        const empty = document.createElement('div');
        empty.className = 'exercise-suggestions-empty';
        empty.textContent = 'Упражнения не найдены';
        exerciseSuggestions.appendChild(empty);
        return;
    }

    matches.forEach((exercise) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'exercise-suggestion';
        button.textContent = exercise.name;

        button.addEventListener('click', () => {
            state.filters.exerciseId = String(exercise.id);
            exerciseIdInput.value = String(exercise.id);
            exerciseSearchInput.value = exercise.name;
            exerciseSuggestions.innerHTML = '';
            renderFilteredHistory();
        });

        exerciseSuggestions.appendChild(button);
    });
}

function resetFilters() {
    state.filters = {
        dateFrom: '',
        dateTo: '',
        workoutType: '',
        exerciseId: ''
    };

    dateFromInput.value = '';
    dateToInput.value = '';
    workoutTypeSelect.value = '';
    exerciseSearchInput.value = '';
    exerciseIdInput.value = '';
    exerciseSuggestions.innerHTML = '';
    renderFilteredHistory();
}

function exerciseWord(value) {
    if (value % 10 === 1 && value % 100 !== 11) return 'упражнение';
    if ([2, 3, 4].includes(value % 10) && ![12, 13, 14].includes(value % 100)) return 'упражнения';
    return 'упражнений';
}

function setWord(value) {
    if (value % 10 === 1 && value % 100 !== 11) return 'подход';
    if ([2, 3, 4].includes(value % 10) && ![12, 13, 14].includes(value % 100)) return 'подхода';
    return 'подходов';
}

document.addEventListener('DOMContentLoaded', async () => {
    renderWorkoutTypes();

    dateFromInput.addEventListener('change', () => {
        state.filters.dateFrom = dateFromInput.value;
        void loadHistory().catch((error) => renderHistoryError(error));
    });

    dateToInput.addEventListener('change', () => {
        state.filters.dateTo = dateToInput.value;
        void loadHistory().catch((error) => renderHistoryError(error));
    });

    workoutTypeSelect.addEventListener('change', () => {
        state.filters.workoutType = workoutTypeSelect.value;
        renderFilteredHistory();
    });

    exerciseSearchInput.addEventListener('input', () => {
        state.filters.exerciseId = '';
        exerciseIdInput.value = '';
        renderExerciseSuggestions(exerciseSearchInput.value.trim());
        renderFilteredHistory();
    });

    resetFiltersButton.addEventListener('click', resetFilters);

    try {
        await loadHistory();
    } catch (error) {
        renderHistoryError(error);
    }
});

function renderHistoryError(error) {
    historyList.innerHTML = `
        <div class="history-empty">
            <div class="history-empty-icon">⚠️</div>
            <p>${error instanceof Error ? error.message : 'Не удалось загрузить историю.'}</p>
        </div>
    `;
}
