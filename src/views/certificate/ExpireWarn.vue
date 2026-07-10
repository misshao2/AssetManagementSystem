<template>
  <div class="page-container">
    <el-alert type="warning" :closable="false" title="权证到期预警：剩余天数 ≤90 天标黄，≤30 天标红，请及时处理续期/注销。" style="margin-bottom: 12px" />
    <ProTable
      :data="list" :total="total" :loading="loading" :columns="columns"
      v-model:current="query.pageNum" v-model:size="query.pageSize"
      @size-change="handleSizeChange" @current-change="handleCurrentChange"
    >
      <template #toolbar>
        <el-input v-model="query.filters.keyword" placeholder="权证编号/资产" clearable style="width: 220px" />
        <el-button type="primary" :icon="Search" @click="search()">查询</el-button>
      </template>
      <template #remain="{ row }">
        <el-tag :type="row.remainDays <= 30 ? 'danger' : row.remainDays <= 90 ? 'warning' : 'success'">
          {{ row.remainDays }} 天
        </el-tag>
      </template>
      <template #action="{ row }">
        <el-button type="primary" link @click="handleProcess(row)">处理</el-button>
      </template>
    </ProTable>

    <ProDialog v-model:visible="dialog" title="到期处理" :submitting="submitting" width="460px" @submit="submit">
      <el-form label-width="90px">
        <el-form-item label="处理方式">
          <el-radio-group v-model="processForm.action">
            <el-radio value="RENEW">续期</el-radio>
            <el-radio value="CANCEL">注销</el-radio>
            <el-radio value="NOTE">仅备注</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注说明"><el-input v-model="processForm.remark" type="textarea" :rows="3" /></el-form-item>
      </el-form>
    </ProDialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import ProTable from '@/components/ProTable/index.vue'
import ProDialog from '@/components/ProDialog/index.vue'
import { useTable } from '@/composables/useTable'
import { getCertExpireList, updateCertArchive } from '@/api/certificate'
import type { ProColumn } from '@/components/ProTable/index.vue'

const { loading, list, total, query, getList, search, handleSizeChange, handleCurrentChange } =
  useTable(getCertExpireList)

const columns: ProColumn[] = [
  { prop: 'certNo', label: '权证编号', minWidth: 200 },
  { prop: 'assetName', label: '资产', minWidth: 160 },
  { prop: 'expireDate', label: '到期日', width: 120 },
  { prop: 'remainDays', label: '剩余天数', width: 110, slot: 'remain' },
  { prop: 'status', label: '处理状态', width: 120 },
  { prop: 'action', label: '操作', width: 100, fixed: 'right', slot: 'action' }
]

const dialog = ref(false)
const submitting = ref(false)
const current = ref<any>(null)
const processForm = reactive({ action: 'RENEW', remark: '' })

function handleProcess(row: any) {
  current.value = row
  processForm.action = 'RENEW'
  processForm.remark = ''
  dialog.value = true
}
async function submit() {
  if (!current.value) return
  submitting.value = true
  try {
    await updateCertArchive(current.value.certId, { status: processForm.action === 'RENEW' ? 'RENEWING' : 'CANCELLED' })
    ElMessage.success('已提交处理')
    dialog.value = false
    getList()
  } finally {
    submitting.value = false
  }
}

onMounted(() => getList())
</script>
