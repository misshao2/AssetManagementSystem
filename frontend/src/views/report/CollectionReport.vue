<template>
  <div class="page-container">
    <el-row :gutter="16">
      <el-col v-for="m in metrics" :key="m.label" :span="8">
        <el-card shadow="hover" class="m"><div class="label">{{ m.label }}</div><div class="value">{{ m.value }}</div></el-card>
      </el-col>
    </el-row>
    <el-card shadow="hover" style="margin-top: 16px">
      <template #header>租金账龄分析</template>
      <Chart :option="ageOption" height="320px" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Chart from '@/components/Chart/index.vue'
import { getCollectionReport } from '@/api/report'

const metrics = ref<any[]>([])
const ageOption = ref<any>({})

onMounted(async () => {
  const d = await getCollectionReport()
  metrics.value = [
    { label: '收缴率', value: d.rate },
    { label: '逾期金额(元)', value: d.overdue },
    { label: '逾期合同数', value: 9 }
  ]
  ageOption.value = {
    tooltip: { trigger: 'item' },
    legend: { bottom: 0 },
    series: [{ type: 'pie', radius: ['40%', '65%'], data: d.age }]
  }
})
</script>

<style scoped lang="scss">
.m { text-align: center; }
.m .label { color: #909399; font-size: 13px; }
.m .value { font-size: 24px; font-weight: 700; margin-top: 8px; }
</style>
