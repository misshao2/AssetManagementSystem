<template>
  <div class="page-container">
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
        <el-input v-model="query.filters.keyword" placeholder="用户名/姓名" clearable style="width: 220px" />
        <el-button type="primary" :icon="Search" @click="search()">查询</el-button>
        <el-button :icon="Refresh" @click="reset()">重置</el-button>
        <el-button type="success" :icon="Plus" v-permission="'sys:user:edit'" @click="handleCreate">新增用户</el-button>
      </template>

      <template #org="{ row }">
        {{ orgNameMap[row.orgId] || row.orgId }}
      </template>
      <template #roles="{ row }">
        <el-tag v-for="rid in row.roleIds" :key="rid" size="small" style="margin-right: 4px">
          {{ roleNameMap[rid] || rid }}
        </el-tag>
      </template>
      <template #status="{ row }">
        <DictTag type="UserStatus" :value="row.status" />
      </template>
      <template #action="{ row }">
        <el-button type="primary" link v-permission="'sys:user:edit'" @click="handleEdit(row)">编辑</el-button>
        <el-popconfirm title="确认删除该用户？" @confirm="handleDelete(row)">
          <template #reference>
            <el-button type="danger" link v-permission="'sys:user:edit'">删除</el-button>
          </template>
        </el-popconfirm>
      </template>
    </ProTable>

    <ProDialog
      v-model:visible="dialogVisible"
      :title="dialogTitle"
      :submitting="submitting"
      width="520px"
      @submit="submitForm"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" :disabled="!!editingId" placeholder="登录账号" />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" placeholder="真实姓名" />
        </el-form-item>
        <el-form-item label="所属组织" prop="orgId">
          <OrgPicker v-model="form.orgId" :tree="orgTreeData" placeholder="请选择组织" />
        </el-form-item>
        <el-form-item label="角色" prop="roleIds">
          <el-select v-model="form.roleIds" multiple placeholder="请选择角色" style="width: 100%">
            <el-option v-for="r in roleOptions" :key="r.value" :label="r.label" :value="r.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status" placeholder="请选择" style="width: 100%">
            <el-option v-for="s in statusOptions" :key="s.value" :label="s.label" :value="s.value" />
          </el-select>
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
import { getUserPage, createUser, updateUser, removeUser, getOrgTree } from '@/api/system'
import type { ProColumn } from '@/components/ProTable/index.vue'

const orgNameMap = reactive<Record<string, string>>({})
const roleNameMap = reactive<Record<string, string>>({})
const orgTreeData = ref<any[]>([])

function flattenOrgName(nodes: any[]) {
  nodes.forEach((n) => {
    orgNameMap[n.id] = n.name
    if (n.children && n.children.length) flattenOrgName(n.children)
  })
}

const statusOptions = [
  { label: '启用', value: 'ENABLED' },
  { label: '停用', value: 'DISABLED' }
]
const roleOptions = [
  { label: '集团管理员', value: 'R_ADMIN' },
  { label: '运营专员', value: 'R_OPS' },
  { label: '财务专员', value: 'R_FIN' }
]

const { loading, list, total, query, getList, search, reset, handleSizeChange, handleCurrentChange } =
  useTable(getUserPage)

const columns: ProColumn[] = [
  { prop: 'username', label: '用户名', width: 140 },
  { prop: 'name', label: '姓名', width: 120 },
  { prop: 'orgId', label: '所属组织', width: 160, slot: 'org' },
  { prop: 'roleIds', label: '角色', minWidth: 160, slot: 'roles' },
  { prop: 'status', label: '状态', width: 110, slot: 'status' },
  { prop: 'action', label: '操作', width: 140, fixed: 'right', slot: 'action' }
]

const dialogVisible = ref(false)
const dialogTitle = ref('')
const submitting = ref(false)
const editingId = ref<string | null>(null)
const formRef = ref<FormInstance>()
const form = reactive({ username: '', name: '', orgId: '', roleIds: [] as string[], status: 'ENABLED' })

const rules: FormRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  orgId: [{ required: true, message: '请选择组织', trigger: 'change' }],
  roleIds: [{ required: true, message: '请选择角色', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

function handleCreate() {
  editingId.value = null
  dialogTitle.value = '新增用户'
  Object.assign(form, { username: '', name: '', orgId: '', roleIds: [], status: 'ENABLED' })
  dialogVisible.value = true
}

function handleEdit(row: any) {
  editingId.value = row.id
  dialogTitle.value = '编辑用户'
  Object.assign(form, {
    username: row.username,
    name: row.name,
    orgId: row.orgId,
    roleIds: [...(row.roleIds || [])],
    status: row.status
  })
  dialogVisible.value = true
}

async function handleDelete(row: any) {
  await removeUser(row.id)
  ElMessage.success('删除成功')
  getList()
}

async function submitForm() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitting.value = true
    try {
      if (editingId.value) {
        await updateUser(editingId.value, { ...form })
        ElMessage.success('更新成功')
      } else {
        await createUser({ ...form })
        ElMessage.success('创建成功')
      }
      dialogVisible.value = false
      getList()
    } finally {
      submitting.value = false
    }
  })
}

onMounted(async () => {
  roleOptions.forEach((r) => (roleNameMap[r.value] = r.label))
  const tree = await getOrgTree()
  orgTreeData.value = tree
  flattenOrgName(tree)
  getList()
})
</script>
