<template>
  <div class="geo-layout">
    <GeoHeader />
    <slot />
    <GeoFooter />
    <GeoAuthModal />
  </div>
</template>

<style>
@import '~/assets/css/geo-site.css';
</style>
