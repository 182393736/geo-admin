/** PT12 客户站通用 — 刻意浅结构，对比旗舰深模板 */
export const SAMPLE_DEFAULT = {
  title: '关于我们',
  lead:
    '这是客户站通用页（pageKind=default）示例：结构较浅，由 CMS blocks 拼装，不强制 GEO 深模板（无强制方法元数据、证据包、问题集版本等）。适合品牌介绍、活动页与帮助文档。旗舰 GEO 站的 learn / report / glossary 等类型使用更深骨架。',
  blocks: [
    {
      type: 'hero',
      heading: '多站点内容管理',
      subtitle: '按域名发布页面与导航，让各站点共享渲染能力，又保持独立信息架构。',
    },
    {
      type: 'richtext',
      html: '<p>客户站页面以 <strong>blocks / qa / howto</strong> 为主，编辑在后台完成。你可以把本页理解为「浅结构」对照：当业务是客户品牌站而非 GEO 权威站时，不必为每一页填满报告级字段。</p><p>若同一套渲染服务也承载旗舰站，则通过 <code>pageKind</code> 分流模板：default 走通用 blocks；learn / report 等走答案前置、FAQ、方法元数据等深结构。</p>',
    },
    {
      type: 'richtext',
      html: '<h3>适用场景</h3><ul><li>公司介绍与联系方式</li><li>活动落地页</li><li>帮助中心短文</li><li>不需要可引用方法口径的内容</li></ul>',
    },
  ],
  qa: [
    {
      q: '如何创建站点？',
      a: '在管理后台添加域名与站点配置，再创建页面并设为已发布。导航与页面对应该站点。',
    },
    {
      q: '和旗舰 GEO 站是什么关系？',
      a: '可共享渲染与组件能力；旗舰使用更深的 pageKind 模板与内容规范，客户站 default 保持浅结构。',
    },
    {
      q: '客户站也能做 GEO 长文吗？',
      a: '可以选 learn / insight 等 kind（若已对客户开放），否则用 richtext + qa 近似，但不具备报告级引用元数据约束。',
    },
  ],
}
