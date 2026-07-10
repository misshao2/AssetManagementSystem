<template>
  <div class="page-container">
    <el-row :gutter="16">
      <!-- 字典类型 -->
      <el-col :span="10">
        <ProTable
          :data="typeList"
          :total="typeTotal"
          :loading="typeLoading"
          :columns="typeColumns"
          v-model:current="typeQuery.pageNum"
          v-model:size="typeQuery.pageSize"
          @size-change="loadTypes"
          @current-change="loadTypes"
        >
          <template #toolbar>
            <el-input v-model="typeQuery.filters.keyword" placeholder="名称/编码" clearable style="width: 160px" />
            <el-button type="primary" :icon="Search" @click="loadTypes()">查询</el-button>
            <el-button type="success" :icon="Plus" v-permission="'sys:dict:edit'" @click="handleCreateType">新增类型</el-button>
          </template>
          <template #row="{ row }">
            <el-button type="primary" link @click="selectType(row)">查看项</el-button>
            <el-button type="primary" link v-permission="'sys:dict:edit'" @click="handleEditType(row)">编辑</el-button>
            <el-popconfirm title="删除类型将同时删除其字典项？" @confirm="handleDeleteType(row)">
              <template #reference>
                <el-button type="danger" link v-permission="'sys:dict:edit'">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </ProTable>
      </el-col>

      <!-- 字典项 -->
      <el-col :span="14">
        <ProTable
          :data="itemList"
          :total="itemTotal"
          :loading="itemLoading"
          :columns="itemColumns"
          v-model:current="itemQuery.pageNum"
          v-model:size="itemQuery.pageSize"
          @size-change="loadItems"
          @current-change="loadItems"
        >
          <template #toolbar>
            <span v-if="currentType" class="cur-type">当前类型：{{ currentType.name }}（{{ currentType.type }}）</span>
            <span v-else class="cur-type cur-type--empty">请先在左侧选择字典类型</span>
            <el-button type="success" :icon="Plus" v-permission="'sys:dict:edit'" :disabled="!currentType" @click="handleCreateItem">新增字典项</el-button>
          </template>
          <template #action="{ row }">
            <el-button type="primary" link v-permission="'sys:dict:edit'" @click="handleEditItem(row)">编辑</el-button>
            <el-popconfirm title="确认删除该字典项？" @confirm="handleDeleteItem(row)">
              <template #reference>
                <el-button type="danger" link v-permission="'sys:dict:edit'">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </ProTable>
      </el-col>
    </el-row>

    <!-- 字典类型弹窗 -->
    <ProDialog
      v-model:visible="typeDialog"
      :title="typeDialogTitle"
      :submitting="submitting"
      width="460px"
      @submit="submitType"
    >
      <el-form ref="typeFormRef" :model="typeForm" :rules="typeRules" label-width="90px">
        <el-form-item label="类型编码" prop="type">
          <el-input v-model="typeForm.type" :disabled="!!editingTypeId" placeholder="如 OrgType" />
        </el-form-item>
        <el-form-item label="类型名称" prop="name">
          <el-input v-model="typeForm.name" placeholder="如 组织类型" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="typeForm.status" style="width: 100%">
            <el-option v-for="s in statusOptions" :key="s.value" :label="s.label" :value="s.value" />
          </el-select>
        </el-form-item>
      </el-form>
    </ProDialog>

    <!-- 字典项弹窗 -->
    <ProDialog
      v-model:visible="itemDialog"
      :title="itemDialogTitle"
      :submitting="submitting"
      width="460px"
      @submit="submitItem"
    >
      <el-form ref="itemFormRef" :model="itemForm" :rules="itemRules" label-width="90px">
        <el-form-item label="标签" prop="label">
          <el-input v-model="itemForm.label" placeholder="显示文本" />
        </el-form-item>
        <el-form-item label="值" prop="value">
          <el-input v-model="itemForm.value" :disabled="!!editingItemId" placeholder="存储值" />
        </el-form-item>
        <el-form-item label="排序号">
          <el-input-number v-model="itemForm.orderNo" :min="0" />
        </el-form-item>
      </el-form>
    </ProDialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Plus } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import ProTable from '@/components/ProTable/index.vue'
import ProDialog from '@/components/ProDialog/index.vue'
import {
  getDictTypePage,
  createDictType,
  updateDictType,
  removeDictType,
  getDictItemPage,
  createDictItem,
  updateDictItem,
  removeDictItem
} from '@/api/system'
import type { ProColumn } from '@/components/ProTable/index.vue'

const statusOptions = [
  { label: '启用', value: 'ENABLED' },
  { label: '停用', value: 'DISABLED' }
]

const submitting = ref(false)

// ===== 字典类型 =====
const typeList = ref<any[]>([])
const typeTotal = ref(0)
const typeLoading = ref(false)
const typeQuery = reactive({ pageNum: 1, pageSize: 20, filters: { keyword: '' } as Record<string, any> })

const typeColumns: ProColumn[] = [
  { prop: 'name', label: '类型名称', width: 130 },
  { prop: 'type', label: '类型编码', width: 130 },
  { prop: 'status', label: '状态', width: 90, formatter: (r: any) => (r.status === 'ENABLED' ? '启用' : '停用') },
  { prop: 'row', label: '操作', width: 170, fixed: 'right', slot: 'row' }
]

