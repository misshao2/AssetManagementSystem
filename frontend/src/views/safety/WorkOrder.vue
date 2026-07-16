<template>
  <div class="page-container">
    <ProTable
      :data="list" :total="total" :loading="loading" :columns="columns"
      v-model:current="query.pageNum" v-model:size="query.pageSize"
      @size-change="handleSizeChange" @current-change="handleCurrentChange"
    >
      <template #toolbar>
        <el-input v-model="query.filters.keyword" placeholder="工单/资产" clearable style="width: 200px" />
        <el-button type="primary" :icon="Search" @click="search()">查询</el-button>
        <el-button type="success" :icon="Plus" v-permission="'safety:wo:edit'" @click="handleCreate">新建工单</el-button>
      </template>
      <template #priority="{ row }"><el-tag :type="row.priority === 'HIGH' ? 'danger' : row.priority === 'MID' ? 'warning' : 'info'">{{ ({ HIGH: '高', MID: '中', LOW: '低' } as Record<string, string>)[row.priority] }}</el-tag></template>
      <template #status="{ row }">
        <el-tag :type="row.status === 'DONE' ? 'success' : row.status === 'DOING' ? 'warning' : 'info'">{{ ({ TODO: '待派', DOING: '处理中', DONE: '已完成' } as Record<string, string>)[row.status] }}</el-tag>
      </template>
      <template #action="{ row }">
        <el-button v-if="row.status === 'TODO'" type="primary" link @click="dispatch(row)">派单</el-button>
        <el-button v-if="row.status === 'DOING'" type="primary" link @click="finish(row)">验收</el-button>
      </template>
    </ProTable>

    <ProDialog v-model:visible="dialog" title="新建维保工单" :submitting="submitting" width="480px" @submit="submit">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="工单标题" prop="title"><el-input v-model="form.title" /></el-form-item>
        <el-form-item label="资产" prop="assetName"><el-input v-model="form.assetName" /></el-form-item>
        <el-form-item label="优先级"><el-select v-model="form.priority" style="width:100%"><el-option label="高" value="HIGH" /><el-option label="中" value="MID" /><el-option label="低" value="LOW" /></el-select></el-form-item>
        <el-form-item label="处理人"><el-input v-model="form.handler" /></el-form-item>
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
import { getWorkOrderPage, createWorkOrder, updateWorkOrder } from '@/api/safety'
import type { ProColumn } from '@/components/ProTable/index.vue'

const { loading, list, total, query, getList, search, handleSizeChange, handleCurrentChange } = useTable(getWorkOrderPage)
const columns: ProColumn[] = [
  { prop: 'title', label: '标题', minWidth: 160 },
  { prop: 'assetName', label: '资产', minWidth: 160 },
  { prop: 'priority', label: '优先级', width: 90, slot: 'priority' },
  { prop: 'source', label: '来源', width: 100 },
  { prop: 'handler', label: '处理人', width: 110 },
  { prop: 'status', label: '状态', width: 100, slot: 'status' },
  { prop: 'createTime', label: '创建时间', width: 130 },
  { prop: 'action', label: '操作', width: 120, fixed: 'right', slot: 'action' }
]

const dialog = ref(false)
const submitting = ref(false)
const formRef = ref<FormInstance>()
const form = reactive({ title: '', assetName: '', priority: 'MID', handler: '' })
const rules: FormRules = { title: [{ required: true, message: '请输入标题', trigger: 'blur' }], assetName: [{ required: true, message: '请输入资产', trigger: 'blur' }] }

function handleCreate() {
  Object.assign(form, { title: '', assetName: '', priority: 'MID', handler: '' })
  dialog.value = true
}
async function submit() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitting.value = true
    try {
      await createWorkOrder({ ...form, status: 'TODO', createTime: new Date().toISOString().slice(0, 10) })
      ElMessage.success('工单已创建')
      dialog.value = false
      getList()
    } finally {
      submitting.value = false
    }
  })
}
async function dispatch(row: any) {
  await updateWorkOrder(row.woId, { status: 'DOING' })
  ElMessage.success('已派单')
  getList()
}
async function finish(row: any) {
  await updateWorkOrder(row.woId, { status: 'DONE' })
  ElMessage.success('工单已验收完成')
  getList()
}

onMounted(() => getList())
</script>
