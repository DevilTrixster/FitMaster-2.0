import { Navbar } from '/components/navbar/navbar.js';


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

const profileForm = document.getElementById('profileForm');

const nicknameInput = document.getElementById('nickname');
const emailInput = document.getElementById('email');
const firstNameInput = document.getElementById('firstName');
const lastNameInput = document.getElementById('lastName');
const birthDateInput = document.getElementById('birthDate');
const genderInput = document.getElementById('gender');
const heightInput = document.getElementById('height');
const weightInput = document.getElementById('weight');
const experienceInput =
    document.getElementById('experienceLevel');
const fitnessGoalInput =
    document.getElementById('fitnessGoal');
const preferredTimeInput =
    document.getElementById('preferredWorkoutTime');

const profileDisplayName =
    document.getElementById('profileDisplayName');

const profileDisplayNickname =
    document.getElementById('profileDisplayNickname');

const profileMemberSince =
    document.getElementById('profileMemberSince');

const messageElement =
    document.getElementById('message');


/* Avatar */

const avatarPreview =
    document.getElementById('avatarPreview');

const uploadAvatarButton =
    document.getElementById('uploadAvatarBtn');

const avatarInput =
    document.getElementById('avatarInput');


/* Training days */

const preferredDayInputs =
    document.querySelectorAll(
        'input[name="preferredDays"]'
    );

const selectedDaysCount =
    document.getElementById('selectedDaysCount');

const saveDaysButton =
    document.getElementById('saveDaysBtn');


/* Calendar */

const previousMonthButton =
    document.getElementById('prevMonthBtn');

const nextMonthButton =
    document.getElementById('nextMonthBtn');

const currentMonthYear =
    document.getElementById('currentMonthYear');

const calendarGrid =
    document.getElementById('calendarGrid');

const calendarEventInfo =
    document.getElementById('calendarEventInfo');

const calendarEventStatus =
    document.getElementById('calendarEventStatus');

const calendarEventTitle =
    document.getElementById('calendarEventTitle');

const calendarEventDetails =
    document.getElementById('calendarEventDetails');

const closeCalendarEventButton =
    document.getElementById('closeCalendarEvent');


/* Session */

const logoutButton =
    document.getElementById('logoutBtn');

const logoutModal =
    document.getElementById('logoutModal');

const confirmLogoutButton =
    document.getElementById('confirmLogoutBtn');


/* Delete */

const deleteAccountButton =
    document.getElementById('deleteAccountBtn');

const deleteModal =
    document.getElementById('deleteModal');

const confirmDeleteButton =
    document.getElementById('confirmDeleteBtn');


/* =========================================================
   DEMO USER
   ========================================================= */

const demoUser = {
    nickname: 'lord_sprite',
    email: 'lord@example.com',

    firstName: 'Lord',
    lastName: 'Sprite',

    birthDate: '2000-06-18',

    gender: 'male',

    height: 180,
    weight: 78.5,

    experienceLevel: 'intermediate',

    fitnessGoal: 'muscle_gain',

    preferredWorkoutTime: '18:00',

    preferredDays: [1, 3, 5],

    avatarUrl:
        '/assets/default-avatar/default-avatar.png',

    memberSince: '2026-08-31'
};


/* =========================================================
   DEMO CALENDAR DATA
   =========================================================
   status:
   scheduled   — предстоящая
   completed   — выполнена
   missed      — пропущена
   rescheduled — перенесена

   originalScheduledAt нужен для демонстрации переноса.
   ========================================================= */

