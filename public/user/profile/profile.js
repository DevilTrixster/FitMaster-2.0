import { Navbar } from '/components/navbar/Navbar.js';
import { clearTokens } from '/auth/auth.js';
import { apiJson, requireAuth } from '/common/api.js';

if (!requireAuth()) {
    throw new Error('Authentication required.');
}

const navbarRoot = document.getElementById('navbar');
const profileForm = document.getElementById('profileForm');
const nicknameInput = document.getElementById('nickname');
const emailInput = document.getElementById('email');
const firstNameInput = document.getElementById('firstName');
const lastNameInput = document.getElementById('lastName');
const birthDateInput = document.getElementById('birthDate');
const genderInput = document.getElementById('gender');
const heightInput = document.getElementById('height');
const weightInput = document.getElementById('weight');
const experienceInput = document.getElementById('experienceLevel');
const fitnessGoalInput = document.getElementById('fitnessGoal');
const preferredTimeInput = document.getElementById('preferredWorkoutTime');
const profileDisplayName = document.getElementById('profileDisplayName');
const profileDisplayNickname = document.getElementById('profileDisplayNickname');
const profileMemberSince = document.getElementById('profileMemberSince');
const messageElement = document.getElementById('message');
const avatarPreview = document.getElementById('avatarPreview');
const uploadAvatarButton = document.getElementById('uploadAvatarBtn');
const avatarInput = document.getElementById('avatarInput');
const preferredDayInputs = [...document.querySelectorAll('input[name="preferredDays"]')];
const selectedDaysCount = document.getElementById('selectedDaysCount');
const saveDaysButton = document.getElementById('saveDaysBtn');
const previousMonthButton = document.getElementById('prevMonthBtn');
const nextMonthButton = document.getElementById('nextMonthBtn');
const currentMonthYear = document.getElementById('currentMonthYear');
const calendarGrid = document.getElementById('calendarGrid');
const calendarEventInfo = document.getElementById('calendarEventInfo');
const calendarEventStatus = document.getElementById('calendarEventStatus');
const calendarEventTitle = document.getElementById('calendarEventTitle');
const calendarEventDetails = document.getElementById('calendarEventDetails');
const closeCalendarEventButton = document.getElementById('closeCalendarEvent');
const logoutButton = document.getElementById('logoutBtn');
const logoutModal = document.getElementById('logoutModal');
const confirmLogoutButton = document.getElementById('confirmLogoutBtn');
const deleteAccountButton = document.getElementById('deleteAccountBtn');
const deleteModal = document.getElementById('deleteModal');
const confirmDeleteButton = document.getElementById('confirmDeleteBtn');

if (!navbarRoot || !profileForm || !messageElement || !calendarGrid || !calendarEventInfo) {
    throw new Error('Profile page elements not found.');
}

new Navbar(navbarRoot, { authenticated: true }).render();

const DEFAULT_AVATAR = '/assets/default-avatar/default-avatar.png';
const MAX_PREFERRED_DAYS = 3;
const MONTH_NAMES = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
];

const state = {
    user: null,
    workouts: [],
    patterns: [],
    currentDate: new Date()
};

const statusLabel = {
    PLANNED: 'Предстоящая тренировка',
    IN_PROGRESS: 'Тренировка начата',
    COMPLETED: 'Тренировка выполнена',
    CANCELLED: 'Тренировка пропущена'
};

function dateOnly(value) {
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
    const parsed = new Date(value);
    const pad = (number) => String(number).padStart(2, '0');
    return `${parsed.getFullYear()}-${pad(parsed.getMonth() + 1)}-${pad(parsed.getDate())}`;
}

function monthRange(date) {
    const from = new Date(date.getFullYear(), date.getMonth(), 1);
    const to = new Date(date.getFullYear(), date.getMonth() + 1, 1);
    return { from, to };
}

function localDateString(date) {
    return [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, '0'),
        String(date.getDate()).padStart(2, '0')
    ].join('-');
}

function formatDate(dateValue) {
    const value = typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)
        ? new Date(`${dateValue}T00:00:00`)
        : new Date(dateValue);

    return new Intl.DateTimeFormat('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }).format(value);
}

function formatDateTime(dateValue) {
    return new Intl.DateTimeFormat('ru-RU', {
        day: 'numeric',
        month: 'long',
        hour: '2-digit',
        minute: '2-digit'
    }).format(new Date(dateValue));
}

function patternName(workout) {
    return state.patterns.find((pattern) => pattern.id === workout.patternId)?.name ?? 'Тренировка';
}

function calendarStatus(workout) {
    if (workout.status === 'COMPLETED') return 'completed';
    if (workout.status === 'CANCELLED') return 'missed';
    if (dateOnly(workout.scheduledAt) !== dateOnly(workout.originalScheduledAt)) return 'rescheduled';
    return 'scheduled';
}

