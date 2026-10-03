import { spawn } from 'node:child_process';
import { access, mkdir } from 'node:fs/promises';
import { constants } from 'node:fs';
import { resolve } from 'node:path';

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

const npmCommand = isWindows ? 'cmd.exe' : 'npm';
const npmArgsPrefix = isWindows ? ['/c', 'npm'] : [];

const children = new Set();
let shuttingDown = false;

async function exists(path) {
    try {
        await access(path, constants.F_OK);
        return true;
    } catch {
        return false;
    }
}

function spawnProcess(command, args, cwd, label, env = process.env) {
    const child = spawn(command, args, {
        cwd,
        stdio: 'inherit',
        env,
        shell: false
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
                    `[${label}] завершился с кодом ${code ?? 'unknown'}${signal ? ` (${signal})` : ''}`
                )
            );
        });
    });
}

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
            `Скрипт автоматически устанавливает зависимости, но не может восстановить исходный код без источника проекта.`
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
        await run(npmCommand, [...npmArgsPrefix, ...args], root, (await exists(packageLock)) ? 'npm ci' : 'npm install');
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
    let python = venvPython;

    if (!(await exists(venvPython))) {
        console.log('[ai-service] .venv не найден. Создаём виртуальное окружение...');

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

        if (!created) {
            throw new Error(
                `Не удалось найти Python для создания ai-service/.venv. ${lastError?.message ?? ''}`
            );
        }

        python = venvPython;
    }

    await mkdir(pycacheDir, { recursive: true });

    console.log('[ai-service] Проверяем Python-зависимости...');

    try {
        await run(
            python,
            ['-c', 'import uvicorn, fastapi, pydantic, sqlalchemy, psycopg, openai'],
            aiDir,
            'python dependency check'
        );
    } catch {
        console.log('[ai-service] Зависимости отсутствуют или неполные. Устанавливаем requirements.txt...');
        await run(
            python,
            ['-m', 'pip', 'install', '-r', requirementsFile],
            aiDir,
            'pip install'
        );
    }

    return python;
}

function startNode() {
    console.log('[src] Запускаем npm run dev...');
    return spawnProcess(npmCommand, [...npmArgsPrefix, 'run', 'dev'], root, 'src');
}

function startPython(python) {
    console.log('[ai-service] Запускаем uvicorn...');

    return spawnProcess(
        python,
        [
            '-m',
            'uvicorn',
            'main:app',
            '--host',
            '127.0.0.1',
            '--port',
            '8000'
        ],
        aiDir,
        'ai-service',
        {
            ...process.env,
            PYTHONPYCACHEPREFIX: pycacheDir
        }
    );
}

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
        console.error(`[src] ${error.message}`);
        shutdown(1);
    });

    pythonProcess.once('error', (error) => {
        console.error(`[ai-service] ${error.message}`);
        shutdown(1);
    });

    nodeProcess.once('exit', (code, signal) => {
        if (!shuttingDown && code !== 0) {
            console.error(`[src] завершился с кодом ${code ?? 'unknown'}${signal ? ` (${signal})` : ''}`);
            shutdown(code ?? 1);
        }
    });

    pythonProcess.once('exit', (code, signal) => {
        if (!shuttingDown && code !== 0) {
            console.error(`[ai-service] завершился с кодом ${code ?? 'unknown'}${signal ? ` (${signal})` : ''}`);
            shutdown(code ?? 1);
        }
    });

    console.log('FitMaster development environment started:');
    console.log('  src        -> npm run dev');
    console.log('  ai-service -> http://127.0.0.1:8000');
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));

main().catch((error) => {
    console.error(error.message);
    shutdown(1);
});