const demoCalendarEvents = [
    {
        id: 1,

        title: 'Грудь',

        status: 'completed',

        scheduledAt: '2026-08-31',

        originalScheduledAt: '2026-08-31',

        duration: 48,

        exercises: 5
    },

    {
        id: 2,

        title: 'Спина',

        status: 'completed',

        scheduledAt: '2026-09-02',

        originalScheduledAt: '2026-09-02',

        duration: 51,

        exercises: 4
    },

    {
        id: 3,

        title: 'Ноги',

        status: 'scheduled',

        scheduledAt: '2026-09-04',

        originalScheduledAt: '2026-09-04',

        duration: null,

        exercises: 5
    },

    {
        id: 4,

        title: 'Грудь',

        status: 'missed',

        scheduledAt: '2026-09-07',

        originalScheduledAt: '2026-09-07',

        duration: 0,

        exercises: 4
    },

    {
        id: 5,

        title: 'Спина',

        status: 'rescheduled',

        scheduledAt: '2026-09-10',

        originalScheduledAt: '2026-09-08',

        duration: null,

        exercises: 4
    },

    {
        id: 6,

        title: 'Ноги',

        status: 'scheduled',

        scheduledAt: '2026-09-12',

        originalScheduledAt: '2026-09-12',

        duration: null,

        exercises: 5
    },

    {
        id: 7,

        title: 'Грудь',

        status: 'completed',

        scheduledAt: '2026-09-14',

        originalScheduledAt: '2026-09-14',

        duration: 45,

        exercises: 4
    },

    {
        id: 8,

        title: 'Спина',

        status: 'rescheduled',

        scheduledAt: '2026-09-18',

        originalScheduledAt: '2026-09-16',

        duration: null,

        exercises: 4
    },

    {
        id: 9,

        title: 'Ноги',

        status: 'scheduled',

        scheduledAt: '2026-09-21',

        originalScheduledAt: '2026-09-21',

        duration: null,

        exercises: 5
    }
];


/* =========================================================
   STATE
   ========================================================= */

const state = {

    user: {
        ...demoUser,

        preferredDays: [
            ...demoUser.preferredDays
        ]
    },

    calendar: {

        currentDate: new Date(),

        events: [
            ...demoCalendarEvents
        ]

    }

};


/*
 * Для демонстрации сразу открываем текущий месяц.
 * Это важно, чтобы при запуске страницы календарь
 * показывал актуальный месяц, а не дату demo-событий.
 */

state.calendar.currentDate =
    new Date(
        2026,
        8,
        1
    );


/* =========================================================
   CONSTANTS
   ========================================================= */

const MAX_PREFERRED_DAYS = 3;

const MONTH_NAMES = [
    'января',
    'февраля',
    'марта',
    'апреля',
    'мая',
    'июня',
    'июля',
    'августа',
    'сентября',
    'октября',
    'ноября',
    'декабря'
];

const MONTH_NAMES_NOMINATIVE = [
    'Январь',
    'Февраль',
    'Март',
    'Апрель',
    'Май',
    'Июнь',
    'Июль',
    'Август',
    'Сентябрь',
    'Октябрь',
    'Ноябрь',
    'Декабрь'
];

const STATUS_LABELS = {
    scheduled: 'Предстоящая тренировка',
    completed: 'Тренировка выполнена',
    missed: 'Тренировка пропущена',
    rescheduled: 'Тренировка перенесена'
};


/* =========================================================
   INITIALIZATION
   ========================================================= */

document.addEventListener(
    'DOMContentLoaded',
    initialize
);


function initialize() {

    validateDom();

    loadUserIntoForm();

    renderProfileSummary();

    renderPreferredDays();

    renderCalendar();

    setupEventListeners();

}


/* =========================================================
   DOM VALIDATION
   ========================================================= */

function validateDom() {

    const requiredElements = [
        profileForm,
        nicknameInput,
        emailInput,
        firstNameInput,
        lastNameInput,
        birthDateInput,
        genderInput,
        heightInput,
        weightInput,
        experienceInput,
        fitnessGoalInput,
        preferredTimeInput,
        profileDisplayName,
        profileDisplayNickname,
        profileMemberSince,
        messageElement,
        avatarPreview,
        uploadAvatarButton,
        avatarInput,
        selectedDaysCount,
        saveDaysButton,
        previousMonthButton,
        nextMonthButton,
        currentMonthYear,
        calendarGrid,
        calendarEventInfo,
        calendarEventStatus,
        calendarEventTitle,
        calendarEventDetails,
        closeCalendarEventButton,
        logoutButton,
        logoutModal,
        confirmLogoutButton,
        deleteAccountButton,
        deleteModal,
        confirmDeleteButton
    ];


    if (
        requiredElements.some(
            element => !element
        )
    ) {
        throw new Error(
            'Profile page elements not found.'
        );
    }

}


