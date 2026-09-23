// This file is created by egg-ts-helper@2.1.1
// Do not modify this file!!!!!!!!!
/* eslint-disable */

import 'egg';
type AnyClass = new (...args: any[]) => any;
type AnyFunc<T = any> = (...args: any[]) => T;
type CanExportFunc = AnyFunc<Promise<any>> | AnyFunc<IterableIterator<any>>;
type AutoInstanceType<T, U = T extends CanExportFunc ? T : T extends AnyFunc ? ReturnType<T> : T> = U extends AnyClass ? InstanceType<U> : U;
import ExportMenu = require('../../../app/service/menu');
import ExportPage = require('../../../app/service/page');
import ExportSite = require('../../../app/service/site');
import ExportSsr = require('../../../app/service/ssr');

declare module 'egg' {
  interface IService {
    menu: AutoInstanceType<typeof ExportMenu>;
    page: AutoInstanceType<typeof ExportPage>;
    site: AutoInstanceType<typeof ExportSite>;
    ssr: AutoInstanceType<typeof ExportSsr>;
  }
}
