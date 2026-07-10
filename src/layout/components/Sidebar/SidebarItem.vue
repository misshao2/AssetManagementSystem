<template>
  <el-sub-menu v-if="item.children && item.children.length" :index="resolvePath(item.path)">
    <template #title>
      <el-icon v-if="item.icon"><component :is="item.icon" /></el-icon>
      <span>{{ item.title }}</span>
    </template>
    <SidebarItem
      v-for="child in item.children"
      :key="child.id"
      :item="child"
      :base-path="resolvePath(item.path)"
    />
  </el-sub-menu>

  <el-menu-item v-else :index="resolvePath(item.path)">
    <el-icon v-if="item.icon"><component :is="item.icon" /></el-icon>
    <template #title>{{ item.title }}</template>
  </el-menu-item>
</template>

<script setup lang="ts">
import type { MenuNode } from '@/types'

const props = defineProps<{
  item: MenuNode
  basePath: string
}>()

function resolvePath(path: string): string {
  if (/^https?:\/\//.test(path)) return path
  // 菜单 path 在 mock 中已是完整路由路径（如 cert/archive），动态路由直接以其生成，
  // 故此处统一按绝对路径处理，避免父级 path 重复拼接导致 404。
  return path.startsWith('/') ? path : `/${path}`
}
</script>
