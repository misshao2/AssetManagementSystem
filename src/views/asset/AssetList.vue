<template>
  <div class="page-container">
    <ProTable
      :data="list" :total="total" :loading="loading" :columns="columns"
      v-model:current="query.pageNum" v-model:size="query.pageSize"
      @size-change="handleSizeChange" @current-change="handleCurrentChange"
    >
      <template #toolbar>
        <el-input v-model="query.filters.assetName" placeholder="资产名称" clearable style="width: 200px" />
        <el-select v-model="query.filters.assetType" placeholder="资产类型" clearable style="width: 160px">
          <el-option v-for="t in typeOptions" :key="t.value" :label="t.label" :value="t.value" />
        </el-select>
        <el-button type="primary" :icon="Search" @click="search()">查询</el-button>
        <el-button :icon="Refresh" @click="reset()">重置</el-button>
        <el-button type="success" :icon="Plus" v-permission="'asset:edit'" @click="handleCreate">新建资产</el-button>
      </template>

      <template #status="{ row }"><DictTag type="AssetStatus" :value="row.status" /></template>
      <template #type="{ row }"><DictTag type="AssetType" :value="row.assetType" /></template>
      <template #action="{ row }">
        <el-button type="primary" link @click="goDetail(row)">详情</el-button>
        <el-button type="primary" link v-permission="'asset:edit'" @click="goDetail(row)">编辑</el-button>
        <el-button type="primary" link v-permission="'asset:edit'" @click="handleQrcode(row)">打印二维码</el-button>
      </template>
    </ProTable>

    <ProDialog v-model:visible="dialog" title="新建资产" :submitting="submitting" width="520px" @submit="submit">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="资产名称" prop="assetName"><el-input v-model="form.assetName" /></el-form-item>
        <el-form-item label="资产类型" prop="assetType">
          <el-select v-model="form.assetType" style="width: 100%">
            <el-option v-for="t in typeOptions" :key="t.value" :label="t.label" :value="t.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="建筑面积"><el-input-number v-model="form.area" :min="0" style="width: 100%" /></el-form-item>
        <el-form-item label="责任人"><el-input v-model="form.manager" /></el-form-item>
      </el-form>
    </ProDialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Search, Refresh, Plus } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import ProTable from '@/components/ProTable/index.vue'
import ProDialog from '@/components/ProDialog/index.vue'
import DictTag from '@/components/DictTag/index.vue'
import { useTable } from '@/composables/useTable'
import { getAssetPage, createAsset } from '@/api/asset'
import type { ProColumn } from '@/components/ProTable/index.vue'

const router = useRouter()
const { loading, list, total, query, getList, search, reset, handleSizeChange, handleCurrentChange } = useTable(getAssetPage)

const typeOptions = [
  { label: '写字楼', value: 'OFFICE' }, { label: '商业综合体', value: 'COMMERCIAL' },
  { label: '产业园区', value: 'PARK' }, { label: '长租公寓', value: 'APARTMENT' },
  { label: '配套商铺', value: 'SHOP' }, { label: '闲置自持物业', value: 'IDLE' }
]

const columns: ProColumn[] = [
  { prop: 'assetCode', label: '资产编码', width: 150 },
  { prop: 'assetName', label: '资产名称', minWidth: 180 },
  { prop: 'assetType', label: '类型', width: 120, slot: 'type' },
  { prop: 'orgName', label: '所属组织', width: 120 },
  { prop: 'building', label: '楼栋', width: 100 },
  { prop: 'area', label: '建筑面积(㎡)', width: 130 },
  { prop: 'status', label: '状态', width: 100, slot: 'status' },
  { prop: 'manager', label: '责任人', width: 100 },
  { prop: 'action', label: '操作', width: 220, fixed: 'right', slot: 'action' }
]

function goDetail(row: any) {
  router.push(`/asset/detail/${row.assetId}`)
}
function handleQrcode(row: any) {
  ElMessage.success(`已生成 ${row.assetName} 二维码标签`)
}

const dialog = ref(false)
const submitting = ref(false)
const formRef = ref<FormInstance>()
const form = reactive({ assetName: '', assetType: '', area: 0, manager: '' })
const rules: FormRules = {
  assetName: [{ required: true, message: '请输入资产名称', trigger: 'blur' }],
  assetType: [{ required: true, message: '请选择类型', trigger: 'change' }]
}
function handleCreate() {
  Object.assign(form, { assetName: '', assetType: '', area: 0, manager: '' })
  dialog.value = true
}
async function submit() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitting.value = true
    try {
      await createAsset({ ...form })
      ElMessage.success('新建成功')
      dialog.value = false
      getList()
    } finally {
      submitting.value = false
    }
  })
}

onMounted(() => getList())
</script>
