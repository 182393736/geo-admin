// This file is created by egg-ts-helper@2.1.1
// Do not modify this file!!!!!!!!!
/* eslint-disable */

import 'egg';
import ExportHome = require('../../../app/controller/home');
import ExportMenu = require('../../../app/controller/menu');
import ExportPage = require('../../../app/controller/page');
import ExportSite = require('../../../app/controller/site');
import ExportSsr = require('../../../app/controller/ssr');

declare module 'egg' {
  interface IController {
    home: ExportHome;
    menu: ExportMenu;
    page: ExportPage;
    site: ExportSite;
    ssr: ExportSsr;
  }
}