/* =========================================================
   LOAD PROFILE
   ========================================================= */

function loadUserIntoForm() {

    nicknameInput.value =
        state.user.nickname;

    emailInput.value =
        state.user.email;

    firstNameInput.value =
        state.user.firstName;

    lastNameInput.value =
        state.user.lastName;

    birthDateInput.value =
        state.user.birthDate;

    genderInput.value =
        state.user.gender;

    heightInput.value =
        state.user.height;

    weightInput.value =
        state.user.weight;

    experienceInput.value =
        state.user.experienceLevel;

    fitnessGoalInput.value =
        state.user.fitnessGoal;

    preferredTimeInput.value =
        state.user.preferredWorkoutTime;

    avatarPreview.src =
        state.user.avatarUrl;

}


/* =========================================================
   PROFILE SUMMARY
   ========================================================= */

function renderProfileSummary() {

    const fullName =
        [
            state.user.firstName,
            state.user.lastName
        ]
        .filter(Boolean)
        .join(' ');


    profileDisplayName.textContent =
        fullName || 'Пользователь';


    profileDisplayNickname.textContent =
        `@${state.user.nickname}`;


    profileMemberSince.textContent =
        `В FitMaster с ${
            formatDate(
                state.user.memberSince
            )
        }`;

}


/* =========================================================
   FORM EVENTS
   ========================================================= */

function setupEventListeners() {

    profileForm.addEventListener(
        'submit',
        handleProfileSubmit
    );


    preferredDayInputs.forEach(
        input => {

            input.addEventListener(
                'change',
                handlePreferredDayChange
            );

        }
    );


    saveDaysButton.addEventListener(
        'click',
        savePreferredDays
    );


    uploadAvatarButton.addEventListener(
        'click',
        () => avatarInput.click()
    );


    avatarInput.addEventListener(
        'change',
        handleAvatarChange
    );


    previousMonthButton.addEventListener(
        'click',
        () => changeMonth(-1)
    );


    nextMonthButton.addEventListener(
        'click',
        () => changeMonth(1)
    );


    closeCalendarEventButton.addEventListener(
        'click',
        closeCalendarEvent
    );


    logoutButton.addEventListener(
        'click',
        () => openModal(logoutModal)
    );


    confirmLogoutButton.addEventListener(
        'click',
        handleLogout
    );


    deleteAccountButton.addEventListener(
        'click',
        () => openModal(deleteModal)
    );


    confirmDeleteButton.addEventListener(
        'click',
        handleDeleteAccount
    );


    document
        .querySelectorAll('[data-modal-close]')
        .forEach(
            element => {

                element.addEventListener(
                    'click',
                    () => {

                        const modal =
                            element.closest(
                                '.profile-modal'
                            );

                        if (modal) {
                            closeModal(modal);
                        }

                    }
                );

            }
        );


    document.addEventListener(
        'keydown',
        handleKeyboard
    );

}


/* =========================================================
   PROFILE FORM
   ========================================================= */

