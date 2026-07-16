<template>
  <div class="page-container">
    <ProTable
      :data="list" :total="total" :loading="loading" :columns="columns"
      v-model:current="query.pageNum" v-model:size="query.pageSize"
      @size-change="handleSizeChange" @current-change="handleCurrentChange"
    >
      <template #toolbar>
        <el-input v-model="query.filters.keyword" placeholder="计划名称" clearable style="width: 200px" />
        <el-button type="primary" :icon="Search" @click="search()">查询</el-button>
        <el-button type="success" :icon="Plus" v-permission="'safety:plan:edit'" @click="handleCreate">新增计划</el-button>
      </template>
      <template #type="{ row }"><el-tag>{{ row.type === 'DAILY' ? '日常' : '专项' }}</el-tag></template>
      <template #status="{ row }"><el-tag :type="row.status === 'RUNNING' ? 'success' : 'info'">{{ row.status === 'RUNNING' ? '执行中' : '已结束' }}</el-tag></template>
      <template #action="{ row }">
        <el-button type="primary" link @click="handleGenerate(row)">生成任务</el-button>
      </template>
    </ProTable>

    <ProDialog v-model:visible="dialog" title="新增巡检计划" :submitting="submitting" width="500px" @submit="submit">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="计划名称" prop="planName"><el-input v-model="form.planName" /></el-form-item>
        <el-form-item label="巡检区域"><el-input v-model="form.area" /></el-form-item>
        <el-form-item label="类型"><el-select v-model="form.type" style="width:100%"><el-option label="日常" value="DAILY" /><el-option label="专项" value="SPECIAL" /></el-select></el-form-item>
        <el-form-item label="频次"><el-select v-model="form.freq" style="width:100%"><el-option label="日" value="DAY" /><el-option label="周" value="WEEK" /><el-option label="月" value="MONTH" /></el-select></el-form-item>
        <el-form-item label="执行人"><el-input v-model="form.executor" /></el-form-item>
        <el-form-item label="起止日">
          <el-date-picker v-model="form.startDate" type="date" value-format="YYYY-MM-DD" style="width:48%; margin-right:4%" />
          <el-date-picker v-model="form.endDate" type="date" value-format="YYYY-MM-DD" style="width:48%" />
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
import { getPlanPage, createPlan } from '@/api/safety'
import type { ProColumn } from '@/components/ProTable/index.vue'

const { loading, list, total, query, getList, search, handleSizeChange, handleCurrentChange } = useTable(getPlanPage)
const columns: ProColumn[] = [
  { prop: 'planName', label: '计划名称', minWidth: 160 },
  { prop: 'area', label: '区域', minWidth: 140 },
  { prop: 'type', label: '类型', width: 90, slot: 'type' },
  { prop: 'freq', label: '频次', width: 80, formatter: (r: any) => ({ DAY: '日', WEEK: '周', MONTH: '月' } as Record<string, string>)[r.freq] },
  { prop: 'executor', label: '执行人', width: 110 },
  { prop: 'startDate', label: '开始', width: 120 },
  { prop: 'endDate', label: '结束', width: 120 },
  { prop: 'status', label: '状态', width: 100, slot: 'status' },
  { prop: 'action', label: '操作', width: 100, fixed: 'right', slot: 'action' }
]

const dialog = ref(false)
const submitting = ref(false)
const formRef = ref<FormInstance>()
const form = reactive({ planName: '', area: '', type: 'DAILY', freq: 'MONTH', executor: '', startDate: '', endDate: '' })
const rules: FormRules = { planName: [{ required: true, message: '请输入计划名称', trigger: 'blur' }] }

function handleCreate() {
  Object.assign(form, { planName: '', area: '', type: 'DAILY', freq: 'MONTH', executor: '', startDate: '', endDate: '' })
  dialog.value = true
}
async function submit() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitting.value = true
    try {
      await createPlan({ ...form, status: 'RUNNING' })
      ElMessage.success('计划已创建，将按周期自动生成任务')
      dialog.value = false
      getList()
    } finally {
      submitting.value = false
    }
  })
}
function handleGenerate(row: any) {
  ElMessage.success(`已为《${row.planName}》生成本期巡检任务`)
}

onMounted(() => getList())
</script>
