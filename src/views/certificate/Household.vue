<template>
  <div class="page-container">
    <el-row :gutter="16">
      <el-col :span="8">
        <el-card shadow="hover" class="tree-card">
          <template #header><span>资产（按组织）</span></template>
          <el-tree :data="assetTree" :props="{ label: 'name', children: 'children' }" node-key="id" default-expand-all highlight-current @current-change="onSelect" />
        </el-card>
      </el-col>
      <el-col :span="16">
        <el-card shadow="hover">
          <template #header>
            <span>一户一档 · {{ currentName || '请选择资产' }}</span>
          </template>
          <el-empty v-if="!household.length" description="该资产暂无归集权证" />
          <el-timeline v-else>
            <el-timeline-item v-for="c in household" :key="c.certId" :timestamp="c.acquireDate" placement="top">
              <el-card shadow="never">
                <div class="row"><b>{{ c.certNo }}</b><DictTag type="CertificateType" :value="c.certType" /></div>
                <div class="meta">权利人：{{ c.owner }} ｜ 到期：{{ c.expireDate }} ｜ 附件：{{ c.fileCount }} 份</div>
              </el-card>
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import DictTag from '@/components/DictTag/index.vue'
import { getCertHousehold } from '@/api/certificate'

const assetTree = [
  { id: 'A1001', name: '滨江国际写字楼 A 座' },
  { id: 'A1002', name: '阳光商业广场' },
  { id: 'A1003', name: '智造产业园 3 号厂房' }
]
const household = ref<any[]>([])
const currentName = ref('')
const currentId = ref('')

function onSelect(node: any) {
  currentId.value = node.id
  currentName.value = node.name
  getCertHousehold({ assetId: node.name }).then((res: any) => {
    household.value = res || []
  })
}
</script>

<style scoped lang="scss">
.tree-card { height: 100%; }
.row { display: flex; align-items: center; gap: 8px; }
.meta { color: #909399; font-size: 13px; margin-top: 6px; }
</style>
