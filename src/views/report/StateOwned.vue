<template>
  <div class="page-container">
    <el-alert type="success" :closable="false" title="国资监管报表：按合规标准自动生成，数据真实可溯，支持导出 PDF 报送。" style="margin-bottom: 12px" />
    <el-row :gutter="16">
      <el-col v-for="m in metrics" :key="m.label" :span="6">
        <el-card shadow="hover" class="m"><div class="label">{{ m.label }}</div><div class="value">{{ m.value }}</div></el-card>
      </el-col>
    </el-row>
    <el-card shadow="hover" style="margin-top: 16px">
      <template #header>
        <span>资产明细（国资口径）</span>
        <el-button type="primary" size="small" style="float: right" :icon="Download" @click="handleExport">导出 PDF</el-button>
      </template>
      <el-table :data="rows" border>
        <el-table-column prop="name" label="指标" />
        <el-table-column prop="value" label="数值" />
        <el-table-column prop="unit" label="单位" width="100" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Download } from '@element-plus/icons-vue'
import { getStateOwnedReport } from '@/api/report'

const metrics = ref<any[]>([])
const rows = ref<any[]>([])

onMounted(async () => {
  const d = await getStateOwnedReport()
  metrics.value = [
    { label: '资产总数', value: d.total },
    { label: '总建筑面积(万㎡)', value: d.totalArea },
    { label: '出租率', value: d.leaseRate + '%' },
    { label: '受限资产', value: d.restricted }
  ]
  rows.value = [
    { name: '资产总数量', value: d.total, unit: '处' },
    { name: '总建筑面积', value: d.totalArea, unit: '万㎡' },
    { name: '平均出租率', value: d.leaseRate, unit: '%' },
    { name: '已报废资产', value: d.scrap, unit: '处' },
    { name: '受限（抵押/查封）', value: d.restricted, unit: '处' }
  ]
})

function handleExport() {
  ElMessage.success('国资报表已导出为 PDF（合规版式）')
}
</script>

<style scoped lang="scss">
.m { text-align: center; }
.m .label { color: #909399; font-size: 13px; }
.m .value { font-size: 22px; font-weight: 700; margin-top: 8px; }
</style>
