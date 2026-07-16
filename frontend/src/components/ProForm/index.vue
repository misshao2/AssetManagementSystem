<template>
  <el-dialog
    :model-value="visible"
    :title="title"
    :width="width"
    @update:model-value="$emit('update:visible', $event)"
    @close="$emit('close')"
  >
    <slot />
    <template #footer>
      <el-button @click="$emit('update:visible', false)">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="$emit('submit')">
        确定
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
defineProps<{
  visible: boolean
  title?: string
  width?: string
  submitting?: boolean
}>()

defineEmits<{
  (e: 'update:visible', v: boolean): void
  (e: 'submit'): void
  (e: 'close'): void
}>()
</script>
