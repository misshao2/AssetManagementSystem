<template>
  <div class="page-container" v-loading="loading">
    <el-card shadow="hover" v-if="asset">
      <template #header>
        <span>{{ asset.buildingName }}</span>
        <el-tag :type="statusTagType(asset.statusName)" style="margin-left: 12px">{{ asset.statusName || '--' }}</el-tag>
        <el-button size="small" style="float: right" @click="$router.push('/asset/list')">返回</el-button>
      </template>
      <el-row :gutter="24">
        <el-col :span="24">
          <el-descriptions :column="3" border>
            <el-descriptions-item label="建筑物名称">{{ asset.buildingName }}</el-descriptions-item>
            <el-descriptions-item label="产权单位">{{ asset.ownerUnit }}</el-descriptions-item>
            <el-descriptions-item label="产权证号">{{ asset.propertyNo }}</el-descriptions-item>
            <el-descriptions-item label="建筑地址" :span="3">{{ asset.address }}</el-descriptions-item>
            <el-descriptions-item label="使用期限">{{ asset.usageTerm }}</el-descriptions-item>
            <el-descriptions-item label="建筑面积">{{ asset.buildingArea }} ㎡</el-descriptions-item>
            <el-descriptions-item label="土地性质">{{ asset.landNature }}</el-descriptions-item>
            <el-descriptions-item label="结构类型">{{ asset.structureType }}</el-descriptions-item>
            <el-descriptions-item label="来源">{{ asset.source }}</el-descriptions-item>
            <el-descriptions-item label="资产价值">{{ asset.assetValue?.toLocaleString('zh-CN', { minimumFractionDigits: 2 }) }} 元</el-descriptions-item>
            <el-descriptions-item label="使用状态">{{ asset.statusName }}</el-descriptions-item>
          </el-descriptions>
        </el-col>
      </el-row>
      <el-tabs style="margin-top: 16px">
        <el-tab-pane label="关联权证"><el-empty description="暂无关联权证" /></el-tab-pane>
        <el-tab-pane label="租赁合同"><el-empty description="暂无租赁合同" /></el-tab-pane>
        <el-tab-pane label="运维记录"><el-empty description="暂无运维记录" /></el-tab-pane>
        <el-tab-pane label="操作日志"><el-empty description="暂无操作日志" /></el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getAssetDetail } from '@/api/asset'
import type { AssetVO } from '@/types'

const route = useRoute()
const asset = ref<AssetVO | null>(null)
const loading = ref(false)

function statusTagType(statusName?: string): 'success' | 'warning' | 'danger' | 'info' {
  if (!statusName) return 'info'
  if (statusName.includes('在用')) return 'success'
  if (statusName.includes('闲置')) return 'warning'
  if (statusName.includes('欠费')) return 'danger'
  return 'info'
}

onMounted(async () => {
  loading.value = true
  try {
    asset.value = await getAssetDetail(route.params.id as string)
  } finally {
    loading.value = false
  }
})
</script>
