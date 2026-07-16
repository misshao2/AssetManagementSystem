<template>
  <div class="page-container">
    <el-row :gutter="16" style="margin-bottom: 16px">
      <el-col :span="8" v-for="m in metrics" :key="m.label"><el-card shadow="hover" class="m"><div class="label">{{ m.label }}</div><div class="value">{{ m.value }}</div></el-card></el-col>
    </el-row>
    <ProTable
      :data="list" :total="total" :loading="loading" :columns="columns"
      v-model:current="query.pageNum" v-model:size="query.pageSize"
      @size-change="handleSizeChange" @current-change="handleCurrentChange"
    >
      <template #toolbar>
        <el-select v-model="query.filters.status" placeholder="合同状态" clearable style="width: 160px">
          <el-option v-for="s in statuses" :key="s.value" :label="s.label" :value="s.value" />
        </el-select>
        <el-button type="primary" :icon="Search" @click="search()">查询</el-button>
      </template>
      <template #status="{ row }"><DictTag type="ContractStatus" :value="row.status" /></template>
    </ProTable>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Search } from '@element-plus/icons-vue'
import ProTable from '@/components/ProTable/index.vue'
import DictTag from '@/components/DictTag/index.vue'
import { useTable } from '@/composables/useTable'
import { getContractReport } from '@/api/report'
import type { ProColumn } from '@/components/ProTable/index.vue'

const metrics = ref([
  { label: '在租合同数', value: 86 },
  { label: '即将到期(90天)', value: 12 },
  { label: '本年度退租', value: 9 }
])
const statuses = [
  { label: '草稿', value: 'DRAFT' }, { label: '审批中', value: 'APPROVING' }, { label: '已签', value: 'SIGNED' },
  { label: '执行中', value: 'EXECUTING' }, { label: '即将到期', value: 'EXPIRING' }, { label: '已退租', value: 'TERMINATED' }
]
const { loading, list, total, query, getList, search, handleSizeChange, handleCurrentChange } = useTable(getContractReport)
const columns: ProColumn[] = [
  { prop: 'contractNo', label: '合同号', width: 160 },
  { prop: 'assetName', label: '资产', minWidth: 160 },
  { prop: 'tenant', label: '租户', width: 140 },
  { prop: 'startDate', label: '起租日', width: 120 },
  { prop: 'endDate', label: '止租日', width: 120 },
  { prop: 'rent', label: '租金(元/月)', width: 130 },
  { prop: 'status', label: '状态', width: 110, slot: 'status' }
]

onMounted(() => getList())
</script>

<style scoped lang="scss">
.m { text-align: center; }
.m .label { color: #909399; font-size: 13px; }
.m .value { font-size: 24px; font-weight: 700; margin-top: 8px; }
</style>