function handleProfileSubmit(event) {

    event.preventDefault();


    const nickname =
        nicknameInput.value.trim();

    const firstName =
        firstNameInput.value.trim();

    const lastName =
        lastNameInput.value.trim();


    if (!nickname) {

        showMessage(
            'Никнейм не может быть пустым.',
            'error'
        );

        nicknameInput.focus();

        return;
    }


    if (!firstName) {

        showMessage(
            'Укажи имя.',
            'error'
        );

        firstNameInput.focus();

        return;
    }


    if (!lastName) {

        showMessage(
            'Укажи фамилию.',
            'error'
        );

        lastNameInput.focus();

        return;
    }


    const height =
        Number(heightInput.value);

    const weight =
        Number(weightInput.value);


    if (
        !Number.isFinite(height) ||
        height < 100 ||
        height > 250
    ) {

        showMessage(
            'Рост должен быть от 100 до 250 см.',
            'error'
        );

        heightInput.focus();

        return;
    }


    if (
        !Number.isFinite(weight) ||
        weight < 30 ||
        weight > 300
    ) {

        showMessage(
            'Вес должен быть от 30 до 300 кг.',
            'error'
        );

        weightInput.focus();

        return;
    }


    state.user.nickname =
        nickname;

    state.user.firstName =
        firstName;

    state.user.lastName =
        lastName;

    state.user.birthDate =
        birthDateInput.value;

    state.user.gender =
        genderInput.value;

    state.user.height =
        height;

    state.user.weight =
        weight;

    state.user.experienceLevel =
        experienceInput.value;

    state.user.fitnessGoal =
        fitnessGoalInput.value;

    state.user.preferredWorkoutTime =
        preferredTimeInput.value;


    renderProfileSummary();


    showMessage(
        'Изменения профиля сохранены.',
        'success'
    );

}


/* =========================================================
   PREFERRED DAYS
   ========================================================= */

function renderPreferredDays() {

    preferredDayInputs.forEach(
        input => {

            input.checked =
                state.user.preferredDays.includes(
                    Number(input.value)
                );

        }
    );


    updateSelectedDaysCounter();

}


function handlePreferredDayChange(event) {

    const selectedDays =
        Array.from(
            preferredDayInputs
        )
        .filter(
            input => input.checked
        )
        .map(
            input => Number(input.value)
        );


    if (
        selectedDays.length >
        MAX_PREFERRED_DAYS
    ) {

        event.target.checked =
            false;

        showMessage(
            `Можно выбрать не более ${
                MAX_PREFERRED_DAYS
            } дней.`,
            'error'
        );

        return;
    }


    state.user.preferredDays =
        selectedDays;

    updateSelectedDaysCounter();

}


function updateSelectedDaysCounter() {

    selectedDaysCount.textContent =
        `Выбрано: ${
            state.user.preferredDays.length
        } / ${MAX_PREFERRED_DAYS}`;

}


function savePreferredDays() {

    const selectedDays =
        Array.from(
            preferredDayInputs
        )
        .filter(
            input => input.checked
        )
        .map(
            input => Number(input.value)
        );


    if (
        selectedDays.length === 0
    ) {

        showMessage(
            'Выбери хотя бы один день для тренировок.',
            'error'
        );

        return;
    }


    if (
        selectedDays.length >
        MAX_PREFERRED_DAYS
    ) {

        showMessage(
            `Можно выбрать не более ${
                MAX_PREFERRED_DAYS
            } дней.`,
            'error'
        );

        return;
    }


    state.user.preferredDays =
        selectedDays;


    updateSelectedDaysCounter();


    showMessage(
        'Расписание тренировок сохранено.',
        'success'
    );

}


/* =========================================================
   AVATAR
   ========================================================= */

function handleAvatarChange() {

    const file =
        avatarInput.files?.[0];


    if (!file) {
        return;
    }


    const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/webp'
    ];


    if (
        !allowedTypes.includes(
            file.type
        )
    ) {

        showMessage(
            'Поддерживаются только JPG, PNG и WEBP.',
            'error'
        );

        avatarInput.value = '';

        return;
    }


    const maxSize =
        5 * 1024 * 1024;


    if (file.size > maxSize) {

        showMessage(
            'Размер изображения не должен превышать 5 МБ.',
            'error'
        );

        avatarInput.value = '';

        return;
    }


    const objectUrl =
        URL.createObjectURL(file);


    avatarPreview.src =
        objectUrl;


    state.user.avatarUrl =
        objectUrl;


    showMessage(
        'Фото профиля обновлено.',
        'success'
    );


    /*
     * Когда появится backend, здесь вместо objectURL
     * будет отправка файла на API.
     */

}


