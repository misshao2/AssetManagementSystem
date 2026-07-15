<template>
  <div ref="mapEl" class="amap-container">
    <!-- 加载中 -->
    <div v-if="loading" class="map-overlay">
      <el-icon class="is-loading" :size="36"><Loading /></el-icon>
      <span>地图加载中...</span>
    </div>

    <!-- 加载失败 -->
    <div v-else-if="errorMsg" class="map-overlay error-overlay">
      <el-icon :size="36"><WarningFilled /></el-icon>
      <span>{{ errorMsg }}</span>
    </div>

    <!-- 未配置 Key -->
    <div v-else-if="!hasKey" class="map-overlay placeholder">
      <el-empty description="未配置地图 Key，请在 .env 设置 VITE_APP_AMAP_KEY">
        <template #image>
          <el-icon :size="48"><MapLocation /></el-icon>
        </template>
      </el-empty>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { Loading, MapLocation, WarningFilled } from '@element-plus/icons-vue'
import AMapLoader from '@amap/amap-jsapi-loader'

// ==================== Props ====================
const props = defineProps<{
  points?: {
    lng: number
    lat: number
    name?: string
    leaseRate?: number
    area?: number
    assetType?: string
    status?: string
    info?: Record<string, any>
  }[]
  layer?: 'distribution' | 'lease' | 'vacant'
}>()

// ==================== 状态 ====================
const mapEl = ref<HTMLElement | null>(null)
const loading = ref(false)
const errorMsg = ref('')
const hasKey = !!import.meta.env.VITE_APP_AMAP_KEY

let AMap: any = null
let mapInstance: any = null
let currentMarkers: any[] = []
let currentHeatmap: any = null
let currentInfoWindow: any = null

// ==================== 地图初始化 ====================
async function initMap() {
  if (!hasKey || !mapEl.value) return

  loading.value = true
  errorMsg.value = ''

  try {
    AMap = await AMapLoader.load({
      key: import.meta.env.VITE_APP_AMAP_KEY,
      version: '2.0',
      plugins: [
        'AMap.Scale',
        'AMap.ToolBar',
        'AMap.Marker',
        'AMap.InfoWindow',
        'AMap.HeatMap'
      ]
    })

    mapInstance = new AMap.Map(mapEl.value, {
      zoom: 11,
      center: [121.47, 31.23], // 默认上海中心（与 mock 数据匹配）
      viewMode: '2D'
    })

    // 添加控件
    mapInstance.addControl(new AMap.Scale())
    mapInstance.addControl(new AMap.ToolBar())

    loading.value = false
    renderLayer()
  } catch (err: any) {
    loading.value = false
    const msg = err?.message || String(err)
    if (msg.includes('key') || msg.toLowerCase().includes('invalid')) {
      errorMsg.value = '高德地图 Key 无效，请检查 .env 配置'
    } else {
      errorMsg.value = '地图加载失败，请检查网络连接'
    }
    console.error('[AmapContainer] 地图加载失败:', err)
  }
}

// ==================== 图层清除 ====================
function clearLayer() {
  if (!mapInstance) return

  // 清除所有标记
  currentMarkers.forEach((m) => {
    m.setMap(null)
    m.clearEvents?.()
  })
  currentMarkers = []

  // 清除热力图
  if (currentHeatmap) {
    currentHeatmap.setMap(null)
    currentHeatmap = null
  }

  // 关闭信息窗
  if (currentInfoWindow) {
    currentInfoWindow.close()
    currentInfoWindow = null
  }
}

// ==================== 图层渲染 ====================
function renderLayer() {
  if (!mapInstance || !props.points?.length) return

  clearLayer()

  if (props.layer === 'lease' || props.layer === 'vacant') {
    renderHeatmap()
  } else {
    renderMarkers()
  }

  // 自适应视野：让所有点位都可见
  mapInstance.setFitView(null, false, [60, 60, 60, 60])
}

// ==================== 标记点渲染 ====================
function renderMarkers() {
  if (!mapInstance || !AMap || !props.points) return

  props.points.forEach((point) => {
    const marker = new AMap.Marker({
      position: [point.lng, point.lat],
      title: point.name || '',
      anchor: 'bottom-center'
    })

    const content = buildInfoContent(point)
    marker.on('click', () => {
      if (currentInfoWindow) currentInfoWindow.close()
      currentInfoWindow = new AMap.InfoWindow({
        content,
        offset: new AMap.Pixel(0, -36)
      })
      currentInfoWindow.open(mapInstance, marker.getPosition())
    })

    marker.setMap(mapInstance)
    currentMarkers.push(marker)
  })
}

// ==================== 热力图渲染 ====================
function renderHeatmap() {
  if (!mapInstance || !AMap || !props.points) return

  const isLease = props.layer === 'lease'

  const heatData = props.points
    .filter((p) => p.lng != null && p.lat != null)
    .map((p) => ({
      lng: p.lng,
      lat: p.lat,
      count: isLease
        ? Math.round((p.leaseRate || 0) * 100)
        : Math.round((1 - (p.leaseRate || 0)) * 100)
    }))

  if (!heatData.length) return

  currentHeatmap = new AMap.HeatMap(mapInstance, {
    radius: 30,
    opacity: [0.2, 0.9],
    gradient: isLease
      ? {
          // 出租率：绿 → 黄 → 红（高出租率为热区）
          0.2: '#2c9678',
          0.5: '#f9c270',
          0.8: '#e65c37',
          1.0: '#b52a1c'
        }
      : {
          // 空置率：蓝 → 紫 → 粉（高空置率为热区）
          0.2: '#3a7bd5',
          0.5: '#6c5ce7',
          0.8: '#a855f7',
          1.0: '#d946ef'
        }
  })

  currentHeatmap.setDataSet({
    data: heatData,
    max: 100
  })
}

// ==================== 信息窗内容 ====================
function buildInfoContent(point: any): string {
  const p = point || {}
  const name = p.name || '未命名资产'
  const leaseRate = p.leaseRate != null ? `${Math.round(p.leaseRate * 100)}%` : '-'
  const area = p.area ? `${(p.area / 10000).toFixed(1)}万㎡` : '-'

  return `
    <div style="padding: 6px 12px; min-width: 180px; font-size: 13px; line-height: 1.8;">
      <div style="font-weight: 600; font-size: 14px; color: #303133; margin-bottom: 4px;">${name}</div>
      <div style="color: #909399;">出租率：<span style="color: #409eff; font-weight: 600;">${leaseRate}</span></div>
      <div style="color: #909399;">面积：${area}</div>
    </div>
  `
}

// ==================== 响应数据 / 图层变化 ====================
watch(
  () => [props.points, props.layer],
  () => {
    if (mapInstance && !loading.value && !errorMsg.value) {
      renderLayer()
    }
  },
  { deep: true }
)

onMounted(() => {
  if (hasKey) initMap()
})

onUnmounted(() => {
  clearLayer()
  if (mapInstance) {
    mapInstance.destroy()
    mapInstance = null
  }
})
</script>

<style scoped>
.amap-container {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 400px;
  border-radius: 4px;
  overflow: hidden;
  background: #eef0f6;
}

.map-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: #f5f7fa;
  z-index: 10;
  color: #909399;
  font-size: 14px;
}

.map-overlay.error-overlay {
  color: #e6a23c;
  background: #fdf6ec;
}

.placeholder {
  background: transparent;
}
</style>
