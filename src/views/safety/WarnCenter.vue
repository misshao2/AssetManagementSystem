<template>
  <div class="page-container">
    <el-alert type="info" :closable="false" title="预警中心：汇聚合同到期 / 租金欠费 / 权证到期 / 设备隐患等多源预警，统一列表与分发。" style="margin-bottom: 12px" />
    <ProTable
      :data="list" :total="total" :loading="loading" :columns="columns"
      v-model:current="query.pageNum" v-model:size="query.pageSize"
      @size-change="handleSizeChange" @current-change="handleCurrentChange"
    >
      <template #toolbar>
        <el-select v-model="query.filters.type" placeholder="预警类型" clearable style="width: 160px">
          <el-option label="合同到期" value="合同到期" /><el-option label="租金欠费" value="租金欠费" /><el-option label="权证到期" value="权证到期" /><el-option label="设备隐患" value="设备隐患" />
        </el-select>
        <el-button type="primary" :icon="Search" @click="search()">查询</el-button>
      </template>
      <template #level="{ row }"><el-tag :type="row.level === 'HIGH' ? 'danger' : 'warning'">{{ row.level === 'HIGH' ? '高' : '中' }}</el-tag></template>
      <template #status="{ row }"><el-tag :type="row.status === 'UNREAD' ? 'danger' : 'info'">{{ row.status === 'UNREAD' ? '未读' : '已读' }}</el-tag></template>
      <template #action="{ row }">
        <el-button type="primary" link @click="handleDispatch(row)">分发</el-button>
      </template>
    </ProTable>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import ProTable from '@/components/ProTable/index.vue'
import { useTable } from '@/composables/useTable'
import { getWarnPage } from '@/api/safety'
import type { ProColumn } from '@/components/ProTable/index.vue'

const { loading, list, total, query, getList, search, handleSizeChange, handleCurrentChange } = useTable(getWarnPage)
const columns: ProColumn[] = [
  { prop: 'type', label: '类型', width: 120 },
  { prop: 'title', label: '标题', minWidth: 220 },
  { prop: 'target', label: '对象', width: 160 },
  { prop: 'level', label: '级别', width: 80, slot: 'level' },
  { prop: 'time', label: '时间', width: 160 },
  { prop: 'status', label: '状态', width: 90, slot: 'status' },
  { prop: 'action', label: '操作', width: 90, fixed: 'right', slot: 'action' }
]

function handleDispatch(row: any) {
  ElMessage.success(`预警「${row.title}」已分发至责任岗位`)
}

onMounted(() => getList())
</script>
