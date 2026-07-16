<template>
  <el-tag :type="tagType" :effect="effect">{{ label }}</el-tag>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useDictStore } from '@/store/dict'

const props = withDefaults(
  defineProps<{
    type: string
    value: string
    effect?: 'dark' | 'light' | 'plain'
  }>(),
  { effect: 'light' }
)

const dictStore = useDictStore()

// 确保所需字典已加载（字典为异步拉取，未加载时先触发请求）
onMounted(() => {
  if (!dictStore.getDict(props.type).length) {
    dictStore.loadDict(props.type)
  }
})

// 枚举值 → el-tag 颜色映射（mock 的 dict/items 仅返回 {label,value}，
// 此处按业务枚举值兜底着色，满足「枚举→颜色标签」要求；若字典项自带 type 则优先使用）。
type TagType = 'success' | 'info' | 'warning' | 'danger' | 'primary'
const VALUE_COLOR: Record<string, TagType> = {
  // 资产状态
  IN_USE: 'success', LEASED: 'success',
  VACANT: 'warning', RENOVATING: 'warning',
  TO_DISPOSE: 'danger', SCRAPPED: 'danger',
  // 权证/合同/账单状态
  NORMAL: 'success', EXECUTING: 'success', SIGNED: 'success', PAID: 'success',
  EXPIRING: 'warning', APPROVING: 'warning', PARTIAL: 'warning', OVERDUE: 'warning', UNPAID: 'warning',
  TERMINATED: 'danger',
  // 组织/用户/角色
  ENABLED: 'success', DISABLED: 'danger',
  // 隐患/工单
  MAJOR: 'danger', PENDING: 'warning', DOING: 'warning', BORROWED: 'warning', RUNNING: 'warning', WARN: 'warning',
  DONE: 'success', READ: 'info'
}

const item = computed(() => dictStore.getDict(props.type).find((d) => d.value === props.value))
const label = computed(() => item.value?.label || props.value)
const tagType = computed<TagType>(() => (item.value?.type as TagType) || VALUE_COLOR[props.value] || 'info')
</script>
