import { Navbar } from '/components/navbar/Navbar.js';

/* =========================================================
   FITMASTER — АНАЛИТИКА
   Пока страница работает на локальных mock-данных.
   В дальнейшем этот слой можно заменить API-ответами,
   не меняя DOM и визуальную композицию страницы.
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
   ДЕМО-ДАННЫЕ
   ========================================================= */

const GROUPS = ['Плечи', 'Грудь', 'Руки', 'Ноги', 'Спина', 'Кор'];

const EXERCISE_DATA = {
    'Жим лёжа': {
        unit: 'кг',
        summary: {
            current: '114 кг',
            currentChange: '+14,8%',
            adaptation: '111 кг',
            adaptationChange: '+12,4%',
            last: '82,5 кг × 8',
            date: '24 августа'
        },
        periods: {
            month: {
                labels: ['05 авг.', '08 авг.', '12 авг.', '15 авг.', '19 авг.', '22 авг.', '24 авг.'],
                actual: [104, 106, 107, 109, 110, 112, 114],
                adaptation: [103, 104, 106, 107, 109, 110, 111]
            },
            sixMonths: {
                labels: ['Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август'],
                actual: [99, 101, 104, 107, 110, 114],
                adaptation: [98, 100, 102, 105, 108, 111]
            },
            year: {
                labels: ['Сент. 25', 'Ноя.', 'Янв.', 'Март', 'Май', 'Июль', 'Авг.'],
                actual: [86, 91, 95, 99, 104, 110, 114],
                adaptation: [85, 89, 94, 98, 102, 107, 111]
            }
        }
    },
    'Приседания со штангой': {
        unit: 'кг',
        summary: {
            current: '126 кг',
            currentChange: '+18,2%',
            adaptation: '123 кг',
            adaptationChange: '+15,4%',
            last: '120 кг × 5',
            date: '21 августа'
        },
        periods: {
            month: {
                labels: ['05 авг.', '08 авг.', '12 авг.', '15 авг.', '18 авг.', '21 авг.'],
                actual: [115, 117, 119, 121, 123, 126],
                adaptation: [114, 116, 118, 120, 122, 123]
            },
            sixMonths: {
                labels: ['Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август'],
                actual: [106, 110, 114, 118, 122, 126],
                adaptation: [105, 109, 112, 116, 120, 123]
            },
            year: {
                labels: ['Сент. 25', 'Ноя.', 'Янв.', 'Март', 'Май', 'Июль', 'Авг.'],
                actual: [97, 100, 103, 106, 114, 122, 126],
                adaptation: [96, 99, 102, 105, 111, 119, 123]
            }
        }
    },
    'Подтягивания': {
        unit: 'кг',
        summary: {
            current: '42 кг',
            currentChange: '+6,8%',
            adaptation: '40 кг',
            adaptationChange: '+4,1%',
            last: '+25 кг × 6',
            date: '19 августа'
        },
        periods: {
            month: {
                labels: ['05 авг.', '08 авг.', '12 авг.', '15 авг.', '19 авг.'],
                actual: [37, 38, 39, 41, 42],
                adaptation: [37, 38, 38, 39, 40]
            },
            sixMonths: {
                labels: ['Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август'],
                actual: [35, 35, 36, 38, 39, 42],
                adaptation: [34, 35, 36, 37, 39, 40]
            },
            year: {
                labels: ['Сент. 25', 'Ноя.', 'Янв.', 'Март', 'Май', 'Июль', 'Авг.'],
                actual: [31, 32, 34, 35, 36, 39, 42],
                adaptation: [31, 32, 33, 35, 36, 38, 40]
            }
        }
    },
    'Жим гантелей': {
        unit: 'кг',
        summary: {
            current: '38 кг',
            currentChange: '+9,7%',
            adaptation: '37 кг',
            adaptationChange: '+8,1%',
            last: '34 кг × 10',
            date: '17 августа'
        },
        periods: {
            month: {
                labels: ['03 авг.', '07 авг.', '10 авг.', '14 авг.', '17 авг.'],
                actual: [34, 35, 35, 37, 38],
                adaptation: [33, 34, 35, 36, 37]
            },
            sixMonths: {
                labels: ['Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август'],
                actual: [32, 32, 34, 35, 37, 38],
                adaptation: [31, 32, 33, 35, 36, 37]
            },
            year: {
                labels: ['Сент. 25', 'Ноя.', 'Янв.', 'Март', 'Май', 'Июль', 'Авг.'],
                actual: [28, 29, 31, 32, 34, 37, 38],
                adaptation: [28, 29, 30, 32, 34, 36, 37]
            }
        }
    }
};

