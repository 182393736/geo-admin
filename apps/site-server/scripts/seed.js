'use strict';

/**
 * 可选种子数据：本地联调用
 * 用法：cd apps/server && node scripts/seed.js
 * 需要 MongoDB 已启动
 */
const mongoose = require('mongoose');

const MONGODB_URL = process.env.MONGODB_URL || 'mongodb://127.0.0.1:27017/site_manage';

async function main() {
  await mongoose.connect(MONGODB_URL);

  const Site = mongoose.connection.collection('sites');
  const Page = mongoose.connection.collection('pages');
  // 旧版独立 menus 集合不再使用
  const Menu = mongoose.connection.collection('menus');

  await Site.deleteMany({ domain: 'localhost' });

  const now = new Date();
  const siteResult = await Site.insertOne({
    name: '本地演示站',
    domain: 'localhost',
    aliases: [ '127.0.0.1' ],
    status: 'active',
    meta: {
      title: '本地演示站',
      description: 'Site Manage 本地演示',
    },
    createdAt: now,
    updatedAt: now,
  });

  const siteId = siteResult.insertedId;

  await Menu.deleteMany({ siteId });
  await Page.deleteMany({ siteId });

  await Page.insertMany([
    {
      siteId,
      path: '/',
      title: '首页',
      parentId: null,
      sort: 0,
      visible: true,
      template: 'default',
      status: 'published',
      blocks: [
        {
          id: 'hero-1',
          type: 'hero',
          props: { heading: '欢迎来到演示站', subtitle: '多网站 SSR 系统架子已就绪' },
        },
        {
          id: 'rich-1',
          type: 'richtext',
          props: { html: '<p>这是通过域名 <code>localhost</code> 匹配到的首页 pageData。</p>' },
        },
      ],
      qa: [
        {
          id: 'qa-1',
          question: '什么是多网站系统？',
          answer: '一个后台可管理多个域名站点，前台按域名拉取对应 pageData 做 SSR。',
        },
      ],
      howto: [],
      steps: [],
      seo: { title: '首页 - 本地演示站', description: '演示首页' },
      createdAt: now,
      updatedAt: now,
    },
    {
      siteId,
      path: '/about',
      title: '关于',
      parentId: null,
      sort: 1,
      visible: true,
      template: 'default',
      status: 'published',
      blocks: [
        {
          id: 'hero-2',
          type: 'hero',
          props: { heading: '关于我们', subtitle: '多站点内容管理' },
        },
      ],
      qa: [],
      howto: [
        {
          id: 'howto-1',
          title: '如何创建站点',
          content: '在管理后台「网站管理」新建域名，再到「页面 / 菜单」添加内容。',
        },
      ],
      steps: [
        { id: 'step-1', title: '创建域名', content: '填写主域名并保存' },
        { id: 'step-2', title: '配置页面', content: '添加问答 / howto / steps 等结构化内容' },
        { id: 'step-3', title: '发布', content: '将状态设为已发布后前台即可访问' },
      ],
      seo: { title: '关于 - 本地演示站' },
      createdAt: now,
      updatedAt: now,
    },
  ]);

  console.log('Seed OK: domain=localhost, pages=/ and /about (menu+page unified)');
  await mongoose.disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
