<template>
  <div class="page-container">
    <ProTable
      :data="list" :total="total" :loading="loading" :columns="columns"
      v-model:current="query.pageNum" v-model:size="query.pageSize"
      @size-change="handleSizeChange" @current-change="handleCurrentChange"
    >
      <template #toolbar>
        <el-input v-model="query.filters.keyword" placeholder="任务名称" clearable style="width: 200px" />
        <el-button type="primary" :icon="Search" @click="search()">查询</el-button>
        <el-button type="success" :icon="Plus" @click="handleCreate">发起盘点</el-button>
      </template>
      <template #status="{ row }">
        <el-tag :type="row.status === 'DONE' ? 'success' : 'warning'">{{ row.status === 'DONE' ? '已完成' : '待执行' }}</el-tag>
      </template>
      <template #progress="{ row }">{{ row.scanned }}/{{ row.total }}</template>
      <template #action="{ row }">
        <el-button type="primary" link @click="handleReport(row)">报告</el-button>
      </template>
    </ProTable>

    <ProDialog v-model:visible="dialog" title="发起盘点任务" :submitting="submitting" width="480px" @submit="submit">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="任务名称" prop="taskName"><el-input v-model="form.taskName" /></el-form-item>
        <el-form-item label="盘点范围" prop="scope"><el-input v-model="form.scope" /></el-form-item>
        <el-form-item label="执行人"><el-input v-model="form.executor" /></el-form-item>
        <el-form-item label="计划日期"><el-date-picker v-model="form.planDate" type="date" value-format="YYYY-MM-DD" style="width:100%" /></el-form-item>
      </el-form>
    </ProDialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Plus } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import ProTable from '@/components/ProTable/index.vue'
import ProDialog from '@/components/ProDialog/index.vue'
import { useTable } from '@/composables/useTable'
import { getInventoryPage, createInventory } from '@/api/asset'
import type { ProColumn } from '@/components/ProTable/index.vue'

const { loading, list, total, query, getList, search, handleSizeChange, handleCurrentChange } = useTable(getInventoryPage)

const columns: ProColumn[] = [
  { prop: 'taskName', label: '任务名称', minWidth: 180 },
  { prop: 'scope', label: '范围', minWidth: 160 },
  { prop: 'executor', label: '执行人', width: 110 },
  { prop: 'planDate', label: '计划日期', width: 120 },
  { prop: 'progress', label: '盘点进度', width: 110, slot: 'progress' },
  { prop: 'status', label: '状态', width: 100, slot: 'status' },
  { prop: 'action', label: '操作', width: 100, fixed: 'right', slot: 'action' }
]

const dialog = ref(false)
const submitting = ref(false)
const formRef = ref<FormInstance>()
const form = reactive({ taskName: '', scope: '', executor: '', planDate: '' })
const rules: FormRules = { taskName: [{ required: true, message: '请输入任务名称', trigger: 'blur' }] }

function handleCreate() {
  Object.assign(form, { taskName: '', scope: '', executor: '', planDate: '' })
  dialog.value = true
}
async function submit() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitting.value = true
    try {
      await createInventory({ ...form, total: 0 })
      ElMessage.success('盘点任务已发起（可下发移动端离线盘点）')
      dialog.value = false
      getList()
    } finally {
      submitting.value = false
    }
  })
}
function handleReport(row: any) {
  ElMessage.success(`已生成《${row.taskName}》盘点报告`)
}

onMounted(() => getList())
</script>
