<template>
  <div class="page-container">
    <ProTable
      :data="list" :total="total" :loading="loading" :columns="columns"
      v-model:current="query.pageNum" v-model:size="query.pageSize"
      @size-change="handleSizeChange" @current-change="handleCurrentChange"
    >
      <template #toolbar>
        <el-input v-model="query.filters.keyword" placeholder="权证编号/资产" clearable style="width: 220px" />
        <el-button type="primary" :icon="Search" @click="search()">查询</el-button>
        <el-button :icon="Refresh" @click="reset()">重置</el-button>
        <el-button type="success" :icon="Plus" v-permission="'cert:view'" @click="handleCreate">新增权证</el-button>
      </template>
      <template #certType="{ row }"><DictTag type="CertificateType" :value="row.certType" /></template>
      <template #action="{ row }">
        <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
      </template>
    </ProTable>

    <ProDialog v-model:visible="dialog" :title="dialogTitle" :submitting="submitting" width="520px" @submit="submit">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="权证编号" prop="certNo"><el-input v-model="form.certNo" /></el-form-item>
        <el-form-item label="权证类型" prop="certType">
          <el-select v-model="form.certType" style="width: 100%">
            <el-option v-for="t in certTypes" :key="t.value" :label="t.label" :value="t.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="所属资产" prop="assetName"><el-input v-model="form.assetName" /></el-form-item>
        <el-form-item label="权利人"><el-input v-model="form.owner" /></el-form-item>
        <el-form-item label="取得日期"><el-date-picker v-model="form.acquireDate" type="date" value-format="YYYY-MM-DD" style="width:100%" /></el-form-item>
        <el-form-item label="到期日"><el-date-picker v-model="form.expireDate" type="date" value-format="YYYY-MM-DD" style="width:100%" /></el-form-item>
        <el-form-item label="扫描件"><FileUpload tip="支持上传多份权证扫描件" /></el-form-item>
      </el-form>
    </ProDialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Refresh, Plus } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import ProTable from '@/components/ProTable/index.vue'
import ProDialog from '@/components/ProDialog/index.vue'
import DictTag from '@/components/DictTag/index.vue'
import FileUpload from '@/components/FileUpload/index.vue'
import { useTable } from '@/composables/useTable'
import { getCertArchivePage, createCertArchive, updateCertArchive } from '@/api/certificate'
import type { ProColumn } from '@/components/ProTable/index.vue'

const certTypes = [
  { label: '房屋所有权证', value: 'HOUSE_OWNERSHIP' },
  { label: '国有土地使用证', value: 'LAND_USE' },
  { label: '不动产权证', value: 'REAL_ESTATE' },
  { label: '他项权证', value: 'OTHER_RIGHT' }
]

const { loading, list, total, query, getList, search, reset, handleSizeChange, handleCurrentChange } =
  useTable(getCertArchivePage)

const columns: ProColumn[] = [
  { prop: 'certNo', label: '权证编号', minWidth: 200 },
  { prop: 'certType', label: '类型', width: 140, slot: 'certType' },
  { prop: 'assetName', label: '所属资产', minWidth: 160 },
  { prop: 'owner', label: '权利人', width: 120 },
  { prop: 'acquireDate', label: '取得日期', width: 120 },
  { prop: 'expireDate', label: '到期日', width: 120 },
  { prop: 'fileCount', label: '附件数', width: 80 },
  { prop: 'action', label: '操作', width: 100, fixed: 'right', slot: 'action' }
]

const dialog = ref(false)
const dialogTitle = ref('')
const submitting = ref(false)
const editingId = ref<string | null>(null)
const formRef = ref<FormInstance>()
const form = reactive({ certNo: '', certType: '', assetName: '', owner: '', acquireDate: '', expireDate: '' })
const rules: FormRules = {
  certNo: [{ required: true, message: '请输入权证编号', trigger: 'blur' }],
  certType: [{ required: true, message: '请选择权证类型', trigger: 'change' }],
  assetName: [{ required: true, message: '请输入所属资产', trigger: 'blur' }]
}

function handleCreate() {
  editingId.value = null
  dialogTitle.value = '新增权证'
  Object.assign(form, { certNo: '', certType: '', assetName: '', owner: '', acquireDate: '', expireDate: '' })
  dialog.value = true
}
function handleEdit(row: any) {
  editingId.value = row.certId
  dialogTitle.value = '编辑权证'
  Object.assign(form, { certNo: row.certNo, certType: row.certType, assetName: row.assetName, owner: row.owner, acquireDate: row.acquireDate, expireDate: row.expireDate })
  dialog.value = true
}
async function submit() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitting.value = true
    try {
      if (editingId.value) await updateCertArchive(editingId.value, { ...form })
      else await createCertArchive({ ...form, status: 'NORMAL' })
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
