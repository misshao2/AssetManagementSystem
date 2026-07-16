<template>
  <div class="page-container">
    <ProTable
      :data="list" :total="total" :loading="loading" :columns="columns"
      v-model:current="query.pageNum" v-model:size="query.pageSize"
      @size-change="handleSizeChange" @current-change="handleCurrentChange"
    >
      <template #toolbar>
        <el-input v-model="query.filters.keyword" placeholder="资产名称" clearable style="width: 200px" />
        <el-button type="primary" :icon="Search" @click="search()">查询</el-button>
        <el-button type="success" :icon="Plus" @click="handleCreate">接收登记</el-button>
      </template>
      <template #action="{ row }">
        <el-button type="primary" link @click="handleView(row)">查看</el-button>
      </template>
    </ProTable>

    <ProDialog v-model:visible="dialog" title="资产接收登记" :submitting="submitting" width="480px" @submit="submit">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="资产名称" prop="assetName"><el-input v-model="form.assetName" /></el-form-item>
        <el-form-item label="来源" prop="source"><el-input v-model="form.source" placeholder="如 在建工程转固" /></el-form-item>
        <el-form-item label="接收部门"><el-input v-model="form.receiveDept" /></el-form-item>
        <el-form-item label="接收人"><el-input v-model="form.receiveUser" /></el-form-item>
        <el-form-item label="接收日期"><el-date-picker v-model="form.receiveDate" type="date" value-format="YYYY-MM-DD" style="width:100%" /></el-form-item>
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
import { getReceiptPage, createReceipt } from '@/api/asset'
import type { ProColumn } from '@/components/ProTable/index.vue'

const { loading, list, total, query, getList, search, handleSizeChange, handleCurrentChange } = useTable(getReceiptPage)

const columns: ProColumn[] = [
  { prop: 'assetName', label: '资产名称', minWidth: 180 },
  { prop: 'source', label: '来源', width: 160 },
  { prop: 'receiveDept', label: '接收部门', width: 140 },
  { prop: 'receiveUser', label: '接收人', width: 110 },
  { prop: 'receiveDate', label: '接收日期', width: 120 },
  { prop: 'action', label: '操作', width: 100, fixed: 'right', slot: 'action' }
]

const dialog = ref(false)
const submitting = ref(false)
const formRef = ref<FormInstance>()
const form = reactive({ assetName: '', source: '', receiveDept: '', receiveUser: '', receiveDate: '' })
const rules: FormRules = { assetName: [{ required: true, message: '请输入资产名称', trigger: 'blur' }] }

function handleCreate() {
  Object.assign(form, { assetName: '', source: '', receiveDept: '', receiveUser: '', receiveDate: '' })
  dialog.value = true
}
function handleView(row: any) {
  Object.assign(form, row)
  dialog.value = true
}
async function submit() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitting.value = true
    try {
      await createReceipt({ ...form })
      ElMessage.success('接收登记成功')
      dialog.value = false
      getList()
    } finally {
      submitting.value = false
    }
  })
}

onMounted(() => getList())
</script>
