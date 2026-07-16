import { post, get } from '@/utils/request'
import type { UserInfo, MenuNode } from '@/types'

export function login(account: string, password: string) {
  return post<{ token: string; refreshToken: string }>('/login/account', { account, password })
}

export function getUserInfo() {
  return get<{ userInfo: UserInfo; menus: MenuNode[] }>('/user/info')
}