async function loadTypes() {
  typeLoading.value = true
  try {
    const res = await getDictTypePage({
      pageNum: typeQuery.pageNum,
      pageSize: typeQuery.pageSize,
      filters: typeQuery.filters
    })
    typeList.value = res.list
    typeTotal.value = res.total
  } finally {
    typeLoading.value = false
  }
}

// ===== 字典项 =====
const currentType = ref<any>(null)
const itemList = ref<any[]>([])
const itemTotal = ref(0)
const itemLoading = ref(false)
const itemQuery = reactive({ pageNum: 1, pageSize: 20, filters: { keyword: '', type: '' } as Record<string, any> })

const itemColumns: ProColumn[] = [
  { prop: 'label', label: '标签', width: 140 },
  { prop: 'value', label: '值', width: 140 },
  { prop: 'orderNo', label: '排序', width: 80 },
  { prop: 'action', label: '操作', width: 140, fixed: 'right', slot: 'action' }
]

async function loadItems() {
  if (!currentType.value) return
  itemQuery.filters.type = currentType.value.type
  itemLoading.value = true
  try {
    const res = await getDictItemPage({
      pageNum: itemQuery.pageNum,
      pageSize: itemQuery.pageSize,
      filters: itemQuery.filters
    })
    itemList.value = res.list
    itemTotal.value = res.total
  } finally {
    itemLoading.value = false
  }
}

function selectType(row: any) {
  currentType.value = row
  itemQuery.pageNum = 1
  itemQuery.filters.keyword = ''
  loadItems()
}

// ===== 类型弹窗 =====
const typeDialog = ref(false)
const typeDialogTitle = ref('')
const editingTypeId = ref<string | null>(null)
const typeFormRef = ref<FormInstance>()
const typeForm = reactive({ type: '', name: '', status: 'ENABLED' })
const typeRules: FormRules = {
  type: [{ required: true, message: '请输入类型编码', trigger: 'blur' }],
  name: [{ required: true, message: '请输入类型名称', trigger: 'blur' }]
}

function handleCreateType() {
  editingTypeId.value = null
  typeDialogTitle.value = '新增字典类型'
  Object.assign(typeForm, { type: '', name: '', status: 'ENABLED' })
  typeDialog.value = true
}
function handleEditType(row: any) {
  editingTypeId.value = row.id
  typeDialogTitle.value = '编辑字典类型'
  Object.assign(typeForm, { type: row.type, name: row.name, status: row.status })
  typeDialog.value = true
}
async function handleDeleteType(row: any) {
  await removeDictType(row.id)
  ElMessage.success('删除成功')
  if (currentType.value?.id === row.id) currentType.value = null
  loadTypes()
}
async function submitType() {
  if (!typeFormRef.value) return
  await typeFormRef.value.validate(async (valid) => {
    if (!valid) return
    submitting.value = true
    try {
      if (editingTypeId.value) await updateDictType(editingTypeId.value, { ...typeForm })
      else await createDictType({ ...typeForm })
      ElMessage.success('保存成功')
      typeDialog.value = false
      loadTypes()
    } finally {
      submitting.value = false
    }
  })
}

// ===== 字典项弹窗 =====
const itemDialog = ref(false)
const itemDialogTitle = ref('')
const editingItemId = ref<string | null>(null)
const itemFormRef = ref<FormInstance>()
const itemForm = reactive({ label: '', value: '', orderNo: 1 })
const itemRules: FormRules = {
  label: [{ required: true, message: '请输入标签', trigger: 'blur' }],
  value: [{ required: true, message: '请输入值', trigger: 'blur' }]
}

function handleCreateItem() {
  if (!currentType.value) return
  editingItemId.value = null
  itemDialogTitle.value = '新增字典项'
  Object.assign(itemForm, { label: '', value: '', orderNo: itemList.value.length + 1 })
  itemDialog.value = true
}
function handleEditItem(row: any) {
  editingItemId.value = row.id
  itemDialogTitle.value = '编辑字典项'
  Object.assign(itemForm, { label: row.label, value: row.value, orderNo: row.orderNo })
  itemDialog.value = true
}
async function handleDeleteItem(row: any) {
  await removeDictItem(row.id)
  ElMessage.success('删除成功')
  loadItems()
}
async function submitItem() {
  if (!itemFormRef.value || !currentType.value) return
  await itemFormRef.value.validate(async (valid) => {
    if (!valid) return
    submitting.value = true
    try {
      const payload = { ...itemForm, type: currentType.value.type }
      if (editingItemId.value) await updateDictItem(editingItemId.value, payload)
      else await createDictItem(payload)
      ElMessage.success('保存成功')
      itemDialog.value = false
      loadItems()
    } finally {
      submitting.value = false
    }
  })
}

onMounted(() => {
  loadTypes()
})
</script>

<style scoped lang="scss">
.cur-type {
  font-size: 13px;
  color: #606266;
  margin-right: auto;
  &--empty {
    color: #c0c4cc;
  }
}
</style>
