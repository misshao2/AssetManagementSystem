<template>
  <div class="page-container">
    <ProTable
      :data="list" :total="total" :loading="loading" :columns="columns"
      v-model:current="query.pageNum" v-model:size="query.pageSize"
      @size-change="handleSizeChange" @current-change="handleCurrentChange"
    >
      <template #toolbar>
        <el-input v-model="query.filters.keyword" placeholder="账单号/租户" clearable style="width: 220px" />
        <el-button type="primary" :icon="Search" @click="search()">查询</el-button>
        <el-button type="success" :icon="Plus" @click="handleAdd">新增催收记录</el-button>
      </template>
      <template #overdueDays="{ row }">
        <el-tag :type="row.overdueDays > 30 ? 'danger' : 'warning'">{{ row.overdueDays }} 天</el-tag>
      </template>
      <template #action="{ row }">
        <el-button type="primary" link @click="handleUrge(row)">发送催缴</el-button>
      </template>
    </ProTable>

    <ProDialog v-model:visible="dialog" title="催收记录" :submitting="submitting" width="480px" @submit="submit">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="账单号" prop="billNo"><el-input v-model="form.billNo" /></el-form-item>
        <el-form-item label="租户" prop="tenant"><el-input v-model="form.tenant" /></el-form-item>
        <el-form-item label="催收方式"><el-select v-model="form.method" style="width:100%"><el-option label="电话" value="电话" /><el-option label="短信" value="短信" /><el-option label="上门" value="上门" /></el-select></el-form-item>
        <el-form-item label="催收结果"><el-input v-model="form.result" type="textarea" :rows="2" /></el-form-item>
        <el-form-item label="下次跟进"><el-date-picker v-model="form.nextFollow" type="date" value-format="YYYY-MM-DD" style="width:100%" /></el-form-item>
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
import { getCollectionPage, createCollection } from '@/api/finance'
import type { ProColumn } from '@/components/ProTable/index.vue'

const { loading, list, total, query, getList, search, handleSizeChange, handleCurrentChange } = useTable(getCollectionPage)
const columns: ProColumn[] = [
  { prop: 'billNo', label: '账单号', width: 160 },
  { prop: 'tenant', label: '租户', width: 140 },
  { prop: 'amount', label: '金额(元)', width: 120 },
  { prop: 'overdueDays', label: '逾期', width: 100, slot: 'overdueDays' },
  { prop: 'method', label: '方式', width: 90 },
  { prop: 'lastTime', label: '最近催收', width: 130 },
  { prop: 'result', label: '结果', minWidth: 180 },
  { prop: 'nextFollow', label: '下次跟进', width: 130 },
  { prop: 'action', label: '操作', width: 110, fixed: 'right', slot: 'action' }
]

const dialog = ref(false)
const submitting = ref(false)
const formRef = ref<FormInstance>()
const form = reactive({ billNo: '', tenant: '', method: '电话', result: '', nextFollow: '' })
const rules: FormRules = { billNo: [{ required: true, message: '请输入账单号', trigger: 'blur' }] }

function handleAdd() {
  Object.assign(form, { billNo: '', tenant: '', method: '电话', result: '', nextFollow: '' })
  dialog.value = true
}
async function submit() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitting.value = true
    try {
      await createCollection({ ...form, lastTime: new Date().toISOString().slice(0, 10) })
      ElMessage.success('催收记录已保存')
      dialog.value = false
      getList()
    } finally {
      submitting.value = false
    }
  })
}
function handleUrge(row: any) {
  ElMessage.success(`已向 ${row.tenant} 发送催缴通知（短信/小程序）`)
}

onMounted(() => getList())
</script>
