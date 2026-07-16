<template>
  <div class="pro-table">
    <div v-if="$slots.toolbar" class="toolbar">
      <slot name="toolbar" />
    </div>
    <el-table
      v-loading="loading"
      :data="data"
      border
      stripe
      style="width: 100%"
    >
      <el-table-column
        v-for="col in columns"
        :key="col.prop"
        :prop="col.prop"
        :label="col.label"
        :width="col.width"
        :min-width="col.minWidth"
        :fixed="col.fixed"
        :formatter="col.formatter"
        show-overflow-tooltip
      >
        <template v-if="col.slot" #default="scope">
          <slot :name="col.slot" :row="scope.row" :index="scope.$index" />
        </template>
      </el-table-column>
    </el-table>
    <div class="pager">
      <el-pagination
        :current-page="current"
        :page-size="size"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="$emit('size-change', $event)"
        @current-change="$emit('current-change', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
export interface ProColumn {
  prop: string
  label: string
  width?: number | string
  minWidth?: number | string
  fixed?: boolean | 'left' | 'right'
  formatter?: (row: any, column: any, cellValue: any) => string
  slot?: string
}

const props = defineProps<{
  data: any[]
  total: number
  loading?: boolean
  columns: ProColumn[]
  current?: number
  size?: number
}>()

const emit = defineEmits<{
  (e: 'size-change', size: number): void
  (e: 'current-change', page: number): void
}>()

const current = defineModel('current', { default: 1 })
const size = defineModel('size', { default: 20 })
</script>

<style scoped lang="scss">
.toolbar {
  margin-bottom: 12px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.pager {
  margin-top: 12px;
  display: flex;
  justify-content: flex-end;
}
</style>
