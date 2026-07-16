<template>
  <div class="sidebar-container">
    <div class="logo">{{ title }}</div>
    <el-scrollbar>
      <el-menu
        :default-active="activeMenu"
        :collapse="appStore.sidebarCollapsed"
        :collapse-transition="false"
        router
        background-color="#001529"
        text-color="#bfcbd9"
        active-text-color="#409eff"
      >
        <SidebarItem
          v-for="menu in menus"
          :key="menu.id"
          :item="menu"
          base-path=""
        />
      </el-menu>
    </el-scrollbar>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/store/user'
import { useAppStore } from '@/store/app'
import SidebarItem from './SidebarItem.vue'

const route = useRoute()
const userStore = useUserStore()
const appStore = useAppStore()

const menus = computed(() => userStore.menus)
const activeMenu = computed(() => route.path)
const title = import.meta.env.VITE_APP_TITLE
</script>

<style scoped lang="scss">
.sidebar-container {
  height: 100%;
  background: #001529;
}

.logo {
  height: 50px;
  line-height: 50px;
  text-align: center;
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
}

.el-menu {
  border-right: none;
}
</style>
