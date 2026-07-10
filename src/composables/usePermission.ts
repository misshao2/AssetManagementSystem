import { useUserStore } from '@/store/user'

// JS 逻辑内判断权限
export function usePermission() {
  const userStore = useUserStore()

  function hasPerm(perm: string | string[]): boolean {
    const required = Array.isArray(perm) ? perm : [perm]
    return required.some((p) => userStore.permissions.includes(p))
  }

  return { hasPerm }
}
