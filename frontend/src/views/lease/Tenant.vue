<template>
  <div class="page-container">
    <ProTable
      :data="list" :total="total" :loading="loading" :columns="columns"
      v-model:current="query.pageNum" v-model:size="query.pageSize"
      @size-change="handleSizeChange" @current-change="handleCurrentChange"
    >
      <template #toolbar>
        <el-input v-model="query.filters.keyword" placeholder="租户名称/信用代码" clearable style="width: 220px" />
        <el-button type="primary" :icon="Search" @click="search()">查询</el-button>
        <el-button type="success" :icon="Plus" v-permission="'lease:tenant:edit'" @click="handleCreate">新增租户</el-button>
      </template>
      <template #creditLevel="{ row }">
        <el-tag :type="row.creditLevel === 'A' ? 'success' : row.creditLevel === 'B' ? 'warning' : 'info'">{{ row.creditLevel }}</el-tag>
      </template>
      <template #action="{ row }">
        <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
      </template>
    </ProTable>

    <ProDialog v-model:visible="dialog" :title="dialogTitle" :submitting="submitting" width="520px" @submit="submit">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="租户名称" prop="name"><el-input v-model="form.name" /></el-form-item>
        <el-form-item label="租户类型">
          <el-select v-model="form.type" style="width:100%"><el-option label="企业" value="ENTERPRISE" /><el-option label="个人" value="PERSONAL" /></el-select>
        </el-form-item>
        <el-form-item label="统一信用代码"><el-input v-model="form.creditCode" /></el-form-item>
        <el-form-item label="联系人"><el-input v-model="form.contact" /></el-form-item>
        <el-form-item label="所属行业"><el-input v-model="form.industry" /></el-form-item>
        <el-form-item label="信用等级">
          <el-select v-model="form.creditLevel" style="width:100%"><el-option label="A" value="A" /><el-option label="B" value="B" /><el-option label="C" value="C" /></el-select>
        </el-form-item>
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
import { getTenantPage, createTenant, updateTenant } from '@/api/lease'
import type { ProColumn } from '@/components/ProTable/index.vue'

const { loading, list, total, query, getList, search, handleSizeChange, handleCurrentChange } = useTable(getTenantPage)
const columns: ProColumn[] = [
  { prop: 'name', label: '租户名称', minWidth: 160 },
  { prop: 'type', label: '类型', width: 100, formatter: (r: any) => (r.type === 'ENTERPRISE' ? '企业' : '个人') },
  { prop: 'creditCode', label: '信用代码', width: 180 },
  { prop: 'contact', label: '联系人', width: 110 },
  { prop: 'industry', label: '行业', width: 120 },
  { prop: 'creditLevel', label: '信用等级', width: 100, slot: 'creditLevel' },
  { prop: 'contractCount', label: '合同数', width: 90 },
  { prop: 'action', label: '操作', width: 100, fixed: 'right', slot: 'action' }
]

const dialog = ref(false)
const dialogTitle = ref('')
const submitting = ref(false)
const editingId = ref<string | null>(null)
const formRef = ref<FormInstance>()
const form = reactive({ name: '', type: 'ENTERPRISE', creditCode: '', contact: '', industry: '', creditLevel: 'A' })
const rules: FormRules = { name: [{ required: true, message: '请输入租户名称', trigger: 'blur' }] }

function handleCreate() {
  editingId.value = null
  dialogTitle.value = '新增租户'
  Object.assign(form, { name: '', type: 'ENTERPRISE', creditCode: '', contact: '', industry: '', creditLevel: 'A' })
  dialog.value = true
}
function handleEdit(row: any) {
  editingId.value = row.tenantId
  dialogTitle.value = '编辑租户'
  Object.assign(form, row)
  dialog.value = true
}
async function submit() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitting.value = true
    try {
      if (editingId.value) await updateTenant(editingId.value, { ...form })
      else await createTenant({ ...form, contractCount: 0 })
      ElMessage.success('保存成功')
      dialog.value = false
      getList()
    } finally {
      submitting.value = false
    }
  })
}

onMounted(() => getList())
</script>
