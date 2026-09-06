import { Navbar } from '/components/navbar/Navbar.js';


/* =========================================================
   NAVBAR
   ========================================================= */

const navbarRoot = document.getElementById('navbar');

if (!navbarRoot) {
    throw new Error('Navbar root element not found.');
}

const navbar = new Navbar(navbarRoot, {
    authenticated: true
});

navbar.render();


/* =========================================================
   DOM
   ========================================================= */

const historyCount = document.getElementById('historyCount');
const historyList = document.getElementById('historyList');

const dateFromInput = document.getElementById('dateFrom');
const dateToInput = document.getElementById('dateTo');

const workoutTypeSelect =
    document.getElementById('workoutType');

const exerciseSearchInput =
    document.getElementById('exerciseSearch');

const exerciseSuggestions =
    document.getElementById('exerciseSuggestions');

const exerciseIdInput =
    document.getElementById('exerciseId');

const resetFiltersButton =
    document.getElementById('resetFiltersBtn');

const activeFiltersLabel =
    document.getElementById('activeFiltersLabel');

if (
    !historyList ||
    !dateFromInput ||
    !dateToInput ||
    !workoutTypeSelect ||
    !exerciseSearchInput ||
    !exerciseSuggestions ||
    !exerciseIdInput ||
    !resetFiltersButton ||
    !activeFiltersLabel
) {
    throw new Error(
        'History page elements not found.'
    );
}


/* =========================================================
   DEMO DATA
   =========================================================
   В дальнейшем этот массив будет заменён данными,
   которые придут с backend через user_workout_result.
   ========================================================= */

const workoutTypes = [
    {
        id: 'chest',
        name: 'Грудь'
    },
    {
        id: 'back',
        name: 'Спина'
    },
    {
        id: 'legs',
        name: 'Ноги'
    }
];


const exercises = [
    {
        id: 1,
        name: 'Жим штанги лёжа'
    },
    {
        id: 2,
        name: 'Жим гантелей лёжа'
    },
    {
        id: 3,
        name: 'Разводка с гантелями'
    },
    {
        id: 4,
        name: 'Тяга верхнего блока'
    },
    {
        id: 5,
        name: 'Подтягивания'
    },
    {
        id: 6,
        name: 'Тяга штанги в наклоне'
    },
    {
        id: 7,
        name: 'Приседания со штангой'
    },
    {
        id: 8,
        name: 'Жим ногами'
    },
    {
        id: 9,
        name: 'Разгибание ног в тренажёре'
    }
];


