import { onBeforeUnmount, onMounted, type Ref } from 'vue'
import * as echarts from 'echarts'

// ECharts 实例封装：自动初始化、自适应、销毁
export function useChart(elRef: Ref<HTMLElement | null>) {
  let chart: echarts.ECharts | null = null
  let latestOption: echarts.EChartsOption | null = null

  function init() {
    if (elRef.value && !chart) {
      chart = echarts.init(elRef.value)
      // 初始化后立即应用已传入的 option（避免 immediate watch 早于 mounted 导致首屏空白）
      if (latestOption) chart.setOption(latestOption)
    }
  }

  function setOption(option: echarts.EChartsOption) {
    latestOption = option
    chart?.setOption(option)
  }

  function resize() {
    chart?.resize()
  }

  onMounted(() => {
    init()
    window.addEventListener('resize', resize)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', resize)
    chart?.dispose()
    chart = null
  })

  return { setOption, resize }
}
