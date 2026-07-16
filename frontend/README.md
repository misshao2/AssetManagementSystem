# 资产管理系统 · 前端管理后台（asset-admin）

基于 Vue 3 + TypeScript + Vite 的企业级中后台脚手架，对应《资产管理系统开发文档（前端篇）》。

## 技术栈

| 维度 | 选型 |
|------|------|
| 框架 | Vue 3（`<script setup>` + Composition API） |
| 语言 | TypeScript |
| 构建 | Vite 5 |
| 路由 | Vue Router 4（动态路由 + 权限过滤） |
| 状态 | Pinia 2（+ 持久化插件） |
| UI | Element Plus + @element-plus/icons-vue |
| 图表 | ECharts 5 |
| HTTP | Axios（统一拦截） |
| 工具 | dayjs / lodash-es / nprogress / xlsx |

## 目录结构

```
src/
├── api/          接口层（按 8 大模块拆分）
├── assets/       静态资源
├── components/    公共组件（ProTable/ProForm/Chart/DictTag...）
├── composables/  组合式函数（useTable/useDialog/usePermission/useChart）
├── config/       常量/枚举
├── directives/   自定义指令（permission）
├── layout/       布局（Sidebar/Navbar/TagsView）
├── router/       路由（constantRoutes + dynamicRoutes）
├── store/        Pinia（user/app/dict/org/message）
├── styles/       全局样式
├── utils/        工具（request/auth/storage/download/format）
├── views/        页面（8 大模块）
├── App.vue
├── main.ts
└── env.d.ts
```

## 快速开始

```bash
# 依赖安装
npm install

# 开发（内置 vite-plugin-mock，无需后端即可登录与查看样例数据）
npm run dev          # http://localhost:3000

# 生产构建
npm run build

# 预览构建产物
npm run preview

# 类型检查 / 代码规范
npm run type-check
npm run lint
```

> 内置 Mock 账号：任意账号 + 任意密码（如 `admin / 123456`）即可登录。
> 关闭 Mock：将 `.env.development` 中 `VITE_USE_MOCK` 改为 `false`，并配置后端 `VITE_API_BASE_URL`。

## 约定

- 列表页统一使用 `ProTable` + `useTable`；弹窗表单统一使用 `ProForm`。
- 按钮级权限使用 `v-permission="'asset:edit'"` 指令或 `usePermission().hasPerm()`。
- 字典/枚举统一走 `dictStore`，禁止硬编码。
- 接口统一返回 `{ code:0, message, data, requestId }`，详见开发文档第 1 章。
