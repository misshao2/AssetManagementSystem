<template>
  <div class="page-container">
    <ProTable
      :data="list" :total="total" :loading="loading" :columns="columns"
      v-model:current="query.pageNum" v-model:size="query.pageSize"
      @size-change="handleSizeChange" @current-change="handleCurrentChange"
    >
      <template #toolbar>
        <el-input v-model="query.filters.keyword" placeholder="隐患/资产" clearable style="width: 200px" />
        <el-button type="primary" :icon="Search" @click="search()">查询</el-button>
        <el-button type="success" :icon="Plus" v-permission="'safety:hazard:edit'" @click="handleCreate">登记隐患</el-button>
      </template>
      <template #level="{ row }"><el-tag :type="row.level === 'MAJOR' ? 'danger' : 'warning'"><DictTag type="HazardLevel" :value="row.level" effect="dark" /></el-tag></template>
      <template #status="{ row }">
        <el-tag :type="row.status === 'RECTIFIED' ? 'success' : row.status === 'PENDING' ? 'danger' : 'warning'">{{ ({ PENDING: '待整改', RECTIFYING: '整改中', RECTIFIED: '已闭环' } as Record<string, string>)[row.status] }}</el-tag>
      </template>
      <template #action="{ row }">
        <el-button v-if="row.status !== 'RECTIFIED'" type="primary" link @click="verify(row)">整改验证</el-button>
      </template>
    </ProTable>

    <ProDialog v-model:visible="dialog" title="隐患登记" :submitting="submitting" width="480px" @submit="submit">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="隐患描述" prop="title"><el-input v-model="form.title" /></el-form-item>
        <el-form-item label="资产" prop="assetName"><el-input v-model="form.assetName" /></el-form-item>
        <el-form-item label="隐患等级"><el-select v-model="form.level" style="width:100%"><el-option label="一般" value="NORMAL" /><el-option label="重大" value="MAJOR" /></el-select></el-form-item>
        <el-form-item label="整改人"><el-input v-model="form.reporter" /></el-form-item>
        <el-form-item label="整改期限"><el-date-picker v-model="form.deadline" type="date" value-format="YYYY-MM-DD" style="width:100%" /></el-form-item>
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
import DictTag from '@/components/DictTag/index.vue'
import { useTable } from '@/composables/useTable'
import { getHazardPage, createHazard, updateHazard } from '@/api/safety'
import type { ProColumn } from '@/components/ProTable/index.vue'

const { loading, list, total, query, getList, search, handleSizeChange, handleCurrentChange } = useTable(getHazardPage)
const columns: ProColumn[] = [
  { prop: 'title', label: '隐患描述', minWidth: 180 },
  { prop: 'assetName', label: '资产', minWidth: 160 },
  { prop: 'level', label: '等级', width: 110, slot: 'level' },
  { prop: 'reporter', label: '上报人', width: 110 },
  { prop: 'deadline', label: '整改期限', width: 130 },
  { prop: 'status', label: '状态', width: 110, slot: 'status' },
  { prop: 'action', label: '操作', width: 110, fixed: 'right', slot: 'action' }
]

const dialog = ref(false)
const submitting = ref(false)
const formRef = ref<FormInstance>()
const form = reactive({ title: '', assetName: '', level: 'NORMAL', reporter: '', deadline: '' })
const rules: FormRules = { title: [{ required: true, message: '请输入隐患描述', trigger: 'blur' }], assetName: [{ required: true, message: '请输入资产', trigger: 'blur' }] }

function handleCreate() {
  Object.assign(form, { title: '', assetName: '', level: 'NORMAL', reporter: '', deadline: '' })
  dialog.value = true
}
async function submit() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitting.value = true
    try {
      await createHazard({ ...form, status: 'PENDING' })
      ElMessage.success('隐患已登记' + (form.level === 'MAJOR' ? '，已升级预警中心' : ''))
      dialog.value = false
      getList()
    } finally {
      submitting.value = false
    }
  })
}
async function verify(row: any) {
  await updateHazard(row.hazardId, { status: 'RECTIFIED' })
  ElMessage.success('整改验证通过，隐患闭环')
  getList()
}

onMounted(() => getList())
</script>