/* =========================================================
   CALENDAR
   ========================================================= */

function renderCalendar() {

    const year =
        state.calendar.currentDate.getFullYear();

    const month =
        state.calendar.currentDate.getMonth();


    currentMonthYear.textContent =
        `${MONTH_NAMES_NOMINATIVE[month]} ${year}`;


    calendarGrid.innerHTML = '';


    const firstDay =
        new Date(
            year,
            month,
            1
        );


    const daysInMonth =
        new Date(
            year,
            month + 1,
            0
        ).getDate();


    /*
     * getDay():
     * 0 — воскресенье
     * 1 — понедельник
     *
     * Приводим к Monday-first.
     */

    const firstWeekday =
        firstDay.getDay() === 0
            ? 6
            : firstDay.getDay() - 1;


    for (
        let index = 0;
        index < firstWeekday;
        index += 1
    ) {

        const emptyDay =
            document.createElement('div');

        emptyDay.className =
            'calendar-day empty';

        calendarGrid.appendChild(
            emptyDay
        );

    }


    for (
        let day = 1;
        day <= daysInMonth;
        day += 1
    ) {

        const dateString =
            toDateString(
                year,
                month,
                day
            );


        const dayElement =
            createCalendarDay(
                day,
                dateString
            );


        calendarGrid.appendChild(
            dayElement
        );

    }

}


/* =========================================================
   CALENDAR DAY
   ========================================================= */

function createCalendarDay(
    dayNumber,
    dateString
) {

    const dayElement =
        document.createElement('button');

    dayElement.type = 'button';

    dayElement.className =
        'calendar-day';


    const number =
        document.createElement('span');

    number.className =
        'calendar-day-number';

    number.textContent =
        dayNumber;


    dayElement.appendChild(number);


    const event =
        getCalendarEvent(
            dateString
        );


    if (event) {

        dayElement.classList.add(
            'has-workout'
        );

        dayElement.classList.add(
            event.status
        );


        dayElement.addEventListener(
            'click',
            () => showCalendarEvent(event)
        );

    }


    if (
        isToday(dateString)
    ) {

        dayElement.classList.add(
            'today'
        );

    }


    return dayElement;

}


/* =========================================================
   CALENDAR EVENT SEARCH
   ========================================================= */

function getCalendarEvent(dateString) {

    return state.calendar.events.find(
        event =>
            event.scheduledAt ===
            dateString
    ) ?? null;

}


/* =========================================================
   SHOW CALENDAR EVENT
   ========================================================= */

function showCalendarEvent(event) {

    const statusLabel =
        STATUS_LABELS[event.status] ??
        'Тренировка';


    calendarEventStatus.textContent =
        statusLabel;


    calendarEventTitle.textContent =
        event.title;


    calendarEventDetails.innerHTML =
        buildCalendarEventDetails(
            event
        );


    calendarEventInfo.classList.remove(
        'hidden'
    );


    calendarEventInfo.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
    });

}


/* =========================================================
   CALENDAR EVENT DETAILS
   ========================================================= */

function buildCalendarEventDetails(event) {

    const details = [];


    if (event.status === 'completed') {

        details.push(
            `Выполнена ${formatDate(
                event.scheduledAt
            )}.`
        );


        if (event.duration) {

            details.push(
                `Продолжительность: ${
                    event.duration
                } мин.`
            );

        }


        if (event.exercises) {

            details.push(
                `Упражнений: ${
                    event.exercises
                }.`
            );

        }

    }


    if (event.status === 'scheduled') {

        details.push(
            `Запланирована на ${
                formatDate(
                    event.scheduledAt
                )
            }.`
        );


        if (state.user.preferredWorkoutTime) {

            details.push(
                `Время: ${
                    state.user.preferredWorkoutTime
                }.`
            );

        }

    }


    if (event.status === 'missed') {

        details.push(
            `Тренировка была запланирована на ${
                formatDate(
                    event.scheduledAt
                )
            }, но не была выполнена.`
        );

    }


    if (event.status === 'rescheduled') {

        details.push(
            `Изначально запланирована на ${
                formatDate(
                    event.originalScheduledAt
                )
            }.`
        );


        details.push(
            `Перенесена на ${
                formatDate(
                    event.scheduledAt
                )
            }.`
        );

    }


    return details.join(' ');

}


