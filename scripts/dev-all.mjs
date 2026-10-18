import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { constants } from 'node:fs';
import { access, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

// ==========================================
// КОНСТАНТЫ И ПУТИ
// ==========================================

const root = process.cwd();
const aiDir = resolve(root, 'ai-service');
const srcDir = resolve(root, 'src');
const scriptsDir = resolve(root, 'scripts');

const packageJson = resolve(root, 'package.json');
const packageLock = resolve(root, 'package-lock.json');
const nodeModules = resolve(root, 'node_modules');

const requirementsFile = resolve(aiDir, 'requirements.txt');
const venvDir = resolve(aiDir, '.venv');
const pycacheDir = resolve(aiDir, 'pycache');

const isWindows = process.platform === 'win32';
const pythonCommands = isWindows ? ['python', 'py'] : ['python3', 'python'];

const venvPython = isWindows
    ? resolve(venvDir, 'Scripts', 'python.exe')
    : resolve(venvDir, 'bin', 'python');

// ИСПРАВЛЕНИЕ 1: Используем npm.cmd напрямую, без костылей с cmd.exe
const npmCommand = isWindows ? 'npm.cmd' : 'npm';
const npmArgsPrefix = [];

const children = new Set();
let shuttingDown = false;

// ==========================================
// БАЗОВЫЕ УТИЛИТЫ
// ==========================================

async function exists(path) {
    try {
        await access(path, constants.F_OK);
        return true;
    } catch {
        return false;
    }
}

// ИСПРАВЛЕНИЕ 2: "Пуленепробиваемый" spawn для Windows
function spawnProcess(command, args, cwd, label, env = process.env) {
    let spawnCommand = command;
    let spawnArgs = args;
    let useShell = false;

    if (isWindows) {
        // Если команда содержит пробелы (путь к python.exe) или является .cmd/.bat файлом
        if (command.includes(' ') || command.endsWith('.cmd') || command.endsWith('.bat')) {
            useShell = true;
            // 1. Оборачиваем саму команду в кавычки, если в пути есть пробелы
            const quotedCommand = command.includes(' ') ? `"${command}"` : command;
            // 2. Оборачиваем аргументы в кавычки, если они сами содержат пробелы
            const quotedArgs = args.map((arg) => (arg.includes(' ') ? `"${arg}"` : arg));
            // 3. Собираем всё в одну строку. Это УБИВАЕТ ошибку DEP0190 и проблему с пробелами в путях
            spawnCommand = `${quotedCommand} ${quotedArgs.join(' ')}`;
            spawnArgs = []; // Аргументы уже внутри строки, передаем пустой массив
        }
    }

    const child = spawn(spawnCommand, spawnArgs, {
        cwd,
        stdio: 'inherit',
        env,
        shell: useShell // Включаем shell ТОЛЬКО когда это необходимо для Windows
    });

    children.add(child);
    child.on('exit', () => children.delete(child));

    return child;
}

function run(command, args, cwd, label, env = process.env) {
    return new Promise((resolvePromise, rejectPromise) => {
        const child = spawnProcess(command, args, cwd, label, env);

        child.once('error', (error) => {
            rejectPromise(new Error(`[${label}] не удалось запустить процесс: ${error.message}`));
        });

        child.once('exit', (code, signal) => {
            if (code === 0) {
                resolvePromise();
                return;
            }
            rejectPromise(
                new Error(
                    `[${label}] завершился с ошибкой. Код: ${code ?? 'unknown'}${signal ? ` (Сигнал: ${signal})` : ''}`
                )
            );
        });
    });
}

// ==========================================
// ПРОВЕРКИ И ПОДГОТОВКА ОКРУЖЕНИЯ
// ==========================================

async function ensureProjectFiles() {
    const required = [
        [packageJson, 'корневой package.json'],
        [srcDir, 'директория src'],
        [resolve(aiDir, 'main.py'), 'ai-service/main.py'],
        [requirementsFile, 'ai-service/requirements.txt']
    ];

    const missing = [];
    for (const [path, label] of required) {
        if (!(await exists(path))) {
            missing.push(label);
        }
    }

    if (missing.length > 0) {
        throw new Error(
            `Не хватает файлов самого проекта: ${missing.join(', ')}. ` +
                `Скрипт автоматически устанавливает зависимости, но не может восстановить исходный код.`
        );
    }
}

async function commandWorks(command, args, cwd = root) {
    try {
        await run(command, args, cwd, `${command} check`);
        return true;
    } catch {
        return false;
    }
}

async function prepareNode() {
    if (!(await exists(nodeModules))) {
        console.log('[src] node_modules не найден. Устанавливаем зависимости...');
        const args = (await exists(packageLock)) ? ['ci'] : ['install'];
        const label = (await exists(packageLock)) ? 'npm ci' : 'npm install';
        await run(npmCommand, [...npmArgsPrefix, ...args], root, label);
        return;
    }

    console.log('[src] Проверяем npm-зависимости...');
    const healthy = await commandWorks(
        npmCommand,
        [...npmArgsPrefix, 'ls', '--depth=0', '--omit=optional'],
        root
    );

    if (healthy) {
        console.log('[src] npm-зависимости готовы.');
        return;
    }

    console.log('[src] npm-зависимости неполные. Выполняем npm install...');
    await run(npmCommand, [...npmArgsPrefix, 'install'], root, 'npm install');
}

async function preparePython() {
    const python = venvPython;
    const requirements = await readFile(requirementsFile);
    const requirementsHash = createHash('sha256').update(requirements).digest('hex');
    const requirementsStamp = resolve(venvDir, '.fitmaster-requirements.sha256');

    let venvExists = await exists(venvPython);
    let installedHash = null;
    if (venvExists && (await exists(requirementsStamp))) {
        installedHash = (await readFile(requirementsStamp, 'utf8')).trim();
    }

    // A venv created with an older, much larger requirements.txt may contain many
    // packages that this service no longer needs. Rebuild only this project's venv
    // when it has no stamp or the requirements have changed.
    if (!venvExists || installedHash !== requirementsHash) {
        if (await exists(venvDir)) {
            console.log('[ai-service] Список зависимостей изменился или старое окружение не отмечено. Пересоздаём только ai-service/.venv...');
            await rm(venvDir, { recursive: true, force: true });
        } else {
            console.log('[ai-service] .venv не найден. Создаём виртуальное окружение...');
        }

        let created = false;
        let lastError = null;
        for (const command of pythonCommands) {
            try {
                await run(command, ['-m', 'venv', venvDir], root, 'python -m venv');
                created = true;
                break;
            } catch (error) {
                lastError = error;
            }
        }
        if (!created || !(await exists(venvPython))) {
            throw new Error(
                `Не удалось создать ai-service/.venv. Последняя ошибка: ${lastError?.message ?? 'неизвестно'}`
            );
        }

        await mkdir(pycacheDir, { recursive: true });
        console.log('[ai-service] Устанавливаем зависимости, перечисленные в ai-service/requirements.txt...');
        await run(
            python,
            ['-m', 'pip', 'install', '--disable-pip-version-check', '--no-warn-script-location', '-r', requirementsFile],
            aiDir,
            'pip install ai-service requirements'
        );
        await writeFile(requirementsStamp, `${requirementsHash}\n`, 'utf8');
        return python;
    }

    await mkdir(pycacheDir, { recursive: true });
    console.log('[ai-service] Проверяем необходимые Python-зависимости...');
    try {
        await run(
            python,
            ['-c', 'import dotenv, fastapi, openai, pydantic, uvicorn'],
            aiDir,
            'python dependency check'
        );
    } catch {
        console.log('[ai-service] Не все необходимые пакеты установлены. Восстанавливаем зависимости из requirements.txt...');
        await run(
            python,
            ['-m', 'pip', 'install', '--disable-pip-version-check', '--no-warn-script-location', '-r', requirementsFile],
            aiDir,
            'pip install ai-service requirements'
        );
        await writeFile(requirementsStamp, `${requirementsHash}\n`, 'utf8');
    }

    return python;
}

// ==========================================
// ЗАПУСК СЕРВЕРОВ
// ==========================================

function startNode() {
    console.log('[src] Запускаем npm run dev...');
    return spawnProcess(npmCommand, [...npmArgsPrefix, 'run', 'dev'], root, 'src');
}

function startPython(python) {
    console.log('[ai-service] Запускаем uvicorn...');
    return spawnProcess(
        python,
        ['-m', 'uvicorn', 'main:app', '--host', '127.0.0.1', '--port', '8000'],
        aiDir,
        'ai-service',
        {
            ...process.env,
            PYTHONPYCACHEPREFIX: pycacheDir
        }
    );
}

// ==========================================
// ЗАВЕРШЕНИЕ РАБОТЫ
// ==========================================

function stopAll() {
    for (const child of children) {
        if (!child.killed) {
            child.kill();
        }
    }
}

function shutdown(code = 0) {
    if (shuttingDown) return;
    shuttingDown = true;
    stopAll();
    process.exitCode = code;
}

// ==========================================
// ГЛАВНАЯ ФУНКЦИЯ
// ==========================================

async function main() {
    await ensureProjectFiles();

    console.log('Preparing FitMaster development environment...');
    console.log('  src        -> dependencies / npm run dev');
    console.log('  ai-service -> .venv / pip dependencies / uvicorn');

    await prepareNode();
    const python = await preparePython();

    const nodeProcess = startNode();
    const pythonProcess = startPython(python);

    nodeProcess.once('error', (error) => {
        console.error(`[src] Критическая ошибка запуска: ${error.message}`);
        shutdown(1);
    });

    pythonProcess.once('error', (error) => {
        console.error(`[ai-service] Критическая ошибка запуска: ${error.message}`);
        shutdown(1);
    });

    nodeProcess.once('exit', (code, signal) => {
        if (!shuttingDown && code !== 0) {
            console.error(
                `[src] аварийно завершился с кодом ${code ?? 'unknown'}${signal ? ` (${signal})` : ''}`
            );
            shutdown(code ?? 1);
        }
    });

    pythonProcess.once('exit', (code, signal) => {
        if (!shuttingDown && code !== 0) {
            console.error(
                `[ai-service] аварийно завершился с кодом ${code ?? 'unknown'}${signal ? ` (${signal})` : ''}`
            );
            shutdown(code ?? 1);
        }
    });

    console.log('FitMaster development environment started successfully:');
    console.log('  src        -> http://localhost:3000 (или ваш порт из TS)');
    console.log('  ai-service -> http://127.0.0.1:8000');
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));

main().catch((error) => {
    console.error('Критическая ошибка при инициализации:', error.message);
    shutdown(1);
});
