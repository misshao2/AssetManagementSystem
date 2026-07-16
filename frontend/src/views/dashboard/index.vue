<template>
  <div class="dashboard">
    <el-row :gutter="16">
      <el-col v-for="m in metrics" :key="m.label" :span="6">
        <el-card shadow="hover" class="metric">
          <div class="label">{{ m.label }}</div>
          <div class="value">{{ m.value }}</div>
          <div class="unit">{{ m.unit }}</div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16" class="charts">
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>资产类型分布</template>
          <Chart :option="typeOption" height="300px" />
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>出租率趋势</template>
          <Chart :option="trendOption" height="300px" />
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="hover" class="shortcut">
      <template #header>快捷入口</template>
      <el-space wrap>
        <el-button v-for="s in shortcuts" :key="s.path" type="primary" plain @click="$router.push(s.path)">
          {{ s.title }}
        </el-button>
      </el-space>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { EChartsOption } from 'echarts'
import Chart from '@/components/Chart/index.vue'

const metrics = [
  { label: '资产总数', value: '1,286', unit: '处' },
  { label: '总建筑面积', value: '356.8', unit: '万㎡' },
  { label: '平均出租率', value: '82.4', unit: '%' },
  { label: '待处置资产', value: '37', unit: '处' }
]

const shortcuts = [
  { title: '资产台账', path: '/asset/list' },
  { title: 'GIS 分布', path: '/gis/map' },
  { title: '权证管理', path: '/cert/overview' },
  { title: '招商看板', path: '/lease/board' },
  { title: '账单管理', path: '/finance/bill' },
  { title: '安巡总览', path: '/safety/dashboard' },
  { title: '经营大屏', path: '/report/screen' }
]

const typeOption = computed<EChartsOption>(() => ({
  tooltip: { trigger: 'item' },
  legend: { bottom: 0 },
  series: [
    {
      type: 'pie',
      radius: ['40%', '65%'],
      data: [
        { name: '写字楼', value: 520 },
        { name: '商业', value: 310 },
        { name: '产业园', value: 280 },
        { name: '公寓', value: 120 },
        { name: '商铺', value: 56 }
      ]
    }
  ]
}))

const trendOption = computed<EChartsOption>(() => ({
  tooltip: { trigger: 'axis' },
  xAxis: { type: 'category', data: ['1月', '2月', '3月', '4月', '5月', '6月'] },
  yAxis: { type: 'value', axisLabel: { formatter: '{value}%' } },
  series: [{ type: 'line', smooth: true, data: [78, 80, 79, 81, 83, 82.4] }]
}))
</script>

<style scoped lang="scss">
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.metric {
  text-align: center;
}
.metric .label {
  color: #909399;
  font-size: 13px;
}
.metric .value {
  font-size: 26px;
  font-weight: 700;
  color: #303133;
  margin: 8px 0 2px;
}
.metric .unit {
  color: #c0c4cc;
  font-size: 12px;
}
.charts {
  margin: 0 !important;
}
</style>
