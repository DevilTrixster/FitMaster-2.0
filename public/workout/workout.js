import { Navbar } from '/components/navbar/Navbar.js';
import { ApiError, apiJson, requireAuth } from '/common/api.js';
import { getWorkoutCategory } from '/common/workoutCategory.js';

if (!requireAuth()) {
    throw new Error('Authentication required.');
}

const params = new URLSearchParams(window.location.search);
const workoutId = params.get('id');
const requestedMode = params.get('mode') === 'active' ? 'active' : 'view';

const navbarRoot = document.getElementById('navbar');
const workoutModeLabel = document.getElementById('workoutModeLabel');
const workoutTitle = document.getElementById('workoutTitle');
const workoutMeta = document.getElementById('workoutMeta');
const workoutStatus = document.getElementById('workoutStatus');
const workoutMessage = document.getElementById('workoutMessage');
const workoutTimer = document.getElementById('workoutTimer');
const workoutTimerValue = document.getElementById('workoutTimerValue');
const exerciseList = document.getElementById('exerciseList');
const restSecondsLabel = document.getElementById('restSecondsLabel');
const sessionSurvey = document.getElementById('sessionSurvey');
const sessionSurveyForm = document.getElementById('sessionSurveyForm');
const sessionSurveySummary = document.getElementById('sessionSurveySummary');
const surveySummaryText = document.getElementById('surveySummaryText');
const wellnessInput = document.getElementById('wellnessInput');
const fatigueInput = document.getElementById('fatigueInput');
const saveSurveyBtn = document.getElementById('saveSurveyBtn');
const editSurveyBtn = document.getElementById('editSurveyBtn');
const finishSection = document.getElementById('finishSection');
const finishWorkoutBtn = document.getElementById('finishWorkoutBtn');

if (!workoutId) {
    window.location.replace('/user/dashboard/dashboard.html');
    throw new Error('Workout ID is required.');
}

new Navbar(navbarRoot, { authenticated: true }).render();

const DRAFT_STORAGE_PREFIX = 'fitmaster:workout-draft:';
const state = {
    mode: requestedMode,
    workout: null,
    workoutExercises: [],
    exercises: [],
    result: null,
    patterns: [],
    survey: {
        wellness: null,
        fatigue: null
    },
    draft: null,
    timerId: null
};

const STATUS_LABELS = {
    PLANNED: 'Предстоящая',
    IN_PROGRESS: 'В процессе',
    COMPLETED: 'Завершена',
    CANCELLED: 'Пропущена'
};

function showMessage(message, type = 'error') {
    workoutMessage.textContent = message;
    workoutMessage.classList.toggle('success', type === 'success');
    workoutMessage.classList.toggle('error', type !== 'success');
    workoutMessage.classList.remove('hidden');
}

function clearMessage() {
    workoutMessage.classList.add('hidden');
    workoutMessage.classList.remove('success', 'error');
}

const customSelectControllers = new Map();

function closeCustomSelects(except = null) {
    document.querySelectorAll('.workout-custom-select.is-open').forEach((wrapper) => {
        if (wrapper !== except) {
            wrapper.classList.remove('is-open');
            wrapper.querySelector('.workout-custom-select-trigger')?.setAttribute('aria-expanded', 'false');
        }
    });
}

document.addEventListener('click', () => closeCustomSelects());

