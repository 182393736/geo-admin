'use strict';
/**
 * 指标计算服务 —— 所有公式均对照线上实测口径
 */
const { Service } = require('egg');

class MetricsService extends Service {
  /** 位次 → 权重分（rankWeights[0]=第1名40分 … 未上榜=0） */
  rankScore(position) {
    if (!position) return 0;
    const w = this.config.rankWeights;
    return position <= w.length ? w[position - 1] : 0;
  }
  /** 三率：分母恒为「问题数 × 引擎数 × 端」有效槽位 */
  rates(slots, mentions) {
    const denominator = slots.length;
    const mentioned = mentions.filter(m => m.is_target).length;
    const top3 = mentions.filter(m => m.is_target && m.position <= 3).length;
    const first = mentions.filter(m => m.is_target && m.position === 1).length;
    const pct = n => (denominator ? +(n / denominator * 100).toFixed(2) : 0);
    return { denominator, mentioned, top3, first,
      mention_rate: pct(mentioned), top3_rate: pct(top3), first_rate: pct(first) };
  }
  /** 口碑：观点极性占比 + 0-100 分 + 风险评级（阈值对前端 SentimentPage 逆向实锤） */
  reputation(opinions) {
    const n = { positive: 0, neutral: 0, negative: 0 };
    opinions.forEach(o => n[o.polarity]++);
    const total = n.positive + n.neutral + n.negative || 1;
    const ratio = {
      positive: +(n.positive / total).toFixed(4),
      neutral: +(n.neutral / total).toFixed(4),
      negative: +(n.negative / total).toFixed(4),
    };
    const rep_score = Math.round(ratio.positive * 100);
    const risk = rep_score >= 80 ? '健康' : rep_score >= 60 ? '中风险' : '高风险';
    return { ratio, rep_score, risk, total };
  }
  /** 环比：本期 vs 上一等长周期（与接口 cmp_start_date/cmp_end_date 对齐） */
  delta(cur, prev, { reverse = false } = {}) {
    const d = +(cur - prev).toFixed(2);
    return { delta: d, trend: d === 0 ? 'flat' : (d > 0) !== reverse ? 'up' : 'down' };
  }
}
module.exports = MetricsService;
