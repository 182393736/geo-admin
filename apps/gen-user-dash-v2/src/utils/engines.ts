/** 监控引擎展示常量（与后端 PLATFORMS 对齐：doubao/deepseek/wenxin/yuanbao） */
export const ENGINE_KEYS = ['doubao', 'deepseek', 'wenxin', 'yuanbao'] as const;

export const ENGINE_META: Record<string, { name: string; color: string }> = {
  doubao: { name: '豆包', color: '#3b82f6' },
  deepseek: { name: 'DeepSeek', color: '#4f46e5' },
  wenxin: { name: '文心一言', color: '#ec4899' },
  yuanbao: { name: '腾讯元宝', color: '#06b6d4' },
  qianwen: { name: '通义千问', color: '#f59e0b' },
  kimi: { name: 'Kimi', color: '#10b981' },
};

export const engineName = (k: string) => ENGINE_META[k]?.name || k;
export const engineColor = (k: string) => ENGINE_META[k]?.color || '#4f46e5';

/** 数字格式化 */
export const fmtNum = (v: any, d = 1) => (typeof v === 'number' && Number.isFinite(v) ? +v.toFixed(d) : 0);
export const fmtPct = (v: any, d = 2) => (typeof v === 'number' && Number.isFinite(v) ? `${(+v.toFixed(d))}%` : '—');
export const fmtRank = (v: any) => {
  if (v == null || v === '' || v === '未提及') return '未提及';
  return String(v);
};
export const fmtDate = (s: string) => (s ? s.slice(5) : '');

/** 最近 N 天日期范围（YYYY-MM-DD） */
export const lastNDays = (n = 7) => {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - (n - 1));
  const f = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  return { start: f(start), end: f(end) };
};
