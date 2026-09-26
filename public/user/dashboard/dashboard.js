import { Navbar } from '/components/navbar/Navbar.js';
import { apiJson, requireAuth } from '/common/api.js';
import { getWorkoutCategory } from '/common/workoutCategory.js';

if (!requireAuth()) {
    throw new Error('Authentication required.');
}

const navbarRoot = document.getElementById('navbar');
const upcomingWorkoutsRoot = document.getElementById('upcomingWorkouts');

if (!navbarRoot || !upcomingWorkoutsRoot) {
    throw new Error('Dashboard page elements not found.');
}

new Navbar(navbarRoot, { authenticated: true }).render();

const totalWorkouts = document.getElementById('totalWorkouts');
const currentStreak = document.getElementById('currentStreak');

const recoveryScore = document.getElementById('recoveryScore');
const fatigueValue = document.getElementById('fatigueValue');
const injuryValue = document.getElementById('injuryValue');
const performanceTrend = document.getElementById('performanceTrend');
const fatigueBar = document.getElementById('fatigueBar');
const injuryBar = document.getElementById('injuryBar');
const muscleRecoveryList = document.getElementById('muscleRecoveryList');

function dateOnly(value) {
    const parsed = new Date(value);
    const pad = (number) => String(number).padStart(2, '0');
    return `${parsed.getFullYear()}-${pad(parsed.getMonth() + 1)}-${pad(parsed.getDate())}`;
}

function startOfDay(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function toApiDateTime(date) {
    return date.toISOString();
}

function formatDateTime(value) {
    return new Intl.DateTimeFormat('ru-RU', {
        day: 'numeric',
        month: 'long',
        hour: '2-digit',
        minute: '2-digit'
    }).format(new Date(value));
}

function statusLabel(status) {
    return {
        PLANNED: 'Предстоящая',
        IN_PROGRESS: 'В процессе',
        COMPLETED: 'Завершена',
        CANCELLED: 'Пропущена'
    }[status] ?? 'Тренировка';
}

function statusClass(status) {
    return {
        PLANNED: 'scheduled',
        IN_PROGRESS: 'scheduled',
        COMPLETED: 'completed',
        CANCELLED: 'missed'
    }[status] ?? 'scheduled';
}

function renderEmpty() {
    upcomingWorkoutsRoot.innerHTML = `
        <div class="empty-state">
            <div class="empty-state-icon">🏋️</div>
            <div class="empty-state-content">
                <h3>Нет предстоящих тренировок</h3>
                <p>Тренировки появятся здесь, когда будет сформирован твой план.</p>
            </div>
        </div>
    `;
}

function createActionButton(label, className, onClick) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `btn ${className}`;
    button.textContent = label;
    button.addEventListener('click', onClick);
    return button;
}

function createViewLink(workoutId) {
    const link = document.createElement('a');
    link.className = 'btn btn-outline';
    link.href = `/workout/index.html?id=${encodeURIComponent(workoutId)}&mode=view`;
    link.textContent = 'Просмотр';
    return link;
}

async function startWorkout(workoutId, button) {
    button.disabled = true;

    try {
        await apiJson(`/api/workouts/${workoutId}/status`, {
            method: 'PATCH',
            body: { status: 'IN_PROGRESS' }
        });

        window.location.assign(
            `/workout/index.html?id=${encodeURIComponent(workoutId)}&mode=active`
        );
    } catch (error) {
        button.disabled = false;
        window.alert(error instanceof Error ? error.message : 'Не удалось начать тренировку.');
    }
}

