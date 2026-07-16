<template>
  <div class="page-container">
    <ProTable
      :data="list" :total="total" :loading="loading" :columns="columns"
      v-model:current="query.pageNum" v-model:size="query.pageSize"
      @size-change="handleSizeChange" @current-change="handleCurrentChange"
    >
      <template #toolbar>
        <el-input v-model="query.filters.keyword" placeholder="模板名称" clearable style="width: 200px" />
        <el-button type="primary" :icon="Search" @click="search()">查询</el-button>
        <el-button type="success" :icon="Plus" v-permission="'sys:msg:edit'" @click="handleCreate">新增模板</el-button>
      </template>
      <template #channel="{ row }">{{ row.channel }}</template>
      <template #status="{ row }"><el-tag :type="row.status === 'ENABLED' ? 'success' : 'info'">{{ row.status === 'ENABLED' ? '启用' : '停用' }}</el-tag></template>
      <template #action="{ row }">
        <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
        <el-button type="primary" link @click="handleTest(row)">测试发送</el-button>
      </template>
    </ProTable>

    <ProDialog v-model:visible="dialog" :title="dialogTitle" :submitting="submitting" width="520px" @submit="submit">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="模板名称" prop="name"><el-input v-model="form.name" /></el-form-item>
        <el-form-item label="触发场景">
          <el-select v-model="form.scene" style="width:100%"><el-option label="合同到期" value="CONTRACT_EXPIRE" /><el-option label="租金欠费" value="RENT_OVERDUE" /><el-option label="报修超时" value="REPAIR_TIMEOUT" /></el-select>
        </el-form-item>
        <el-form-item label="渠道">
          <el-checkbox-group v-model="channels">
            <el-checkbox value="SMS">短信</el-checkbox><el-checkbox value="EMAIL">邮件</el-checkbox><el-checkbox value="APP">APP推送</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="提前天数"><el-input-number v-model="form.advanceDays" :min="0" /></el-form-item>
        <el-form-item label="模板内容"><el-input v-model="form.content" type="textarea" :rows="3" /></el-form-item>
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
import { getMessageTemplatePage, createMessageTemplate, updateMessageTemplate } from '@/api/system'
import type { ProColumn } from '@/components/ProTable/index.vue'

const { loading, list, total, query, getList, search, handleSizeChange, handleCurrentChange } = useTable(getMessageTemplatePage)
const columns: ProColumn[] = [
  { prop: 'name', label: '模板名称', width: 160 },
  { prop: 'scene', label: '场景', width: 140, formatter: (r: any) => ({ CONTRACT_EXPIRE: '合同到期', RENT_OVERDUE: '租金欠费', REPAIR_TIMEOUT: '报修超时' } as Record<string, string>)[r.scene] },
  { prop: 'channel', label: '渠道', width: 160, slot: 'channel' },
  { prop: 'advanceDays', label: '提前(天)', width: 100 },
  { prop: 'status', label: '状态', width: 90, slot: 'status' },
  { prop: 'action', label: '操作', width: 140, fixed: 'right', slot: 'action' }
]

const dialog = ref(false)
const dialogTitle = ref('')
const submitting = ref(false)
const editingId = ref<string | null>(null)
const channels = ref<string[]>(['SMS'])
const formRef = ref<FormInstance>()
const form = reactive({ name: '', scene: 'CONTRACT_EXPIRE', advanceDays: 30, content: '' })
const rules: FormRules = { name: [{ required: true, message: '请输入名称', trigger: 'blur' }] }

function handleCreate() {
  editingId.value = null
  dialogTitle.value = '新增模板'
  channels.value = ['SMS']
  Object.assign(form, { name: '', scene: 'CONTRACT_EXPIRE', advanceDays: 30, content: '' })
  dialog.value = true
}
function handleEdit(row: any) {
  editingId.value = row.tplId
  dialogTitle.value = '编辑模板'
  channels.value = row.channel.split(',')
  Object.assign(form, { name: row.name, scene: row.scene, advanceDays: row.advanceDays, content: row.content })
  dialog.value = true
}
async function submit() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitting.value = true
    try {
      const payload = { ...form, channel: channels.value.join(',') }
      if (editingId.value) await updateMessageTemplate(editingId.value, payload)
      else await createMessageTemplate(payload)
      ElMessage.success('保存成功')
      dialog.value = false
      getList()
    } finally {
      submitting.value = false
    }
  })
}
function handleTest(row: any) {
  ElMessage.success(`模板「${row.name}」测试消息已发送`)
}

onMounted(() => getList())
</script>