const workoutHistory = [
    {
        id: 101,

        date: '2025-07-27',

        type: {
            id: 'legs',
            name: 'Ноги'
        },

        duration: 56,

        exercises: [
            {
                exerciseId: 7,
                exerciseName: 'Приседания со штангой',

                actualSets: [
                    {
                        weight: 80,
                        reps: 10
                    },
                    {
                        weight: 85,
                        reps: 8
                    },
                    {
                        weight: 85,
                        reps: 7
                    }
                ]
            },

            {
                exerciseId: 8,
                exerciseName: 'Жим ногами',

                actualSets: [
                    {
                        weight: 140,
                        reps: 12
                    },
                    {
                        weight: 150,
                        reps: 10
                    },
                    {
                        weight: 150,
                        reps: 9
                    }
                ]
            },

            {
                exerciseId: 9,
                exerciseName: 'Разгибание ног в тренажёре',

                actualSets: [
                    {
                        weight: 55,
                        reps: 12
                    },
                    {
                        weight: 55,
                        reps: 11
                    }
                ]
            }
        ]
    },

    {
        id: 100,

        date: '2025-07-24',

        type: {
            id: 'back',
            name: 'Спина'
        },

        duration: 52,

        exercises: [
            {
                exerciseId: 4,
                exerciseName: 'Тяга верхнего блока',

                actualSets: [
                    {
                        weight: 60,
                        reps: 12
                    },
                    {
                        weight: 65,
                        reps: 10
                    },
                    {
                        weight: 65,
                        reps: 9
                    }
                ]
            },

            {
                exerciseId: 5,
                exerciseName: 'Подтягивания',

                actualSets: [
                    {
                        reps: 9
                    },
                    {
                        reps: 8
                    },
                    {
                        reps: 7
                    }
                ]
            },

            {
                exerciseId: 6,
                exerciseName: 'Тяга штанги в наклоне',

                actualSets: [
                    {
                        weight: 60,
                        reps: 10
                    },
                    {
                        weight: 65,
                        reps: 8
                    }
                ]
            }
        ]
    },

    {
        id: 99,

        date: '2025-07-21',

        type: {
            id: 'chest',
            name: 'Грудь'
        },

        duration: 49,

        exercises: [
            {
                exerciseId: 1,
                exerciseName: 'Жим штанги лёжа',

                actualSets: [
                    {
                        weight: 77.5,
                        reps: 10
                    },
                    {
                        weight: 80,
                        reps: 9
                    },
                    {
                        weight: 80,
                        reps: 7
                    }
                ]
            },

            {
                exerciseId: 2,
                exerciseName: 'Жим гантелей лёжа',

                actualSets: [
                    {
                        weight: 28,
                        reps: 10
                    },
                    {
                        weight: 28,
                        reps: 9
                    },
                    {
                        weight: 30,
                        reps: 7
                    }
                ]
            },

            {
                exerciseId: 3,
                exerciseName: 'Разводка с гантелями',

                actualSets: [
                    {
                        weight: 12,
                        reps: 12
                    },
                    {
                        weight: 12,
                        reps: 10
                    }
                ]
            }
        ]
    },

    {
        id: 98,

        date: '2025-07-18',

        type: {
            id: 'legs',
            name: 'Ноги'
        },

        duration: 54,

        exercises: [
            {
                exerciseId: 7,
                exerciseName: 'Приседания со штангой',

                actualSets: [
                    {
                        weight: 75,
                        reps: 10
                    },
                    {
                        weight: 80,
                        reps: 10
                    },
                    {
                        weight: 82.5,
                        reps: 8
                    }
                ]
            },

            {
                exerciseId: 8,
                exerciseName: 'Жим ногами',

                actualSets: [
                    {
                        weight: 135,
                        reps: 12
                    },
                    {
                        weight: 145,
                        reps: 10
                    }
                ]
            }
        ]
    },

    {
        id: 97,

        date: '2025-07-15',

        type: {
            id: 'back',
            name: 'Спина'
        },

        duration: 47,

        exercises: [
            {
                exerciseId: 4,
                exerciseName: 'Тяга верхнего блока',

                actualSets: [
                    {
                        weight: 55,
                        reps: 12
                    },
                    {
                        weight: 60,
                        reps: 11
                    },
                    {
                        weight: 60,
                        reps: 9
                    }
                ]
            },

            {
                exerciseId: 5,
                exerciseName: 'Подтягивания',

                actualSets: [
                    {
                        reps: 8
                    },
                    {
                        reps: 8
                    }
                ]
            }
        ]
    },

    {
        id: 96,

        date: '2025-07-12',

        type: {
            id: 'chest',
            name: 'Грудь'
        },

        duration: 51,

        exercises: [
            {
                exerciseId: 1,
                exerciseName: 'Жим штанги лёжа',

                actualSets: [
                    {
                        weight: 75,
                        reps: 10
                    },
                    {
                        weight: 77.5,
                        reps: 9
                    },
                    {
                        weight: 77.5,
                        reps: 8
                    }
                ]
            },

            {
                exerciseId: 2,
                exerciseName: 'Жим гантелей лёжа',

                actualSets: [
                    {
                        weight: 26,
                        reps: 10
                    },
                    {
                        weight: 28,
                        reps: 8
                    }
                ]
            }
        ]
    },

    {
        id: 95,

        date: '2025-06-26',

        type: {
            id: 'chest',
            name: 'Грудь'
        },

        duration: 48,

        exercises: [
            {
                exerciseId: 1,
                exerciseName: 'Жим штанги лёжа',

                actualSets: [
                    {
                        weight: 70,
                        reps: 10
                    },
                    {
                        weight: 72.5,
                        reps: 9
                    },
                    {
                        weight: 75,
                        reps: 7
                    }
                ]
            },

            {
                exerciseId: 3,
                exerciseName: 'Разводка с гантелями',

                actualSets: [
                    {
                        weight: 10,
                        reps: 12
                    },
                    {
                        weight: 10,
                        reps: 11
                    }
                ]
            }
        ]
    }
];