function renderUpcoming(workouts, patterns) {
    const upcoming = workouts
        .filter((workout) => workout.status === 'PLANNED' || workout.status === 'IN_PROGRESS')
        .slice(0, 6);

    if (!upcoming.length) {
        renderEmpty();
        return;
    }

    upcomingWorkoutsRoot.replaceChildren();

    upcoming.forEach((workout) => {
        const card = document.createElement('article');
        card.className = 'dashboard-workout-card';

        const info = document.createElement('div');

        const eyebrow = document.createElement('span');
        eyebrow.className = 'dashboard-panel-eyebrow';
        eyebrow.textContent = statusLabel(workout.status);

        const title = document.createElement('h3');
        title.textContent = getWorkoutCategory(patterns, workout);

        const exerciseCount = workout.workoutPlan?.exercises?.length ?? 0;
        const meta = document.createElement('p');
        meta.textContent = `${formatDateTime(workout.scheduledAt)} · ${exerciseCount} ${exerciseWord(exerciseCount)}`;

        info.append(eyebrow, title, meta);

        const actions = document.createElement('div');
        actions.className = 'dashboard-workout-card-actions';

        const status = document.createElement('span');
        status.className = `status-badge ${statusClass(workout.status)}`;
        status.textContent = statusLabel(workout.status);

        const viewLink = createViewLink(workout.id);
        actions.append(status, viewLink);

        const actionLabel = workout.status === 'IN_PROGRESS' ? 'Продолжить' : 'Начать';
        const actionButton = createActionButton(
            actionLabel,
            'btn-primary',
            () => {
                if (workout.status === 'IN_PROGRESS') {
                    window.location.assign(
                        `/workout/index.html?id=${encodeURIComponent(workout.id)}&mode=active`
                    );
                    return;
                }

                void startWorkout(workout.id, actionButton);
            }
        );

        actions.append(actionButton);
        card.append(info, actions);
        upcomingWorkoutsRoot.appendChild(card);
    });
}

function exerciseWord(value) {
    if (value % 10 === 1 && value % 100 !== 11) return 'упражнение';
    if ([2, 3, 4].includes(value % 10) && ![12, 13, 14].includes(value % 100)) return 'упражнения';
    return 'упражнений';
}

function updateStatistics(workouts) {
    const completed = workouts.filter((workout) => workout.status === 'COMPLETED');

    if (totalWorkouts) {
        totalWorkouts.textContent = String(completed.length);
    }

    const completedDays = new Set(
        completed.map((workout) => dateOnly(workout.completedAt ?? workout.scheduledAt))
    );

    let streak = 0;
    const cursor = startOfDay(new Date());

    while (completedDays.has(dateOnly(cursor))) {
        streak += 1;
        cursor.setDate(cursor.getDate() - 1);
    }

    if (currentStreak) {
        currentStreak.textContent = String(streak);
    }
}

function setUnsupportedRecovery() {
    [recoveryScore, fatigueValue, injuryValue, performanceTrend].forEach((element) => {
        if (element) element.textContent = '—';
    });

    [fatigueBar, injuryBar].forEach((bar) => {
        if (bar) bar.style.width = '0';
    });

    if (muscleRecoveryList) {
        muscleRecoveryList.innerHTML = `
            <div class="muscle-placeholder">
                <span>Данные восстановления появятся после подключения адаптации.</span>
            </div>
        `;
    }
}

async function initialize() {
    const now = new Date();
    const from = startOfDay(now);
    const to = new Date(now);
    to.setDate(to.getDate() + 30);

    try {
        let [workouts, patterns] = await Promise.all([
            apiJson(`/api/workouts?from=${encodeURIComponent(toApiDateTime(from))}&to=${encodeURIComponent(toApiDateTime(to))}`),
            apiJson('/api/workout-patterns')
        ]);

        if (!(workouts ?? []).length) {
            await apiJson('/api/workouts/defaults', {
                method: 'POST',
                body: {}
            });

            workouts = await apiJson(
                `/api/workouts?from=${encodeURIComponent(toApiDateTime(from))}&to=${encodeURIComponent(toApiDateTime(to))}`
            );
        }

        updateStatistics(workouts ?? []);
        renderUpcoming(workouts ?? [], patterns ?? []);
        setUnsupportedRecovery();
    } catch (error) {
        upcomingWorkoutsRoot.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">⚠️</div>
                <div class="empty-state-content">
                    <h3>Не удалось загрузить тренировки</h3>
                    <p>${error instanceof Error ? error.message : 'Попробуй обновить страницу.'}</p>
                </div>
            </div>
        `;
        setUnsupportedRecovery();
    }
}

document.addEventListener('DOMContentLoaded', initialize);
