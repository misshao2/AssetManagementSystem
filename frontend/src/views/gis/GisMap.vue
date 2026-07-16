<template>
  <div class="page-container gis">
    <el-card shadow="never" class="filter">
      <el-radio-group v-model="layer" @change="onLayerChange">
        <el-radio-button value="distribution">分布图</el-radio-button>
        <el-radio-button value="lease">出租率热力</el-radio-button>
        <el-radio-button value="vacant">空置热力</el-radio-button>
      </el-radio-group>
      <el-select
        v-model="assetType"
        placeholder="资产类型"
        clearable
        style="width: 160px; margin-left: 12px"
        @change="loadPoints"
      >
        <el-option v-for="t in typeOptions" :key="t.value" :label="t.label" :value="t.value" />
      </el-select>
      <el-tag v-if="layer !== 'distribution' && heatCount > 0" type="warning" style="margin-left: 12px">
        热力采样点 {{ heatCount }}
      </el-tag>
    </el-card>

    <el-row :gutter="12" class="body">
      <el-col :span="6">
        <el-card shadow="never" class="tree-card">
          <template #header>区域下钻</template>
          <el-tree
            :data="regionTree"
            :props="{ label: 'name', children: 'children' }"
            node-key="id"
            default-expand-all
            highlight-current
            @node-click="onRegion"
          />
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card shadow="never" class="map-card">
          <template #header>资产分布（高德地图）</template>
          <AmapContainer :points="points" :layer="layer" />
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card shadow="never" class="list-card">
          <template #header>
            资产点位（{{ points.length }}）
            <el-button link type="primary" size="small" style="float: right" @click="loadPoints">刷新</el-button>
          </template>
          <el-scrollbar height="100%">
            <div v-for="p in points" :key="p.id" class="point" @click="goDetail(p)">
              <div class="name">{{ p.name }}</div>
              <div class="meta">
                <DictTag type="AssetType" :value="p.assetType" />
                <span class="rate">出租率 {{ Math.round((p.leaseRate || 0) * 100) }}%</span>
              </div>
            </div>
            <el-empty v-if="!points.length" description="暂无资产点位" :image-size="60" />
          </el-scrollbar>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AmapContainer from '@/components/AmapContainer/index.vue'
import DictTag from '@/components/DictTag/index.vue'
import { getAssetPoints, getHeatmap, getRegionTree } from '@/api/gis'

const router = useRouter()

type Layer = 'distribution' | 'lease' | 'vacant'
const layer = ref<Layer>('distribution')
const assetType = ref<string>('')
const points = ref<any[]>([])
const regionTree = ref<any[]>([])
const heatCount = ref(0)

const typeOptions = [
  { label: '写字楼', value: 'OFFICE' },
  { label: '商业综合体', value: 'COMMERCIAL' },
  { label: '产业园区', value: 'PARK' },
  { label: '长租公寓', value: 'APARTMENT' },
  { label: '配套商铺', value: 'SHOP' },
  { label: '闲置自持物业', value: 'IDLE' }
]

async function loadPoints() {
  const res = await getAssetPoints({ assetType: assetType.value })
  points.value = res || []
  heatCount.value = 0
}

async function loadHeatmap() {
  const res = await getHeatmap(layer.value, {})
  heatCount.value = Array.isArray(res) ? res.length : 0
}

function onLayerChange() {
  if (layer.value === 'distribution') {
    heatCount.value = 0
  } else {
    loadHeatmap()
  }
}

// 区域下钻：按节点名称在资产点位中做前缀/包含匹配（mock 资产名含项目名）
function onRegion(node: any) {
  const name: string = node?.name || ''
  if (!name) return
  points.value = points.value // 保留原数据引用
  getAssetPoints({ assetType: assetType.value }).then((res: any[]) => {
    const list = res || []
    points.value = name === '全部' ? list : list.filter((p) => (p.name || '').includes(name))
  })
}

function goDetail(p: any) {
  if (p.id) router.push(`/asset/detail/${p.id}`)
}

onMounted(async () => {
  await loadPoints()
  getRegionTree().then((r) => {
    regionTree.value = r || []
  })
  // 默认加载一次热力采样量，便于切换图层时直观感知
})
</script>

<style scoped lang="scss">
.gis {
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
}
.body {
  flex: 1;
  min-height: 0;
}
.tree-card,
.map-card,
.list-card {
  height: 100%;
}
.tree-card :deep(.el-card__body),
.list-card :deep(.el-card__body) {
  height: calc(100% - 40px);
  overflow: auto;
}
.point {
  padding: 8px 10px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  &:hover {
    background: #f5f7fa;
  }
  .name {
    font-weight: 600;
    color: #303133;
  }
  .meta {
    margin-top: 4px;
    display: flex;
    align-items: center;
    gap: 8px;
    .rate {
      font-size: 12px;
      color: #909399;
    }
  }
}
</style>
