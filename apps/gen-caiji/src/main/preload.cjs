'use strict';
/**
 * 预加载脚本：以 contextBridge 暴露最小化 API 给渲染层（contextIsolation 开启）
 */
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  /** 拉取 IP 列表（公开 POST 接口，主进程 Node fetch 规避渲染层 CORS） */
  fetchIpList: () => ipcRenderer.invoke('ip-list:fetch'),
  /** 打开该 IP 的独立浏览器会话（launchPersistentContext） */
  openBrowser: ip => ipcRenderer.invoke('browser:open', ip),
  /** 关闭该 IP 的整个浏览器会话（数据保留，可再开） */
  closeBrowser: ip => ipcRenderer.invoke('browser:close', ip),
  /** 在该 IP 的浏览器会话内打开某个平台标签页 */
  openPlatform: (ip, platform) => ipcRenderer.invoke('browser:open-platform', { ip, platform }),
  /** 关闭该 IP 会话内的某个平台标签页 */
  closePlatform: (ip, platform) => ipcRenderer.invoke('platform:close', { ip, platform }),
  /** 订阅平台登录态变化（主进程推送 { ip, platform, loggedIn, username }） */
  onPlatformAuth: cb => {
    const handler = (_e, data) => { try { cb(data); } catch { /* ignore */ } };
    ipcRenderer.on('platform-auth-changed', handler);
    return () => ipcRenderer.removeListener('platform-auth-changed', handler);
  },
});
