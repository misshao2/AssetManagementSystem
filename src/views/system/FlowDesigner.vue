<template>
  <div class="page-container">
    <el-row :gutter="16">
      <el-col :span="8">
        <el-card shadow="hover" class="list-card">
          <template #header><span>流程定义</span><el-button size="small" type="success" style="float:right" :icon="Plus" @click="handleCreate">新增</el-button></template>
          <el-menu :default-active="current?.flowId" @select="onSelect">
            <el-menu-item v-for="f in list" :key="f.flowId" :index="f.flowId">
              <span>{{ f.name }}</span>
              <el-tag size="small" style="margin-left: 8px">{{ f.category }}</el-tag>
            </el-menu-item>
          </el-menu>
        </el-card>
      </el-col>
      <el-col :span="16">
        <el-card shadow="hover" v-if="current">
          <template #header>
            <span>{{ current.name }}（v{{ current.version }}）</span>
            <el-tag size="small" :type="current.status === 'ENABLED' ? 'success' : 'info'" style="margin-left: 8px">{{ current.status === 'ENABLED' ? '启用' : '停用' }}</el-tag>
          </template>
          <div class="flow">
            <div v-for="(n, i) in nodes" :key="i" class="node" :class="'node--' + n.type">
              <div class="node-title">{{ n.label }}</div>
              <div class="node-sub">{{ n.mode }}</div>
              <div v-if="i < nodes.length - 1" class="arrow">→</div>
            </div>
          </div>
          <el-alert type="info" :closable="false" class="tip" title="流程节点：开始 → 审批（会签/或签/依次）→ 条件分支 → 抄送 → 结束。可对接 bpmn-js 或自研轻量画布。" />
        </el-card>
      </el-col>
    </el-row>

    <ProDialog v-model:visible="dialog" title="新增流程" :submitting="submitting" width="460px" @submit="submit">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="流程名称" prop="name"><el-input v-model="form.name" /></el-form-item>
        <el-form-item label="业务分类"><el-input v-model="form.category" /></el-form-item>
        <el-form-item label="标识 Key"><el-input v-model="form.key" /></el-form-item>
      </el-form>
    </ProDialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import ProDialog from '@/components/ProDialog/index.vue'
import { getFlowPage, createFlow } from '@/api/system'

const list = ref<any[]>([])
const current = ref<any>(null)
const nodes = ref<any[]>([])
const dialog = ref(false)
const submitting = ref(false)
const formRef = ref<FormInstance>()
const form = reactive({ name: '', category: '', key: '' })
const rules: FormRules = { name: [{ required: true, message: '请输入名称', trigger: 'blur' }] }

function onSelect(id: string) {
  current.value = list.value.find((f) => f.flowId === id) || null
  renderNodes()
}
function renderNodes() {
  nodes.value = [
    { label: '开始', type: 'start', mode: '' },
    { label: '部门审批', type: 'approve', mode: '或签' },
    { label: '分管领导审批', type: 'approve', mode: '会签' },
    { label: '条件判断', type: 'condition', mode: '金额>50万' },
    { label: '抄送归档', type: 'copy', mode: '' },
    { label: '结束', type: 'end', mode: '' }
  ]
}
function handleCreate() {
  Object.assign(form, { name: '', category: '', key: '' })
  dialog.value = true
}
async function submit() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitting.value = true
    try {
      const n = await createFlow({ ...form })
      ElMessage.success('流程已创建')
      dialog.value = false
      list.value.push(n)
    } finally {
      submitting.value = false
    }
  })
}

onMounted(async () => {
  const res = await getFlowPage({ pageNum: 1, pageSize: 50, filters: {} })
  list.value = res.list
  if (list.value.length) {
    current.value = list.value[0]
    renderNodes()
  }
})
</script>

<style scoped lang="scss">
.list-card { height: 100%; }
.flow { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; }
.node {
  position: relative; border: 1px solid #dcdfe6; border-radius: 6px; padding: 12px 16px; min-width: 120px; text-align: center;
  &--start { border-color: #67c23a; }
  &--approve { border-color: #409eff; }
  &--condition { border-color: #e6a23c; }
  &--copy { border-color: #909399; }
  &--end { border-color: #f56c6c; }
}
.node-title { font-weight: 600; }
.node-sub { font-size: 12px; color: #909399; margin-top: 4px; }
.arrow { color: #c0c4cc; font-size: 18px; margin: 0 4px; }
.tip { margin-top: 16px; }
</style>
