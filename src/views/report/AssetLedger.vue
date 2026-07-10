<template>
  <div class="page-container">
    <ProTable
      :data="list" :total="total" :loading="loading" :columns="columns"
      v-model:current="query.pageNum" v-model:size="query.pageSize"
      @size-change="handleSizeChange" @current-change="handleCurrentChange"
    >
      <template #toolbar>
        <el-select v-model="query.filters.assetType" placeholder="类型" clearable style="width: 160px">
          <el-option v-for="t in types" :key="t.value" :label="t.label" :value="t.value" />
        </el-select>
        <el-select v-model="query.filters.status" placeholder="状态" clearable style="width: 140px">
          <el-option v-for="s in statuses" :key="s.value" :label="s.label" :value="s.value" />
        </el-select>
        <el-button type="primary" :icon="Search" @click="search()">查询</el-button>
        <el-button :icon="Download" @click="handleExport">导出 Excel</el-button>
      </template>
      <template #status="{ row }"><DictTag type="AssetStatus" :value="row.status" /></template>
      <template #type="{ row }"><DictTag type="AssetType" :value="row.assetType" /></template>
    </ProTable>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Download } from '@element-plus/icons-vue'
import ProTable from '@/components/ProTable/index.vue'
import DictTag from '@/components/DictTag/index.vue'
import { useTable } from '@/composables/useTable'
import { getAssetLedger } from '@/api/report'
import type { ProColumn } from '@/components/ProTable/index.vue'

const types = [
  { label: '写字楼', value: 'OFFICE' }, { label: '商业综合体', value: 'COMMERCIAL' },
  { label: '产业园区', value: 'PARK' }, { label: '长租公寓', value: 'APARTMENT' },
  { label: '配套商铺', value: 'SHOP' }, { label: '闲置自持物业', value: 'IDLE' }
]
const statuses = [
  { label: '在用', value: 'IN_USE' }, { label: '出租', value: 'LEASED' }, { label: '空置', value: 'VACANT' },
  { label: '待处置', value: 'TO_DISPOSE' }, { label: '已报废', value: 'SCRAPPED' }
]
const { loading, list, total, query, getList, search, handleSizeChange, handleCurrentChange } = useTable(getAssetLedger)
const columns: ProColumn[] = [
  { prop: 'assetCode', label: '资产编码', width: 150 },
  { prop: 'assetName', label: '资产名称', minWidth: 180 },
  { prop: 'assetType', label: '类型', width: 120, slot: 'type' },
  { prop: 'orgName', label: '组织', width: 120 },
  { prop: 'area', label: '面积(㎡)', width: 120 },
  { prop: 'status', label: '状态', width: 100, slot: 'status' },
  { prop: 'originalValue', label: '原值(元)', width: 140 }
]

function handleExport() {
  ElMessage.success('资产台账报表已导出为 Excel')
}

onMounted(() => getList())
</script>
