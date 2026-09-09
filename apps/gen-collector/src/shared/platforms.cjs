'use strict';
/**
 * 5 个 AI 平台的网页端地址（主进程与渲染进程共用，单一事实源）
 * 对应采集平台：doubao / deepseek / wenxin / qwen / yuanbao
 */
module.exports = [
  { key: 'doubao', name: '豆包', url: 'https://www.doubao.com/chat/' },
  { key: 'deepseek', name: 'DeepSeek', url: 'https://chat.deepseek.com/' },
  { key: 'wenxin', name: '文心一言', url: 'https://yiyan.baidu.com/' },
  { key: 'qwen', name: '通义千问', url: 'https://tongyi.aliyun.com/' },
  { key: 'yuanbao', name: '腾讯元宝', url: 'https://yuanbao.tencent.com/' },
];
