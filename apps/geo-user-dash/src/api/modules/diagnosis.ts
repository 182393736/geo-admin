/** 单次品牌诊断 */
import { get, post } from '../http';
import type { DiagnosisTaskItem } from '../types';

export type DiagnosisPlatformSel = { engine: string; ends: Array<'web' | 'app'> };

export const diagnosisApi = {
  tasks: (page = 1, size = 50) =>
    get<{ list: DiagnosisTaskItem[]; total: number; page: number; size: number }>(
      `/diagnosis/tasks?page=${page}&size=${size}`,
    ),
  create: (payload: {
    brand_name?: string;
    brand_id?: string | null;
    aliases?: string[];
    topic_count: number;
    platforms: DiagnosisPlatformSel[];
    target_brand_input?: { name: string; brand_id?: string | null };
  }) => post<DiagnosisTaskItem>('/diagnosis/order/create', payload),
  cancel: (diagnosis_id: string) => post('/diagnosis/order/cancel', { diagnosis_id }),
};
