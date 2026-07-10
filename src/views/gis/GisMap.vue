<template>
  <div class="page-container gis">
    <el-card shadow="never" class="filter">
      <el-radio-group v-model="layer">
        <el-radio-button value="distribution">分布图</el-radio-button>
        <el-radio-button value="lease">出租率热力</el-radio-button>
        <el-radio-button value="vacant">空置热力</el-radio-button>
      </el-radio-group>
    </el-card>
    <el-card shadow="never" class="map-card">
      <AmapContainer :points="points" :layer="layer" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AmapContainer from '@/components/AmapContainer/index.vue'

const layer = ref<'distribution' | 'lease' | 'vacant'>('distribution')
const points = ref([
  { lng: 121.5, lat: 31.2, name: '滨江国际写字楼' },
  { lng: 121.6, lat: 31.3, name: '阳光商业广场' }
])
</script>

<style scoped lang="scss">
.gis {
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
}
.map-card {
  flex: 1;
}
.map-card :deep(.el-card__body) {
  height: calc(100% - 40px);
}
</style>
