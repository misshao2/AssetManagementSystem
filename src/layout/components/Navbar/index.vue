<template>
  <div class="navbar">
    <el-icon class="toggle" @click="appStore.toggleSidebar()">
      <Fold v-if="!appStore.sidebarCollapsed" />
      <Expand v-else />
    </el-icon>

    <el-select
      v-model="orgStore.currentOrgId"
      placeholder="选择组织"
      size="small"
      class="org-select"
      @change="onOrgChange"
    >
      <el-option label="集团总部" value="ORG_GROUP" />
      <el-option label="华东公司" value="ORG_EAST" />
      <el-option label="产业园公司" value="ORG_PARK" />
    </el-select>

    <div class="right-menu">
      <el-tooltip content="切换主题" placement="bottom">
        <el-icon class="action" @click="toggleTheme()">
          <Moon v-if="appStore.theme === 'light'" />
          <Sunny v-else />
        </el-icon>
      </el-tooltip>

      <el-badge :value="messageStore.unreadCount" :max="99" class="action">
        <el-icon><Bell /></el-icon>
      </el-badge>

      <el-dropdown @command="handleCommand">
        <span class="user">
          <el-avatar :size="28">{{ userStore.userInfo?.userName?.charAt(0) || 'U' }}</el-avatar>
          <span class="name">{{ userStore.userInfo?.userName || '未登录' }}</span>
          <el-icon><ArrowDown /></el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="logout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { useAppStore } from '@/store/app'
import { useUserStore } from '@/store/user'
import { useOrgStore } from '@/store/org'
import { useMessageStore } from '@/store/message'

const router = useRouter()
const appStore = useAppStore()
const userStore = useUserStore()
const orgStore = useOrgStore()
const messageStore = useMessageStore()

function toggleTheme() {
  appStore.setTheme(appStore.theme === 'light' ? 'dark' : 'light')
}

function onOrgChange() {
  // 切换组织上下文：实际项目此处重新拉取数据/刷新页面
  location.reload()
}

function handleCommand(command: string) {
  if (command === 'logout') {
    ElMessageBox.confirm('确认退出登录？', '提示', { type: 'warning' })
      .then(() => {
        userStore.logout()
        router.push('/login')
      })
      .catch(() => {})
  }
}
</script>

<style scoped lang="scss">
@use '../../../styles/variables.scss' as *;

.navbar {
  height: $header-height;
  display: flex;
  align-items: center;
  padding: 0 16px;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
}

.toggle {
  font-size: 20px;
  cursor: pointer;
}

.org-select {
  width: 160px;
  margin-left: 16px;
}

.right-menu {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 18px;
}

.action {
  font-size: 18px;
  cursor: pointer;
  color: #5a5e66;
}

.user {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  outline: none;
}

.name {
  font-size: 14px;
}
</style>
