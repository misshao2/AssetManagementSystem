<template>
  <div ref="el" class="chart" :style="{ width: width, height: height }"></div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { EChartsOption } from 'echarts'
import { useChart } from '@/composables/useChart'

const props = withDefaults(
  defineProps<{
    option: EChartsOption
    width?: string
    height?: string
  }>(),
  {
    width: '100%',
    height: '320px'
  }
)

const el = ref<HTMLElement | null>(null)
const { setOption } = useChart(el)

watch(
  () => props.option,
  (opt) => setOption(opt),
  { immediate: true, deep: true }
)
</script>

<style scoped>
.chart {
  min-height: 200px;
}
</style>
