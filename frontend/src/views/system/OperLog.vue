<template>
  <div class="page-container">
    <ProTable
      :data="list" :total="total" :loading="loading" :columns="columns"
      v-model:current="query.pageNum" v-model:size="query.pageSize"
      @size-change="handleSizeChange" @current-change="handleCurrentChange"
    >
      <template #toolbar>
        <el-select v-model="query.filters.module" placeholder="模块" clearable style="width: 160px">
          <el-option label="资产台账" value="资产台账" /><el-option label="租赁合同" value="租赁合同" /><el-option label="权证档案" value="权证档案" /><el-option label="系统管理" value="系统管理" />
        </el-select>
        <el-input v-model="query.filters.keyword" placeholder="用户/对象" clearable style="width: 200px" />
        <el-button type="primary" :icon="Search" @click="search()">查询</el-button>
        <el-button :icon="Download" @click="handleExport">导出</el-button>
      </template>
      <template #result="{ row }"><el-tag :type="row.result === 'SUCCESS' ? 'success' : 'danger'">{{ row.result === 'SUCCESS' ? '成功' : '失败' }}</el-tag></template>
    </ProTable>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Download } from '@element-plus/icons-vue'
import ProTable from '@/components/ProTable/index.vue'
import { useTable } from '@/composables/useTable'
import { getOperLogPage } from '@/api/system'
import type { ProColumn } from '@/components/ProTable/index.vue'

const { loading, list, total, query, getList, search, handleSizeChange, handleCurrentChange } = useTable(getOperLogPage)
const columns: ProColumn[] = [
  { prop: 'user', label: '用户', width: 100 },
  { prop: 'org', label: '组织', width: 120 },
  { prop: 'module', label: '模块', width: 120 },
  { prop: 'action', label: '操作', width: 100 },
  { prop: 'object', label: '对象', minWidth: 160 },
  { prop: 'ip', label: 'IP', width: 130 },
  { prop: 'time', label: '时间', width: 180 },
  { prop: 'result', label: '结果', width: 90, slot: 'result' }
]

function handleExport() {
  ElMessage.success('操作日志已导出')
}

onMounted(() => getList())
</script>