/* =========================================================
   STATE
   ========================================================= */

const state = {
    workouts: [...workoutHistory],

    filters: {
        dateFrom: '',
        dateTo: '',
        workoutType: '',
        exerciseId: ''
    },

    selectedExerciseName: ''
};


/* =========================================================
   INITIALIZATION
   ========================================================= */

document.addEventListener(
    'DOMContentLoaded',
    initialize
);


function initialize() {

    renderWorkoutTypes();

    renderHistory(state.workouts);

    setupEventListeners();

}


/* =========================================================
   EVENT LISTENERS
   ========================================================= */

function setupEventListeners() {

    dateFromInput.addEventListener(
        'change',
        handleDateFilterChange
    );


    dateToInput.addEventListener(
        'change',
        handleDateFilterChange
    );


    workoutTypeSelect.addEventListener(
        'change',
        handleWorkoutTypeChange
    );


    exerciseSearchInput.addEventListener(
        'input',
        handleExerciseSearch
    );


    exerciseSearchInput.addEventListener(
        'focus',
        handleExerciseFocus
    );


    resetFiltersButton.addEventListener(
        'click',
        resetFilters
    );


    document.addEventListener(
        'click',
        handleDocumentClick
    );

}


/* =========================================================
   FILTER HANDLERS
   ========================================================= */

function handleDateFilterChange() {

    state.filters.dateFrom =
        dateFromInput.value;

    state.filters.dateTo =
        dateToInput.value;

    renderFilteredHistory();

}


function handleWorkoutTypeChange() {

    state.filters.workoutType =
        workoutTypeSelect.value;

    renderFilteredHistory();

}


function handleExerciseSearch(event) {

    const searchValue =
        event.target.value.trim();

    state.selectedExerciseName = '';

    state.filters.exerciseId = '';

    exerciseIdInput.value = '';

    renderExerciseSuggestions(searchValue);

    renderFilteredHistory();

}


function handleExerciseFocus() {

    const searchValue =
        exerciseSearchInput.value.trim();

    if (searchValue) {
        renderExerciseSuggestions(searchValue);
    }

}


/* =========================================================
   EXERCISE SEARCH
   ========================================================= */

function renderExerciseSuggestions(searchValue) {

    exerciseSuggestions.innerHTML = '';

    if (!searchValue) {
        return;
    }

    const normalizedSearch =
        searchValue.toLowerCase();


    const matches =
        exercises.filter(exercise =>
            exercise.name
                .toLowerCase()
                .includes(normalizedSearch)
        );


    if (matches.length === 0) {

        const emptyElement =
            document.createElement('div');

        emptyElement.className =
            'exercise-suggestions-empty';

        emptyElement.textContent =
            'Упражнения не найдены';

        exerciseSuggestions.appendChild(
            emptyElement
        );

        return;
    }


    matches.forEach(exercise => {

        const button =
            document.createElement('button');

        button.type = 'button';

        button.className =
            'exercise-suggestion';

        button.textContent =
            exercise.name;

        button.dataset.exerciseId =
            String(exercise.id);

        button.addEventListener(
            'click',
            () => selectExercise(exercise)
        );

        exerciseSuggestions.appendChild(button);

    });

}


