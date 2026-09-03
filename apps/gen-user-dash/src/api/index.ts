/**
 * API 出口层 —— Mock/真实 一键切换
 * 使用：import { api } from '@/api'
 * 配置：.env 中 VITE_USE_MOCK=true 时继续走 src/mock；false 时走后端
 */
export const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

export { userApi } from './modules/user';
export { monitorApi } from './modules/monitor';
export { reportApi, publishApi } from './modules/report';
export { brandApi } from './modules/brand';
export * from './types';

import { userApi } from './modules/user';
import { monitorApi } from './modules/monitor';
import { reportApi, publishApi } from './modules/report';
import { brandApi } from './modules/brand';

export const api = { user: userApi, monitor: monitorApi, report: reportApi, publish: publishApi, brand: brandApi };
