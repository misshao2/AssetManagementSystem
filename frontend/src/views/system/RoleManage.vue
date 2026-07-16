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
        <el-input v-model="query.filters.keyword" placeholder="角色名/编码" clearable style="width: 220px" />
        <el-button type="primary" :icon="Search" @click="search()">查询</el-button>
        <el-button :icon="Refresh" @click="reset()">重置</el-button>
        <el-button type="success" :icon="Plus" v-permission="'sys:role:edit'" @click="handleCreate">新增角色</el-button>
      </template>

      <template #status="{ row }">
        <DictTag type="RoleStatus" :value="row.status" />
      </template>
      <template #action="{ row }">
        <el-button type="primary" link v-permission="'sys:role:edit'" @click="handleEdit(row)">编辑</el-button>
        <el-popconfirm title="确认删除该角色？" @confirm="handleDelete(row)">
          <template #reference>
            <el-button type="danger" link v-permission="'sys:role:edit'">删除</el-button>
          </template>
        </el-popconfirm>
      </template>
    </ProTable>

    <ProDialog
      v-model:visible="dialogVisible"
      :title="dialogTitle"
      :submitting="submitting"
      width="560px"
      @submit="submitForm"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="角色编码" prop="code">
          <el-input v-model="form.code" :disabled="!!editingId" placeholder="如 GROUP_ADMIN" />
        </el-form-item>
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status" placeholder="请选择" style="width: 100%">
            <el-option v-for="s in statusOptions" :key="s.value" :label="s.label" :value="s.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="权限">
          <el-checkbox-group v-model="form.permissions">
            <el-checkbox v-for="p in permissionOptions" :key="p.value" :value="p.value">{{ p.label }}</el-checkbox>
          </el-checkbox-group>
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
import { useTable } from '@/composables/useTable'
import { getRolePage, createRole, updateRole, removeRole } from '@/api/system'
import type { ProColumn } from '@/components/ProTable/index.vue'

const statusOptions = [
  { label: '启用', value: 'ENABLED' },
  { label: '停用', value: 'DISABLED' }
]
const permissionOptions = [
  { label: '组织架构查看', value: 'sys:org:view' },
  { label: '组织编辑', value: 'sys:org:edit' },
  { label: '用户查看', value: 'sys:user:view' },
  { label: '用户编辑', value: 'sys:user:edit' },
  { label: '角色查看', value: 'sys:role:view' },
  { label: '角色编辑', value: 'sys:role:edit' },
  { label: '字典查看', value: 'sys:dict:view' },
  { label: '字典编辑', value: 'sys:dict:edit' },
  { label: '资产查看', value: 'asset:view' },
  { label: '资产编辑', value: 'asset:edit' },
  { label: '账单查看', value: 'fin:bill:view' }
]

const { loading, list, total, query, getList, search, reset, handleSizeChange, handleCurrentChange } =
  useTable(getRolePage)

const columns: ProColumn[] = [
  { prop: 'code', label: '角色编码', width: 160 },
  { prop: 'name', label: '角色名称', width: 160 },
  { prop: 'permissions', label: '权限数', width: 90, formatter: (row: any) => `${row.permissions?.length || 0} 项` },
  { prop: 'status', label: '状态', width: 110, slot: 'status' },
  { prop: 'action', label: '操作', width: 140, fixed: 'right', slot: 'action' }
]

const dialogVisible = ref(false)
const dialogTitle = ref('')
const submitting = ref(false)
const editingId = ref<string | null>(null)
const formRef = ref<FormInstance>()
const form = reactive({ code: '', name: '', status: 'ENABLED', permissions: [] as string[] })

const rules: FormRules = {
  code: [{ required: true, message: '请输入角色编码', trigger: 'blur' }],
  name: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

function handleCreate() {
  editingId.value = null
  dialogTitle.value = '新增角色'
  Object.assign(form, { code: '', name: '', status: 'ENABLED', permissions: [] })
  dialogVisible.value = true
}

function handleEdit(row: any) {
  editingId.value = row.id
  dialogTitle.value = '编辑角色'
  Object.assign(form, {
    code: row.code,
    name: row.name,
    status: row.status,
    permissions: [...(row.permissions || [])]
  })
  dialogVisible.value = true
}

async function handleDelete(row: any) {
  await removeRole(row.id)
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
        await updateRole(editingId.value, { ...form })
        ElMessage.success('更新成功')
      } else {
        await createRole({ ...form })
        ElMessage.success('创建成功')
      }
      dialogVisible.value = false
      getList()
    } finally {
      submitting.value = false
    }
  })
}

onMounted(() => {
  getList()
})
</script>
