<template>
  <div class="page-container">
    <el-row :gutter="16">
      <!-- 组织树 -->
      <el-col :span="8">
        <el-card shadow="hover" class="tree-card">
          <template #header>
            <span>组织架构树</span>
          </template>
          <el-tree
            ref="treeRef"
            :data="tree"
            :props="{ label: 'name', children: 'children' }"
            node-key="id"
            default-expand-all
            highlight-current
            :expand-on-click-node="false"
            @current-change="onTreeSelect"
          />
        </el-card>
      </el-col>

      <!-- 组织表格 -->
      <el-col :span="16">
        <ProTable
          :data="list"
          :total="total"
          :loading="loading"
          :columns="columns"
          v-model:current="query.pageNum"
          v-model:size="query.pageSize"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        >
          <template #toolbar>
            <el-input v-model="query.filters.keyword" placeholder="组织名称" clearable style="width: 200px" />
            <el-button type="primary" :icon="Search" @click="search()">查询</el-button>
            <el-button :icon="Refresh" @click="resetAll()">重置</el-button>
            <el-button type="success" :icon="Plus" v-permission="'sys:org:edit'" @click="handleCreate">新增组织</el-button>
          </template>

          <template #type="{ row }">
            <DictTag type="OrgType" :value="row.type" />
          </template>
          <template #action="{ row }">
            <el-button type="primary" link v-permission="'sys:org:edit'" @click="handleEdit(row)">编辑</el-button>
            <el-popconfirm title="确认删除该组织及其下级？" @confirm="handleDelete(row)">
              <template #reference>
                <el-button type="danger" link v-permission="'sys:org:edit'">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </ProTable>
      </el-col>
    </el-row>

    <!-- 新增 / 编辑弹窗 -->
    <ProDialog
      v-model:visible="dialogVisible"
      :title="dialogTitle"
      :submitting="submitting"
      width="480px"
      @submit="submitForm"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="上级组织">
          <OrgPicker v-model="form.parentId" :tree="tree" placeholder="不选择则为顶级" />
        </el-form-item>
        <el-form-item label="组织名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入组织名称" />
        </el-form-item>
        <el-form-item label="组织类型" prop="type">
          <el-select v-model="form.type" placeholder="请选择" style="width: 100%">
            <el-option v-for="t in orgTypeOptions" :key="t.value" :label="t.label" :value="t.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="排序号">
          <el-input-number v-model="form.orderNo" :min="0" />
        </el-form-item>
      </el-form>
    </ProDialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Refresh, Plus } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import ProTable from '@/components/ProTable/index.vue'
import ProDialog from '@/components/ProDialog/index.vue'
import DictTag from '@/components/DictTag/index.vue'
import OrgPicker from '@/components/OrgPicker/index.vue'
import { useTable } from '@/composables/useTable'
import { getOrgTree, getOrgPage, createOrg, updateOrg, removeOrg } from '@/api/system'
import type { ProColumn } from '@/components/ProTable/index.vue'

const orgTypeOptions = [
  { label: '集团', value: 'GROUP' },
  { label: '公司', value: 'COMPANY' },
  { label: '项目', value: 'PROJECT' },
  { label: '部门', value: 'DEPT' }
]

const tree = ref<any[]>([])
const treeRef = ref<any>(null)

const { loading, list, total, query, getList, search, reset, handleSizeChange, handleCurrentChange } =
  useTable(getOrgPage)

const columns: ProColumn[] = [
  { prop: 'name', label: '组织名称', minWidth: 160 },
  { prop: 'type', label: '类型', width: 120, slot: 'type' },
  { prop: 'parentId', label: '上级ID', width: 130 },
  { prop: 'orderNo', label: '排序', width: 80 },
  { prop: 'action', label: '操作', width: 140, fixed: 'right', slot: 'action' }
]

const dialogVisible = ref(false)
const dialogTitle = ref('')
const submitting = ref(false)
const editingId = ref<string | null>(null)
const formRef = ref<FormInstance>()
const form = reactive({ parentId: '', name: '', type: '', orderNo: 1 })

const rules: FormRules = {
  name: [{ required: true, message: '请输入组织名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择组织类型', trigger: 'change' }]
}

async function loadTree() {
  tree.value = await getOrgTree()
}

function onTreeSelect(node: any) {
  query.filters.parentId = node?.id || ''
  search()
}

function resetAll() {
  reset()
  treeRef.value?.setCurrentKey(undefined as any)
}

function handleCreate() {
  editingId.value = null
  dialogTitle.value = '新增组织'
  form.parentId = ''
  form.name = ''
  form.type = ''
  form.orderNo = tree.value.length + 1
  dialogVisible.value = true
}

function handleEdit(row: any) {
  editingId.value = row.id
  dialogTitle.value = '编辑组织'
  form.parentId = row.parentId === '0' ? '' : row.parentId
  form.name = row.name
  form.type = row.type
  form.orderNo = row.orderNo
  dialogVisible.value = true
}

async function handleDelete(row: any) {
  await removeOrg(row.id)
  ElMessage.success('删除成功')
  await Promise.all([loadTree(), getList()])
}

async function submitForm() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitting.value = true
    try {
      const payload = { ...form, parentId: form.parentId || '0' }
      if (editingId.value) {
        await updateOrg(editingId.value, payload)
        ElMessage.success('更新成功')
      } else {
        await createOrg(payload)
        ElMessage.success('创建成功')
      }
      dialogVisible.value = false
      await Promise.all([loadTree(), getList()])
    } finally {
      submitting.value = false
    }
  })
}

onMounted(async () => {
  await loadTree()
  getList()
})
</script>

<style scoped lang="scss">
.tree-card {
  height: 100%;
}
</style>
