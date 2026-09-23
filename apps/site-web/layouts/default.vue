<script setup lang="ts">
const sitePage = useSitePage()

const siteName = computed(() => sitePage.value?.site?.name || 'Site')
const menus = computed(() => sitePage.value?.menus || [])
</script>

<template>
  <div class="layout">
    <header class="header">
      <div class="container header-inner">
        <NuxtLink to="/" class="brand">{{ siteName }}</NuxtLink>
        <nav class="nav">
          <NuxtLink
            v-for="menu in menus"
            :key="menu._id"
            :to="menu.path"
            class="nav-link"
          >
            {{ menu.title }}
          </NuxtLink>
        </nav>
      </div>
    </header>

    <main class="main">
      <div class="container">
        <slot />
      </div>
    </main>

    <footer class="footer">
      <div class="container">
        <p>&copy; {{ new Date().getFullYear() }} {{ siteName }}</p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  background: #fff;
  border-bottom: 1px solid var(--color-border);
}

.header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
}

.brand {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text);
  text-decoration: none;
}

.nav {
  display: flex;
  gap: 1.25rem;
}

.nav-link {
  color: var(--color-muted);
  font-size: 0.95rem;
}

.nav-link.router-link-active {
  color: var(--color-primary);
  font-weight: 600;
}

.main {
  flex: 1;
  padding: 2rem 0;
}

.footer {
  border-top: 1px solid var(--color-border);
  padding: 1.5rem 0;
  color: var(--color-muted);
  font-size: 0.875rem;
}
</style>
