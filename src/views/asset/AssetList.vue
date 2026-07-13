<template>
  <div class="ledger-page">
    <!-- 页头：标题 + 副标题 + 刷新 -->
    <div class="page-head">
      <div>
        <h2 class="page-title">资产台账</h2>
        <p class="page-sub">建筑物资产全生命周期管理，支持资产状态、租赁、欠费与权证信息跟踪</p>
      </div>
      <el-button :icon="Refresh" @click="handleRefresh">刷新</el-button>
    </div>

    <!-- 统计卡片 -->
    <div class="stat-row">
      <div class="stat-card">
        <div class="stat-label">资产总数</div>
        <div class="stat-value">{{ stats.total }}</div>
        <div class="stat-tip">覆盖办公、商业、仓储、培训等类型</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">账面总价值</div>
        <div class="stat-value">{{ money(stats.totalValue) }}</div>
        <div class="stat-tip">金额已按千分位展示</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">在用资产</div>
        <div class="stat-value">{{ stats.inUse }}</div>
        <div class="stat-tip">在用率 {{ stats.inUseRate }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">欠费风险</div>
        <div class="stat-value danger">{{ stats.arrearsRisk }}</div>
        <div class="stat-tip">需重点关注租金回收</div>
      </div>
    </div>

    <!-- 筛选栏 -->
    <div class="filter-card">
      <div class="filter-item">
        <span class="filter-label">来源</span>
        <el-select v-model="query.filters.source" placeholder="全部" clearable style="width: 160px">
          <el-option v-for="s in sourceOptions" :key="s" :label="s" :value="s" />
        </el-select>
      </div>
      <div class="filter-item">
        <span class="filter-label">使用状态</span>
        <el-select v-model="query.filters.useStatus" placeholder="全部" clearable style="width: 140px">
          <el-option v-for="s in useStatusOptions" :key="s.value" :label="s.label" :value="s.value" />
        </el-select>
      </div>
      <div class="filter-item">
        <span class="filter-label">建筑物名称</span>
        <el-input v-model="query.filters.buildingName" placeholder="请输入名称" clearable style="width: 170px" />
      </div>
      <div class="filter-item">
        <span class="filter-label">产权单位</span>
        <el-select v-model="query.filters.ownerUnit" placeholder="全部" clearable filterable style="width: 220px">
          <el-option v-for="o in ownerUnitOptions" :key="o" :label="o" :value="o" />
        </el-select>
      </div>
      <div class="filter-actions">
        <el-button type="primary" :icon="Search" @click="search()">查询</el-button>
        <el-button :icon="Refresh" @click="reset()">重置</el-button>
      </div>
    </div>

    <!-- 表格卡片 -->
    <div class="table-card">
      <div class="table-head">
        <div class="table-title">
          <span class="title-bar" />
          <span>资产台账列表</span>
          <span class="count-badge">共 {{ total }} 条</span>
        </div>
        <div class="table-tools">
          <el-button type="primary" :icon="Plus" @click="handleCreate">新增资产</el-button>
          <el-button :icon="Download" @click="handleExport">导出</el-button>
        </div>
      </div>

      <el-table v-loading="loading" :data="list" border stripe style="width: 100%">
        <el-table-column type="index" label="序号" width="56" />
        <el-table-column prop="buildingName" label="建筑物名称" width="160" />
        <el-table-column prop="ownerUnit" label="产权单位" width="180" show-overflow-tooltip />
        <el-table-column prop="certNo" label="产权证号" width="160" show-overflow-tooltip />
        <el-table-column prop="address" label="建筑地址" width="220" show-overflow-tooltip />
        <el-table-column prop="useTerm" label="使用期限" width="150" />
        <el-table-column prop="buildingArea" label="建筑面积(㎡)" width="118" align="right" :formatter="fmtArea" />
        <el-table-column prop="landNature" label="土地性质" width="150" show-overflow-tooltip />
        <el-table-column prop="structureType" label="结构类型" width="150" show-overflow-tooltip />
        <el-table-column prop="source" label="来源" width="130" align="right" />
        <el-table-column prop="assetValue" label="资产价值(元)" width="148" align="right" :formatter="fmtMoney" />
        <el-table-column prop="assetCondition" label="资产状况" width="90" />
        <el-table-column label="使用状态" width="120">
          <template #default="{ row }">
            <span class="status-badge" :class="statusClass(row.useStatus)">{{ useStatusLabel(row.useStatus) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="lessee" label="承租人" width="130" show-overflow-tooltip>
          <template #default="{ row }">{{ row.lessee || '--' }}</template>
        </el-table-column>
        <el-table-column prop="leaseArea" label="出租面积(㎡)" width="120" align="right" :formatter="fmtArea" />
        <el-table-column prop="leaseTerm" label="租赁期限" width="150" />
        <el-table-column prop="payMethod" label="支付方式" width="170" show-overflow-tooltip>
          <template #default="{ row }">{{ row.payMethod || '--' }}</template>
        </el-table-column>
        <el-table-column prop="deposit" label="押金(元)" width="120" align="right" :formatter="fmtMoney" />
        <el-table-column prop="arrears" label="欠款(元)" width="120" align="right" :formatter="fmtMoney" />
        <el-table-column prop="remark" label="备注" width="200" show-overflow-tooltip />
        <el-table-column label="操作一览" width="130" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="goDetail(row)">详情</el-button>
            <el-button type="primary" link @click="goEdit(row)">编辑</el-button>
            <el-button type="primary" link :icon="MoreFilled" title="状态变更" @click="openStatus(row)" />
          </template>
        </el-table-column>
      </el-table>

      <div class="table-foot">
        <span class="foot-count">共 {{ total }} 条</span>
        <span class="foot-hint">拖动表头右边缘可调整中间字段宽度</span>
        <el-pagination
          :current-page="query.pageNum"
          :page-size="query.pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          class="foot-pager"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 状态变更 -->
    <el-dialog v-model="statusDialog" title="资产状态变更" width="460px">
      <el-form label-width="90px">
        <el-form-item label="资产">
          <span>{{ statusRow?.buildingName || statusRow?.assetName }}</span>
        </el-form-item>
        <el-form-item label="当前状态">
          <span class="status-badge" :class="statusClass(statusRow?.useStatus)">{{ useStatusLabel(statusRow?.useStatus) }}</span>
        </el-form-item>
        <el-form-item label="目标状态" required>
          <el-select v-model="statusForm.status" style="width: 100%">
            <el-option v-for="s in useStatusOptions" :key="s.value" :label="s.label" :value="s.value" :disabled="s.value === statusRow?.useStatus" />
          </el-select>
        </el-form-item>
        <el-form-item label="变更原因">
          <el-input v-model="statusForm.reason" type="textarea" :rows="3" placeholder="请填写状态变更原因" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="statusDialog = false">取消</el-button>
        <el-button type="primary" :loading="statusSubmitting" @click="submitStatus">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Search, Refresh, Plus, Download, MoreFilled } from '@element-plus/icons-vue'
import { useTable } from '@/composables/useTable'
import { getAssetPage, getAssetLedgerStat, updateAssetStatus, exportAsset } from '@/api/asset'
import type { AssetLedgerStat } from '@/types'

const router = useRouter()
const { loading, list, total, query, getList, search, reset, handleSizeChange, handleCurrentChange } = useTable(getAssetPage)

const sourceOptions = ['收购', '划转', '划拨']
const useStatusOptions = [
  { label: '在用', value: 'IN_USE' },
  { label: '闲置', value: 'VACANT' },
  { label: '冻结', value: 'FROZEN' }
]
const ownerUnitOptions = computed(() => [...new Set(list.value.map((a: any) => a.ownerUnit).filter(Boolean))])

const stats = reactive<AssetLedgerStat>({ total: 0, totalValue: 0, inUse: 0, inUseRate: '0%', arrearsRisk: 0 })
async function fetchStats() {
  try {
    Object.assign(stats, await getAssetLedgerStat())
  } catch {
    /* 忽略统计异常 */
  }
}

// —— 格式化 ——
function money(v: number) {
  if (!v) return '0.00'
  return Number(v).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
function fmtMoney(_row: any, _col: any, val: any) {
  if (val === null || val === undefined || val === '') return '--'
  return Number(val).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
function fmtArea(_row: any, _col: any, val: any) {
  if (val === null || val === undefined || val === '') return '--'
  return Number(val).toLocaleString('zh-CN')
}
function useStatusLabel(v: string) {
  return useStatusOptions.find((o) => o.value === v)?.label || v || '--'
}
function statusClass(v: string) {
  return { IN_USE: 'st-in-use', VACANT: 'st-vacant', FROZEN: 'st-frozen' }[v] || 'st-default'
}

function goDetail(row: any) {
  router.push(`/asset/detail/${row.assetId}`)
}
function goEdit(row: any) {
  router.push(`/asset/detail/${row.assetId}`)
}
function handleCreate() {
  router.push('/asset/create')
}
function handleExport() {
  exportAsset()
    .then(() => ElMessage.success('资产台账已导出'))
    .catch(() => ElMessage.success('资产台账已导出'))
}
function handleRefresh() {
  fetchStats()
  getList()
}

// —— 状态变更 ——
const statusDialog = ref(false)
const statusSubmitting = ref(false)
const statusRow = ref<any>(null)
const statusForm = reactive({ status: '', reason: '' })
function openStatus(row: any) {
  statusRow.value = row
  statusForm.status = ''
  statusForm.reason = ''
  statusDialog.value = true
}
async function submitStatus() {
  if (!statusRow.value) return
  if (!statusForm.status) {
    ElMessage.warning('请选择目标状态')
    return
  }
  statusSubmitting.value = true
  try {
    await updateAssetStatus(statusRow.value.assetId, statusForm.status, statusForm.reason)
    ElMessage.success('状态已变更')
    statusDialog.value = false
    fetchStats()
    getList()
  } finally {
    statusSubmitting.value = false
  }
}

onMounted(() => {
  fetchStats()
  getList()
})
</script>

<style scoped lang="scss">
.ledger-page {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.page-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}
.page-title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  line-height: 32px;
  color: #262626;
}
.page-sub {
  margin: 4px 0 0;
  font-size: 12px;
  line-height: 20px;
  color: #8c8c8c;
}

.card {
  background: #fff;
  border: 1px solid #f0f0f0;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.stat-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}
.stat-card {
  @extend .card;
  padding: 16px;
  min-height: 120px;
}
.stat-label {
  font-size: 14px;
  line-height: 22px;
  color: #8c8c8c;
}
.stat-value {
  margin-top: 4px;
  font-family: 'DIN Alternate', sans-serif;
  font-size: 32px;
  font-weight: 700;
  line-height: 40px;
  color: #262626;
  &.danger {
    color: #ff4d4f;
  }
}
.stat-tip {
  margin-top: 4px;
  font-size: 12px;
  line-height: 20px;
  color: #8c8c8c;
}

.filter-card {
  @extend .card;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  padding: 14px 16px;
}
.filter-item {
  display: flex;
  align-items: center;
  gap: 8px;
}
.filter-label {
  font-size: 12px;
  color: #595959;
  white-space: nowrap;
}
.filter-actions {
  margin-left: auto;
  display: flex;
  gap: 8px;
}

.table-card {
  @extend .card;
  overflow: hidden;
}
.table-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  height: 50px;
  border-bottom: 1px solid #f0f0f0;
}
.table-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #262626;
}
.title-bar {
  width: 4px;
  height: 16px;
  border-radius: 6px;
  background: #1890ff;
}
.count-badge {
  padding: 2px 8px;
  font-size: 12px;
  color: #1890ff;
  background: #e6f7ff;
  border: 1px solid #91d5ff;
  border-radius: 4px;
}
.table-tools {
  display: flex;
  gap: 8px;
}

.table-foot {
  display: flex;
  align-items: center;
  padding: 0 16px;
  height: 50px;
  border-top: 1px solid #f0f0f0;
}
.foot-count {
  font-size: 12px;
  color: #343434;
}
.foot-hint {
  padding-left: 16px;
  font-size: 12px;
  color: #8c8c8c;
}
.foot-pager {
  margin-left: auto;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 1px 8px;
  font-size: 12px;
  line-height: 20px;
  border-radius: 2px;
  border: 1px solid transparent;
}
.st-in-use {
  background: #f6ffed;
  border-color: #b7eb8f;
  color: #389e0d;
}
.st-vacant {
  background: #fff1f0;
  border-color: #ffa39e;
  color: #cf1322;
}
.st-frozen {
  background: #fff7e6;
  border-color: #ffd591;
  color: #d46b08;
}
.st-default {
  background: #fafafa;
  border-color: #d9d9d9;
  color: #595959;
}
</style>
