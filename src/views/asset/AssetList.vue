<template>
  <div class="page-container">
    <ProTable
      :data="list"
      :total="total"
      :loading="loading"
      :columns="columns"
      v-model:current="query.pageNum"
      v-model:size="query.pageSize"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    >
      <template #toolbar>
        <el-input v-model="query.filters.assetName" placeholder="资产名称" clearable style="width: 200px" />
        <el-select v-model="query.filters.assetType" placeholder="资产类型" clearable style="width: 160px">
          <el-option v-for="t in typeOptions" :key="t.value" :label="t.label" :value="t.value" />
        </el-select>
        <el-button type="primary" :icon="Search" @click="search()">查询</el-button>
        <el-button :icon="Refresh" @click="reset()">重置</el-button>
        <el-button type="success" :icon="Plus" v-permission="'asset:edit'" @click="handleCreate">新建资产</el-button>
      </template>

      <template #status="{ row }">
        <DictTag type="AssetStatus" :value="row.status" />
      </template>
      <template #type="{ row }">
        <DictTag type="AssetType" :value="row.assetType" />
      </template>
      <template #action>
        <el-button type="primary" link>详情</el-button>
        <el-button type="primary" link v-permission="'asset:edit'">编辑</el-button>
      </template>
    </ProTable>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { Search, Refresh, Plus } from '@element-plus/icons-vue'
import ProTable from '@/components/ProTable/index.vue'
import DictTag from '@/components/DictTag/index.vue'
import { useTable } from '@/composables/useTable'
import { getAssetPage } from '@/api/asset'
import type { ProColumn } from '@/components/ProTable/index.vue'

const { loading, list, total, query, getList, search, reset, handleSizeChange, handleCurrentChange } =
  useTable(getAssetPage)

const typeOptions = [
  { label: '写字楼', value: 'OFFICE' },
  { label: '商业综合体', value: 'COMMERCIAL' },
  { label: '产业园区', value: 'PARK' },
  { label: '长租公寓', value: 'APARTMENT' },
  { label: '配套商铺', value: 'SHOP' },
  { label: '闲置自持物业', value: 'IDLE' }
]

const columns: ProColumn[] = [
  { prop: 'assetCode', label: '资产编码', width: 150 },
  { prop: 'assetName', label: '资产名称', minWidth: 180 },
  { prop: 'assetType', label: '类型', width: 120, slot: 'type' },
  { prop: 'orgName', label: '所属组织', width: 120 },
  { prop: 'building', label: '楼栋', width: 100 },
  { prop: 'area', label: '建筑面积(㎡)', width: 130 },
  { prop: 'status', label: '状态', width: 100, slot: 'status' },
  { prop: 'manager', label: '责任人', width: 100 },
  { prop: 'action', label: '操作', width: 160, fixed: 'right', slot: 'action' }
]

function handleCreate() {
  // 实际项目：打开 ProForm 新增弹窗
  console.info('打开新建资产弹窗')
}

onMounted(() => getList())
</script>
