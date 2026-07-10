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
  // 已带前导斜杠：视为完整路径，直接返回（避免父级 base 重复拼接）
  if (path.startsWith('/')) return path
  const base = props.basePath.replace(/\/$/, '')
  // 子菜单 path 已包含父级前缀（如 system/org）时，不再拼接 base
  if (base && path.startsWith(base.replace(/^\//, '') + '/')) return `/${path}`
  return base ? `${base}/${path}` : `/${path}`
}
</script>
