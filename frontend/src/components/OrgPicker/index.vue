<template>
  <el-tree-select
    :model-value="modelValue"
    :data="tree"
    :props="{ label: 'name', children: 'children' }"
    node-key="id"
    check-strictly
    default-expand-all
    clearable
    :placeholder="placeholder"
    style="width: 100%"
    @update:model-value="$emit('update:modelValue', $event)"
  />
</template>

<script setup lang="ts">
import { useOrgStore } from '@/store/org'
import type { OrgNode } from '@/store/org'

const props = defineProps<{
  modelValue?: string
  tree?: OrgNode[]
  placeholder?: string
}>()

const emit = defineEmits<{ (e: 'update:modelValue', v: string): void }>()

const orgStore = useOrgStore()
const tree = props.tree || orgStore.orgTree
</script>