function selectExercise(exercise) {

    state.filters.exerciseId =
        String(exercise.id);

    state.selectedExerciseName =
        exercise.name;

    exerciseIdInput.value =
        String(exercise.id);

    exerciseSearchInput.value =
        exercise.name;

    exerciseSuggestions.innerHTML = '';

    renderFilteredHistory();

}


/* =========================================================
   OUTSIDE CLICK
   ========================================================= */

function handleDocumentClick(event) {

    const exerciseFilter =
        document.querySelector('.exercise-filter');


    if (
        exerciseFilter &&
        !exerciseFilter.contains(event.target)
    ) {
        exerciseSuggestions.innerHTML = '';
    }

}


/* =========================================================
   FILTERING
   ========================================================= */

function renderFilteredHistory() {

    const filteredWorkouts =
        state.workouts.filter(
            workout => matchesFilters(workout)
        );

    renderHistory(filteredWorkouts);

}


function matchesFilters(workout) {

    const {
        dateFrom,
        dateTo,
        workoutType,
        exerciseId
    } = state.filters;


    /* ---------- Date from ---------- */

    if (
        dateFrom &&
        workout.date < dateFrom
    ) {
        return false;
    }


    /* ---------- Date to ---------- */

    if (
        dateTo &&
        workout.date > dateTo
    ) {
        return false;
    }


    /* ---------- Workout type ---------- */

    if (
        workoutType &&
        workout.type.id !== workoutType
    ) {
        return false;
    }


    /* ---------- Exercise ---------- */

    if (exerciseId) {

        const hasExercise =
            workout.exercises.some(
                exercise =>
                    String(exercise.exerciseId) ===
                    String(exerciseId)
            );

        if (!hasExercise) {
            return false;
        }

    }


    return true;

}


/* =========================================================
   RESET
   ========================================================= */

function resetFilters() {

    state.filters.dateFrom = '';
    state.filters.dateTo = '';
    state.filters.workoutType = '';
    state.filters.exerciseId = '';

    state.selectedExerciseName = '';

    dateFromInput.value = '';
    dateToInput.value = '';

    workoutTypeSelect.value = '';

    exerciseSearchInput.value = '';

    exerciseIdInput.value = '';

    exerciseSuggestions.innerHTML = '';

    renderFilteredHistory();

}


/* =========================================================
   WORKOUT TYPE SELECT
   ========================================================= */

function renderWorkoutTypes() {

    workoutTypes.forEach(type => {

        const option =
            document.createElement('option');

        option.value = type.id;

        option.textContent = type.name;

        workoutTypeSelect.appendChild(option);

    });

}


/* =========================================================
   HISTORY RENDER
   ========================================================= */

function renderHistory(workouts) {

    updateActiveFiltersLabel();


    if (workouts.length === 0) {

        renderEmptyHistory();

        return;
    }


    historyList.innerHTML = '';


    workouts.forEach(workout => {

        const card =
            createWorkoutCard(workout);

        historyList.appendChild(card);

    });

}


/* =========================================================
   WORKOUT CARD
   ========================================================= */

