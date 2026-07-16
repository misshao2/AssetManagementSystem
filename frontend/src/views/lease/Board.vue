<template>
  <div class="page-container">
    <el-card shadow="hover">
      <template #header>招商漏斗（线索 → 带看 → 意向 → 签约）</template>
      <Chart :option="funnelOption" height="320px" />
    </el-card>
    <el-row :gutter="16" style="margin-top: 16px">
      <el-col :span="8" v-for="m in metrics" :key="m.label">
        <el-card shadow="hover" class="m">{{ m.label }}<b>{{ m.value }}</b></el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import type { EChartsOption } from 'echarts'
import Chart from '@/components/Chart/index.vue'

const funnelOption: EChartsOption = {
  tooltip: { trigger: 'item' },
  series: [
    {
      type: 'funnel',
      data: [
        { name: '线索', value: 320 },
        { name: '带看', value: 180 },
        { name: '意向', value: 96 },
        { name: '签约', value: 54 }
      ]
    }
  ]
}

const metrics = [
  { label: '出租率', value: '82.4%' },
  { label: '平均坪效', value: '¥118/㎡' },
  { label: '待跟进', value: '23' }
]
</script>

<style scoped>
.m { text-align: center; }
.m b { display: block; font-size: 22px; margin-top: 8px; }
</style>
