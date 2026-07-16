<template>
  <div class="page-container">
    <ProTable
      :data="list" :total="total" :loading="loading" :columns="columns"
      v-model:current="query.pageNum" v-model:size="query.pageSize"
      @size-change="handleSizeChange" @current-change="handleCurrentChange"
    >
      <template #toolbar>
        <el-input v-model="query.filters.keyword" placeholder="发票号/租户" clearable style="width: 220px" />
        <el-button type="primary" :icon="Search" @click="search()">查询</el-button>
        <el-button type="success" :icon="Plus" @click="handleApply">开票申请</el-button>
      </template>
      <template #status="{ row }">
        <el-tag :type="row.status === 'ISSUED' ? 'success' : 'warning'">{{ row.status === 'ISSUED' ? '已开具' : '开票中' }}</el-tag>
      </template>
    </ProTable>

    <ProDialog v-model:visible="dialog" title="开票申请" :submitting="submitting" width="480px" @submit="submit">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="关联账单" prop="billNo"><el-input v-model="form.billNo" /></el-form-item>
        <el-form-item label="租户" prop="tenant"><el-input v-model="form.tenant" /></el-form-item>
        <el-form-item label="金额(元)"><el-input-number v-model="form.amount" :min="0" style="width:100%" /></el-form-item>
        <el-form-item label="税额(元)"><el-input-number v-model="form.tax" :min="0" style="width:100%" /></el-form-item>
        <el-form-item label="收票人"><el-input v-model="form.receiver" /></el-form-item>
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
import { getInvoicePage, applyInvoice } from '@/api/finance'
import type { ProColumn } from '@/components/ProTable/index.vue'

const { loading, list, total, query, getList, search, handleSizeChange, handleCurrentChange } = useTable(getInvoicePage)
const columns: ProColumn[] = [
  { prop: 'invoiceNo', label: '发票号', width: 180 },
  { prop: 'billNo', label: '账单号', width: 160 },
  { prop: 'tenant', label: '租户', width: 140 },
  { prop: 'amount', label: '金额(元)', width: 120 },
  { prop: 'tax', label: '税额(元)', width: 110 },
  { prop: 'date', label: '开票日', width: 120 },
  { prop: 'receiver', label: '收票人', width: 110 },
  { prop: 'status', label: '状态', width: 100, slot: 'status' }
]

const dialog = ref(false)
const submitting = ref(false)
const formRef = ref<FormInstance>()
const form = reactive({ billNo: '', tenant: '', amount: 0, tax: 0, receiver: '' })
const rules: FormRules = { billNo: [{ required: true, message: '请输入账单号', trigger: 'blur' }], tenant: [{ required: true, message: '请输入租户', trigger: 'blur' }] }

function handleApply() {
  Object.assign(form, { billNo: '', tenant: '', amount: 0, tax: 0, receiver: '' })
  dialog.value = true
}
async function submit() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitting.value = true
    try {
      await applyInvoice({ ...form, date: new Date().toISOString().slice(0, 10), status: 'ISSUED' })
      ElMessage.success('开票成功（对接税控/第三方）')
      dialog.value = false
      getList()
    } finally {
      submitting.value = false
    }
  })
}

onMounted(() => getList())
</script>