function createWorkoutCard(workout) {

    const article =
        document.createElement('article');

    article.className =
        'history-card';


    /* ---------- Header ---------- */

    const header =
        document.createElement('button');

    header.type = 'button';

    header.className =
        'history-card-header';

    header.setAttribute(
        'aria-expanded',
        'false'
    );


    const mainInfo =
        document.createElement('div');

    mainInfo.className =
        'history-main-info';


    const type =
        document.createElement('span');

    type.className =
        'history-card-type';

    type.textContent =
        workout.type.name;


    const title =
        document.createElement('h3');

    title.className =
        'history-card-title';

    title.textContent =
        workout.type.name;


    const meta =
        document.createElement('div');

    meta.className =
        'history-meta';


    const dateMeta =
        createMetaItem(
            '📅',
            formatDate(workout.date)
        );


    const durationMeta =
        createMetaItem(
            '⏱',
            `${workout.duration} мин`
        );


    const exerciseMeta =
        createMetaItem(
            '▦',
            `${workout.exercises.length} ${
                getExerciseWord(workout.exercises.length)
            }`
        );


    meta.appendChild(dateMeta);
    meta.appendChild(durationMeta);
    meta.appendChild(exerciseMeta);


    mainInfo.appendChild(type);
    mainInfo.appendChild(title);
    mainInfo.appendChild(meta);


    /* ---------- Side ---------- */

    const side =
        document.createElement('div');

    side.className =
        'history-card-side';


    const status =
        document.createElement('span');

    status.className =
        'status-badge status-completed';

    status.textContent =
        'Завершена';


    const expand =
        document.createElement('span');

    expand.className =
        'history-expand';

    expand.textContent =
        '+';

    expand.setAttribute(
        'aria-hidden',
        'true'
    );


    side.appendChild(status);
    side.appendChild(expand);


    header.appendChild(mainInfo);
    header.appendChild(side);


    /* ---------- Content ---------- */

    const content =
        document.createElement('div');

    content.className =
        'history-card-content';


    const contentInner =
        document.createElement('div');

    contentInner.className =
        'history-card-content-inner';


    const exerciseList =
        document.createElement('div');

    exerciseList.className =
        'history-exercise-list';


    workout.exercises.forEach(
        exercise => {

            const exerciseElement =
                createExerciseHistory(
                    exercise
                );

            exerciseList.appendChild(
                exerciseElement
            );

        }
    );


    contentInner.appendChild(
        exerciseList
    );

    content.appendChild(
        contentInner
    );


    /* ---------- Toggle ---------- */

    header.addEventListener(
        'click',
        () => {

            const expanded =
                article.classList.toggle(
                    'expanded'
                );

            header.setAttribute(
                'aria-expanded',
                String(expanded)
            );

        }
    );


    article.appendChild(header);
    article.appendChild(content);


    return article;

}


/* =========================================================
   EXERCISE HISTORY
   ========================================================= */

function createExerciseHistory(exercise) {

    const wrapper =
        document.createElement('div');

    wrapper.className =
        'history-exercise';


    const header =
        document.createElement('div');

    header.className =
        'history-exercise-header';


    const name =
        document.createElement('h4');

    name.className =
        'history-exercise-name';

    name.textContent =
        exercise.exerciseName;


    const setCount =
        document.createElement('span');

    setCount.className =
        'history-exercise-sets-count';

    setCount.textContent =
        `${exercise.actualSets.length} ${
            getSetWord(exercise.actualSets.length)
        }`;


    header.appendChild(name);
    header.appendChild(setCount);


    const sets =
        document.createElement('div');

    sets.className =
        'actual-sets';


    exercise.actualSets.forEach(
        (set, index) => {

            const setElement =
                createActualSet(
                    set,
                    index
                );

            sets.appendChild(
                setElement
            );

        }
    );


    wrapper.appendChild(header);
    wrapper.appendChild(sets);


    return wrapper;

}


/* =========================================================
   ACTUAL SET
   ========================================================= */

function createActualSet(set, index) {

    const wrapper =
        document.createElement('span');

    wrapper.className =
        'actual-set';


    const indexElement =
        document.createElement('span');

    indexElement.className =
        'actual-set-index';

    indexElement.textContent =
        `#${index + 1}`;


    const valueElement =
        document.createElement('span');

    valueElement.className =
        'actual-set-value';

    valueElement.textContent =
        formatActualSet(set);


    wrapper.appendChild(indexElement);
    wrapper.appendChild(valueElement);


    return wrapper;

}


/* =========================================================
   META ITEM
   ========================================================= */

function createMetaItem(icon, text) {

    const element =
        document.createElement('span');

    element.className =
        'history-meta-item';

    element.innerHTML = `
        <span aria-hidden="true">${icon}</span>
        <span>${text}</span>
    `;

    return element;

}


