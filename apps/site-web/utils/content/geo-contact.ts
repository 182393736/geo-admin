import type { HubContactContent } from '@site-manage/shared'
import { GEO_SITE } from '../geo-seo'

/** 联系我们默认文案与渠道（可被 CMS hubContent 覆盖） */
export const GEO_CONTACT_DEFAULT: HubContactContent = {
  version: 1,
  eyebrow: '联系我们',
  title: '有事直接找我们',
  titleAccent: '',
  description:
    '产品演示、商务合作、账号与计费问题，按渠道联系即可。不设站内工单表单，跟进在工作台与邮件完成。',
  channels: [
    {
      id: 'demo',
      label: '预约产品演示',
      value: '适合增长、品牌与内容团队',
      href: '/demo',
      kind: 'link',
      note: '走通问题集 → 引擎采样 → 引用缺口 → 行动清单',
    },
    {
      id: 'support',
      label: '产品与支持',
      value: GEO_SITE.email,
      href: `mailto:${GEO_SITE.email}`,
      kind: 'email',
      note: '账号、监测、发稿与使用问题',
    },
    {
      id: 'partner',
      label: '商务与合作',
      value: GEO_SITE.partnerEmail,
      href: `mailto:${GEO_SITE.partnerEmail}`,
      kind: 'email',
      note: '代理、OEM、API 与私有化',
    },
    {
      id: 'console',
      label: '进入工作台',
      value: '登录后开通套餐与跟进工单',
      href: 'console:/login',
      kind: 'link',
      note: '带上来源标记，方便商务认领',
    },
  ],
  faq: [
    {
      q: '想先看效果，从哪开始？',
      a: '先做免费诊断，或打开任意 GEO工具输入品牌。需要完整演示再预约。',
    },
    {
      q: '邮件一般多久回复？',
      a: '工作日通常 1 个工作日内回复。已登录用户优先按工作台账号跟进。',
    },
    {
      q: '定制版、OEM 找谁？',
      a: '发邮件到商务邮箱，说明场景与规模；也可先预约演示再谈合同。',
    },
  ],
  note: '请勿在邮件中发送密码或密钥。具体报价与合同以工作台及商务确认为准。',
}