function showMessage(message, type = 'success') {
    messageElement.textContent = message;
    messageElement.className = `profile-message ${type}`;

    window.clearTimeout(showMessage.timeout);
    showMessage.timeout = window.setTimeout(() => {
        messageElement.classList.add('hidden');
    }, 3500);
}

function fillUser(user) {
    nicknameInput.value = user.nickname;
    emailInput.value = user.email;
    firstNameInput.value = user.firstName;
    lastNameInput.value = user.lastName;
    birthDateInput.value = user.birthDate;
    genderInput.value = user.gender;
    heightInput.value = user.height;
    weightInput.value = user.weight;
    experienceInput.value = user.experienceLevel;
    fitnessGoalInput.value = user.fitnessGoal;
    preferredTimeInput.value = user.preferredWorkoutTime;
    avatarPreview.src = user.avatarUrl || DEFAULT_AVATAR;

    // Эти два поля сейчас не входят в UpdateUserProfileRequest.
    birthDateInput.disabled = true;
    genderInput.disabled = true;

    preferredDayInputs.forEach((input) => {
        input.checked = user.preferredDays.includes(Number(input.value));
    });

    updateSelectedDaysCounter();
}

function renderSummary() {
    const fullName = [state.user.firstName, state.user.lastName].filter(Boolean).join(' ');
    profileDisplayName.textContent = fullName || 'Пользователь';
    profileDisplayNickname.textContent = `@${state.user.nickname}`;
    profileMemberSince.textContent = `В FitMaster с ${formatDate(state.user.createdAt)}`;
}

function updateSelectedDaysCounter() {
    selectedDaysCount.textContent = `Выбрано: ${preferredDayInputs.filter((input) => input.checked).length} / ${MAX_PREFERRED_DAYS}`;
}

async function loadCalendar() {
    const { from, to } = monthRange(state.currentDate);
    const params = new URLSearchParams({
        from: from.toISOString(),
        to: to.toISOString()
    });

    const [workouts, patterns] = await Promise.all([
        apiJson(`/api/workouts?${params.toString()}`),
        apiJson('/api/workout-patterns')
    ]);

    state.workouts = workouts ?? [];
    state.patterns = patterns ?? [];
    renderCalendar();
}

function renderCalendar() {
    currentMonthYear.textContent = MONTH_NAMES[state.currentDate.getMonth()] + ` ${state.currentDate.getFullYear()}`;
    calendarGrid.replaceChildren();

    const year = state.currentDate.getFullYear();
    const month = state.currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const mondayFirst = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;

    for (let i = 0; i < mondayFirst; i += 1) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day empty';
        calendarGrid.appendChild(emptyDay);
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
        const dateString = localDateString(new Date(year, month, day));
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'calendar-day';

        const number = document.createElement('span');
        number.className = 'calendar-day-number';
        number.textContent = String(day);
        button.appendChild(number);

        const workout = state.workouts.find((item) => dateOnly(item.scheduledAt) === dateString);

        if (workout) {
            const displayStatus = calendarStatus(workout);
            button.classList.add('has-workout', displayStatus);
            button.addEventListener('click', () => showCalendarEvent(workout));
        }

        if (dateString === localDateString(new Date())) {
            button.classList.add('today');
        }

        calendarGrid.appendChild(button);
    }
}

function showCalendarEvent(workout) {
    const displayStatus = calendarStatus(workout);
    calendarEventStatus.textContent = statusLabel[workout.status] ?? statusLabel.PLANNED;
    calendarEventTitle.textContent = patternName(workout);

    const details = [
        `Дата: ${formatDateTime(workout.scheduledAt)}.`,
        `Упражнений: ${workout.workoutPlan.exercises.length}.`
    ];

    if (displayStatus === 'rescheduled') {
        details.push(`Изначально: ${formatDateTime(workout.originalScheduledAt)}.`);
    }

    calendarEventDetails.textContent = details.join(' ');
    calendarEventInfo.classList.remove('hidden');
}

async function handleProfileSubmit(event) {
    event.preventDefault();

    const height = Number(heightInput.value);
    const weight = Number(weightInput.value);

    if (!nicknameInput.value.trim() || !firstNameInput.value.trim() || !lastNameInput.value.trim()) {
        showMessage('Никнейм, имя и фамилия обязательны.', 'error');
        return;
    }

    if (!Number.isInteger(height) || height <= 100 || height >= 300) {
        showMessage('Рост должен быть от 101 до 299 см.', 'error');
        return;
    }

    if (!Number.isFinite(weight) || weight <= 30 || weight >= 300) {
        showMessage('Вес должен быть больше 30 и меньше 300 кг.', 'error');
        return;
    }

    try {
        state.user = await apiJson('/api/profile/me', {
            method: 'PATCH',
            body: {
                nickname: nicknameInput.value.trim(),
                firstName: firstNameInput.value.trim(),
                lastName: lastNameInput.value.trim(),
                height,
                weight,
                preferredWorkoutTime: preferredTimeInput.value,
                preferredDays: preferredDayInputs.filter((input) => input.checked).map((input) => Number(input.value)),
                experienceLevel: experienceInput.value,
                fitnessGoal: fitnessGoalInput.value
            }
        });

        fillUser(state.user);
        renderSummary();
        showMessage('Изменения профиля сохранены.');
    } catch (error) {
        showMessage(error instanceof Error ? error.message : 'Не удалось сохранить профиль.', 'error');
    }
}

