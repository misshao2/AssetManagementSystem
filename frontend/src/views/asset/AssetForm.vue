<template>
  <div class="page-container">
    <el-card shadow="hover">
      <template #header><span>资产建档</span></template>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px" style="max-width: 720px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="资产名称" prop="assetName"><el-input v-model="form.assetName" /></el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="资产类型" prop="assetType">
              <el-select v-model="form.assetType" style="width: 100%">
                <el-option v-for="t in assetTypes" :key="t.value" :label="t.label" :value="t.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="所属组织" prop="orgId"><OrgPicker v-model="form.orgId" /></el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="楼栋/房号"><el-input v-model="form.building" /></el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="建筑面积(㎡)"><el-input-number v-model="form.area" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="责任人"><el-input v-model="form.manager" /></el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="原值(元)"><el-input-number v-model="form.originalValue" :min="0" style="width: 100%" /></el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="净值(元)"><el-input-number v-model="form.netValue" :min="0" style="width: 100%" /></el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="权证附件"><FileUpload tip="上传资产相关权证扫描件" /></el-form-item>
          </el-col>
        </el-row>
        <el-form-item>
          <el-button type="primary" :loading="submitting" @click="submit">保存建档</el-button>
          <el-button @click="$router.back()">返回</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import OrgPicker from '@/components/OrgPicker/index.vue'
import FileUpload from '@/components/FileUpload/index.vue'
import { createAsset } from '@/api/asset'

const router = useRouter()
const assetTypes = [
  { label: '写字楼', value: 'OFFICE' }, { label: '商业综合体', value: 'COMMERCIAL' },
  { label: '产业园区', value: 'PARK' }, { label: '长租公寓', value: 'APARTMENT' },
  { label: '配套商铺', value: 'SHOP' }, { label: '闲置自持物业', value: 'IDLE' }
]
const formRef = ref<FormInstance>()
const submitting = ref(false)
const form = reactive({ assetName: '', assetType: '', orgId: '', building: '', area: 0, manager: '', originalValue: 0, netValue: 0 })
const rules: FormRules = {
  assetName: [{ required: true, message: '请输入资产名称', trigger: 'blur' }],
  assetType: [{ required: true, message: '请选择资产类型', trigger: 'change' }],
  orgId: [{ required: true, message: '请选择所属组织', trigger: 'change' }]
}

async function submit() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitting.value = true
    try {
      await createAsset({ ...form })
      ElMessage.success('建档成功')
      router.push('/asset/list')
    } finally {
      submitting.value = false
    }
  })
}
</script>
