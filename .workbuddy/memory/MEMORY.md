# 项目长期记忆

## 技术栈
- Vue 3 + TypeScript + Vite + Element Plus + Pinia
- vite-plugin-mock 用于开发期 mock
- axios 请求封装在 src/utils/request.ts，baseURL = VITE_API_BASE_URL = /api

## 资产台账接口
- 后端地址：http://localhost:8081
- 端点：GET /api/v1/assets, GET /api/v1/assets/{id}, GET /api/v1/assets/statistics
- 适配层在 src/api/asset/index.ts，做参数转换(pageNum→page)和响应拍平(pagination→flat)
- 其他模块仍用 mock，URL 不冲突
- Mock 快速切换：.env.development 中 VITE_USE_ASSET_MOCK=true 走前端 mock（src/api/asset/mock-data.ts），false 走真实后端

## 关键坑
- vite-plugin-mock 的 .mjs 缓存文件会被 fast-glob 扫描加载，覆盖 index.ts 的修改
- 解决：viteMockServe 配置 `ignore: /_.*\.bundled_/`