const LOAD_DATA = {
    month: [42, 53, 49, 64, 59, 73, 68, 82, 77, 86, 74, 81],
    quarter: [48, 51, 55, 58, 62, 59, 66, 71, 69, 75, 78, 82],
    sixMonths: [39, 43, 45, 48, 52, 49, 56, 61, 58, 63, 68, 66],
    year: [28, 31, 34, 36, 39, 42, 45, 48, 51, 55, 58, 61]
};

const LOAD_META = {
    month: { average: '8 420 кг', change: '+9,2%' },
    quarter: { average: '8 070 кг', change: '+12,1%' },
    sixMonths: { average: '7 680 кг', change: '+18,6%' },
    year: { average: '7 190 кг', change: '+24,8%' }
};

const GROUP_LOAD_DATA = [23, 21, 14, 26, 11, 5];

const RECOVERY_DATA = {
    now: [54, 89, 81, 43, 73, 96],
    week: [63, 82, 76, 58, 78, 91],
    month: [68, 79, 74, 65, 81, 88]
};

const RECOVERY_NOTES = {
    0: { title: 'Плечи', note: 'Нужен запас восстановления' },
    1: { title: 'Грудь', note: 'Высокая готовность' },
    2: { title: 'Руки', note: 'Высокая готовность' },
    3: { title: 'Ноги', note: 'После недавней нагрузки' },
    4: { title: 'Спина', note: 'Восстановление продолжается' },
    5: { title: 'Кор', note: 'Почти полное восстановление' }
};

const RISK_DATA = [
    { group: 'Грудь', level: 'Низкий', value: 24, tone: 'low' },
    { group: 'Спина', level: 'Умеренный', value: 53, tone: 'medium' },
    { group: 'Плечи', level: 'Повышенный', value: 76, tone: 'high' },
    { group: 'Ноги', level: 'Умеренный', value: 49, tone: 'medium' },
    { group: 'Руки', level: 'Низкий', value: 19, tone: 'low' },
    { group: 'Кор', level: 'Низкий', value: 12, tone: 'low' }
];

const ADAPTATION_ACCURACY = {
    month: { value: 87, change: '+6,1%', labels: ['Нед. 1', 'Нед. 2', 'Нед. 3', 'Нед. 4', 'Сейчас'], data: [79, 81, 84, 86, 87] },
    quarter: { value: 87, change: '+6,1%', labels: ['Июн.', 'Июль', 'Авг.'], data: [81, 84, 87] },
    sixMonths: { value: 87, change: '+6,1%', labels: ['Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август'], data: [75, 77, 79, 82, 84, 87] },
    year: { value: 87, change: '+11,4%', labels: ['Сент.', 'Ноя.', 'Янв.', 'Март', 'Май', 'Июль', 'Авг.'], data: [69, 72, 73, 75, 79, 84, 87] }
};

/* =========================================================
   УТИЛИТЫ DOM
   ========================================================= */

const qs = (selector, root = document) => root.querySelector(selector);
const qsa = (selector, root = document) => [...root.querySelectorAll(selector)];

