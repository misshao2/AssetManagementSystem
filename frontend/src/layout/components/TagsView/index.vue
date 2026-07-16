<template>
  <div class="tags-view">
    <el-tag
      v-for="tag in appStore.tagsView"
      :key="tag.path"
      :type="tag.path === activePath ? 'primary' : 'info'"
      :closable="tag.path !== '/dashboard'"
      class="tag"
      @click="go(tag.path)"
      @close="close(tag.path)"
    >
      {{ tag.title }}
    </el-tag>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/store/app'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
const activePath = ref(route.path)

watch(
  () => route.path,
  () => {
    activePath.value = route.path
    if (route.meta.title) {
      appStore.addTag({ path: route.path, title: String(route.meta.title) })
    }
  },
  { immediate: true }
)

function go(path: string) {
  router.push(path)
}

function close(path: string) {
  appStore.removeTag(path)
  if (path === activePath.value) {
    const last = appStore.tagsView[appStore.tagsView.length - 1]
    router.push(last ? last.path : '/dashboard')
  }
}
</script>

<style scoped lang="scss">
@use '../../../styles/variables.scss' as *;

.tags-view {
  height: $tags-height;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
  background: #fff;
  border-top: 1px solid #f0f0f0;
  overflow-x: auto;
}

.tag {
  cursor: pointer;
}
</style>
