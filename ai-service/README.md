# FitMaster AI Service

Python-сервис адаптации тренировок. Он хранит отдельную базу знаний `ai-fitmaster`, рассчитывает показатели пользователя и обращается к LLM для генерации следующего шаблона.

## Запуск вручную

Из корня проекта:

```powershell
cd ai-service
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m uvicorn main:app --host 127.0.0.1 --port 8000
```

Для Linux/macOS путь к Python виртуального окружения будет `.venv/bin/python`.

## Запуск FitMaster целиком

Из корня проекта:

```powershell
npm install
npm run dev:all
```

Команда одновременно запускает:

- `npm run dev` — TypeScript/Express на `PORT` из `.env`;
- Python/Uvicorn — AI-service на `http://127.0.0.1:8000`.

## Проверка

Открой:

```text
http://127.0.0.1:8000/
http://127.0.0.1:8000/health
http://127.0.0.1:8000/docs
```

`/health` должен показать состояние базы и AI-клиента. `/docs` содержит Swagger для проверки маршрутов.

## Переменные

Минимально нужны:

```env
API_KEY=...
AI_BASE_URL=https://openrouter.ai/api/v1
AI_MODEL=qwen/qwen3.8-27b:free

AI_DB_HOST=localhost
AI_DB_PORT=5432
AI_DB_USER=postgres
AI_DB_PASSWORD=password
AI_DB_NAME=ai-fitmaster

AI_SERVICE_URL=http://127.0.0.1:8000
AI_SERVICE_TIMEOUT_MS=60000
```

Можно использовать `AI_DATABASE_URL` вместо отдельных `AI_DB_*` переменных.

## Как проходит одна адаптация

```text
src
  ↓ POST /api/v1/adaptation/generate
Routes
  ↓
Schema
  ↓
Storage + Service/indicators.py
  ↓
Main/llm.py
  ↓
Schema/guards
  ↓
JSON ответа
  ↓
src
  ↓
workout_pattern (ADAPTIVE / ADAPTATION)
```

Результат тренировки сохраняется в основной БД **до** обращения к AI. Если AI-service недоступен, результат тренировки не теряется.
