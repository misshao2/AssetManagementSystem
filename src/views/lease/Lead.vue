<template>
  <div class="page-container">
    <ProTable
      :data="list" :total="total" :loading="loading" :columns="columns"
      v-model:current="query.pageNum" v-model:size="query.pageSize"
      @size-change="handleSizeChange" @current-change="handleCurrentChange"
    >
      <template #toolbar>
        <el-input v-model="query.filters.keyword" placeholder="客户/电话" clearable style="width: 200px" />
        <el-button type="primary" :icon="Search" @click="search()">查询</el-button>
        <el-button type="success" :icon="Plus" @click="handleCreate">新增线索</el-button>
      </template>
      <template #followStatus="{ row }">
        <el-tag :type="row.followStatus === 'SIGNED' ? 'success' : row.followStatus === 'FOLLOWING' ? 'warning' : 'info'">
          {{ row.followStatus === 'SIGNED' ? '已签约' : row.followStatus === 'FOLLOWING' ? '跟进中' : '新线索' }}
        </el-tag>
      </template>
      <template #action="{ row }">
        <el-button type="primary" link @click="handleConvert(row)">转租户</el-button>
      </template>
    </ProTable>

    <ProDialog v-model:visible="dialog" title="新增招商线索" :submitting="submitting" width="480px" @submit="submit">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="客户" prop="customer"><el-input v-model="form.customer" /></el-form-item>
        <el-form-item label="电话"><el-input v-model="form.phone" /></el-form-item>
        <el-form-item label="意向业态"><el-input v-model="form.intention" /></el-form-item>
        <el-form-item label="需求面积"><el-input v-model="form.area" /></el-form-item>
        <el-form-item label="来源">
          <el-select v-model="form.source" style="width:100%"><el-option label="官网" value="官网" /><el-option label="中介" value="中介" /><el-option label="自拓" value="自拓" /></el-select>
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
import { getLeadPage, createLead } from '@/api/lease'
import type { ProColumn } from '@/components/ProTable/index.vue'

const { loading, list, total, query, getList, search, handleSizeChange, handleCurrentChange } = useTable(getLeadPage)
const columns: ProColumn[] = [
  { prop: 'customer', label: '客户', width: 120 },
  { prop: 'phone', label: '电话', width: 140 },
  { prop: 'intention', label: '意向业态', width: 120 },
  { prop: 'area', label: '需求面积', width: 120 },
  { prop: 'source', label: '来源', width: 100 },
  { prop: 'owner', label: '负责人', width: 100 },
  { prop: 'followStatus', label: '跟进状态', width: 110, slot: 'followStatus' },
  { prop: 'action', label: '操作', width: 100, fixed: 'right', slot: 'action' }
]

const dialog = ref(false)
const submitting = ref(false)
const formRef = ref<FormInstance>()
const form = reactive({ customer: '', phone: '', intention: '', area: '', source: '官网' })
const rules: FormRules = { customer: [{ required: true, message: '请输入客户', trigger: 'blur' }] }

function handleCreate() {
  Object.assign(form, { customer: '', phone: '', intention: '', area: '', source: '官网' })
  dialog.value = true
}
async function submit() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitting.value = true
    try {
      await createLead({ ...form, followStatus: 'NEW', createTime: new Date().toISOString().slice(0, 10) })
      ElMessage.success('线索已录入')
      dialog.value = false
      getList()
    } finally {
      submitting.value = false
    }
  })
}
function handleConvert(row: any) {
  ElMessage.success(`线索「${row.customer}」已转为租户档案`)
}

onMounted(() => getList())
</script>