/* =========================================================
   CLOSE CALENDAR EVENT
   ========================================================= */

function closeCalendarEvent() {

    calendarEventInfo.classList.add(
        'hidden'
    );

}


/* =========================================================
   MONTH NAVIGATION
   ========================================================= */

function changeMonth(offset) {

    const current =
        state.calendar.currentDate;


    state.calendar.currentDate =
        new Date(
            current.getFullYear(),
            current.getMonth() + offset,
            1
        );


    closeCalendarEvent();

    renderCalendar();

}


/* =========================================================
   MODALS
   ========================================================= */

function openModal(modal) {

    modal.classList.remove('hidden');

    modal.setAttribute(
        'aria-hidden',
        'false'
    );


    document.body.style.overflow =
        'hidden';

}


function closeModal(modal) {

    modal.classList.add('hidden');

    modal.setAttribute(
        'aria-hidden',
        'true'
    );


    const visibleModal =
        document.querySelector(
            '.profile-modal:not(.hidden)'
        );


    if (!visibleModal) {

        document.body.style.overflow =
            '';

    }

}


/* =========================================================
   KEYBOARD
   ========================================================= */

function handleKeyboard(event) {

    if (
        event.key !== 'Escape'
    ) {
        return;
    }


    document
        .querySelectorAll(
            '.profile-modal:not(.hidden)'
        )
        .forEach(
            modal => closeModal(modal)
        );


    closeCalendarEvent();

}


/* =========================================================
   LOGOUT
   ========================================================= */

function handleLogout() {

    /*
     * Пока backend не подключён.
     *
     * Позже здесь будет:
     *
     * POST /api/auth/logout
     *
     * после чего очищаем accessToken/refreshToken
     * и отправляем пользователя на login.
     */


    closeModal(logoutModal);


    showMessage(
        'Выход выполнен. Перенаправление на страницу входа...',
        'success'
    );


    window.setTimeout(
        () => {

            window.location.href =
                '/auth/login/index.html';

        },
        700
    );

}


/* =========================================================
   DELETE ACCOUNT
   ========================================================= */

function handleDeleteAccount() {

    /*
     * Пока frontend-only.
     *
     * Позже здесь будет DELETE-запрос к backend.
     */


    closeModal(deleteModal);


    showMessage(
        'Аккаунт удалён. Перенаправление...',
        'success'
    );


    window.setTimeout(
        () => {

            window.location.href =
                '/auth/login/index.html';

        },
        700
    );

}


/* =========================================================
   MESSAGE
   ========================================================= */

let messageTimeout = null;


function showMessage(
    message,
    type = 'success'
) {

    if (messageTimeout) {

        window.clearTimeout(
            messageTimeout
        );

    }


    messageElement.textContent =
        message;


    messageElement.className =
        `profile-message ${type}`;


    messageTimeout =
        window.setTimeout(
            () => {

                messageElement.classList.add(
                    'hidden'
                );

            },
            3500
        );

}


/* =========================================================
   DATE HELPERS
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


function toDateString(
    year,
    month,
    day
) {

    return [
        String(year),
        String(month + 1).padStart(2, '0'),
        String(day).padStart(2, '0')
    ].join('-');

}


function isToday(dateString) {

    const today =
        new Date();


    const currentDate =
        toDateString(
            today.getFullYear(),
            today.getMonth(),
            today.getDate()
        );


    return (
        dateString ===
        currentDate
    );

}