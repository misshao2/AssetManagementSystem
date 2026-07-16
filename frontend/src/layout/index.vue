<template>
  <div class="app-wrapper" :class="{ 'is-collapsed': appStore.sidebarCollapsed }">
    <Sidebar class="sidebar" />
    <div class="main-container">
      <Navbar />
      <TagsView />
      <section class="app-main">
        <router-view v-slot="{ Component }">
          <keep-alive>
            <component :is="Component" />
          </keep-alive>
        </router-view>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAppStore } from '@/store/app'
import Sidebar from './components/Sidebar/index.vue'
import Navbar from './components/Navbar/index.vue'
import TagsView from './components/TagsView/index.vue'

const appStore = useAppStore()
</script>

<style scoped lang="scss">
@use '../styles/variables.scss' as *;

.app-wrapper {
  display: flex;
  height: 100%;
}

.sidebar {
  width: $sidebar-width;
  flex-shrink: 0;
  transition: width 0.28s;
  background: $sidebar-bg;
  overflow: hidden;
}

.is-collapsed .sidebar {
  width: $sidebar-collapsed-width;
}

.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.app-main {
  flex: 1;
  padding: 16px;
  overflow: auto;
  background: $content-bg;
}
</style>
