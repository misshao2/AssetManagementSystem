<template>
  <div class="qrcode-viewer">
    <div class="box">{{ code }}</div>
    <div class="label">资产二维码（一资产一码）</div>
    <el-button size="small" @click="print">打印标签</el-button>
  </div>
</template>

<script setup lang="ts">
// 资产二维码展示组件（占位实现，可替换为 qrcode 库生成的真实二维码）
const props = defineProps<{ code: string }>()

function print() {
  const w = window.open('', '_blank')
  if (w) {
    w.document.write(`<pre style="font-size:24px">${props.code}</pre>`)
    w.print()
    w.close()
  }
}
</script>

<style scoped>
.qrcode-viewer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.box {
  width: 160px;
  height: 160px;
  border: 1px dashed #dcdfe6;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  letter-spacing: 1px;
  color: #303133;
  word-break: break-all;
  padding: 8px;
}
.label {
  font-size: 12px;
  color: #909399;
}
</style>
