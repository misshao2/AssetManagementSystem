<template>
  <div class="page-container">
    <ProTable
      :data="list" :total="total" :loading="loading" :columns="columns"
      v-model:current="query.pageNum" v-model:size="query.pageSize"
      @size-change="handleSizeChange" @current-change="handleCurrentChange"
    >
      <template #toolbar>
        <el-input v-model="query.filters.keyword" placeholder="合同号/租户" clearable style="width: 200px" />
        <el-button type="primary" :icon="Search" @click="search()">查询</el-button>
        <el-button type="success" :icon="Plus" v-permission="'lease:contract:edit'" @click="$router.push('/lease/contract/create')">起草合同</el-button>
      </template>
      <template #status="{ row }"><DictTag type="ContractStatus" :value="row.status" /></template>
      <template #action="{ row }">
        <el-button type="primary" link @click="$router.push(`/lease/contract/${row.contractId}`)">起草/查看</el-button>
        <el-button type="primary" link @click="$router.push('/lease/sign')" v-if="row.status === 'APPROVING' || row.status === 'SIGNED'">签章</el-button>
      </template>
    </ProTable>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Search, Plus } from '@element-plus/icons-vue'
import ProTable from '@/components/ProTable/index.vue'
import DictTag from '@/components/DictTag/index.vue'
import { useTable } from '@/composables/useTable'
import { getContractPage } from '@/api/lease'
import type { ProColumn } from '@/components/ProTable/index.vue'

const router = useRouter()
const { loading, list, total, query, getList, search, handleSizeChange, handleCurrentChange } = useTable(getContractPage)
const columns: ProColumn[] = [
  { prop: 'contractNo', label: '合同号', width: 160 },
  { prop: 'assetName', label: '资产', minWidth: 160 },
  { prop: 'tenant', label: '租户', width: 140 },
  { prop: 'startDate', label: '起租日', width: 120 },
  { prop: 'endDate', label: '止租日', width: 120 },
  { prop: 'rent', label: '租金(元/月)', width: 130 },
  { prop: 'status', label: '状态', width: 110, slot: 'status' },
  { prop: 'action', label: '操作', width: 180, fixed: 'right', slot: 'action' }
]

onMounted(() => getList())
</script>