/* =========================================================
   EMPTY STATE
   ========================================================= */

function renderEmptyHistory() {

    historyList.innerHTML = `

        <div class="history-empty">

            <div
                class="history-empty-icon"
                aria-hidden="true"
            >
                🏋️
            </div>

            <h3 class="history-empty-title">
                Тренировки не найдены
            </h3>

            <p class="history-empty-description">
                По выбранным параметрам
                не удалось найти завершённые тренировки.
                Попробуй изменить фильтры.
            </p>

        </div>

    `;

}


/* =========================================================
   ACTIVE FILTER LABEL
   ========================================================= */

function updateActiveFiltersLabel() {

    const activeFilters = [];


    if (state.filters.dateFrom) {

        activeFilters.push(
            `от ${formatDate(
                state.filters.dateFrom
            )}`
        );

    }


    if (state.filters.dateTo) {

        activeFilters.push(
            `до ${formatDate(
                state.filters.dateTo
            )}`
        );

    }


    if (state.filters.workoutType) {

        const selectedType =
            workoutTypes.find(
                type =>
                    type.id ===
                    state.filters.workoutType
            );

        if (selectedType) {
            activeFilters.push(
                selectedType.name
            );
        }

    }


    if (state.filters.exerciseId) {

        const exercise =
            exercises.find(
                item =>
                    String(item.id) ===
                    String(state.filters.exerciseId)
            );

        if (exercise) {
            activeFilters.push(
                exercise.name
            );
        }

    }


    if (activeFilters.length === 0) {

        activeFiltersLabel.textContent =
            'Все тренировки';

        return;

    }


    activeFiltersLabel.textContent =
        activeFilters.join(' · ');

}


/* =========================================================
   DATE FORMAT
   ========================================================= */

function formatDate(dateString) {

    const date =
        new Date(
            `${dateString}T00:00:00`
        );


    return new Intl.DateTimeFormat(
        'ru-RU',
        {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        }
    ).format(date);

}


/* =========================================================
   ACTUAL SET FORMAT
   ========================================================= */

function formatActualSet(set) {

    const values = [];


    if (
        set.weight !== undefined &&
        set.weight !== null
    ) {
        values.push(
            `${formatNumber(set.weight)} кг`
        );
    }


    if (
        set.reps !== undefined &&
        set.reps !== null
    ) {
        values.push(
            `${set.reps} повт.`
        );
    }


    if (
        set.duration !== undefined &&
        set.duration !== null
    ) {
        values.push(
            set.duration
        );
    }


    if (
        set.distance !== undefined &&
        set.distance !== null
    ) {
        values.push(
            `${formatNumber(set.distance)} м`
        );
    }


    if (values.length === 0) {
        return 'Нет данных';
    }


    return values.join(' × ');

}


/* =========================================================
   NUMBER FORMAT
   ========================================================= */

function formatNumber(value) {

    return new Intl.NumberFormat(
        'ru-RU',
        {
            maximumFractionDigits: 2
        }
    ).format(value);

}


/* =========================================================
   WORD FORMS
   ========================================================= */

function getExerciseWord(number) {

    const lastTwo =
        number % 100;

    const last =
        number % 10;


    if (
        lastTwo >= 11 &&
        lastTwo <= 14
    ) {
        return 'упражнений';
    }


    if (last === 1) {
        return 'упражнение';
    }


    if (
        last >= 2 &&
        last <= 4
    ) {
        return 'упражнения';
    }


    return 'упражнений';

}


function getSetWord(number) {

    const lastTwo =
        number % 100;

    const last =
        number % 10;


    if (
        lastTwo >= 11 &&
        lastTwo <= 14
    ) {
        return 'подходов';
    }


    if (last === 1) {
        return 'подход';
    }


    if (
        last >= 2 &&
        last <= 4
    ) {
        return 'подхода';
    }


    return 'подходов';

}