<template>
  <div class="page-container">
    <el-card shadow="hover">
      <template #header><span>资产调拨 / 处置</span></template>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px" style="max-width: 720px">
        <el-form-item label="目标资产" prop="assetId">
          <el-select v-model="form.assetId" filterable placeholder="选择资产" style="width: 100%">
            <el-option v-for="a in assetList" :key="a.id" :label="a.buildingName" :value="a.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="操作类型" prop="type">
          <el-radio-group v-model="form.type">
            <el-radio value="TRANSFER">内部调拨</el-radio>
            <el-radio value="DISPOSE">合规处置</el-radio>
            <el-radio value="SCRAP">报废</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="目标组织" v-if="form.type === 'TRANSFER'">
          <OrgPicker v-model="form.targetOrgId" />
        </el-form-item>
        <el-form-item label="处置方式" v-if="form.type !== 'TRANSFER'">
          <el-select v-model="form.disposeMethod" style="width: 100%">
            <el-option label="公开转让" value="TRANSFER_PUBLIC" />
            <el-option label="无偿划转" value="FREE_TRANSFER" />
            <el-option label="报废拆除" value="SCRAP" />
          </el-select>
        </el-form-item>
        <el-form-item label="说明" prop="reason">
          <el-input v-model="form.reason" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="submitting" @click="submit">提交（触发审批流）</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import OrgPicker from '@/components/OrgPicker/index.vue'
import { transferAsset, getAssetPage } from '@/api/asset'

const assetList = ref<any[]>([])
const formRef = ref<FormInstance>()
const submitting = ref(false)
const form = reactive({ assetId: '', type: 'TRANSFER', targetOrgId: '', disposeMethod: '', reason: '' })
const rules: FormRules = {
  assetId: [{ required: true, message: '请选择资产', trigger: 'change' }],
  reason: [{ required: true, message: '请填写说明', trigger: 'blur' }]
}

onMounted(async () => {
  const res = await getAssetPage({ pageNum: 1, pageSize: 100, filters: {} })
  assetList.value = res.list
})

async function submit() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitting.value = true
    try {
      await transferAsset({ ...form })
      ElMessage.success('已提交，进入审批流程')
    } finally {
      submitting.value = false
    }
  })
}
</script>
