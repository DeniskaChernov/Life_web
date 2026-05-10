# LIFE — план разработки

Источник истины — `LIFE_MASTER_BLUEPRINT.md` (вне репо, у владельца).
Этот файл — рабочая матрица «что сделано / что дальше», обновляется вместе с коммитами.

---

## ✅ Сделано

### Epic A — Foundation (MVP 0.1)

Коммиты: `b848b1e`, `858baa8`, `56f3181`, `a400f2a`, `12ccb08`

- Next.js 15 + Tailwind 3 + Prisma 5 + PostgreSQL (Railway)
- NextAuth v5 (Credentials + Google OAuth)
- REST API: `/api/v1/{graphs,nodes,edges}` + auth/register
- LifeMap на React Flow + Zustand store
- Демо-граф через `seedDemoGraphForUser` при регистрации
- Husky + Prettier + ESLint pre-commit
- Sidebar, Dashboard, Breadcrumb-навигация

### Epic C1 — Полная схема БД (LIFE_MASTER_BLUEPRINT.md §11)

Коммиты: `c3c6a90`, `112816e`

- Расширены `User` (avatar, timezone, currency, onboardingCompleted, settings)
- Расширен `Graph` (parentNodeId — для drill-in)
- Расширен `Node` (subCategory, parentId, subgraphId, depth, progress, timeHorizon, energy, startDate, completedAt, icon, size, isPinned, isCollapsed, aiScore, aiInsights, version)
- Расширен `Edge` (description, strength, direction, isAnimated)
- Новые таблицы: `NodeSnapshot`, `AiInteraction`
- Идемпотентная SQL-миграция `20260510190000_epic_c1_full_schema`
- Domain types (`types/*.types.ts`) и validation в API (auto-completion, version++, JsonNull)
- Новый `lib/bootstrap-user-graph.ts` с SELF + GOAL + ASSET + INCOME + HABIT и edge-типами FUNDS/SUPPORTS/GENERATES

### Epic B3 — Design system (LIFE_MASTER_BLUEPRINT.md §5.7)

Коммит: `d530d4e`

- `constants/colors.ts`, `typography.ts`, `animations.ts`, `zoom-levels.ts`
- Tailwind theme: bg/node/status цвета, шрифты, тени `glass`/`glow`, keyframes
- `globals.css`: `.glass-panel`, `.node-active/selected/critical`, `.edge-animated`, ReactFlow overrides
- Inter (display+body) + JetBrains Mono, dark theme

### Epic B1 — Graph visuals + LOD (LIFE_MASTER_BLUEPRINT.md §5.3)

Коммиты: `4d8954a`, `17cc314`

- Динамические типы узлов и рёбер (`nodeKindFromCategory`, `edgeKindFromType`)
- `useZoomPreset` hook → 4 уровня LOD (galaxy/system/planet/surface)
- BaseNode (LOD, glow, progress bar, status dot), SelfNode (радиальный glow), FinancialNode (mono-числа, формат валюты)
- BaseEdge / FundsEdge (animated dasharray) / RisksEdge (dashed glow)
- Edge culling при `zoom < 0.55` для непринципиальных типов
- Фильтрация узлов по preset.visibleCategories

### Epic B2 — UX Layer Framer Motion (LIFE_MASTER_BLUEPRINT.md §5.2, 5.4–5.6)

Коммит: `de4483f`

- `useCameraControls`: flyToNode / flyToHome / overview / zoomBy («без телепортаций»)
- `nodesWithinHops` для 2-hop focus ray (за пределами opacity 0.28)
- CommandPalette (Cmd/Ctrl+K, поиск + быстрые команды)
- NodeContextMenu (правый клик на узел/ребро)
- FloatingToolbar (мульти-выделение → chain / change status / delete)
- TimeHorizonBar (фильтр DAY..LIFE с анимированным pill)
- BottomInfoBar (zoom%, узлы/связи/выделение, ⌂ Я, ⛶ Обзор)
- Multi-select: `selectionOnDrag`, Shift+click, `panOnDrag={[1,2]}`
- RightPanel: полный редактор для всех новых полей (category, status, priority, timeHorizon, energy, progress slider) + edge editing (type, label, description, strength, direction)

### Лендинг + восстановление пароля

Коммит: `073a9de`

- Публичный лендинг на `/` (HERO + 3 фичи + 4 принципа UX + final CTA), стилизован по design system
- `PasswordResetToken` модель + миграция `20260510210000`
- `POST /api/v1/auth/{forgot,reset}-password` (защита от email enumeration, токен 1 час, SHA-256 хэш в БД)
- Страницы `/forgot-password` и `/reset-password?token=...`
- `lib/email.ts` — Resend если есть `RESEND_API_KEY`, иначе fallback в логи
- На `/login`: ссылка «Забыли пароль?» + Google-иконка

---

## 🚧 Сейчас в работе

_(пусто — все начатые блоки закоммичены)_

---

## 🎯 Дальше (по приоритету)

### 1. Epic C2 — Финансовая модель целиком (§7 блюпринта)

