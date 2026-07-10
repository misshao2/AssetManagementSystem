<template>
  <div class="page-container">
    <ProTable
      :data="list" :total="total" :loading="loading" :columns="columns"
      v-model:current="query.pageNum" v-model:size="query.pageSize"
      @size-change="handleSizeChange" @current-change="handleCurrentChange"
    >
      <template #toolbar>
        <el-button type="success" :icon="Plus" v-permission="'cert:borrow:edit'" @click="handleCreate">借阅申请</el-button>
      </template>
      <template #status="{ row }">
        <el-tag :type="row.status === 'BORROWED' ? 'warning' : row.status === 'OVERDUE' ? 'danger' : 'success'">
          {{ row.status === 'BORROWED' ? '借出中' : row.status === 'OVERDUE' ? '已逾期' : '已归还' }}
        </el-tag>
      </template>
      <template #action="{ row }">
        <el-button v-if="row.status === 'BORROWED'" type="primary" link @click="handleReturn(row)">归还登记</el-button>
        <el-button type="primary" link @click="handleRemind(row)" v-if="row.status !== 'RETURNED'">提醒</el-button>
      </template>
    </ProTable>

    <ProDialog v-model:visible="dialog" title="借阅申请" :submitting="submitting" width="480px" @submit="submit">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="权证" prop="certNo"><el-input v-model="form.certNo" /></el-form-item>
        <el-form-item label="借阅人" prop="borrower"><el-input v-model="form.borrower" /></el-form-item>
        <el-form-item label="部门"><el-input v-model="form.dept" /></el-form-item>
        <el-form-item label="用途"><el-input v-model="form.purpose" type="textarea" :rows="2" /></el-form-item>
        <el-form-item label="应还日期"><el-date-picker v-model="form.dueDate" type="date" value-format="YYYY-MM-DD" style="width:100%" /></el-form-item>
      </el-form>
    </ProDialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import ProTable from '@/components/ProTable/index.vue'
import ProDialog from '@/components/ProDialog/index.vue'
import { useTable } from '@/composables/useTable'
import { getCertBorrowPage, createBorrow, updateBorrow } from '@/api/certificate'
import type { ProColumn } from '@/components/ProTable/index.vue'

const { loading, list, total, query, getList, handleSizeChange, handleCurrentChange } = useTable(getCertBorrowPage)

const columns: ProColumn[] = [
  { prop: 'certNo', label: '权证编号', minWidth: 200 },
  { prop: 'borrower', label: '借阅人', width: 100 },
  { prop: 'dept', label: '部门', width: 120 },
  { prop: 'borrowDate', label: '借出日', width: 120 },
  { prop: 'dueDate', label: '应还日', width: 120 },
  { prop: 'returnDate', label: '实际归还', width: 120 },
  { prop: 'status', label: '状态', width: 100, slot: 'status' },
  { prop: 'action', label: '操作', width: 140, fixed: 'right', slot: 'action' }
]

const dialog = ref(false)
const submitting = ref(false)
const formRef = ref<FormInstance>()
const form = reactive({ certNo: '', borrower: '', dept: '', purpose: '', dueDate: '' })
const rules: FormRules = {
  certNo: [{ required: true, message: '请输入权证编号', trigger: 'blur' }],
  borrower: [{ required: true, message: '请输入借阅人', trigger: 'blur' }]
}

function handleCreate() {
  Object.assign(form, { certNo: '', borrower: '', dept: '', purpose: '', dueDate: '' })
  dialog.value = true
}
async function submit() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitting.value = true
    try {
      await createBorrow({ ...form, borrowDate: new Date().toISOString().slice(0, 10), status: 'BORROWED' })
      ElMessage.success('申请已提交')
      dialog.value = false
      getList()
    } finally {
      submitting.value = false
    }
  })
}
async function handleReturn(row: any) {
  await updateBorrow(row.borrowId, { returnDate: new Date().toISOString().slice(0, 10), status: 'RETURNED' })
  ElMessage.success('已归还')
  getList()
}
function handleRemind(row: any) {
  ElMessage.success(`已向 ${row.borrower} 发送催还提醒`)
}

onMounted(() => getList())
</script>
