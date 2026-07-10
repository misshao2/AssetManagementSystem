<template>
  <div ref="el" class="amap-container">
    <div v-if="!hasKey" class="placeholder">
      <el-empty description="未配置地图 Key，请在 .env 设置 VITE_APP_AMAP_KEY">
        <template #image>
          <el-icon :size="48"><MapLocation /></el-icon>
        </template>
      </el-empty>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { MapLocation } from '@element-plus/icons-vue'

const props = defineProps<{
  points?: { lng: number; lat: number; name?: string; info?: Record<string, any> }[]
  layer?: 'distribution' | 'lease' | 'vacant'
}>()

const el = ref<HTMLElement | null>(null)
const hasKey = !!import.meta.env.VITE_APP_AMAP_KEY

onMounted(() => {
  if (!hasKey || !el.value) return
  // 真实集成：动态加载高德 JS API（window.AMap），渲染点位/聚合/热力图层。
  // 私有化环境可替换为天地图/离线 GIS 瓦片，接口保持不变。
  console.info('[AmapContainer] 地图初始化（需配置 VITE_APP_AMAP_KEY）', props.points, props.layer)
})
</script>

<style scoped>
.amap-container {
  width: 100%;
  height: 100%;
  min-height: 400px;
  border-radius: 4px;
  overflow: hidden;
  background: #eef0f6;
}
.placeholder {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
