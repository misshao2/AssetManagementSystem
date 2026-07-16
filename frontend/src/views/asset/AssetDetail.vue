<template>
  <div class="page-container" v-loading="loading">
    <el-card shadow="hover" v-if="asset">
      <template #header>
        <span>{{ asset.assetName }}</span>
        <DictTag type="AssetStatus" :value="asset.status" style="margin-left: 12px" />
        <el-button size="small" type="primary" style="float: right; margin-left: 8px" v-permission="'asset:edit'" @click="openStatus">变更状态</el-button>
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

    <!-- 生命周期状态机流转 -->
    <ProDialog v-model:visible="statusDialog" title="变更资产状态" :submitting="statusSubmitting" width="460px" @submit="submitStatus">
      <el-form label-width="90px">
        <el-form-item label="当前状态">
          <DictTag type="AssetStatus" :value="asset?.status" />
        </el-form-item>
        <el-form-item label="目标状态" required>
          <el-select v-model="statusForm.status" style="width: 100%">
            <el-option v-for="s in STATUS_OPTIONS" :key="s.value" :label="s.label" :value="s.value" :disabled="s.value === asset?.status" />
          </el-select>
        </el-form-item>
        <el-form-item label="变更原因">
          <el-input v-model="statusForm.reason" type="textarea" :rows="3" placeholder="请填写状态变更原因（后端将记录操作日志）" />
        </el-form-item>
      </el-form>
    </ProDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import DictTag from '@/components/DictTag/index.vue'
import QrcodeViewer from '@/components/QrcodeViewer/index.vue'
import ProDialog from '@/components/ProDialog/index.vue'
import { getAssetDetail, updateAssetStatus } from '@/api/asset'

// 资产生命周期状态机（沿用 PRD 4.3）
const STATUS_OPTIONS = [
  { value: 'PENDING', label: '待启用' },
  { value: 'IN_USE', label: '在用' },
  { value: 'VACANT', label: '空置' },
  { value: 'LEASED', label: '出租' },
  { value: 'RENOVATING', label: '改造' },
  { value: 'TO_DISPOSE', label: '待处置' },
  { value: 'SCRAPPED', label: '已报废' }
]

const route = useRoute()
const asset = ref<any>(null)
const loading = ref(false)

const statusDialog = ref(false)
const statusSubmitting = ref(false)
const statusForm = reactive({ status: '', reason: '' })

function openStatus() {
  statusForm.status = ''
  statusForm.reason = ''
  statusDialog.value = true
}

async function submitStatus() {
  if (!asset.value) return
  if (!statusForm.status) {
    ElMessage.warning('请选择目标状态')
    return
  }
  statusSubmitting.value = true
  try {
    await updateAssetStatus(asset.value.assetId, statusForm.status, statusForm.reason)
    ElMessage.success('状态已变更，后端已记录操作日志')
    statusDialog.value = false
    asset.value = await getAssetDetail(asset.value.assetId)
  } finally {
    statusSubmitting.value = false
  }
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
