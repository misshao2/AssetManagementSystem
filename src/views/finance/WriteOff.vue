<template>
  <div class="page-container">
    <el-row :gutter="16">
      <el-col :span="14">
        <el-card shadow="hover">
          <template #header><span>待核销账单</span></template>
          <el-table :data="bills" border @current-change="onSelect">
            <el-table-column prop="billNo" label="账单号" width="160" />
            <el-table-column prop="tenant" label="租户" />
            <el-table-column prop="amount" label="金额(元)" width="120" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }"><DictTag type="BillStatus" :value="row.status" /></template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="10">
        <el-card shadow="hover">
          <template #header><span>核销录入</span></template>
          <el-form label-width="100px">
            <el-form-item label="选择账单"><el-input :model-value="current?.billNo" disabled placeholder="左侧选择" /></el-form-item>
            <el-form-item label="收款流水号"><el-input v-model="form.receiptNo" /></el-form-item>
            <el-form-item label="核销金额(元)"><el-input-number v-model="form.amount" :min="0" style="width:100%" /></el-form-item>
            <el-form-item label="核销方式">
              <el-radio-group v-model="form.mode"><el-radio value="FULL">全额</el-radio><el-radio value="PARTIAL">部分</el-radio><el-radio value="REVERSE">冲红</el-radio></el-radio-group>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :loading="submitting" @click="submit">确认核销</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import DictTag from '@/components/DictTag/index.vue'
import { getBillPage, writeOff } from '@/api/finance'

const bills = ref<any[]>([])
const current = ref<any>(null)
const submitting = ref(false)
const form = reactive({ receiptNo: '', amount: 0, mode: 'FULL' })

function onSelect(row: any) {
  if (row) {
    current.value = row
    form.amount = Number(row.amount) || 0
  }
}
async function submit() {
  if (!current.value) return ElMessage.warning('请先选择账单')
  submitting.value = true
  try {
    await writeOff({ billNo: current.value.billNo, ...form })
    ElMessage.success('核销成功，账单状态已回填')
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  const res = await getBillPage({ pageNum: 1, pageSize: 50, filters: {} })
  bills.value = res.list
})
</script>
