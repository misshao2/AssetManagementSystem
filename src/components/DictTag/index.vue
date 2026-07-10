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
const item = computed(() => dictStore.getDict(props.type).find((d) => d.value === props.value))
const label = computed(() => item.value?.label || props.value)
const tagType = computed(() => item.value?.type || 'info')
</script>
