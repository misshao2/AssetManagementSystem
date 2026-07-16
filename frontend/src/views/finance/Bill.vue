<template>
  <div class="page-container">
    <el-card shadow="hover">
      <template #header>
        <span>账单管理</span>
        <el-button type="primary" size="small" style="float: right" @click="handleGen">按合同生成账单</el-button>
      </template>
      <el-table :data="bills" border>
        <el-table-column prop="billNo" label="账单号" width="180" />
        <el-table-column prop="tenant" label="租户" />
        <el-table-column prop="period" label="账期" width="120" />
        <el-table-column prop="amount" label="应收金额" width="140" />
        <el-table-column prop="status" label="状态" width="100" />
        <el-table-column label="操作" width="160" fixed="right">
          <template #default>
            <el-button type="primary" link>核销</el-button>
            <el-button type="primary" link>开票</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { genBill } from '@/api/finance'
import { ElMessage } from 'element-plus'

const bills = [
  { billNo: 'B-2026-0001', tenant: '某科技公司', period: '2026-07', amount: '86,400', status: '已收' },
  { billNo: 'B-2026-0002', tenant: '某餐饮品牌', period: '2026-07', amount: '52,000', status: '逾期' }
]

function handleGen() {
  genBill('C-0001')
    .then(() => ElMessage.success('账单已生成'))
    .catch(() => ElMessage.error('生成失败'))
}
</script>
