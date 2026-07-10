<template>
  <div class="page-container">
    <el-row :gutter="16">
      <el-col v-for="c in cards" :key="c.label" :span="6">
        <el-card shadow="hover" class="card">
          <div class="label">{{ c.label }}</div>
          <div class="value">{{ c.value }}</div>
        </el-card>
      </el-col>
    </el-row>
    <el-card shadow="hover" style="margin-top: 16px">
      <template #header>到期预警清单</template>
      <el-table :data="expireList" border>
        <el-table-column prop="certNo" label="权证编号" />
        <el-table-column prop="assetName" label="资产" />
        <el-table-column prop="expireDate" label="到期日" />
        <el-table-column prop="remainDays" label="剩余天数" />
        <el-table-column prop="status" label="处理状态" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
const cards = [
  { label: '权证总量', value: '1,024' },
  { label: '按类型分布', value: '6 类' },
  { label: '即将到期', value: '12' },
  { label: '受限(抵押/查封)', value: '5' }
]

const expireList = [
  { certNo: '沪(2026)不动产权第0001号', assetName: '滨江国际写字楼', expireDate: '2026-12-31', remainDays: 174, status: '待处理' },
  { certNo: '沪(2026)不动产权第0002号', assetName: '阳光商业广场', expireDate: '2026-09-30', remainDays: 82, status: '续期中' }
]
</script>

<style scoped>
.card { text-align: center; }
.card .label { color: #909399; font-size: 13px; }
.card .value { font-size: 24px; font-weight: 700; margin-top: 8px; }
</style>
