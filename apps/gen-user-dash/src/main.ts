import { createApp } from 'vue';
import { createPinia } from 'pinia';
import ArcoVue from '@arco-design/web-vue';
import App from './App.vue';
import router from './router';
import '@arco-design/web-vue/dist/arco.css';
import './styles/global.scss';
import { ingestConsoleToken } from './utils/site';

// 站点「前往控制台」回传的 token（#token=）在挂载前吸收，写入 localStorage，
// 使后续路由守卫 / 鉴权 store 直接识别为已登录
ingestConsoleToken();

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(ArcoVue);

app.mount('#app');
