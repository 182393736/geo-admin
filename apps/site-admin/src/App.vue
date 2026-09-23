<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const activeMenu = computed(() => route.path)

const menus = [
  { path: '/sites', title: '域名 / 站点', icon: 'Monitor' },
  { path: '/pages', title: '页面配置', icon: 'Document' },
]

function go(path: string) {
  router.push(path)
}
</script>

<template>
  <el-config-provider size="small">
    <el-container class="layout">
      <el-aside width="200px" class="aside">
        <div class="logo">Site Manage</div>
        <el-menu
          :default-active="activeMenu"
          background-color="#001529"
          text-color="#ffffff"
          active-text-color="#409eff"
          @select="go"
        >
          <el-menu-item v-for="m in menus" :key="m.path" :index="m.path">
            <el-icon><component :is="m.icon" /></el-icon>
            <span>{{ m.title }}</span>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <el-container>
        <el-header height="48px" class="header">
          <span class="header-title">HANYUAI GEO · 内容后台</span>
        </el-header>
        <el-main class="main">
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </el-config-provider>
</template>

<style>
html,
body,
#app {
  margin: 0;
  height: 100%;
  font-family: 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
}

.layout {
  height: 100%;
}

.aside {
  background: #001529;
  color: #fff;
}

.aside .el-menu {
  border-right: none;
  background: transparent !important;
}

.aside .el-menu-item {
  color: #ffffff !important;
  height: 40px !important;
  line-height: 40px !important;
}

.aside .el-menu-item .el-icon {
  color: #ffffff !important;
  font-size: 16px;
}

.aside .el-menu-item span {
  color: #ffffff !important;
  font-size: 13px;
}

.aside .el-menu-item:hover,
.aside .el-menu-item:focus {
  background-color: rgba(255, 255, 255, 0.08) !important;
}

.aside .el-menu-item.is-active {
  color: #409eff !important;
  background-color: rgba(64, 158, 255, 0.15) !important;
}

.aside .el-menu-item.is-active .el-icon,
.aside .el-menu-item.is-active span {
  color: #409eff !important;
}

.logo {
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
  color: #fff;
  letter-spacing: 0.02em;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.header {
  display: flex;
  align-items: center;
  border-bottom: 1px solid #ebeef5;
  background: #fff;
}

.header-title {
  font-size: 14px;
  font-weight: 600;
}

.main {
  background: #f5f7fa;
  padding: 12px;
}
</style>