function createCustomSelect(selectElement) {
    if (!selectElement || customSelectControllers.has(selectElement)) {
        return customSelectControllers.get(selectElement) ?? null;
    }

    const wrapper = document.createElement('div');
    wrapper.className = 'workout-custom-select';

    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'workout-custom-select-trigger';
    trigger.setAttribute('aria-haspopup', 'listbox');
    trigger.setAttribute('aria-expanded', 'false');

    const triggerText = document.createElement('span');
    triggerText.className = 'workout-custom-select-text';

    const arrow = document.createElement('span');
    arrow.className = 'workout-custom-select-arrow';
    arrow.setAttribute('aria-hidden', 'true');
    arrow.textContent = '⌄';

    trigger.append(triggerText, arrow);

    const menu = document.createElement('div');
    menu.className = 'workout-custom-select-menu';
    menu.setAttribute('role', 'listbox');

    wrapper.append(trigger, menu);
    selectElement.classList.add('workout-native-select');
    selectElement.setAttribute('aria-hidden', 'true');
    selectElement.tabIndex = -1;
    selectElement.parentNode.insertBefore(wrapper, selectElement);
    wrapper.appendChild(selectElement);

    const sync = () => {
        const option = selectElement.options[selectElement.selectedIndex] ?? selectElement.options[0];
        triggerText.textContent = option?.textContent ?? '';
        trigger.classList.toggle('is-placeholder', !selectElement.value);

        menu.querySelectorAll('.workout-custom-select-option').forEach((item) => {
            item.classList.toggle('is-selected', item.dataset.value === selectElement.value);
        });
    };

    const renderOptions = () => {
        menu.replaceChildren();

        [...selectElement.options].forEach((option) => {
            const item = document.createElement('button');
            item.type = 'button';
            item.className = 'workout-custom-select-option';
            item.dataset.value = option.value;
            item.textContent = option.textContent;
            item.disabled = option.disabled;

            item.addEventListener('click', (event) => {
                event.stopPropagation();
                selectElement.value = option.value;
                selectElement.dispatchEvent(new Event('change', { bubbles: true }));
                sync();
                closeCustomSelects();
            });

            menu.appendChild(item);
        });

        sync();
    };

    trigger.addEventListener('click', (event) => {
        event.stopPropagation();
        const willOpen = !wrapper.classList.contains('is-open');
        closeCustomSelects(wrapper);
        wrapper.classList.toggle('is-open', willOpen);
        trigger.setAttribute('aria-expanded', String(willOpen));
    });

    selectElement.addEventListener('change', sync);

    const controller = { sync, renderOptions };
    customSelectControllers.set(selectElement, controller);
    renderOptions();

    return controller;
}

function syncCustomSelect(selectElement) {
    customSelectControllers.get(selectElement)?.sync();
}

