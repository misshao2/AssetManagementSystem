import { defineStore } from 'pinia'
import { ref } from 'vue'
import { login as loginApi, getUserInfo } from '@/api/login'
import { getToken, setToken, setRefreshToken, clearAuth } from '@/utils/auth'
import type { UserInfo, MenuNode } from '@/types'

export const useUserStore = defineStore(
  'user',
  () => {
    const token = ref<string>(getToken())
    const userInfo = ref<UserInfo | null>(null)
    const permissions = ref<string[]>([])
    const roles = ref<string[]>([])
    const menus = ref<MenuNode[]>([])

    async function login(account: string, password: string) {
      const data = await loginApi(account, password)
      token.value = data.token
      setToken(data.token)
      setRefreshToken(data.refreshToken)
    }

    async function fetchUserInfo() {
      const data = await getUserInfo()
      userInfo.value = data.userInfo
      permissions.value = data.userInfo.permissions
      roles.value = data.userInfo.roles
      menus.value = data.menus
      return data
    }

    function logout() {
      clearAuth()
      token.value = ''
      userInfo.value = null
      permissions.value = []
      roles.value = []
      menus.value = []
    }

    return { token, userInfo, permissions, roles, menus, login, fetchUserInfo, logout }
  },
  {
    persist: { paths: ['token'] }
  }
)
