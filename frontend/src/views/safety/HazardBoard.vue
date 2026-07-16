<template>
  <div class="page-container">
    <el-row :gutter="16">
      <el-col v-for="m in metrics" :key="m.label" :span="6">
        <el-card shadow="hover" class="metric"><div class="label">{{ m.label }}</div><div class="value">{{ m.value }}</div></el-card>
      </el-col>
    </el-row>
    <el-row :gutter="16" style="margin-top: 16px">
      <el-col :span="12">
        <el-card shadow="hover"><template #header>隐患整改进度</template><Chart :option="barOption" height="300px" /></el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover"><template #header>风险等级分布</template><Chart :option="pieOption" height="300px" /></el-card>
      </el-col>
    </el-row>
    <el-card shadow="hover" style="margin-top: 16px">
      <template #header>隐患位置分布（地图）</template>
      <AmapContainer :points="points" layer="vacant" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { EChartsOption } from 'echarts'
import Chart from '@/components/Chart/index.vue'
import AmapContainer from '@/components/AmapContainer/index.vue'
import { getSafetyDashboard } from '@/api/safety'

const metrics = ref<any[]>([])
const points = ref<any[]>([])

onMounted(async () => {
  const d = await getSafetyDashboard()
  metrics.value = [
    { label: '今日巡检完成率', value: d.inspectRate },
    { label: '隐患数量', value: d.hazard },
    { label: '待处理工单', value: d.workOrder },
    { label: '预警数', value: d.warn }
  ]
  points.value = [
    { lng: 121.5, lat: 31.2, name: '滨江国际写字楼' },
    { lng: 121.47, lat: 31.22, name: '阳光商业广场' },
    { lng: 120.2, lat: 30.3, name: '智造产业园' }
  ]
})

const barOption: EChartsOption = {
  tooltip: { trigger: 'axis' }, legend: { bottom: 0 },
  xAxis: { type: 'category', data: ['一般隐患', '重大隐患'] },
  yAxis: { type: 'value' },
  series: [
    { name: '已整改', type: 'bar', data: [12, 3], itemStyle: { color: '#67c23a' } },
    { name: '整改中', type: 'bar', data: [4, 1], itemStyle: { color: '#e6a23c' } }
  ]
}
const pieOption: EChartsOption = {
  tooltip: { trigger: 'item' },
  series: [{ type: 'pie', radius: ['40%', '65%'], data: [{ name: '一般', value: 16 }, { name: '重大', value: 2 }] }]
}
</script>

<style scoped lang="scss">
.metric { text-align: center; }
.metric .label { color: #909399; font-size: 13px; }
.metric .value { font-size: 24px; font-weight: 700; margin-top: 8px; }
</style>