const setText = (selector, value, root = document) => {
    const element = qs(selector, root);
    if (element) element.textContent = value;
    return element;
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const percent = (value) => `${Math.round(value)}%`;

/* =========================================================
   ОБЩИЙ ПЕРИОД
   Пока используется как главный период для связанных блоков.
   ========================================================= */

const periodButtons = qsa('.period-button');
let activeGlobalPeriod = 'sixMonths';

const periodMap = new Map([
    ['1 мес.', 'month'],
    ['3 мес.', 'quarter'],
    ['6 мес.', 'sixMonths'],
    ['1 год', 'year']
]);

periodButtons.forEach((button) => {
    button.addEventListener('click', () => {
        periodButtons.forEach((item) => item.classList.remove('active'));
        button.classList.add('active');

        activeGlobalPeriod = periodMap.get(button.textContent.trim()) ?? 'sixMonths';
        renderLoadChart(activeGlobalPeriod);
        renderAdaptationChart(activeGlobalPeriod);
    });
});

/* =========================================================
   ГРАФИК ПРОГРЕССА УПРАЖНЕНИЯ
   ========================================================= */

const exerciseSelect = qs('#exerciseSelect');
const chartPeriodButtons = qsa('.chart-period');
const progressSvg = qs('.progress-chart-svg');
const actualLine = qs('.actual-line');
const adaptationLine = qs('.adaptation-line');
const chartAreaFill = qs('.chart-area-fill');
const progressTooltip = qs('.chart-tooltip-demo');
const xAxis = qs('.chart-x-axis');
const yAxis = qs('.chart-y-axis');
const progressPointTemplate = qsa('.actual-point', progressSvg);

let activeExercisePeriod = 'month';

const chartPeriodMap = new Map([
    ['1 мес.', 'month'],
    ['6 мес.', 'sixMonths'],
    ['1 год', 'year']
]);

const createSmoothPath = (values, width, height, min, max) => {
    if (!values.length) return '';

    const points = values.map((value, index) => {
        const x = values.length === 1 ? width / 2 : (index / (values.length - 1)) * width;
        const normalized = (value - min) / (max - min || 1);
        const y = height - clamp(normalized, 0, 1) * height;
        return { x, y };
    });

    if (points.length === 1) {
        return `M${points[0].x},${points[0].y}`;
    }

    let path = `M${points[0].x},${points[0].y}`;

    for (let index = 1; index < points.length; index += 1) {
        const previous = points[index - 1];
        const current = points[index];
        const midpoint = (previous.x + current.x) / 2;
        path += ` C${midpoint},${previous.y} ${midpoint},${current.y} ${current.x},${current.y}`;
    }

    return path;
};

const chartPoints = (values, width, height, min, max) => values.map((value, index) => ({
    x: values.length === 1 ? width / 2 : (index / (values.length - 1)) * width,
    y: height - clamp((value - min) / (max - min || 1), 0, 1) * height,
    value
}));

const clearDynamicProgressPoints = () => {
    qsa('.progress-dynamic-point', progressSvg).forEach((point) => point.remove());
};

const renderProgressChart = () => {
    const exerciseName = exerciseSelect?.value ?? 'Жим лёжа';
    const exercise = EXERCISE_DATA[exerciseName];

    if (!exercise || !actualLine || !adaptationLine || !progressSvg) return;

    const period = exercise.periods[activeExercisePeriod];
    const values = [...period.actual, ...period.adaptation];
    const dataMin = Math.floor((Math.min(...values) - 5) / 5) * 5;
    const dataMax = Math.ceil((Math.max(...values) + 5) / 5) * 5;
    const width = 900;
    const height = 300;

    const actualPath = createSmoothPath(period.actual, width, height, dataMin, dataMax);
    const adaptationPath = createSmoothPath(period.adaptation, width, height, dataMin, dataMax);

    actualLine.setAttribute('d', actualPath);
    adaptationLine.setAttribute('d', adaptationPath);
    chartAreaFill.setAttribute('d', `${actualPath} L${width},${height} L0,${height} Z`);

    clearDynamicProgressPoints();

    const actualPoints = chartPoints(period.actual, width, height, dataMin, dataMax);
    actualPoints.forEach((point, index) => {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', point.x);
        circle.setAttribute('cy', point.y);
        circle.setAttribute('r', index === actualPoints.length - 1 ? '7' : '5');
        circle.setAttribute('class', `chart-point actual-point progress-dynamic-point${index === actualPoints.length - 1 ? ' current' : ''}`);
        circle.dataset.index = String(index);
        circle.dataset.exercise = exerciseName;
        circle.setAttribute('tabindex', '0');
        circle.setAttribute('role', 'button');
        circle.setAttribute('aria-label', `${exerciseName}: ${period.labels[index]}, ${point.value} ${exercise.unit}`);
        progressSvg.appendChild(circle);
    });

    if (yAxis) {
        const step = (dataMax - dataMin) / 5;
        qsa('span', yAxis).forEach((label, index) => {
            const value = dataMax - step * index;
            label.textContent = Number.isInteger(value) ? String(value) : value.toFixed(1).replace('.', ',');
        });
    }

    if (xAxis) {
        xAxis.innerHTML = period.labels.map((label) => `<span>${label}</span>`).join('');
    }

    const summary = exercise.summary;
    setText('.progress-summary-item:nth-child(1) strong', summary.current);
    setText('.progress-summary-item:nth-child(1) .summary-change', summary.currentChange);
    setText('.progress-summary-item:nth-child(2) strong', summary.adaptation);
    setText('.progress-summary-item:nth-child(2) .summary-change', summary.adaptationChange);
    setText('.progress-summary-item:nth-child(3) strong', summary.last);
    setText('.progress-summary-item:nth-child(3) .summary-caption', summary.date);
    progressSvg.setAttribute('aria-label', `График прогресса: ${exerciseName}`);

    const latestActual = period.actual[period.actual.length - 1];
    const latestAdaptation = period.adaptation[period.adaptation.length - 1];
    const latestLabel = period.labels[period.labels.length - 1];

    if (progressTooltip) {
        progressTooltip.innerHTML = `
            <span>${latestLabel}</span>
            <strong>Факт ${latestActual} ${exercise.unit}</strong>
            <em>Адаптация ${latestAdaptation} ${exercise.unit}</em>
        `;
    }

    const showTooltip = (point) => {
        const index = Number(point.dataset.index);
        const actual = period.actual[index];
        const predicted = period.adaptation[index];
        const date = period.labels[index];

        if (!progressTooltip) return;

        progressTooltip.innerHTML = `
            <span>${date}</span>
            <strong>Факт ${actual} ${exercise.unit}</strong>
            <em>Адаптация ${predicted} ${exercise.unit}</em>
        `;
    };

    qsa('.progress-dynamic-point', progressSvg).forEach((point) => {
        point.addEventListener('mouseenter', () => showTooltip(point));
        point.addEventListener('focus', () => showTooltip(point));
    });
};

exerciseSelect?.addEventListener('change', renderProgressChart);

chartPeriodButtons.forEach((button) => {
    button.addEventListener('click', () => {
        chartPeriodButtons.forEach((item) => item.classList.remove('active'));
        button.classList.add('active');
        activeExercisePeriod = chartPeriodMap.get(button.textContent.trim()) ?? 'month';
        renderProgressChart();
    });
});

/* =========================================================
   ГРАФИК ТРЕНИРОВОЧНОЙ НАГРУЗКИ
   ========================================================= */

const loadBars = qsa('.load-bar');
const loadAverage = qs('.mini-chart-meta strong');
const loadChange = qs('.mini-chart-meta .trend-chip');

const renderLoadChart = (periodKey = activeGlobalPeriod) => {
    const values = LOAD_DATA[periodKey] ?? LOAD_DATA.sixMonths;
    const meta = LOAD_META[periodKey] ?? LOAD_META.sixMonths;

    loadBars.forEach((bar, index) => {
        const value = values[index % values.length];
        bar.style.height = `${clamp(value, 5, 95)}%`;

        const wrapper = bar.closest('.load-bar-wrap');
        const label = wrapper?.querySelector('span');
        if (label) label.textContent = String(index + 1);
    });

    if (loadAverage) loadAverage.textContent = meta.average;
    if (loadChange) loadChange.textContent = meta.change;
};

/* =========================================================
   RADAR — РАСПРЕДЕЛЕНИЕ НАГРУЗКИ
   ========================================================= */

const loadRadar = qs('.radar-chart');
const loadRadarPolygon = qs('.radar-value', loadRadar);
const loadRadarPoints = qsa('.radar-point', loadRadar);
const loadRadarSummary = qsa('.group-summary-grid > div');

const LOAD_RADAR_COORDINATES = [
    { x: 180, y: 30 },
    { x: 309, y: 106 },
    { x: 278, y: 252 },
    { x: 82, y: 252 },
    { x: 51, y: 106 }
];

const renderLoadRadar = () => {
    const maxValue = Math.max(...GROUP_LOAD_DATA);
    const points = LOAD_RADAR_COORDINATES.slice(0, 5).map((coord, index) => {
        const ratio = GROUP_LOAD_DATA[index] / maxValue;
        const centerX = 180;
        const centerY = 145;
        return {
            x: centerX + (coord.x - centerX) * ratio,
            y: centerY + (coord.y - centerY) * ratio
        };
    });

    const polygonPoints = points.map(({ x, y }) => `${x},${y}`).join(' ');
    loadRadarPolygon?.setAttribute('points', polygonPoints);

    loadRadarPoints.forEach((point, index) => {
        const next = points[index];
        if (!next) return;
        point.setAttribute('cx', next.x);
        point.setAttribute('cy', next.y);
    });

    // Для кора используем отдельную подпись в текстовой сетке — он не входит в 5-угольник SVG.
    loadRadarSummary.forEach((item, index) => {
        const value = GROUP_LOAD_DATA[index];
        const strong = item.querySelector('strong');
        if (strong) strong.textContent = `${value}%`;
    });
};

/* =========================================================
   ВОССТАНОВЛЕНИЕ
   ========================================================= */

const recoveryButtons = qsa('.recovery-period');
const recoveryDetails = qsa('.recovery-detail-row');
const recoveryRadar = qs('.recovery-radar');
const recoveryValuePolygon = qs('.recovery-value', recoveryRadar);
const recoveryPoints = qsa('.recovery-point', recoveryRadar);
const recoveryInsight = qs('.recovery-insight p');

const RECOVERY_COORDINATES = [
    { x: 210, y: 30 },
    { x: 357, y: 115 },
    { x: 303, y: 285 },
    { x: 117, y: 285 },
    { x: 63, y: 115 }
];

const renderRecoveryRadar = (values) => {
    const maxValue = 100;
    const centerX = 210;
    const centerY = 157;

    const points = RECOVERY_COORDINATES.map((coord, index) => {
        const ratio = clamp(values[index] / maxValue, 0.15, 1);
        return {
            x: centerX + (coord.x - centerX) * ratio,
            y: centerY + (coord.y - centerY) * ratio
        };
    });

    recoveryValuePolygon?.setAttribute('points', points.map(({ x, y }) => `${x},${y}`).join(' '));

    recoveryPoints.forEach((point, index) => {
        const next = points[index];
        if (!next) return;
        point.setAttribute('cx', next.x);
        point.setAttribute('cy', next.y);
    });
};

const renderRecovery = (key = 'now') => {
    const values = RECOVERY_DATA[key] ?? RECOVERY_DATA.now;
    renderRecoveryRadar(values);

    recoveryDetails.forEach((row, index) => {
        const value = values[index];
        const strong = row.querySelector('strong');
        const bar = row.querySelector('.metric-progress span');
        const note = row.querySelector('.group-note');

        if (strong) strong.textContent = percent(value);
        if (bar) bar.style.width = `${value}%`;
        if (note) note.textContent = RECOVERY_NOTES[index]?.note ?? '';
    });

    const lowestIndex = values.indexOf(Math.min(...values));
    const lowest = RECOVERY_NOTES[lowestIndex];
    if (recoveryInsight && lowest) {
        recoveryInsight.textContent = `${lowest.title} сейчас требует больше всего восстановления (${values[lowestIndex]}%). Адаптация учитывает недавнюю нагрузку этой группы при формировании дальнейших рекомендаций.`;
    }
};

recoveryButtons.forEach((button) => {
    button.addEventListener('click', () => {
        recoveryButtons.forEach((item) => item.classList.remove('active'));
        button.classList.add('active');

        const map = {
            'Сейчас': 'now',
            '7 дней': 'week',
            '1 мес.': 'month'
        };

        renderRecovery(map[button.textContent.trim()] ?? 'now');
    });
});

/* =========================================================
   РИСК
   ========================================================= */

const riskRows = qsa('.risk-row');
const riskInsight = qs('.risk-insight p');

const renderRisk = () => {
    riskRows.forEach((row, index) => {
        const item = RISK_DATA[index];
        if (!item) return;

        const label = row.querySelector('.risk-row-main span');
        const status = row.querySelector('.risk-row-main small');
        const meter = row.querySelector('.risk-meter span');

        if (label) label.textContent = item.group;
        if (status) status.textContent = item.level;
        if (meter) {
            meter.style.width = `${item.value}%`;
            meter.className = item.tone;
        }

        row.classList.toggle('highlighted', item.tone === 'high');
    });

    const highestRisk = RISK_DATA.reduce((current, item) => item.value > current.value ? item : current, RISK_DATA[0]);
    if (riskInsight) {
        riskInsight.textContent = highestRisk.group === 'Плечи'
            ? 'Плечи получают повышенную частоту нагрузки при неполном восстановлении.'
            : `${highestRisk.group} сейчас имеет самый высокий показатель риска перегрузки.`;
    }
};

/* =========================================================
   ТОЧНОСТЬ АДАПТАЦИИ
   ========================================================= */

const adaptationLineElement = qs('.adaptation-chart-line');
const adaptationPoint = qs('.adaptation-chart-point');
const adaptationAxisLabels = qs('.adaptation-axis-labels');
const adaptationScore = qs('.adaptation-score-block strong');
const adaptationChange = qs('.adaptation-score-block .trend-chip');

const renderAdaptationChart = (periodKey = activeGlobalPeriod) => {
    const data = ADAPTATION_ACCURACY[periodKey] ?? ADAPTATION_ACCURACY.sixMonths;
    const width = 620;
    const height = 170;
    const min = 60;
    const max = 100;

    const path = createSmoothPath(data.data, width, height - 15, min, max);
    adaptationLineElement?.setAttribute('d', path);

    const lastValue = data.data[data.data.length - 1];
    const lastY = height - 15 - ((lastValue - min) / (max - min)) * (height - 15);
    adaptationPoint?.setAttribute('cx', String(width));
    adaptationPoint?.setAttribute('cy', String(lastY));

    if (adaptationAxisLabels) {
        adaptationAxisLabels.innerHTML = data.labels.map((label) => `<span>${label}</span>`).join('');
    }

    if (adaptationScore) adaptationScore.textContent = `${data.value}%`;
    if (adaptationChange) adaptationChange.textContent = `${data.change} за выбранный период`;
};

/* =========================================================
   НАЧАЛЬНАЯ ИНИЦИАЛИЗАЦИЯ
   ========================================================= */

renderProgressChart();
renderLoadChart(activeGlobalPeriod);
renderLoadRadar();
renderRecovery('now');
renderRisk();
renderAdaptationChart(activeGlobalPeriod);
