'use strict';

module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;

  const MenuSchema = new Schema(
    {
      siteId: { type: Schema.Types.ObjectId, ref: 'Site', required: true, index: true },
      title: { type: String, required: true },
      path: { type: String, required: true },
      parentId: { type: Schema.Types.ObjectId, ref: 'Menu', default: null },
      sort: { type: Number, default: 0 },
      visible: { type: Boolean, default: true },
    },
    { timestamps: true }
  );

  MenuSchema.index({ siteId: 1, path: 1 }, { unique: true });

  return mongoose.model('Menu', MenuSchema);
};
