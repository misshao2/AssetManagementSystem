<template>
  <div class="page-container">
    <el-row :gutter="16">
      <el-col v-for="m in metrics" :key="m.label" :span="6">
        <el-card shadow="hover" class="m">
          <div class="label">{{ m.label }}</div>
          <div class="value">{{ m.value }}</div>
        </el-card>
      </el-col>
    </el-row>
    <el-card shadow="hover" style="margin-top: 16px">
      <template #header>隐患整改进度</template>
      <Chart :option="barOption" height="300px" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import type { EChartsOption } from 'echarts'
import Chart from '@/components/Chart/index.vue'

const metrics = [
  { label: '今日巡检完成率', value: '92%' },
  { label: '隐患数量', value: '18' },
  { label: '待处理工单', value: '7' },
  { label: '预警数', value: '3' }
]

const barOption: EChartsOption = {
  tooltip: { trigger: 'axis' },
  xAxis: { type: 'category', data: ['一般隐患', '重大隐患'] },
  yAxis: { type: 'value' },
  series: [
    { name: '已整改', type: 'bar', data: [12, 3], itemStyle: { color: '#67c23a' } },
    { name: '整改中', type: 'bar', data: [4, 1], itemStyle: { color: '#e6a23c' } }
  ]
}
</script>

<style scoped>
.m { text-align: center; }
.m .label { color: #909399; font-size: 13px; }
.m .value { font-size: 24px; font-weight: 700; margin-top: 8px; }
</style>
