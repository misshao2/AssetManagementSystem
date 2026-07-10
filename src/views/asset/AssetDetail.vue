<template>
  <div class="page-container" v-loading="loading">
    <el-card shadow="hover" v-if="asset">
      <template #header>
        <span>{{ asset.assetName }}</span>
        <DictTag type="AssetStatus" :value="asset.status" style="margin-left: 12px" />
        <el-button size="small" style="float: right" @click="$router.push('/asset/list')">返回</el-button>
      </template>
      <el-row :gutter="24">
        <el-col :span="18">
          <el-descriptions :column="3" border>
            <el-descriptions-item label="资产编码">{{ asset.assetCode }}</el-descriptions-item>
            <el-descriptions-item label="资产名称">{{ asset.assetName }}</el-descriptions-item>
            <el-descriptions-item label="资产类型"><DictTag type="AssetType" :value="asset.assetType" /></el-descriptions-item>
            <el-descriptions-item label="所属组织">{{ asset.orgName }}</el-descriptions-item>
            <el-descriptions-item label="楼栋/房号">{{ asset.building }}</el-descriptions-item>
            <el-descriptions-item label="建筑面积">{{ asset.area }} ㎡</el-descriptions-item>
            <el-descriptions-item label="业态">{{ asset.useType }}</el-descriptions-item>
            <el-descriptions-item label="原值">{{ asset.originalValue }} 元</el-descriptions-item>
            <el-descriptions-item label="净值">{{ asset.netValue }} 元</el-descriptions-item>
            <el-descriptions-item label="责任人">{{ asset.责任人 }}</el-descriptions-item>
            <el-descriptions-item label="地址" :span="3">{{ asset.address }}</el-descriptions-item>
          </el-descriptions>
        </el-col>
        <el-col :span="6">
          <QrcodeViewer :code="asset.qrCode" />
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
import DictTag from '@/components/DictTag/index.vue'
import QrcodeViewer from '@/components/QrcodeViewer/index.vue'
import { getAssetDetail } from '@/api/asset'

const route = useRoute()
const asset = ref<any>(null)
const loading = ref(false)

onMounted(async () => {
  loading.value = true
  try {
    asset.value = await getAssetDetail(route.params.id as string)
  } finally {
    loading.value = false
  }
})
</script>
