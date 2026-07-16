<template>
  <div class="screen">
    <el-row :gutter="16">
      <el-col :span="6" v-for="m in metrics" :key="m.label">
        <el-card shadow="never" class="m">
          <div class="label">{{ m.label }}</div>
          <div class="value">{{ m.value }}</div>
        </el-card>
      </el-col>
    </el-row>
    <el-row :gutter="16" style="margin-top: 16px">
      <el-col :span="12">
        <el-card shadow="never"><template #header>资产分布</template><Chart :option="pie" height="300px" /></el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="never"><template #header>经营趋势</template><Chart :option="line" height="300px" /></el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import type { EChartsOption } from 'echarts'
import Chart from '@/components/Chart/index.vue'

const metrics = [
  { label: '资产总额', value: '¥ 48.6 亿' },
  { label: '出租率', value: '82.4%' },
  { label: '年度租金收入', value: '¥ 3.2 亿' },
  { label: '空置面积', value: '62.4 万㎡' }
]

const pie: EChartsOption = {
  tooltip: { trigger: 'item' },
  series: [{ type: 'pie', radius: ['40%', '65%'], data: [{ name: '写字楼', value: 520 }, { name: '商业', value: 310 }, { name: '产业园', value: 280 }] }]
}

const line: EChartsOption = {
  tooltip: { trigger: 'axis' },
  xAxis: { type: 'category', data: ['Q1', 'Q2', 'Q3', 'Q4'] },
  yAxis: { type: 'value' },
  series: [{ type: 'line', smooth: true, data: [62, 75, 81, 82.4] }]
}
</script>

<style scoped>
.screen { padding: 16px; background: #0a1f3c; color: #cfe3ff; min-height: 100%; }
.m { background: #0f2c52; border: none; color: #cfe3ff; text-align: center; }
.m .label { color: #8fb4e6; font-size: 13px; }
.m .value { font-size: 24px; font-weight: 700; margin-top: 8px; }
.screen :deep(.el-card) { background: #0f2c52; border: none; color: #cfe3ff; }
</style>
