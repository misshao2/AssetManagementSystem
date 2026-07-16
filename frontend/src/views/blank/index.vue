<template>
  <div class="blank">
    <el-empty description="该模块页面建设中（脚手架占位）">
      <el-tag>{{ route.path }}</el-tag>
    </el-empty>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
const route = useRoute()
</script>

<style scoped>
.blank {
  padding: 40px 0;
}
</style>