function formatDateTime(value) {
    return new Intl.DateTimeFormat('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(new Date(value));
}

function formatElapsed(milliseconds) {
    const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const pad = (value) => String(value).padStart(2, '0');

    return `${hours > 0 ? `${pad(hours)}:` : ''}${pad(minutes)}:${pad(seconds)}`;
}

function realExerciseMap() {
    return new Map(state.exercises.map((exercise) => [exercise.id, exercise]));
}

function effectiveExercise(planExercise) {
    const replacement = state.workoutExercises.find(
        (item) => item.plannedExerciseId === planExercise.exerciseId
    );

    const exerciseMap = realExerciseMap();
    const exerciseId = replacement?.exerciseId ?? planExercise.exerciseId;
    const exercise = exerciseMap.get(exerciseId);

    return {
        planExercise,
        replacement,
        exerciseId,
        exercise,
        exerciseName: exercise?.name ?? planExercise.exerciseName,
        sets: replacement?.adaptationData?.sets ?? planExercise.sets,
        target: replacement?.adaptationData?.target ?? planExercise.target
    };
}

function isActive() {
    return state.mode === 'active' && state.workout?.status === 'IN_PROGRESS';
}

function hasTargetType(target, type) {
    return (target ?? []).some((value) => value?.type === type);
}

function metricInputConfig(effective) {
    const target = effective.target ?? [];
    const equipmentType = effective.exercise?.equipmentType;

    if (hasTargetType(target, 'duration') || hasTargetType(target, 'distance') || equipmentType === 'cardio') {
        const metrics = [];

        if (hasTargetType(target, 'duration') || equipmentType === 'cardio') {
            metrics.push({
                key: 'duration',
                type: 'text',
                inputType: 'duration',
                inputMode: 'numeric',
                step: undefined,
                label: 'Время'
            });
        }

        if (hasTargetType(target, 'distance') || equipmentType === 'cardio') {
            metrics.push({
                key: 'distance',
                type: 'number',
                inputType: 'distance',
                step: '1',
                min: '0',
                label: 'Расстояние, м'
            });
        }

        return metrics;
    }

    if (hasTargetType(target, 'reps')) {
        return [
            {
                key: 'reps',
                type: 'number',
                inputType: 'reps',
                step: '1',
                min: '0',
                label: 'Повторения'
            },
            {
                key: 'weight',
                type: 'number',
                inputType: 'weight',
                step: '0.1',
                min: '0',
                label: 'Вес, кг'
            }
        ];
    }

    return (target.length ? target : [{ type: 'reps' }]).map((value) => {
        switch (value.type) {
            case 'weight':
                return { key: 'weight', type: 'number', inputType: 'weight', step: '0.1', min: '0', label: 'Вес, кг' };
            case 'duration':
                return { key: 'duration', type: 'text', inputType: 'duration', inputMode: 'numeric', step: undefined, label: 'Время' };
            case 'distance':
                return { key: 'distance', type: 'number', inputType: 'distance', step: '1', min: '0', label: 'Расстояние, м' };
            default:
                return { key: 'reps', type: 'number', inputType: 'reps', step: '1', min: '0', label: 'Повторения' };
        }
    });
}

function targetForMetric(target, metric) {
    return (target ?? []).find((value) => value?.type === metric) ?? null;
}

function formatMetricTarget(target, metric) {
    return formatWorkoutValue(targetForMetric(target, metric));
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

function formatWorkoutValue(value) {
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

function storageKey() {
    return `${DRAFT_STORAGE_PREFIX}${workoutId}`;
}

function loadLocalDraft() {
    try {
        const raw = localStorage.getItem(storageKey());
        if (!raw) return null;
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

function saveLocalDraft() {
    if (!isActive()) return;

    try {
        localStorage.setItem(
            storageKey(),
            JSON.stringify({
                actualData: buildActualData(),
                survey: state.survey
            })
        );
    } catch {
        // Local draft is only a convenience. Server completion still remains authoritative.
    }
}

function clearLocalDraft() {
    try {
        localStorage.removeItem(storageKey());
    } catch {
        // Ignore storage errors.
    }
}

function hydrateDraft() {
    const stored = loadLocalDraft();
    state.draft = stored?.actualData ?? state.result?.actualData ?? null;

    if (stored?.survey) {
        state.survey = {
            wellness: stored.survey.wellness ?? null,
            fatigue: stored.survey.fatigue ?? null
        };
    } else if (state.result?.actualData) {
        state.survey = {
            wellness: state.result.actualData.wellness ?? null,
            fatigue: state.result.actualData.fatigue ?? null
        };
    }

    wellnessInput.value = state.survey.wellness ? String(state.survey.wellness) : '';
    fatigueInput.value = state.survey.fatigue ? String(state.survey.fatigue) : '';
    syncCustomSelect(wellnessInput);
    syncCustomSelect(fatigueInput);
}

function currentDraftExercise(orderIndex) {
    return state.draft?.exercises?.find((exercise) => exercise.orderIndex === orderIndex) ?? null;
}

function updateSurveySummary() {
    const complete = Number.isInteger(state.survey.wellness) && Number.isInteger(state.survey.fatigue);

    if (!complete) {
        sessionSurveyForm.classList.remove('hidden');
        sessionSurveySummary.classList.add('hidden');
        return;
    }

    surveySummaryText.textContent =
        `Самочувствие: ${state.survey.wellness}/5 · Усталость: ${state.survey.fatigue}/5`;
    sessionSurveyForm.classList.add('hidden');
    sessionSurveySummary.classList.remove('hidden');
}

function saveSurvey() {
    const wellness = Number(wellnessInput.value);
    const fatigue = Number(fatigueInput.value);

    if (!Number.isInteger(wellness) || !Number.isInteger(fatigue)) {
        showMessage('Сначала оцени самочувствие и усталость.');
        return false;
    }

    state.survey = { wellness, fatigue };
    updateSurveySummary();
    saveLocalDraft();
    clearMessage();
    return true;
}

function startTimer() {
    stopTimer();

    if (!isActive() || !state.workout?.startedAt) {
        return;
    }

    const update = () => {
        workoutTimerValue.textContent = formatElapsed(
            Date.now() - new Date(state.workout.startedAt).getTime()
        );
    };

    update();
    state.timerId = window.setInterval(update, 1000);
}

function stopTimer() {
    if (state.timerId !== null) {
        window.clearInterval(state.timerId);
        state.timerId = null;
    }
}

function renderSurvey() {
    if (!isActive()) {
        sessionSurvey.classList.add('hidden');
        return;
    }

    sessionSurvey.classList.remove('hidden');
    updateSurveySummary();
}

function renderModeControls() {
    const active = isActive();

    workoutModeLabel.textContent = active ? 'Тренировка' : 'Просмотр';
    workoutTimer.classList.toggle('hidden', !active);
    finishSection.classList.toggle('hidden', !active);
}

function renderWorkout() {
    const workout = state.workout;
    const active = isActive();

    if (!workout) return;

    workoutTitle.textContent = getWorkoutCategory(state.patterns, workout);
    workoutMeta.textContent = `${formatDateTime(workout.scheduledAt)} · ${workout.workoutPlan.exercises.length} ${exerciseWord(workout.workoutPlan.exercises.length)}`;
    workoutStatus.textContent = STATUS_LABELS[workout.status] ?? 'Тренировка';
    restSecondsLabel.textContent = `Отдых: ${workout.workoutPlan.restSeconds} сек.`;

    exerciseList.replaceChildren();

    workout.workoutPlan.exercises
        .slice()
        .sort((a, b) => a.orderIndex - b.orderIndex)
        .forEach((planExercise) => {
            exerciseList.appendChild(createExerciseCard(effectiveExercise(planExercise)));
        });

    renderModeControls();
    renderSurvey();

    if (active) {
        startTimer();
    } else {
        stopTimer();
    }
}

function createExerciseCard(effective) {
    const card = document.createElement('article');
    card.className = 'workout-exercise-card';
    card.dataset.orderIndex = String(effective.planExercise.orderIndex);
    card.dataset.exerciseId = String(effective.exerciseId);

    const head = document.createElement('div');
    head.className = 'workout-exercise-head';

    const info = document.createElement('div');
    info.className = 'workout-exercise-info';

    const title = document.createElement('h3');
    title.textContent = `${effective.planExercise.orderIndex + 1}. ${effective.exerciseName}`;

    const sets = document.createElement('small');
    sets.textContent = `${effective.sets} ${setWord(effective.sets)}`;
    info.append(title, sets);
    head.appendChild(info);

    if (isActive()) {
        const select = document.createElement('select');
        select.className = 'workout-replace-native';

        const placeholder = document.createElement('option');
        placeholder.value = '';
        placeholder.textContent = 'Заменить упражнение…';
        select.appendChild(placeholder);

        const usedExerciseIds = new Set(
            state.workout.workoutPlan.exercises.map((item) => effectiveExercise(item).exerciseId)
        );

        state.exercises
            .slice()
            .sort((a, b) => a.name.localeCompare(b.name, 'ru'))
            .forEach((exercise) => {
                if (!exercise.isActive || usedExerciseIds.has(exercise.id)) return;

                const option = document.createElement('option');
                option.value = String(exercise.id);
                option.textContent = exercise.name;
                select.appendChild(option);
            });

        head.appendChild(select);
        createCustomSelect(select);

        select.addEventListener('change', async () => {
            if (!select.value) return;

            try {
                saveLocalDraft();
                clearMessage();

                await apiJson(`/api/workouts/${workoutId}/exercises/${effective.planExercise.exerciseId}`, {
                    method: 'PATCH',
                    body: {
                        exerciseId: Number(select.value),
                        adaptationData: effective.replacement?.adaptationData ?? null
                    }
                });

                await load();
            } catch (error) {
                select.value = '';
                syncCustomSelect(select);
                showMessage(error instanceof Error ? error.message : 'Не удалось заменить упражнение.');
            }
        });

    }

    const body = document.createElement('div');

    if (!isActive()) {
        body.className = 'workout-preview';

        const recommendationTitle = document.createElement('span');
        recommendationTitle.className = 'workout-recommendation-title';
        recommendationTitle.textContent = 'Рекомендация';
        body.appendChild(recommendationTitle);

        const fields = document.createElement('div');
        fields.className = 'workout-preview-fields';

        const configs = metricInputConfig(effective);
        configs.forEach((config) => {
            const field = document.createElement('div');
            field.className = 'workout-preview-field';

            const label = document.createElement('span');
            label.className = 'workout-preview-field-label';
            label.textContent = config.label;

            const value = document.createElement('div');
            value.className = 'workout-preview-field-value';
            value.textContent = formatMetricTarget(effective.target, config.inputType) || 'Не указано';
            if (!formatMetricTarget(effective.target, config.inputType)) {
                value.classList.add('muted');
            }

            field.append(label, value);
            fields.appendChild(field);
        });

        body.appendChild(fields);
    } else {
        body.className = 'workout-sets';

        const inputConfigs = metricInputConfig(effective);
        const draftExercise = currentDraftExercise(effective.planExercise.orderIndex);

        for (let index = 0; index < effective.sets; index += 1) {
            const set = document.createElement('div');
            set.className = 'workout-set';

            const header = document.createElement('div');
            header.className = 'workout-set-header';

            const label = document.createElement('strong');
            label.textContent = `Подход ${index + 1}`;
            header.appendChild(label);
            set.appendChild(header);

            const fields = document.createElement('div');
            fields.className = 'workout-set-fields';

            inputConfigs.forEach((config) => {
                const field = document.createElement('label');
                field.className = 'workout-input-field';

                const fieldLabel = document.createElement('span');
                fieldLabel.textContent = config.label;
                field.appendChild(fieldLabel);

                const input = document.createElement('input');
                input.type = config.type;
                if (config.step !== undefined) input.step = config.step;
                if (config.inputMode) input.inputMode = config.inputMode;
                if (config.inputType === 'duration') {
                    input.maxLength = 5;
                    input.pattern = '^\\d{2}:[0-5]\\d$';
                    input.autocomplete = 'off';
                }
                if (config.min !== undefined) input.min = config.min;
                input.dataset.inputType = config.inputType;
                input.dataset.orderIndex = String(effective.planExercise.orderIndex);
                input.dataset.exerciseId = String(effective.exerciseId);
                input.dataset.setIndex = String(index);
                input.placeholder = formatMetricTarget(effective.target, config.inputType) || 'Введи значение';

                const existingValues = draftExercise?.actualValues?.[index];
                const existingValue = Array.isArray(existingValues)
                    ? existingValues.find((value) => value?.type === config.inputType)
                    : existingValues?.type === config.inputType
                        ? existingValues
                        : null;

                if (existingValue) {
                    input.value = String(existingValue.value);
                }

                input.addEventListener('input', saveLocalDraft);
                field.appendChild(input);
                fields.appendChild(field);
            });

            set.appendChild(fields);
            body.appendChild(set);
        }
    }

    card.append(head, body);
    return card;
}

function buildActualData() {
    const exercises = [...exerciseList.querySelectorAll('.workout-exercise-card')]
        .sort((a, b) => Number(a.dataset.orderIndex) - Number(b.dataset.orderIndex))
        .map((card) => {
            const planExercise = state.workout.workoutPlan.exercises.find(
                (item) => item.orderIndex === Number(card.dataset.orderIndex)
            );
            const effective = effectiveExercise(planExercise);

            const setInputs = new Map();
            card.querySelectorAll('input[data-set-index]').forEach((input) => {
                const setIndex = Number(input.dataset.setIndex);
                if (!setInputs.has(setIndex)) setInputs.set(setIndex, []);

                if (!input.value) return;

                const raw = input.value;
                let value;

                switch (input.dataset.inputType) {
                    case 'weight':
                        value = { type: 'weight', metric: 'kg', value: Number(raw) };
                        break;
                    case 'duration':
                        value = { type: 'duration', metric: 'min_sec', value: raw.slice(0, 5) };
                        break;
                    case 'distance':
                        value = { type: 'distance', metric: 'metr', value: Number(raw) };
                        break;
                    default:
                        value = { type: 'reps', metric: 'count', value: Number(raw) };
                        break;
                }

                setInputs.get(setIndex).push(value);
            });

            const actualValues = [];
            for (let index = 0; index < effective.sets; index += 1) {
                actualValues.push(setInputs.get(index)?.length ? setInputs.get(index) : null);
            }

            return {
                exerciseId: effective.exerciseId,
                exerciseName: effective.exerciseName,
                orderIndex: effective.planExercise.orderIndex,
                sets: effective.sets,
                actualValues
            };
        });

    const actualData = {
        restSeconds: state.workout.workoutPlan.restSeconds,
        exercises
    };

    if (Number.isInteger(state.survey.wellness)) {
        actualData.wellness = state.survey.wellness;
    }

    if (Number.isInteger(state.survey.fatigue)) {
        actualData.fatigue = state.survey.fatigue;
    }

    return actualData;
}

async function saveResult() {
    const actualData = buildActualData();
    const method = state.result ? 'PATCH' : 'POST';

    const result = await apiJson(`/api/workouts/${workoutId}/result`, {
        method,
        body: actualData
    });

    state.result = result;
    return result;
}

function validateWorkoutInputs() {
    const emptyInput = [...exerciseList.querySelectorAll('input[data-set-index]')]
        .find((input) => !input.value);

    if (!emptyInput) return true;

    showMessage('Заполни все поля каждого подхода перед завершением тренировки.');
    emptyInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    emptyInput.focus();
    return false;
}

async function finishWorkout() {
    if (!isActive()) return;

    const surveySaved = Number.isInteger(state.survey.wellness) && Number.isInteger(state.survey.fatigue);

    if (!surveySaved || !sessionSurveyForm.classList.contains('hidden')) {
        sessionSurvey.scrollIntoView({ behavior: 'smooth', block: 'start' });
        showMessage(
            surveySaved
                ? 'Сохрани новую оценку состояния перед завершением.'
                : 'Перед завершением оцени самочувствие и усталость.'
        );
        return;
    }

    if (!validateWorkoutInputs()) {
        return;
    }

    finishWorkoutBtn.disabled = true;

    try {
        clearMessage();
        await saveResult();

        state.workout = await apiJson(`/api/workouts/${workoutId}/status`, {
            method: 'PATCH',
            body: { status: 'COMPLETED' }
        });

        clearLocalDraft();
        showMessage('Тренировка завершена. Результат сохранён.', 'success');

        window.setTimeout(() => {
            window.location.assign('/user/dashboard/dashboard.html');
        }, 700);
    } catch (error) {
        finishWorkoutBtn.disabled = false;
        showMessage(error instanceof Error ? error.message : 'Не удалось завершить тренировку.');
    }
}

async function load() {
    clearMessage();

    try {
        state.workout = await apiJson(`/api/workouts/${workoutId}`);
        state.workoutExercises = await apiJson(`/api/workouts/${workoutId}/exercises`) ?? [];
        state.patterns = await apiJson('/api/workout-patterns') ?? [];

        if (requestedMode === 'active' && state.workout.status !== 'IN_PROGRESS') {
            state.mode = 'view';
        }

        if (isActive()) {
            try {
                state.result = await apiJson(`/api/workouts/${workoutId}/result`);
            } catch (error) {
                if (error instanceof ApiError && error.status === 404) {
                    state.result = null;
                } else {
                    throw error;
                }
            }
        } else {
            state.result = null;
        }

        const ids = [
            ...state.workout.workoutPlan.exercises.map((exercise) => exercise.exerciseId),
            ...state.workoutExercises.map((exercise) => exercise.exerciseId)
        ];

        const uniqueIds = [...new Set(ids)];
        const allActiveExercises = await apiJson('/api/exercises') ?? [];
        const workoutExercisesById = uniqueIds.length
            ? await apiJson(`/api/exercises/by-ids?exerciseIds=${encodeURIComponent(uniqueIds.join(','))}`) ?? []
            : [];

        const mergedExercises = new Map();
        [...allActiveExercises, ...workoutExercisesById].forEach((exercise) => {
            mergedExercises.set(exercise.id, exercise);
        });
        state.exercises = [...mergedExercises.values()];

        if (isActive()) {
            hydrateDraft();
        } else {
            state.draft = null;
        }

        renderWorkout();
    } catch (error) {
        showMessage(error instanceof Error ? error.message : 'Не удалось загрузить тренировку.');
    }
}

createCustomSelect(wellnessInput);
createCustomSelect(fatigueInput);

saveSurveyBtn.addEventListener('click', saveSurvey);

editSurveyBtn.addEventListener('click', () => {
    sessionSurveyForm.classList.remove('hidden');
    sessionSurveySummary.classList.add('hidden');
    wellnessInput.focus();
});

finishWorkoutBtn.addEventListener('click', () => void finishWorkout());

document.addEventListener('DOMContentLoaded', load);
window.addEventListener('beforeunload', saveLocalDraft);
