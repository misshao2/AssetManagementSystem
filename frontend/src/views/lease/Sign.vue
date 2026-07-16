<template>
  <div class="page-container">
    <el-card shadow="hover" style="max-width: 640px; margin: 0 auto">
      <template #header><span>电子签章对接</span></template>
      <el-form label-width="100px">
        <el-form-item label="合同"><el-select v-model="contractId" style="width:100%"><el-option v-for="c in contracts" :key="c.contractId" :label="`${c.contractNo}（${c.tenant}）`" :value="c.contractId" /></el-select></el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" @click="getUrl">获取签署链接 / 二维码</el-button>
          <el-button @click="pollStatus" :loading="polling">查询签署状态</el-button>
        </el-form-item>
      </el-form>

      <el-result v-if="signUrl" icon="success" title="签署通道已生成" sub-title="请通过链接或扫码完成签署（对接 e签宝/法大大）">
        <template #extra>
          <el-link type="primary" :href="signUrl" target="_blank">{{ signUrl }}</el-link>
          <div class="qr">签署二维码：{{ qrcode }}</div>
        </template>
      </el-result>

      <el-alert v-if="status" :title="`当前签署状态：${status}`" :type="status === 'SIGNED' ? 'success' : 'warning'" :closable="false" style="margin-top: 12px" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { getSignUrl, getSignStatus, getContractPage } from '@/api/lease'

const contracts = ref<any[]>([])
const contractId = ref('')
const signUrl = ref('')
const qrcode = ref('')
const status = ref('')
const loading = ref(false)
const polling = ref(false)

onMounted(async () => {
  const res = await getContractPage({ pageNum: 1, pageSize: 50, filters: {} })
  contracts.value = res.list
})

async function getUrl() {
  if (!contractId.value) return
  loading.value = true
  try {
    const res = await getSignUrl(contractId.value)
    signUrl.value = res.signUrl
    qrcode.value = res.qrcode
  } finally {
    loading.value = false
  }
}
async function pollStatus() {
  if (!contractId.value) return
  polling.value = true
  try {
    const res = await getSignStatus(contractId.value)
    status.value = res.status === 'SIGNED' ? '已签署' : '签署中'
  } finally {
    polling.value = false
  }
}
</script>

<style scoped>
.qr { margin-top: 8px; color: #606266; font-size: 13px; }
</style>
