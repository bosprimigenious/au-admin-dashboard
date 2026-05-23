# au-admin-dashboard

Vue 3 + TypeScript + Vite 暗色 **Ops Center**，对接 agentUniverse Admin API（OSPP #568）。

## 功能页面

| 路由 | 功能 | 后端 API |
|------|------|----------|
| `/overview` | 资源汇总 + 今日 LLM 指标 | `GET /api/v1/admin/resources/summary` |
| `/resources` | 四类资源矩阵 | `GET /api/v1/admin/resources/{agents,tools,knowledge,workflows}` |
| `/monitoring` | LLM 趋势 + 告警流 | `GET /api/v1/admin/metrics/llm` |
| `/trace/:agentId/:sessionId?` | 会话拓扑 + Timeline + LPP 雷达 | `GET /resources/sessions/*` + `GET /trace/sessions/*` |

## 快速开始

### 1. 启动后端

在 agentUniverse 工程目录启动 Flask 网关（默认 `:8000`）：

```bash
python bootstrap/intelligence/server_application.py
```

需使用包含 Admin Blueprint 的分支（如 `feat/admin-resource-phase1`）。

### 2. 启动前端

```bash
npm install
npm run dev
```

访问 `http://127.0.0.1:5173`

Vite 代理：`/api` → `http://127.0.0.1:8000`（见 `vite.config.ts`）。

### 3. 无代理模式

复制 `.env.example` 为 `.env`：

```bash
VITE_API_BASE_URL=http://127.0.0.1:8000
```

## 脚本

```bash
npm run dev          # 开发服务器
npm run build        # 生产构建
npm run test         # Vitest 单测
npm run type-check   # vue-tsc
npm run lint         # ESLint（建议限定 src：npx eslint src --ext .ts,.vue）
```

## 技术栈

- Vue 3.5 + TypeScript + Pinia + Vue Router
- Tailwind CSS v4
- ECharts（趋势图 / LPP 雷达）
- AntV G6 5.x（Trace 拓扑）

## 联调文档

完整 E2E 步骤见 agentUniverse 文档：

`docs/guidebook/zh/How-to/后台管理模块/E2E联调指南.md`

## 目录结构

```
src/
├── api/admin.ts          # 后端契约适配层
├── store/                # Pinia（resource / trace / monitoring）
├── views/                # 页面
├── components/           # 卡片、图表、拓扑
├── hooks/useSafetyRadar.ts
└── types/admin.ts        # 前端 DTO
```

## 响应格式

后端统一返回：

```json
{ "success": true, "result": {}, "message": null, "request_id": null }
```

`src/utils/request.ts` 会自动解包 `result` 并在 `success=false` 时抛错。
