<template>
  <div class="page-container">
    <el-card shadow="hover">
      <template #header><span>合同起草 / 租金测算</span></template>
      <el-form :model="form" label-width="130px" style="max-width: 820px">
        <el-row :gutter="16">
          <el-col :span="12"><el-form-item label="关联资产"><el-input v-model="form.assetName" placeholder="选择资产" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="租户"><el-input v-model="form.tenant" /></el-form-item></el-col>
          <el-col :span="8"><el-form-item label="计租面积(㎡)"><el-input-number v-model="form.area" :min="0" style="width:100%" /></el-form-item></el-col>
          <el-col :span="8"><el-form-item label="租金单价(元/㎡)"><el-input-number v-model="form.unitPrice" :min="0" style="width:100%" /></el-form-item></el-col>
          <el-col :span="8"><el-form-item label="免租期(月)"><el-input-number v-model="form.freeMonths" :min="0" style="width:100%" /></el-form-item></el-col>
          <el-col :span="8"><el-form-item label="押金(元)"><el-input-number v-model="form.deposit" :min="0" style="width:100%" /></el-form-item></el-col>
          <el-col :span="8"><el-form-item label="递增规则"><el-select v-model="form.increaseRule" style="width:100%"><el-option label="不递增" value="NONE" /><el-option label="每年5%" value="YEAR_5" /><el-option label="每两年8%" value="TWO_8" /></el-select></el-form-item></el-col>
          <el-col :span="8"><el-form-item label="付款周期"><el-select v-model="form.payCycle" style="width:100%"><el-option label="月付" value="MONTH" /><el-option label="季付" value="QUARTER" /><el-option label="年付" value="YEAR" /></el-select></el-form-item></el-col>
        </el-row>
        <el-form-item>
          <el-button type="primary" @click="calc">测算租金计划</el-button>
          <el-button type="success" :loading="submitting" @click="submit">提交审批</el-button>
        </el-form-item>
      </el-form>

      <el-table v-if="plan.length" :data="plan" border style="margin-top: 12px">
        <el-table-column prop="period" label="期数" width="120" />
        <el-table-column prop="date" label="应收日期" width="140" />
        <el-table-column prop="amount" label="应收金额(元)" />
        <el-table-column prop="status" label="状态" width="100" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { calcRentPlan, createContract } from '@/api/lease'

const router = useRouter()
const form = reactive({ assetName: '', tenant: '', area: 1000, unitPrice: 5, freeMonths: 1, deposit: 50000, increaseRule: 'NONE', payCycle: 'QUARTER' })
const plan = ref<any[]>([])
const submitting = ref(false)

async function calc() {
  const rent = form.area * form.unitPrice
  const res = await calcRentPlan({ rent, months: 12 })
  plan.value = res
}
async function submit() {
  submitting.value = true
  try {
    await createContract({ ...form, rent: form.area * form.unitPrice, status: 'DRAFT' })
    ElMessage.success('合同已起草，进入审批流程')
    router.push('/lease/contract')
  } finally {
    submitting.value = false
  }
}
</script>