async function savePreferredDays() {
    const selectedDays = preferredDayInputs.filter((input) => input.checked).map((input) => Number(input.value));

    if (selectedDays.length === 0 || selectedDays.length > MAX_PREFERRED_DAYS) {
        showMessage('Выбери от 1 до 3 дней.', 'error');
        return;
    }

    try {
        state.user = await apiJson('/api/profile/me', {
            method: 'PATCH',
            body: { preferredDays: selectedDays }
        });
        fillUser(state.user);
        renderSummary();
        showMessage('Расписание тренировок сохранено.');
    } catch (error) {
        showMessage(error instanceof Error ? error.message : 'Не удалось сохранить расписание.', 'error');
    }
}

function handlePreferredDayChange() {
    const selectedDays = preferredDayInputs.filter((input) => input.checked);

    if (selectedDays.length > MAX_PREFERRED_DAYS) {
        this.checked = false;
        showMessage(`Можно выбрать не более ${MAX_PREFERRED_DAYS} дней.`, 'error');
    }

    updateSelectedDaysCounter();
}

function setupAvatarPreview() {
    uploadAvatarButton?.addEventListener('click', () => avatarInput?.click());
    avatarInput?.addEventListener('change', () => {
        const file = avatarInput.files?.[0];
        if (!file) return;

        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            showMessage('Поддерживаются JPG, PNG и WEBP.', 'error');
            avatarInput.value = '';
            return;
        }

        avatarPreview.src = URL.createObjectURL(file);
        showMessage('Предпросмотр аватара обновлён. Загрузка на сервер пока не поддерживается.', 'success');
    });
}

function openModal(modal) {
    modal?.classList.remove('hidden');
    modal?.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
}

function closeModal(modal) {
    modal?.classList.add('hidden');
    modal?.setAttribute('aria-hidden', 'true');

    if (!document.querySelector('.profile-modal:not(.hidden)')) {
        document.body.style.overflow = '';
    }
}

async function handleLogout() {
    const refreshToken = localStorage.getItem('refreshToken');

    try {
        if (refreshToken) {
            await apiJson('/api/auth/logout', {
                method: 'POST',
                body: { refreshToken }
            }, false);
        }
    } finally {
        clearTokens();
        window.location.replace('/auth/login/index.html');
    }
}

async function handleDeleteAccount() {
    try {
        await apiJson('/api/profile/me', { method: 'DELETE' });
        clearTokens();
        window.location.replace('/auth/login/index.html');
    } catch (error) {
        closeModal(deleteModal);
        showMessage(error instanceof Error ? error.message : 'Не удалось удалить аккаунт.', 'error');
    }
}

function setupEvents() {
    profileForm.addEventListener('submit', handleProfileSubmit);
    preferredDayInputs.forEach((input) => input.addEventListener('change', handlePreferredDayChange));
    saveDaysButton?.addEventListener('click', savePreferredDays);
    setupAvatarPreview();

    previousMonthButton?.addEventListener('click', async () => {
        state.currentDate = new Date(state.currentDate.getFullYear(), state.currentDate.getMonth() - 1, 1);
        try { await loadCalendar(); } catch (error) { showMessage(error instanceof Error ? error.message : 'Не удалось загрузить календарь.', 'error'); }
    });

    nextMonthButton?.addEventListener('click', async () => {
        state.currentDate = new Date(state.currentDate.getFullYear(), state.currentDate.getMonth() + 1, 1);
        try { await loadCalendar(); } catch (error) { showMessage(error instanceof Error ? error.message : 'Не удалось загрузить календарь.', 'error'); }
    });

    closeCalendarEventButton?.addEventListener('click', () => calendarEventInfo.classList.add('hidden'));
    logoutButton?.addEventListener('click', () => openModal(logoutModal));
    confirmLogoutButton?.addEventListener('click', handleLogout);
    deleteAccountButton?.addEventListener('click', () => openModal(deleteModal));
    confirmDeleteButton?.addEventListener('click', handleDeleteAccount);

    document.querySelectorAll('[data-modal-close]').forEach((button) => {
        button.addEventListener('click', () => closeModal(button.closest('.profile-modal')));
    });
}

async function initialize() {
    try {
        const user = await apiJson('/api/profile/me');
        state.user = user;
        fillUser(user);
        renderSummary();
        setupEvents();
        await loadCalendar();
    } catch (error) {
        showMessage(error instanceof Error ? error.message : 'Не удалось загрузить профиль.', 'error');
    }
}

document.addEventListener('DOMContentLoaded', initialize);
