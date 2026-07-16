<template>
  <div class="page-container">
    <ProTable
      :data="list" :total="total" :loading="loading" :columns="columns"
      v-model:current="query.pageNum" v-model:size="query.pageSize"
      @size-change="handleSizeChange" @current-change="handleCurrentChange"
    >
      <template #toolbar>
        <el-input v-model="query.filters.keyword" placeholder="资产/内容" clearable style="width: 200px" />
        <el-button type="primary" :icon="Search" @click="search()">查询</el-button>
        <el-button type="success" :icon="Plus" @click="handleCreate">改扩建申请</el-button>
      </template>
      <template #approveStatus="{ row }">
        <el-tag :type="row.approveStatus === 'APPROVED' ? 'success' : 'warning'">{{ row.approveStatus === 'APPROVED' ? '已审批' : '审批中' }}</el-tag>
      </template>
      <template #action="{ row }">
        <el-button type="primary" link @click="handleApprove(row)" v-if="row.approveStatus !== 'APPROVED'">审批</el-button>
      </template>
    </ProTable>

    <ProDialog v-model:visible="dialog" title="改扩建申请" :submitting="submitting" width="500px" @submit="submit">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="资产名称" prop="assetName"><el-input v-model="form.assetName" /></el-form-item>
        <el-form-item label="改扩建内容" prop="content"><el-input v-model="form.content" type="textarea" :rows="2" /></el-form-item>
        <el-form-item label="预算(元)"><el-input-number v-model="form.budget" :min="0" style="width:100%" /></el-form-item>
        <el-form-item label="开始日期"><el-date-picker v-model="form.startDate" type="date" value-format="YYYY-MM-DD" style="width:100%" /></el-form-item>
        <el-form-item label="结束日期"><el-date-picker v-model="form.endDate" type="date" value-format="YYYY-MM-DD" style="width:100%" /></el-form-item>
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
import { getRenovationPage, createRenovation } from '@/api/asset'
import type { ProColumn } from '@/components/ProTable/index.vue'

const { loading, list, total, query, getList, search, handleSizeChange, handleCurrentChange } = useTable(getRenovationPage)

const columns: ProColumn[] = [
  { prop: 'assetName', label: '资产名称', minWidth: 160 },
  { prop: 'content', label: '改扩建内容', minWidth: 180 },
  { prop: 'budget', label: '预算(元)', width: 120 },
  { prop: 'startDate', label: '开始', width: 110 },
  { prop: 'endDate', label: '结束', width: 110 },
  { prop: 'approveStatus', label: '审批', width: 100, slot: 'approveStatus' },
  { prop: 'action', label: '操作', width: 100, fixed: 'right', slot: 'action' }
]

const dialog = ref(false)
const submitting = ref(false)
const formRef = ref<FormInstance>()
const form = reactive({ assetName: '', content: '', budget: 0, startDate: '', endDate: '' })
const rules: FormRules = { assetName: [{ required: true, message: '请输入资产名称', trigger: 'blur' }], content: [{ required: true, message: '请输入内容', trigger: 'blur' }] }

function handleCreate() {
  Object.assign(form, { assetName: '', content: '', budget: 0, startDate: '', endDate: '' })
  dialog.value = true
}
async function submit() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitting.value = true
    try {
      await createRenovation({ ...form })
      ElMessage.success('改扩建申请已提交（进入审批流）')
      dialog.value = false
      getList()
    } finally {
      submitting.value = false
    }
  })
}
function handleApprove(row: any) {
  ElMessage.success(`《${row.assetName}》改扩建已审批通过`)
}

onMounted(() => getList())
</script>
