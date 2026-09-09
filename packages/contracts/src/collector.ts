/**
 * 采集 worker 协议（gen-api <-> 采集程序，机器对机器）
 * ------------------------------------------------------------------
 * 鉴权：请求头 Authorization: Bearer <COLLECTOR_API_KEY>（或 X-Collector-Key）
 * 范围（当前阶段）：
 *   - 平台恒为 5 家：doubao/deepseek/wenxin/qwen/yuanbao（不含 kimi）
 *   - 端恒为 web（mobile 暂不展开）
 *   - 截图存证 / 中立账号池：后续补，字段先占位为 null
 *   - 提交为单条（slot 粒度）；失败重试：每槽最多尝试 2 次后终态 fail
 */
import type { CollectPlatform, CollectEnd, QueryType, SlotStatus } from './enums';

/** 采集平台（当前生效范围：5 家，不含 kimi） */
export const COLLECTOR_PLATFORMS = ['doubao', 'deepseek', 'wenxin', 'qwen', 'yuanbao'] as const;
export type CollectorPlatform = (typeof COLLECTOR_PLATFORMS)[number];

/** 每个槽位最多失败/超时次数（attempts 只计 fail 提交与运行超时；达上限 → 终态 fail） */
export const COLLECTOR_MAX_ATTEMPTS = 2;

/** 拉取单个待采集槽位请求（单条拉取：一次只领 1 个） */
export interface PullSlotRequest {
  /** 限定平台：单数（单个 tab 常用）；与 platforms 二选一，都传以 platforms 为准 */
  platform?: CollectorPlatform;
  /** 限定平台子集；缺省 = 全部 5 家 */
  platforms?: CollectorPlatform[];
  /** 采集端；当前恒 web */
  end?: CollectEnd;
  /** 限定题型；缺省 = industry/brand 都拉 */
  query_type?: QueryType;
  /** 补采指定统计日 YYYY-MM-DD；缺省 = 服务端当天 */
  date?: string;
}

/** 拉取到的单个槽位载荷（worker 据此执行提问） */
export interface CollectorSlot {
  slot_id: string;          // 唯一：brand_id:date:query_id:platform:web
  task_id: string;          // 所属每日采集任务
  brand_id: string;
  query_id: number;
  query_type: QueryType;
  platform: CollectorPlatform;
  end: CollectEnd;
  date: string;             // YYYY-MM-DD
  question_sent: string;    // 实际发问口径（platform_query）
  question_list: { user_friendly: string; platform_query: string }[];
  mock_account_id: string | null;   // 中立账号池，后续补；当前 null
}

/** 拉取响应（统一壳 data）：单条；slot=null 表示当前无待采槽位 */
export interface PullSlotResponse {
  slot: CollectorSlot | null;
}

/** 单条信源（回答与信源分离：cited_urls 只承载引用来源，正文在 answer_text） */
export interface CitedUrl {
  /** 信源链接（必填） */
  url: string;
  /** 标题 */
  title?: string;
  /** 回答正文中的引用角标序号（[1][2]），与信源列表对应 */
  index?: number;
  /** 信源内容摘要 */
  snippet?: string;
  /** 来源站点名 */
  site_name?: string;
  /** 来源域名（手动统一信源名的键；未填时服务端从 url 兜底推导，小写、去 www） */
  domain?: string;
  /** 发布时间（worker 抓到的原始形态，不强制归一） */
  publish_time?: string;
}

/** 单条提交请求 */
export interface SubmitAnswerRequest {
  /** ok=有回答；empty=引擎无有效回答（也算有效槽位，进指标分母）；fail=采集失败 */
  status: 'ok' | 'empty' | 'fail';
  /** 完整回答原文（ok 必填；empty 可选；fail 忽略） */
  answer_text?: string;
  /** 解析前的信源清单（与正文分离，可选；url 必填，其余字段可选） */
  cited_urls?: CitedUrl[];
  /** 引擎/会话元信息（可选，如模型版本、会话 id） */
  model_meta?: unknown;
  /** fail 时的失败原因（必填） */
  error?: string;
}

/** 提交响应（统一壳 data） */
export interface SubmitAnswerResponse {
  slot_id: string;
  /** 回写后的槽位状态：ok/empty/fail（fail 未达重试上限时回退 pending，前端可忽略此差异） */
  status: SlotStatus;
  /** 已失败/超时次数（本次提交后；仅 fail 与运行超时递增，成功/empty 不变） */
  attempts: number;
  /** 落库的 raw_answer id；ok 或 empty(有原文) 时返回，否则 null */
  answer_id: string | null;
}