Высокий приоритет. Заявленная USP продукта.

- Таблицы: `NetWorthSnapshot`, `CashflowEntry`, `Property`, `Scenario` (схема + миграция)
- API endpoints + valid Zod-схемы
- UI:
  - **Net worth tracker** — график `NetWorthSnapshot` по времени (Recharts/Victory)
  - **Cashflow Sankey** — диаграмма потоков «откуда → куда»
  - **Property card** — узел с детальной карточкой объекта (адрес, оценка, ипотека)
  - **Scenarios** — «что если повышение ставки», «что если +20% дохода» с пересчётом графа
- Связь с edges типа FUNDS/ALLOCATES_TO/GENERATES (уже есть)

### 2. Epic D — AI-стратег (§8 блюпринта)

Таблица `AiInteraction` уже есть, нужно:

- LLM-провайдер (OpenAI / Anthropic) — выбор и API key
- `lib/ai/context-builder.ts` — собирает граф пользователя в structured prompt
- `POST /api/v1/ai/chat` — чат с контекстом активного узла или всего графа
- `POST /api/v1/ai/suggest` — генерация предложений (новые узлы/связи) с accept/reject
- UI: AI panel сбоку (или drawer), inline insights на узлах с `aiScore`
- Запись истории в `AiInteraction` для тренировки персонального контекста (`AiUserMemory` — отдельная таблица позже)

### 3. Epic E — Drill-in / sub-graphs (§3.3, §5.6)

Поле `Graph.parentNodeId` и `Node.subgraphId` уже в схеме.

- `POST /api/v1/graphs` для создания дочернего графа из узла
- UI: двойной клик по узлу → cinematic zoom-in → загружается subgraph
- Breadcrumb-навигация по иерархии графов (компонент уже есть, надо подключить)
- «Назад к родителю» через клавишу Escape с обратной cinematic-анимацией

### 4. Epic F — Onboarding (§9)

Поле `User.onboardingCompleted` уже в схеме.

- 3-шаговый wizard после первого логина: «Что для тебя важно?» → «Какие у тебя цели на год?» → «Какой твой главный риск?»
- На основе ответов — пересборка демо-графа под конкретного пользователя
- Skip-кнопка → сохраняется flag, больше не показывается

### 5. Epic G — Time-travel (§3.4 + NodeSnapshot)

Таблица `NodeSnapshot` уже есть.

- Автоснапшоты при значимых изменениях узла (status flip, progress milestone)
- UI: «прокрутка времени» — слайдер внизу графа, граф перерисовывается на дату X
- Diff-режим: «что изменилось за неделю/месяц»

### 6. Epic H — Production readiness (горизонтально)

- **H1: Email** — настроить `RESEND_API_KEY` и `EMAIL_FROM` на Railway (без него reset-flow работает только в логах)
- **H2: Google OAuth** — настроить `GOOGLE_CLIENT_ID/SECRET` на Railway + redirect URI в Google Cloud Console
- **H3: Observability** — Sentry для ошибок, structured JSON-логи
- **H4: Rate limiting** — на `/api/v1/auth/*` (Upstash Redis или in-memory) для защиты от brute-force
- **H5: Testing** — Vitest unit для services/lib, Playwright e2e для критичных flow (login, create node, edge, delete)
- **H6: SEO/OG** — metadata, OG images, robots.txt, sitemap.xml для лендинга
- **H7: Mobile** — адаптивная вёрстка lendinга и dashboard (граф мобильно — отдельный челлендж, low-pri)
- **H8: Avatar storage** — Cloudflare R2 или S3 для `User.avatarUrl`
- **H9: Settings page** — UI для редактирования `User.settings`, timezone, currency, onboarding reset
- **H10: Subscription/billing** — `User.subscriptionTier` уже зарезервировано, но не используется (Stripe — отложить)

---

## 📦 Backlog (низкий приоритет / далёкий горизонт)

- **Sharing**: read-only ссылка на граф, экспорт в PNG/PDF
- **Collaboration**: совместное редактирование узла (CRDT — Yjs)
- **Mobile graph**: спец-режим для телефона (одна колонка узлов вместо двумерного графа)
- **Plugin SDK**: внешние интеграции (Google Calendar → автосоздание EVENT-узлов, банк-API → INCOME/EXPENSE)
- **Public templates**: типовые графы («Семейный бюджет», «Стартап», «Спортивная подготовка»)

---

## 🗒 Технический долг

- В `lint-staged` нет ESLint (только prettier) — добавить `eslint --fix` для staged
- `next-env.d.ts` в `.gitignore` — норм, но проверить что Railway его генерирует на билде
- Husky + Windows: иногда LF/CRLF warnings — поправить `.gitattributes` (`* text=auto eol=lf`)
- Все 4 nodeTypes/edgeTypes регистрируются глобально, но только 3 фактических компонента — норм, рефактор не нужен

---

_Обновлено: 2026-05-10. После каждого завершённого эпика — обновлять разделы «Сделано» и «Дальше»._
