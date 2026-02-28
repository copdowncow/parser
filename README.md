# AI Job Opportunity Radar

MVP backend для платформы поиска задач с AI-анализом, оценкой конкуренции и `Opportunity Score`.

## Что реализовано сейчас

- Fastify API:
  - `GET /health`
  - `GET /jobs` (с pagination и фильтрами)
  - `GET /jobs/:id` (детальная карточка + анализ)
  - `GET /stats`
  - `GET /parser/status` (состояние фонового парсера)
  - `POST /parser/run` (ручной запуск парсинга)
  - `POST /proposals/generate` (генерация персонализированного отклика)
- Планировщик парсинга (интервальный запуск)
- Источники задач:
  - `mock-board` (локальный шаблон)
  - `github-issues` (публичные GitHub Issues по label `help wanted`)
- Дедупликация задач по URL
- Retry логика парсинга источников (до 3 попыток)
- Защита от параллельных запусков parser-run
- Персистентное локальное хранилище (`STORAGE_FILE_PATH`, JSON на диске)
- AI-эвристический анализ:
  - тип проекта
  - сложность
  - urgency score
  - relevance score
- Scoring Engine (`Opportunity Score` 0–100) + breakdown
- Фильтрация задач по параметрам (tech, budget, difficulty, competition, source, text query)
- Telegram уведомления для high-score задач

## Быстрый старт

```bash
cp .env.example .env
npm install
npm run dev
```

API будет доступен на `http://localhost:3000`.

## Примеры запросов

```bash
curl 'http://localhost:3000/health'
curl 'http://localhost:3000/jobs?technologies=node,react&minOpportunityScore=60&limit=10&offset=0'
curl 'http://localhost:3000/jobs?source=github-issues&query=typescript'
curl 'http://localhost:3000/jobs/<job_id>'
curl 'http://localhost:3000/parser/status'
curl -X POST 'http://localhost:3000/parser/run'
curl -X POST 'http://localhost:3000/proposals/generate' \
  -H 'content-type: application/json' \
  -d '{"jobId":"<job_id>"}'
curl 'http://localhost:3000/stats'
```

## Переменные окружения

- `PARSER_INTERVAL_MINUTES` — период планового запуска
- `OPPORTUNITY_ALERT_THRESHOLD` — порог алерта
- `GITHUB_SOURCE_ENABLED` — включить/выключить GitHub-источник
- `GITHUB_OWNER`, `GITHUB_REPO`, `GITHUB_LABEL` — параметры GitHub-источника
- `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` — Telegram канал уведомлений
- `STORAGE_FILE_PATH` — путь к JSON-файлу локального хранилища

## Структура

- `src/parser` — сбор данных
- `src/ai` — AI-анализ и генерация откликов
- `src/scoring` — расчёт opportunity score
- `src/routes` — HTTP API
- `src/db` — схема БД и репозиторий
- `src/notifications` — каналы уведомлений

Полное ТЗ: `docs/technical-spec.md`.
