<template>
  <div class="page-container">
    <ProTable
      :data="list" :total="total" :loading="loading" :columns="columns"
      v-model:current="query.pageNum" v-model:size="query.pageSize"
      @size-change="handleSizeChange" @current-change="handleCurrentChange"
    >
      <template #toolbar>
        <el-input v-model="query.filters.keyword" placeholder="计划/资产" clearable style="width: 200px" />
        <el-button type="primary" :icon="Search" @click="search()">查询</el-button>
        <el-button type="success" :icon="Plus" @click="handleCreate">录入巡检</el-button>
      </template>
      <template #result="{ row }">
        <el-tag :type="row.result === 'NORMAL' ? 'success' : 'danger'">{{ row.result === 'NORMAL' ? '达标' : '异常' }}</el-tag>
      </template>
    </ProTable>

    <ProDialog v-model:visible="dialog" title="现场巡检录入" :submitting="submitting" width="500px" @submit="submit">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="所属计划"><el-input v-model="form.planName" /></el-form-item>
        <el-form-item label="资产" prop="assetName"><el-input v-model="form.assetName" /></el-form-item>
        <el-form-item label="巡检人"><el-input v-model="form.executor" /></el-form-item>
        <el-form-item label="检查项数"><el-input-number v-model="form.items" :min="0" style="width:100%" /></el-form-item>
        <el-form-item label="异常项数"><el-input-number v-model="form.abnormal" :min="0" style="width:100%" /></el-form-item>
        <el-form-item label="巡检结果">
          <el-radio-group v-model="form.result"><el-radio value="NORMAL">达标</el-radio><el-radio value="ABNORMAL">异常</el-radio></el-radio-group>
        </el-form-item>
        <el-form-item label="现场照片"><FileUpload tip="上传巡检现场照片" /></el-form-item>
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
import FileUpload from '@/components/FileUpload/index.vue'
import { useTable } from '@/composables/useTable'
import { getInspectPage, createInspect } from '@/api/safety'
import type { ProColumn } from '@/components/ProTable/index.vue'

const { loading, list, total, query, getList, search, handleSizeChange, handleCurrentChange } = useTable(getInspectPage)
const columns: ProColumn[] = [
  { prop: 'planName', label: '计划', minWidth: 140 },
  { prop: 'assetName', label: '资产', minWidth: 160 },
  { prop: 'executor', label: '巡检人', width: 110 },
  { prop: 'inspectDate', label: '日期', width: 120 },
  { prop: 'items', label: '检查项', width: 90 },
  { prop: 'abnormal', label: '异常项', width: 90 },
  { prop: 'result', label: '结果', width: 90, slot: 'result' },
  { prop: 'action', label: '操作', width: 80, fixed: 'right' }
]

const dialog = ref(false)
const submitting = ref(false)
const formRef = ref<FormInstance>()
const form = reactive({ planName: '', assetName: '', executor: '', items: 10, abnormal: 0, result: 'NORMAL' })
const rules: FormRules = { assetName: [{ required: true, message: '请输入资产', trigger: 'blur' }] }

function handleCreate() {
  Object.assign(form, { planName: '', assetName: '', executor: '', items: 10, abnormal: 0, result: 'NORMAL' })
  dialog.value = true
}
async function submit() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitting.value = true
    try {
      await createInspect({ ...form, inspectDate: new Date().toISOString().slice(0, 10) })
      ElMessage.success('巡检记录已保存' + (form.result === 'ABNORMAL' ? '，已自动生成隐患/工单' : ''))
      dialog.value = false
      getList()
    } finally {
      submitting.value = false
    }
  })
}

onMounted(() => getList())
</script>
