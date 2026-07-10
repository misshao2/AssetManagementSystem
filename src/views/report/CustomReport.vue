<template>
  <div class="page-container">
    <el-card shadow="hover">
      <template #header>自定义报表</template>
      <el-form :inline="true" label-width="80px">
        <el-form-item label="维度">
          <el-select v-model="dim" multiple collapse-tags style="width: 240px">
            <el-option v-for="d in dims" :key="d.value" :label="d.label" :value="d.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="指标">
          <el-select v-model="metric" style="width: 160px">
            <el-option label="资产数量" value="count" /><el-option label="建筑面积" value="area" /><el-option label="出租率" value="leaseRate" />
          </el-select>
        </el-form-item>
        <el-form-item label="图表">
          <el-radio-group v-model="chartType"><el-radio value="bar">柱状</el-radio><el-radio value="pie">饼图</el-radio><el-radio value="line">折线</el-radio></el-radio-group>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="render">生成</el-button>
          <el-button @click="saveTpl">保存为模板</el-button>
        </el-form-item>
      </el-form>
      <Chart v-if="option.series" :option="option" height="360px" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import Chart from '@/components/Chart/index.vue'
import { saveCustomReport } from '@/api/report'

const dims = [
  { label: '组织', value: 'org' }, { label: '资产类型', value: 'type' }, { label: '状态', value: 'status' }, { label: '区域', value: 'region' }
]
const dim = ref<string[]>(['type'])
const metric = ref('count')
const chartType = ref('bar')
const option = ref<any>({})

function render() {
  const data = [
    { name: '写字楼', value: 520 }, { name: '商业', value: 310 }, { name: '产业园', value: 280 }, { name: '公寓', value: 120 }, { name: '商铺', value: 56 }
  ]
  const typeMap: Record<string, any> = {
    bar: { type: 'bar', data: data.map((d) => d.value) },
    line: { type: 'line', smooth: true, data: data.map((d) => d.value) },
    pie: { type: 'pie', radius: ['40%', '65%'], data }
  }
  option.value = {
    tooltip: { trigger: chartType.value === 'pie' ? 'item' : 'axis' },
    legend: chartType.value === 'pie' ? { bottom: 0 } : undefined,
    xAxis: chartType.value === 'pie' ? undefined : { type: 'category', data: data.map((d) => d.name) },
    yAxis: chartType.value === 'pie' ? undefined : { type: 'value' },
    series: [typeMap[chartType.value]]
  }
}
async function saveTpl() {
  await saveCustomReport({ dim: dim.value, metric: metric.value, chartType: chartType.value })
  ElMessage.success('模板已保存（个人/共享）')
}
</script>
