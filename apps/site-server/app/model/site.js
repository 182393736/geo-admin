'use strict';

module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;

  const SiteSchema = new Schema(
    {
      name: { type: String, required: true },
      domain: { type: String, required: true, unique: true, index: true },
      aliases: { type: [ String ], default: [] },
      status: { type: String, enum: [ 'active', 'inactive' ], default: 'active' },
      meta: {
        title: String,
        description: String,
        keywords: String,
        favicon: String,
        logo: String,
      },

      imageHost: { type: String, default: '' },
      imageKey: { type: String, default: '' },
      beian: { type: String, default: '' },
      brandZh: { type: String, default: '' },
      brandEn: { type: String, default: '' },
      companyZh: { type: String, default: '' },
      companyEn: { type: String, default: '' },
      sort: { type: Number, default: 0 },
      enabled: { type: Boolean, default: true },
      hasSearch: { type: Boolean, default: false },
      googleAdsAccount: { type: String, default: '' },
      googleAdsScript: { type: String, default: '' },
      tencentAdsVerify: { type: String, default: '' },
      googleAnalyticsId: { type: String, default: '' },
      baiduAnalyticsId: { type: String, default: '' },
      bingAnalyticsId: { type: String, default: '' },
      bingPushKey: { type: String, default: '' },
      baiduPushToken: { type: String, default: '' },
    },
    { timestamps: true }
  );

  return mongoose.model('Site', SiteSchema);
};
