// This file is created by egg-ts-helper@2.1.1
// Do not modify this file!!!!!!!!!
/* eslint-disable */

import 'egg';
import ExportMenu = require('../../../app/model/menu');
import ExportPage = require('../../../app/model/page');
import ExportSite = require('../../../app/model/site');

declare module 'egg' {
  interface IModel {
    Menu: ReturnType<typeof ExportMenu>;
    Page: ReturnType<typeof ExportPage>;
    Site: ReturnType<typeof ExportSite>;
  }
}
