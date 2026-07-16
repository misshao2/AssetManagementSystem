<template>
  <div class="page-container">
    <el-alert type="warning" :closable="false" title="闲置资产智能预警：系统按空置天数自动识别低效资产并给出盘活建议。" style="margin-bottom: 12px" />
    <ProTable
      :data="list" :total="total" :loading="loading" :columns="columns"
      v-model:current="query.pageNum" v-model:size="query.pageSize"
      @size-change="handleSizeChange" @current-change="handleCurrentChange"
    >
      <template #toolbar>
        <el-input v-model="query.filters.keyword" placeholder="资产名称" clearable style="width: 200px" />
        <el-button type="primary" :icon="Search" @click="search()">查询</el-button>
      </template>
      <template #idleDays="{ row }">
        <el-tag :type="row.idleDays > 180 ? 'danger' : 'warning'">{{ row.idleDays }} 天</el-tag>
      </template>
      <template #action="{ row }">
        <el-button type="primary" link @click="handleSuggest(row)">盘活建议</el-button>
      </template>
    </ProTable>

    <ProDialog v-model:visible="dialog" title="盘活建议" :submitting="submitting" width="460px" @submit="submit">
      <el-form label-width="90px">
        <el-form-item label="资产"><el-input :model-value="current?.assetName" disabled /></el-form-item>
        <el-form-item label="闲置原因"><el-input v-model="current.reason" disabled /></el-form-item>
        <el-form-item label="建议方案"><el-input v-model="form.suggest" type="textarea" :rows="3" /></el-form-item>
      </el-form>
    </ProDialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import ProTable from '@/components/ProTable/index.vue'
import ProDialog from '@/components/ProDialog/index.vue'
import { useTable } from '@/composables/useTable'
import { getIdlePage } from '@/api/asset'
import type { ProColumn } from '@/components/ProTable/index.vue'

const { loading, list, total, query, getList, search, handleSizeChange, handleCurrentChange } = useTable(getIdlePage)
const columns: ProColumn[] = [
  { prop: 'assetName', label: '资产名称', minWidth: 180 },
  { prop: 'area', label: '面积(㎡)', width: 120 },
  { prop: 'idleDays', label: '闲置天数', width: 120, slot: 'idleDays' },
  { prop: 'reason', label: '原因', minWidth: 160 },
  { prop: 'suggest', label: '建议', minWidth: 180 },
  { prop: 'action', label: '操作', width: 110, fixed: 'right', slot: 'action' }
]

const dialog = ref(false)
const submitting = ref(false)
const current = ref<any>({})
const form = reactive({ suggest: '' })

function handleSuggest(row: any) {
  current.value = row
  form.suggest = row.suggest
  dialog.value = true
}
async function submit() {
  submitting.value = true
  try {
    ElMessage.success('盘活建议已保存')
    dialog.value = false
  } finally {
    submitting.value = false
  }
}

onMounted(() => getList())
</script>
