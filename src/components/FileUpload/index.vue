<template>
  <el-upload
    v-model:file-list="fileList"
    :action="action"
    :headers="headers"
    list-type="text"
    :multiple="multiple"
    :accept="accept"
    :before-upload="beforeUpload"
    :on-success="onSuccess"
  >
    <el-button type="primary" :icon="Upload">点击上传</el-button>
    <template #tip v-if="tip">
      <div class="tip">{{ tip }}</div>
    </template>
  </el-upload>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Upload } from '@element-plus/icons-vue'
import { getToken } from '@/utils/auth'

const props = defineProps<{
  action?: string
  multiple?: boolean
  accept?: string
  maxSize?: number
  tip?: string
}>()

const emit = defineEmits<{ (e: 'success', fileId: string): void }>()

const fileList = ref<any[]>([])
const action = props.action || `${import.meta.env.VITE_API_BASE_URL}/file/upload`
const headers = { Authorization: `Bearer ${getToken()}` }

function beforeUpload(file: File) {
  if (props.maxSize && file.size / 1024 / 1024 > props.maxSize) {
    return false
  }
  return true
}

function onSuccess(response: any) {
  if (response?.code === 0) {
    emit('success', response.data?.fileId || '')
  }
}
</script>

<style scoped>
.tip {
  color: #909399;
  font-size: 12px;
  margin-top: 6px;
}
</style>
