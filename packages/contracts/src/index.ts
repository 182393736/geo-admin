/**
 * @geo-admin/contracts —— GEO 平台共享契约单一事实源
 * -------------------------------------------------
 * - enums       全平台枚举（as const 数组 + 联合类型，跨 CJS/ESM 安全）
 * - constants   平台列表 / 位次权重 / 套餐目录 / 阈值锚点
 * - entities    实体数据结构（对齐 apps/gen-api/app/model/*.js）
 * - schemas     核心实体 zod 运行时 schema（契约测试用）
 * - api         接口请求/响应类型（对齐线上实测契约）
 * - jwt         JWT 载荷形状 + 解码助手
 */
export * from './enums';
export * from './constants';
export * from './entities';
export * from './schemas';
export * from './api';
export * from './jwt';
export * from './admin';
