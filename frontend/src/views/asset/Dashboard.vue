<template>
  <div class="page-container">
    <el-row :gutter="16">
      <el-col v-for="m in metrics" :key="m.label" :span="6">
        <el-card shadow="hover" class="metric">
          <div class="label">{{ m.label }}</div>
          <div class="value">{{ m.value }}<small>{{ m.unit }}</small></div>
        </el-card>
      </el-col>
    </el-row>
    <el-row :gutter="16" style="margin-top: 16px">
      <el-col :span="12">
        <el-card shadow="hover"><template #header>资产类型分布</template><Chart :option="typeOption" height="300px" /></el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover"><template #header>出租率趋势</template><Chart :option="trendOption" height="300px" /></el-card>
      </el-col>
    </el-row>
    <el-row :gutter="16" style="margin-top: 16px">
      <el-col :span="12">
        <el-card shadow="hover"><template #header>资产状态占比</template><Chart :option="statusOption" height="300px" /></el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover"><template #header>空置面积热力（区域）</template><Chart :option="vacantOption" height="300px" /></el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { EChartsOption } from 'echarts'
import Chart from '@/components/Chart/index.vue'
import { getAssetDashboard } from '@/api/asset'

const metrics = ref<any[]>([])

onMounted(async () => {
  const d = await getAssetDashboard()
  metrics.value = [
    { label: '资产总数', value: d.total, unit: '处' },
    { label: '总建筑面积', value: d.totalArea, unit: '万㎡' },
    { label: '平均出租率', value: d.leaseRate, unit: '%' },
    { label: '空置面积', value: d.vacantArea, unit: '万㎡' },
    { label: '本月新增', value: d.monthAdd, unit: '处' },
    { label: '待处置', value: d.toDispose, unit: '处' },
    { label: '预警数', value: d.warning, unit: '条' },
    { label: '盘点数', value: 1286, unit: '处' }
  ]
})

const typeOption: EChartsOption = {
  tooltip: { trigger: 'item' }, legend: { bottom: 0 },
  series: [{ type: 'pie', radius: ['40%', '65%'], data: [{ name: '写字楼', value: 520 }, { name: '商业', value: 310 }, { name: '产业园', value: 280 }, { name: '公寓', value: 120 }, { name: '商铺', value: 56 }] }]
}
const trendOption: EChartsOption = {
  tooltip: { trigger: 'axis' }, xAxis: { type: 'category', data: ['1月', '2月', '3月', '4月', '5月', '6月'] },
  yAxis: { type: 'value', axisLabel: { formatter: '{value}%' } },
  series: [{ type: 'line', smooth: true, data: [78, 80, 79, 81, 83, 82.4] }]
}
const statusOption: EChartsOption = {
  tooltip: { trigger: 'item' }, series: [{ type: 'pie', data: [{ name: '在用', value: 720 }, { name: '出租', value: 410 }, { name: '空置', value: 96 }, { name: '待处置', value: 37 }, { name: '已报废', value: 23 }] }]
}
const vacantOption: EChartsOption = {
  tooltip: { trigger: 'axis' }, xAxis: { type: 'category', data: ['华东', '产业园', '集团其他'] },
  yAxis: { type: 'value' }, series: [{ type: 'bar', data: [32.1, 18.6, 11.7], itemStyle: { color: '#e6a23c' } }]
}
</script>

<style scoped lang="scss">
.metric { text-align: center; }
.metric .label { color: #909399; font-size: 13px; }
.metric .value { font-size: 26px; font-weight: 700; color: #303133; margin-top: 8px; small { font-size: 13px; color: #c0c4cc; margin-left: 4px; } }
</style>
